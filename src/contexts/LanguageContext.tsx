"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react"
import gl from "../dictionaries/gl.json"
import pt from "../dictionaries/pt.json"

type Language = "gl" | "pt"
type Dictionary = Record<string, string>

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const dictionaries: Record<Language, Dictionary> = {
  gl,
  pt,
}

const STORAGE_KEY = "ludio_lang"

function isValidLanguage(value: string | null): value is Language {
  return value === "gl" || value === "pt"
}

let listeners: Array<() => void> = []

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: () => void): () => void {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

function getSnapshot(): Language {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (isValidLanguage(stored)) {
    return stored
  }
  const browserLang = navigator.language.startsWith("pt") ? "pt" : "gl"
  return browserLang
}

function getServerSnapshot(): Language {
  return "gl"
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: React.ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem(STORAGE_KEY, lang)
    emitChange()
  }, [])

  const t = useCallback(
    (key: string): string => {
      const currentDict = dictionaries[language]
      if (key in currentDict) {
        return currentDict[key]
      }
      console.warn(`[i18n] Clave no encontrada: "${key}" en el idioma "${language}"`)
      return key
    },
    [language]
  )

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage debe usarse dentro de un LanguageProvider")
  }
  return context
}
