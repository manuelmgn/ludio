"use server"

import { prisma } from "@/lib/prisma"

export interface SearchGameItem {
  id: string
  title: string
  coverUrl: string | null
  firstReleaseDate: string | null
  releaseYear: number | null
  rating: number | null
  totalRatingCount: number | null
  relevanceScore: number
}

interface SearchSuccess {
  success: true
  data: SearchGameItem[]
}

interface SearchError {
  success: false
  error: string
}

export type SearchResult = SearchSuccess | SearchError

interface IGDBGame {
  id: number
  name: string
  cover?: {
    id: number
    url: string
  }
  total_rating_count?: number
  rating?: number
  category?: number
  first_release_date?: number
}

let cachedToken: { token: string; expiresAt: number } | null = null

async function getIGDBToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.token
  }

  const clientId = process.env.IGDB_CLIENT_ID
  const clientSecret = process.env.IGDB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("IGDB credentials not configured")
  }

  const url = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`

  const response = await fetch(url, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch IGDB token: ${response.statusText}`)
  }

  const data = await response.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  }

  return data.access_token
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

function getQueryVariants(query: string): string[] {
  const variants = new Set<string>()
  const trimmed = query.trim()
  variants.add(trimmed)

  // Unaccented version (e.g. Pokémon -> Pokemon)
  const unaccented = trimmed.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  variants.add(unaccented)

  // Franchise-specific expansions
  if (/pokemon/i.test(unaccented)) {
    variants.add(unaccented.replace(/pokemon/gi, "Pokémon"))
    variants.add(unaccented.replace(/pokemon/gi, "Pokemon"))
  }

  return Array.from(variants).filter((v) => v.length >= 2)
}

function calculateRelevanceScore(game: IGDBGame, query: string): number {
  const qNorm = normalizeText(query)
  const titleNorm = normalizeText(game.name)
  const qWords = qNorm.split(/\s+/).filter(Boolean)

  let score = 0

  // 1. Exact title match
  if (titleNorm === qNorm) {
    score += 5000
  } else if (titleNorm.startsWith(qNorm + " ") || titleNorm.startsWith(qNorm + ":")) {
    score += 3000
  } else if (titleNorm.startsWith(qNorm)) {
    score += 2500
  } else if (titleNorm.includes(qNorm)) {
    score += 1200
  }

  // 2. Word-level token coverage
  if (qWords.length > 0) {
    const matchedWords = qWords.filter((w) => titleNorm.includes(w)).length
    score += Math.round((matchedWords / qWords.length) * 1200)
  }

  // 3. Category weighting
  // 0: Main Game, 8: Remake, 9: Remaster, 10: Expanded, 11: Port, 2: Expansion, 5: Mod
  if (game.category === 0) {
    score += 500 // Official main game
  } else if (game.category === 8 || game.category === 9) {
    score += 400 // Official remake/remaster
  } else if (game.category === 10 || game.category === 11 || game.category === 2) {
    score += 250 // Port, expanded, expansion
  } else if (game.category === 5) {
    score -= 500 // Heavily demote fan mods/hacks
  }

  // 4. Popularity boost based on total rating count
  const ratingCount = game.total_rating_count || 0
  score += Math.min(Math.round(ratingCount * 2.5), 1500)

  // 5. Critic/User Rating boost
  if (game.rating) {
    score += Math.round(game.rating)
  }

  return score
}

export async function searchGames(query: string): Promise<SearchResult> {
  const trimmed = query.trim()

  if (trimmed.length < 2) {
    return { success: false, error: "A busca debe ter polo menos 2 caracteres." }
  }

  try {
    const token = await getIGDBToken()
    const variants = getQueryVariants(trimmed)

    // Parallel IGDB requests with up to 150 entries each
    const cleanSearchQuery = trimmed.replace(/["\\]/g, "")
    const searchPromise = fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID as string,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: `search "${cleanSearchQuery}"; fields name, cover.url, total_rating_count, rating, category, first_release_date; limit 150;`,
    }).then(async (r) => {
      if (!r.ok) return []
      return (await r.json()) as IGDBGame[]
    }).catch(() => [] as IGDBGame[])

    const whereConditions = variants
      .map((v) => `name ~ *"${v.replace(/["\\]/g, "")}"*`)
      .join(" | ")

    const popularityPromise = fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID as string,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: `fields name, cover.url, total_rating_count, rating, category, first_release_date; where ${whereConditions}; sort total_rating_count desc; limit 150;`,
    }).then(async (r) => {
      if (!r.ok) return []
      return (await r.json()) as IGDBGame[]
    }).catch(() => [] as IGDBGame[])

    const [searchRes, popularityRes] = await Promise.all([searchPromise, popularityPromise])

    // Merge without duplicates by ID
    const gameMap = new Map<number, IGDBGame>()
    for (const g of popularityRes) {
      if (g.id && g.name) gameMap.set(g.id, g)
    }
    for (const g of searchRes) {
      if (g.id && g.name && !gameMap.has(g.id)) {
        gameMap.set(g.id, g)
      }
    }

    const allGames = Array.from(gameMap.values())

    if (allGames.length === 0) {
      // Fallback: check local DB if IGDB returned 0 matches
      const localFallback = await prisma.game.findMany({
        where: {
          title: {
            contains: trimmed,
            mode: "insensitive",
          },
        },
        take: 50,
      })

      const formattedLocal: SearchGameItem[] = localFallback.map((g) => ({
        id: g.id,
        title: g.title,
        coverUrl: g.coverUrl,
        firstReleaseDate: g.firstReleaseDate ? g.firstReleaseDate.toISOString() : null,
        releaseYear: g.firstReleaseDate ? g.firstReleaseDate.getFullYear() : null,
        rating: null,
        totalRatingCount: null,
        relevanceScore: 100,
      }))

      return { success: true, data: formattedLocal }
    }

    // Map each game to SearchGameItem with calculated relevance score and release date
    const formattedGames: SearchGameItem[] = allGames.map((igdbGame) => {
      const releaseDate = igdbGame.first_release_date
        ? new Date(igdbGame.first_release_date * 1000)
        : null

      return {
        id: igdbGame.id.toString(),
        title: igdbGame.name,
        coverUrl: igdbGame.cover?.url
          ? `https:${igdbGame.cover.url.replace("t_thumb", "t_cover_big")}`
          : null,
        firstReleaseDate: releaseDate ? releaseDate.toISOString() : null,
        releaseYear: releaseDate ? releaseDate.getFullYear() : null,
        rating: igdbGame.rating ? Math.round(igdbGame.rating) : null,
        totalRatingCount: igdbGame.total_rating_count || 0,
        relevanceScore: calculateRelevanceScore(igdbGame, trimmed),
      }
    })

    // Sort by default by relevance score descending
    formattedGames.sort((a, b) => b.relevanceScore - a.relevanceScore)

    // Upsert into local database in background batches so records exist for details & library
    // We don't block the request if database is slow, but we await the top 30
    const topToUpsert = formattedGames.slice(0, 50)
    await Promise.allSettled(
      topToUpsert.map((g) => {
        const releaseDateObj = g.firstReleaseDate ? new Date(g.firstReleaseDate) : null
        return prisma.game.upsert({
          where: { id: g.id },
          update: {
            title: g.title,
            coverUrl: g.coverUrl,
            firstReleaseDate: releaseDateObj,
          },
          create: {
            id: g.id,
            title: g.title,
            coverUrl: g.coverUrl,
            firstReleaseDate: releaseDateObj,
          },
        })
      })
    )

    return { success: true, data: formattedGames }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro na busca."
    console.error("[searchGames] Error:", message)

    try {
      const localGames = await prisma.game.findMany({
        where: {
          title: {
            contains: trimmed,
            mode: "insensitive",
          },
        },
        take: 50,
      })

      const formattedLocal: SearchGameItem[] = localGames.map((g) => ({
        id: g.id,
        title: g.title,
        coverUrl: g.coverUrl,
        firstReleaseDate: g.firstReleaseDate ? g.firstReleaseDate.toISOString() : null,
        releaseYear: g.firstReleaseDate ? g.firstReleaseDate.getFullYear() : null,
        rating: null,
        totalRatingCount: null,
        relevanceScore: 100,
      }))

      return { success: true, data: formattedLocal }
    } catch {
      return { success: false, error: "Erro ao buscar xogos. Téntao de novo." }
    }
  }
}
