"use client"

import { useState, useTransition } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { addCustomPlatform } from "@/lib/actions/settings"

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage()
  const [platformName, setPlatformName] = useState("")
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleAddPlatform = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!platformName.trim()) return

    setMessage(null)
    startTransition(async () => {
      const result = await addCustomPlatform(platformName)
      if (result.success) {
        setMessage({ type: "success", text: "Plataforma añadida con éxito." })
        setPlatformName("")
      } else {
        setMessage({ type: "error", text: result.error || "Error al añadir la plataforma." })
      }
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 relative">
      {/* Background decoration */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-1/3 right-1/4 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[140px] -z-10" />

      <h1 className="text-4xl font-pixel text-white mb-8 tracking-wider mt-8">
        {t("settings") || "Ajustes"}
      </h1>

      <div className="w-full max-w-2xl flex flex-col gap-6">
        
        {/* Section 1: Language */}
        <GlassPanel>
          <h2 className="text-xl font-medium text-white mb-4">Idioma / Language</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setLanguage("gl")}
              className={`px-4 py-2 rounded-lg font-sans transition-colors ${
                language === "gl"
                  ? "bg-primary text-white border border-primary/50"
                  : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
              }`}
            >
              Galego
            </button>
            <button
              onClick={() => setLanguage("pt")}
              className={`px-4 py-2 rounded-lg font-sans transition-colors ${
                language === "pt"
                  ? "bg-primary text-white border border-primary/50"
                  : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
              }`}
            >
              Português (PT)
            </button>
          </div>
        </GlassPanel>

        {/* Section 2: Custom Platforms */}
        <GlassPanel>
          <h2 className="text-xl font-medium text-white mb-4">Plataformas Personalizadas</h2>
          <p className="text-sm text-gray-400 mb-4">
            Añade plataformas personalizadas para organizar tus juegos (ej. "Game Boy Advance", "Emulador PC").
          </p>
          <form onSubmit={handleAddPlatform} className="flex gap-3">
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              placeholder="Nombre de la plataforma..."
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans"
              disabled={isPending}
            />
            <button
              type="submit"
              disabled={isPending || platformName.trim().length === 0}
              className="rounded-lg bg-primary px-6 py-2 text-white font-medium hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              {isPending ? "Añadiendo..." : "Añadir"}
            </button>
          </form>
          {message && (
            <p className={`mt-3 text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {message.text}
            </p>
          )}
        </GlassPanel>

      </div>
    </div>
  )
}
