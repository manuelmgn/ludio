"use server"

import { prisma } from "@/lib/prisma"
import { mapIGDBGameType, type GameType } from "@/lib/game-types"

export interface SearchGameItem {
  id: string
  title: string
  coverUrl: string | null
  firstReleaseDate: string | null
  releaseYear: number | null
  rating: number | null
  totalRatingCount: number | null
  relevanceScore: number
  gameType: GameType | null
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

interface IGDBAlternativeName {
  id?: number
  name?: string
}

interface IGDBGame {
  id: number
  name: string
  alternative_names?: IGDBAlternativeName[]
  cover?: {
    id: number
    url: string
  }
  total_rating_count?: number
  total_rating?: number
  rating?: number
  hypes?: number
  game_type?: number
  version_parent?: number
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
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
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

interface TextMatchResult {
  score: number
  strong: boolean
  isExact: boolean
}

function matchesAcronym(textNorm: string, qCompact: string): boolean {
  if (qCompact.length < 2 || qCompact.length > 6 || !/^[a-z0-9]+$/.test(qCompact)) {
    return false
  }
  const words = textNorm.split(" ").filter(Boolean)
  if (words.length < qCompact.length) return false
  const initials = words.map((w) => w[0]).join("")
  return initials.includes(qCompact)
}

function scoreTextMatch(
  textNorm: string,
  qNorm: string,
  qWords: string[],
  qCompact: string
): TextMatchResult {
  if (!textNorm || !qNorm) {
    return { score: 0, strong: false, isExact: false }
  }

  const padded = ` ${textNorm} `
  const tWords = textNorm.split(" ").filter(Boolean)

  // 1. Exact match
  if (textNorm === qNorm) {
    return { score: 1000, strong: true, isExact: true }
  }

  // 2. Contiguous whole-word phrase match (e.g. "zelda" in "The Legend of Zelda: ...")
  if (padded.includes(` ${qNorm} `)) {
    const startsBonus = textNorm.startsWith(`${qNorm} `) ? 120 : 0
    return { score: 1000 + startsBonus, strong: true, isExact: false }
  }

  // 3. All query words appear as whole words (e.g. "zelda ocarina")
  if (qWords.length > 1 && qWords.every((w) => padded.includes(` ${w} `))) {
    return { score: 950, strong: true, isExact: false }
  }

  // 4. All query words match word prefixes (e.g. "zeld" -> "Zelda", "poke" -> "Pokémon")
  if (qWords.length > 0 && qWords.every((w) => tWords.some((tw) => tw.startsWith(w)))) {
    const startsBonus = textNorm.startsWith(qNorm) ? 80 : 0
    return { score: 820 + startsBonus, strong: true, isExact: false }
  }

  // 5. Acronym match (e.g. "gta" -> "Grand Theft Auto", "botw" -> "Breath of the Wild")
  if (matchesAcronym(textNorm, qCompact)) {
    return { score: 900, strong: true, isExact: false }
  }

  // 6. Partial word-prefix coverage for multi-word queries
  if (qWords.length > 1) {
    const matched = qWords.filter((w) => tWords.some((tw) => tw.startsWith(w))).length
    if (matched > 0) {
      const ratio = matched / qWords.length
      return { score: Math.round(ratio * 600), strong: ratio >= 0.5, isExact: false }
    }
  }

  return { score: 0, strong: false, isExact: false }
}

function evaluateGameRelevance(
  game: IGDBGame,
  query: string,
  fromSearchEndpoint: boolean
): { keep: boolean; score: number } {
  const qNorm = normalizeText(query)
  const qWords = qNorm.split(" ").filter(Boolean)
  const qCompact = qNorm.replace(/\s+/g, "")

  const titleNorm = normalizeText(game.name || "")
  const titleMatch = scoreTextMatch(titleNorm, qNorm, qWords, qCompact)

  let bestAltMatch: TextMatchResult = { score: 0, strong: false, isExact: false }
  for (const alt of game.alternative_names ?? []) {
    if (!alt?.name) continue
    const altNorm = normalizeText(alt.name)
    const m = scoreTextMatch(altNorm, qNorm, qWords, qCompact)
    if (
      m.score > bestAltMatch.score ||
      (m.score === bestAltMatch.score && m.isExact && !bestAltMatch.isExact)
    ) {
      bestAltMatch = m
    }
  }

  const hasStrongMatch = titleMatch.strong || bestAltMatch.strong
  // Filter out mid-word substring false positives (e.g. "gta" inside "Eggtastic" or "Ragtag")
  if (!hasStrongMatch && !fromSearchEndpoint) {
    return { keep: false, score: -1 }
  }

  const ratingCount = game.total_rating_count || 0
  const hypes = game.hypes || 0
  const effectivePop = ratingCount + hypes * 0.5

  // 1. Text match score (title or alternative name / acronym)
  let textScore = 0
  if (titleMatch.score >= bestAltMatch.score) {
    textScore = titleMatch.score
    if (titleMatch.isExact) {
      // Exact title boost scales down for obscure 0-rating entries (e.g. 1989 Game & Watch "Zelda")
      textScore += effectivePop >= 10 ? 450 : 120
    }
  } else {
    // Alternative name matched better (e.g. "GTA V" for "Grand Theft Auto V")
    textScore = Math.max(0, bestAltMatch.score - 40)
    if (bestAltMatch.isExact) {
      textScore += effectivePop >= 10 ? 350 : 80
    }
  }

  if (textScore === 0 && fromSearchEndpoint) {
    textScore = 350
  }

  // 2. Logarithmic popularity score (total_rating_count + hypes for upcoming games like GTA VI)
  const popScore = Math.round(Math.log10(1 + effectivePop) * 450)

  // 3. Confidence-weighted critic/user rating boost
  const ratingVal = game.total_rating ?? game.rating ?? 0
  const ratingConfidence = Math.min(ratingCount / 10, 1)
  const ratingScore = Math.round(ratingVal * 2.5 * ratingConfidence)

  // 4. IGDB game_type weighting (replaces deprecated `category`)
  // 0: Main Game, 8: Remake, 9: Remaster, 4: Standalone Expansion, 10: Expanded Game,
  // 2: Expansion, 11: Port, 6: Episode, 1: DLC, 3: Bundle, 7: Season, 13: Pack, 14: Update,
  // 12: Fork, 5: Mod
  let typeScore = 0
  switch (game.game_type) {
    case 0:
      typeScore = 450
      break
    case 8:
    case 9:
      typeScore = 350
      break
    case 4:
    case 10:
      typeScore = 280
      break
    case 2:
    case 11:
    case 6:
      typeScore = 100
      break
    case 1:
    case 3:
    case 7:
    case 13:
    case 14:
      typeScore = -150
      break
    case 12:
      typeScore = -300
      break
    case 5:
      typeScore = -900
      break
    default:
      typeScore = 0
  }

  // 5. Demote special/collector/bundle editions below their parent base game
  const versionPenalty = game.version_parent ? -350 : 0

  // 6. Slightly demote entries without cover art (often stubs or fan placeholders)
  const coverPenalty = game.cover?.url ? 0 : -150

  return {
    keep: true,
    score: textScore + popScore + ratingScore + typeScore + versionPenalty + coverPenalty,
  }
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
    const igdbFields =
      "fields name, alternative_names.name, cover.url, total_rating_count, total_rating, rating, hypes, game_type, version_parent, first_release_date;"

    const searchPromise = fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID as string,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: `search "${cleanSearchQuery}"; ${igdbFields} limit 150;`,
    }).then(async (r) => {
      if (!r.ok) return []
      return (await r.json()) as IGDBGame[]
    }).catch(() => [] as IGDBGame[])

    const whereConditions = variants
      .map((v) => {
        const clean = v.replace(/["\\]/g, "")
        return `name ~ *"${clean}"* | alternative_names.name ~ *"${clean}"*`
      })
      .join(" | ")

    const popularityPromise = fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID as string,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: `${igdbFields} where (${whereConditions}); sort total_rating_count desc; limit 150;`,
    }).then(async (r) => {
      if (!r.ok) return []
      return (await r.json()) as IGDBGame[]
    }).catch(() => [] as IGDBGame[])

    const [searchRes, popularityRes] = await Promise.all([searchPromise, popularityPromise])

    const searchIds = new Set<number>()
    for (const g of searchRes) {
      if (g.id) searchIds.add(g.id)
    }

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
        rating: g.igdbRating ?? null,
        totalRatingCount: null,
        relevanceScore: 100,
        gameType: null,
      }))

      return { success: true, data: formattedLocal }
    }

    // Evaluate relevance and filter out mid-word substring noise (e.g. "gta" inside "Eggtastic")
    const evaluatedGames = allGames.map((igdbGame) => ({
      igdbGame,
      evalResult: evaluateGameRelevance(igdbGame, trimmed, searchIds.has(igdbGame.id)),
    }))

    const keptGames = evaluatedGames.filter((entry) => entry.evalResult.keep)
    const finalPool = keptGames.length > 0 ? keptGames : evaluatedGames

    // Map each game to SearchGameItem with calculated relevance score and release date
    const formattedGames: SearchGameItem[] = finalPool.map(({ igdbGame, evalResult }) => {
      const releaseDate = igdbGame.first_release_date
        ? new Date(igdbGame.first_release_date * 1000)
        : null
      const rawRating = igdbGame.total_rating ?? igdbGame.rating

      return {
        id: igdbGame.id.toString(),
        title: igdbGame.name,
        coverUrl: igdbGame.cover?.url
          ? `https:${igdbGame.cover.url.replace("t_thumb", "t_cover_big")}`
          : null,
        firstReleaseDate: releaseDate ? releaseDate.toISOString() : null,
        releaseYear: releaseDate ? releaseDate.getFullYear() : null,
        rating: rawRating ? Math.round(rawRating) : null,
        totalRatingCount: igdbGame.total_rating_count || 0,
        relevanceScore: evalResult.score,
        gameType: mapIGDBGameType(igdbGame.game_type),
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
            igdbRating: g.rating,
          },
          create: {
            id: g.id,
            title: g.title,
            coverUrl: g.coverUrl,
            firstReleaseDate: releaseDateObj,
            igdbRating: g.rating,
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
        rating: g.igdbRating ?? null,
        totalRatingCount: null,
        relevanceScore: 100,
        gameType: null,
      }))

      return { success: true, data: formattedLocal }
    } catch {
      return { success: false, error: "Erro ao buscar xogos. Téntao de novo." }
    }
  }
}

export async function syncGameMetadataIfMissing(gameId: string) {
  try {
    const numericId = Number(gameId)
    if (!Number.isFinite(numericId)) return null

    const token = await getIGDBToken()
    const res = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID as string,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: `fields name, cover.url, rating, first_release_date; where id = ${numericId}; limit 1;`,
    })
    if (!res.ok) return null
    const items = (await res.json()) as IGDBGame[]
    const igdbGame = items[0]
    if (!igdbGame) return null

    const releaseDate = igdbGame.first_release_date
      ? new Date(igdbGame.first_release_date * 1000)
      : null
    const igdbRating = igdbGame.rating ? Math.round(igdbGame.rating) : null
    const coverUrl = igdbGame.cover?.url
      ? `https:${igdbGame.cover.url.replace("t_thumb", "t_cover_big")}`
      : undefined

    return await prisma.game.update({
      where: { id: gameId },
      data: {
        firstReleaseDate: releaseDate,
        igdbRating,
        ...(coverUrl ? { coverUrl } : {}),
      },
    })
  } catch {
    return null
  }
}
