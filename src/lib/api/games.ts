"use server"

import { prisma } from "@/lib/prisma"
import type { Game } from "@generated/prisma/client"

interface SearchSuccess {
  success: true
  data: Game[]
}

interface SearchError {
  success: false
  error: string
}

type SearchResult = SearchSuccess | SearchError

interface IGDBGame {
  id: number
  name: string
  cover?: {
    id: number
    url: string
  }
}

async function getIGDBToken(): Promise<string> {
  const url = `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`
  
  const response = await fetch(url, {
    method: 'POST'
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch IGDB token')
  }
  
  const data = await response.json()
  return data.access_token
}

export async function searchGames(query: string): Promise<SearchResult> {
  const trimmed = query.trim()

  if (trimmed.length < 2) {
    return { success: false, error: "A busca debe ter polo menos 2 caracteres." }
  }

  try {
    // Paso 1: Search local database first (Cache Hit)
    const localGames = await prisma.game.findMany({
      where: {
        title: {
          contains: trimmed,
          mode: "insensitive",
        },
      },
      take: 10,
    })

    if (localGames.length > 0) {
      return { success: true, data: localGames }
    }

    // Paso 2: Cache Miss - fetch from external API (IGDB)
    const token = await getIGDBToken()
    
    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.IGDB_CLIENT_ID as string,
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: `search "${trimmed}"; fields name, cover.url; limit 10;`,
    })

    if (!response.ok) {
      throw new Error(`IGDB API error: ${response.statusText}`)
    }

    const igdbGames: IGDBGame[] = await response.json()

    if (igdbGames.length === 0) {
      return { success: true, data: [] }
    }

    // Cache Miss → Save to database and return
    const savedGames: Game[] = []

    for (const igdbGame of igdbGames) {
      const externalId = igdbGame.id.toString()
      let coverUrl = null

      if (igdbGame.cover?.url) {
        coverUrl = `https:${igdbGame.cover.url.replace('t_thumb', 't_cover_big')}`
      }

      const saved = await prisma.game.upsert({
        where: { id: externalId },
        update: {
          title: igdbGame.name,
          coverUrl: coverUrl,
        },
        create: {
          id: externalId,
          title: igdbGame.name,
          coverUrl: coverUrl,
        },
      })
      savedGames.push(saved)
    }

    return { success: true, data: savedGames }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro descoñecido na busca."
    console.error("[searchGames] Error:", message)
    return { success: false, error: "Erro ao buscar xogos. Téntao de novo." }
  }
}
