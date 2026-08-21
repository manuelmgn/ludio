"use server"

import { prisma } from "@/lib/prisma"
import type { Game } from "../../../generated/prisma/client"

interface SearchSuccess {
  success: true
  data: Game[]
}

interface SearchError {
  success: false
  error: string
}

type SearchResult = SearchSuccess | SearchError

interface ExternalGame {
  id: string
  title: string
  coverUrl: string | null
}

function fetchExternalAPI(query: string): ExternalGame[] {
  const lowerQuery = query.toLowerCase()

  const mockDatabase: ExternalGame[] = [
    { id: "ext-zelda-botw", title: "The Legend of Zelda: Breath of the Wild", coverUrl: null },
    { id: "ext-zelda-totk", title: "The Legend of Zelda: Tears of the Kingdom", coverUrl: null },
    { id: "ext-zelda-oot", title: "The Legend of Zelda: Ocarina of Time", coverUrl: null },
    { id: "ext-zelda-mm", title: "The Legend of Zelda: Majora's Mask", coverUrl: null },
    { id: "ext-zelda-alttp", title: "The Legend of Zelda: A Link to the Past", coverUrl: null },
    { id: "ext-mario-odyssey", title: "Super Mario Odyssey", coverUrl: null },
    { id: "ext-mario-galaxy", title: "Super Mario Galaxy", coverUrl: null },
    { id: "ext-mario-64", title: "Super Mario 64", coverUrl: null },
    { id: "ext-elden-ring", title: "Elden Ring", coverUrl: null },
    { id: "ext-dark-souls", title: "Dark Souls", coverUrl: null },
    { id: "ext-hollow-knight", title: "Hollow Knight", coverUrl: null },
    { id: "ext-celeste", title: "Celeste", coverUrl: null },
    { id: "ext-hades", title: "Hades", coverUrl: null },
    { id: "ext-metroid-dread", title: "Metroid Dread", coverUrl: null },
    { id: "ext-persona-5", title: "Persona 5 Royal", coverUrl: null },
  ]

  return mockDatabase.filter((game) =>
    game.title.toLowerCase().includes(lowerQuery)
  )
}

export async function searchGames(query: string): Promise<SearchResult> {
  const trimmed = query.trim()

  if (trimmed.length < 2) {
    return { success: false, error: "A busca debe ter polo menos 2 caracteres." }
  }

  try {
    // Step A: Search local database first (Cache Hit)
    const localGames = await prisma.game.findMany({
      where: {
        title: {
          contains: trimmed,
          mode: "insensitive",
        },
      },
      take: 20,
    })

    // Step B: If we have local results, return them immediately
    if (localGames.length > 0) {
      return { success: true, data: localGames }
    }

    // Step C: No local results — fetch from external API (simulated)
    const externalResults = fetchExternalAPI(trimmed)

    if (externalResults.length === 0) {
      return { success: true, data: [] }
    }

    // Step D: Cache Miss → Save to database and return
    const savedGames: Game[] = []

    for (const externalGame of externalResults) {
      const saved = await prisma.game.upsert({
        where: { id: externalGame.id },
        update: {
          title: externalGame.title,
          coverUrl: externalGame.coverUrl,
        },
        create: {
          id: externalGame.id,
          title: externalGame.title,
          coverUrl: externalGame.coverUrl,
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
