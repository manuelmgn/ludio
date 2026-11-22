"use client"

import { useState, useTransition, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Input } from "@/components/ui/Input"
import { addCustomPlatform, getCustomPlatforms, deleteCustomPlatform } from "@/lib/actions/settings"

interface CustomPlatform {
  id: string
  name: string
  createdAt: Date
}

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage()
  const [platformName, setPlatformName] = useState("")
  const [platforms, setPlatforms] = useState<CustomPlatform[]>([])
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    let isMounted = true
    getCustomPlatforms().then((res) => {
      if (isMounted && res.success && res.data) {
        setPlatforms(res.data)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const handleAddPlatform = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!platformName.trim()) return

    setMessage(null)
    startTransition(async () => {
      const result = await addCustomPlatform(platformName)
      if (result.success && result.data) {
        setMessage({ type: "success", text: "Plataforma engadida con éxito ✓" })
        setPlatforms((prev) => [result.data as CustomPlatform, ...prev])
        setPlatformName("")
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: "error", text: result.error || "Erro ao engadir a plataforma." })
      }
    })
  }

  const handleDeletePlatform = async (id: string) => {
    if (!confirm("Tes a certeza de que queres eliminar esta plataforma?")) return

    setDeletingId(id)
    const result = await deleteCustomPlatform(id)
    setDeletingId(null)

    if (result.success) {
      setPlatforms((prev) => prev.filter((p) => p.id !== id))
    } else {
      alert(result.error || "Erro ao eliminar.")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-4 sm:p-8 relative">
      {/* Background decoration */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-1/3 right-1/4 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[140px] -z-10" />

      <h1 className="text-4xl font-pixel text-white mb-8 tracking-wider mt-6 flex items-center gap-3">
        <span>⚙️</span>
        <span>{t("settings")}</span>
      </h1>

      <div className="w-full max-w-2xl flex flex-col gap-6">
        
        {/* Section 1: Language */}
        <GlassPanel>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🌐</span>
            <h2 className="text-xl font-medium text-white font-sans">{t("language")}</h2>
          </div>
          <p className="text-xs text-zinc-400 font-sans mb-4">
            Selecciona o idioma principal da interface.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setLanguage("gl")}
              className={`flex-1 py-3 px-4 rounded-xl font-sans text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                language === "gl"
                  ? "bg-primary text-white border border-primary/50 shadow-[0_0_15px_rgba(157,0,255,0.4)]"
                  : "bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>Galego</span>
              {language === "gl" && <span>✓</span>}
            </button>
            <button
              onClick={() => setLanguage("pt")}
              className={`flex-1 py-3 px-4 rounded-xl font-sans text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                language === "pt"
                  ? "bg-primary text-white border border-primary/50 shadow-[0_0_15px_rgba(157,0,255,0.4)]"
                  : "bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>Português</span>
              {language === "pt" && <span>✓</span>}
            </button>
          </div>
        </GlassPanel>

        {/* Section 2: Custom Platforms */}
        <GlassPanel>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎮</span>
            <h2 className="text-xl font-medium text-white font-sans">{t("custom_platforms_title")}</h2>
          </div>
          <p className="text-xs text-zinc-400 mb-4 font-sans leading-relaxed">
            {t("custom_platforms_desc")}
          </p>

          <form onSubmit={handleAddPlatform} className="flex gap-2 mb-6 items-end">
            <div className="flex-1">
              <Input
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                placeholder={t("platform_name_placeholder")}
                disabled={isPending}
              />
            </div>
            <button
              type="submit"
              disabled={isPending || platformName.trim().length === 0}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm text-white font-medium hover:bg-primary-hover shadow-[0_0_15px_rgba(157,0,255,0.3)] transition-all disabled:opacity-40 disabled:pointer-events-none h-[42px]"
            >
              {isPending ? t("saving") : t("add_platform_btn")}
            </button>
          </form>

          {message && (
            <p className={`mb-4 text-xs ${message.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
              {message.text}
            </p>
          )}

          {/* Platforms List */}
          <div className="pt-4 border-t border-white/10">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 block mb-3">
              As túas plataformas activas ({platforms.length})
            </span>

            {platforms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {platforms.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-sans text-zinc-200"
                  >
                    <span>{p.name}</span>
                    <button
                      onClick={() => handleDeletePlatform(p.id)}
                      disabled={deletingId === p.id}
                      className="text-zinc-500 hover:text-rose-400 transition-colors ml-1"
                      title={t("delete")}
                    >
                      {deletingId === p.id ? "..." : "✕"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">
                {t("no_custom_platforms")}
              </p>
            )}
          </div>
        </GlassPanel>

      </div>
    </div>
  )
}
