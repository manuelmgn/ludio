"use client"

import { useState, useTransition, useEffect } from "react"
import {
  Settings,
  Globe,
  Gamepad2,
  Store,
  Download,
  Check,
  X,
  Plus,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { usePwa } from "@/contexts/PwaContext"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import {
  addCustomPlatform,
  getCustomPlatforms,
  deleteCustomPlatform,
  getStores,
  addStore,
  deleteStore,
  exportUserData,
} from "@/lib/actions/settings"

interface CustomPlatform {
  id: string
  name: string
  createdAt: Date
}

interface StoreItem {
  id: string
  name: string
  isDefault: boolean
  createdAt: Date
}

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage()
  const {
    isStandalone,
    canInstallPrompt,
    isIOSInstallable,
    isInstalling,
    triggerInstall,
  } = usePwa()
  const [pwaFeedback, setPwaFeedback] = useState<string | null>(null)
  const [platformName, setPlatformName] = useState("")
  const [platforms, setPlatforms] = useState<CustomPlatform[]>([])
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [storeName, setStoreName] = useState("")
  const [storesList, setStoresList] = useState<StoreItem[]>([])
  const [isStorePending, startStoreTransition] = useTransition()
  const [deletingStoreId, setDeletingStoreId] = useState<string | null>(null)
  const [storeMessage, setStoreMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [isExporting, setIsExporting] = useState(false)

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const res = await exportUserData()
      if (res.success && res.data) {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], {
          type: "application/json;charset=utf-8",
        })
        const blobUrl = URL.createObjectURL(blob)
        const downloadAnchor = document.createElement("a")
        downloadAnchor.setAttribute("href", blobUrl)
        const dateStr = new Date().toISOString().split("T")[0]
        downloadAnchor.setAttribute("download", `flux-backup-${dateStr}.json`)
        document.body.appendChild(downloadAnchor)
        downloadAnchor.click()
        downloadAnchor.remove()
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
      } else {
        alert(res.error || "Erro ao exportar datos")
      }
    } catch {
      alert("Erro ao xerar a copia de seguridade")
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    getCustomPlatforms().then((res) => {
      if (isMounted && res.success && res.data) {
        setPlatforms(res.data)
      }
    })
    getStores().then((res) => {
      if (isMounted && res.success && res.data) {
        setStoresList(res.data as StoreItem[])
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

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeName.trim()) return

    setStoreMessage(null)
    startStoreTransition(async () => {
      const result = await addStore(storeName)
      if (result.success && result.data) {
        setStoreMessage({ type: "success", text: t("store_added_success") })
        setStoresList((prev) => [...prev, result.data as StoreItem])
        setStoreName("")
        setTimeout(() => setStoreMessage(null), 3000)
      } else {
        setStoreMessage({ type: "error", text: result.error || t("store_add_error") })
      }
    })
  }

  const handleDeleteStore = async (id: string) => {
    if (!confirm(t("store_delete_confirm"))) return

    setDeletingStoreId(id)
    const result = await deleteStore(id)
    setDeletingStoreId(null)

    if (result.success) {
      setStoresList((prev) => prev.filter((s) => s.id !== id))
    } else {
      alert(result.error || t("store_delete_error"))
    }
  }

  const defaultStores = storesList.filter((s) => s.isDefault)
  const customStores = storesList.filter((s) => !s.isDefault)

  return (
    <div className="flex flex-1 flex-col items-center px-4 sm:px-8 py-6 sm:py-8">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary-hover">
            <Settings className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
              {t("settings")}
            </h1>
            <p className="text-xs text-zinc-400 font-sans">
              Personaliza idioma, plataformas, tendas e copias de seguridade.
            </p>
          </div>
        </div>

        {/* Section 1: Language */}
        <GlassPanel>
          <div className="flex items-center gap-2.5 mb-1.5">
            <Globe className="w-5 h-5 text-primary-hover" aria-hidden="true" />
            <h2 className="text-lg font-display font-semibold text-white">{t("language")}</h2>
          </div>
          <p className="text-xs text-zinc-400 font-sans mb-4">
            Selecciona o idioma principal da interface.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLanguage("gl")}
              aria-pressed={language === "gl"}
              className={`py-3 px-4 rounded-xl font-sans text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                language === "gl"
                  ? "bg-primary/20 text-white border-primary/60 shadow-[0_0_20px_rgba(168,85,247,0.28)]"
                  : "bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <span>Galego</span>
              {language === "gl" && <Check className="w-4 h-4 text-primary-hover" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={() => setLanguage("pt")}
              aria-pressed={language === "pt"}
              className={`py-3 px-4 rounded-xl font-sans text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                language === "pt"
                  ? "bg-primary/20 text-white border-primary/60 shadow-[0_0_20px_rgba(168,85,247,0.28)]"
                  : "bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <span>Português</span>
              {language === "pt" && <Check className="w-4 h-4 text-primary-hover" aria-hidden="true" />}
            </button>
          </div>
        </GlassPanel>

        {/* Section 2: Custom Platforms */}
        <GlassPanel>
          <div className="flex items-center gap-2.5 mb-1.5">
            <Gamepad2 className="w-5 h-5 text-primary-hover" aria-hidden="true" />
            <h2 className="text-lg font-display font-semibold text-white">
              {t("custom_platforms_title")}
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mb-4 font-sans leading-relaxed">
            {t("custom_platforms_desc")}
          </p>

          <form onSubmit={handleAddPlatform} className="flex gap-2 mb-5 items-end">
            <div className="flex-1">
              <Input
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                placeholder={t("platform_name_placeholder")}
                disabled={isPending}
              />
            </div>
            <Button
              type="submit"
              disabled={isPending || platformName.trim().length === 0}
              className="h-[42px] shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>{isPending ? t("saving") : t("add_platform_btn")}</span>
            </Button>
          </form>

          {message && (
            <p
              className={`mb-4 text-xs font-mono ${
                message.type === "success" ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {message.text}
            </p>
          )}

          <div className="pt-4 border-t border-white/[0.08]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block mb-3">
              As túas plataformas activas ({platforms.length})
            </span>

            {platforms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {platforms.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-sans text-zinc-200"
                  >
                    <span>{p.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeletePlatform(p.id)}
                      disabled={deletingId === p.id}
                      className="text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title={t("delete")}
                      aria-label={`${t("delete")} ${p.name}`}
                    >
                      {deletingId === p.id ? "..." : <X className="w-3.5 h-3.5" aria-hidden="true" />}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">{t("no_custom_platforms")}</p>
            )}
          </div>
        </GlassPanel>

        {/* Section 3: Stores */}
        <GlassPanel>
          <div className="flex items-center gap-2.5 mb-1.5">
            <Store className="w-5 h-5 text-primary-hover" aria-hidden="true" />
            <h2 className="text-lg font-display font-semibold text-white">{t("stores_title")}</h2>
          </div>
          <p className="text-xs text-zinc-400 mb-4 font-sans leading-relaxed">{t("stores_desc")}</p>

          <form onSubmit={handleAddStore} className="flex gap-2 mb-5 items-end">
            <div className="flex-1">
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder={t("store_name_placeholder")}
                disabled={isStorePending}
              />
            </div>
            <Button
              type="submit"
              disabled={isStorePending || storeName.trim().length === 0}
              className="h-[42px] shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>{isStorePending ? t("saving") : t("add_store_btn")}</span>
            </Button>
          </form>

          {storeMessage && (
            <p
              className={`mb-4 text-xs font-mono ${
                storeMessage.type === "success" ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {storeMessage.text}
            </p>
          )}

          <div className="pt-4 border-t border-white/[0.08]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block mb-3">
              {t("stores_default_label")} ({defaultStores.length})
            </span>
            {defaultStores.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {defaultStores.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/[0.07] border border-amber-500/20 text-xs font-sans text-zinc-200"
                  >
                    <span>{s.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic mb-4">{t("no_stores")}</p>
            )}
          </div>

          {customStores.length > 0 && (
            <div className="pt-3 border-t border-white/[0.08]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block mb-3">
                {t("stores_custom_label")} ({customStores.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {customStores.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-sans text-zinc-200"
                  >
                    <span>{s.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteStore(s.id)}
                      disabled={deletingStoreId === s.id}
                      className="text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title={t("delete")}
                      aria-label={`${t("delete")} ${s.name}`}
                    >
                      {deletingStoreId === s.id ? "..." : <X className="w-3.5 h-3.5" aria-hidden="true" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassPanel>

        {/* Section 4: Install as Mobile App (PWA) */}
        <GlassPanel>
          <div className="flex items-center gap-2.5 mb-1.5">
            <Smartphone className="w-5 h-5 text-primary-hover" aria-hidden="true" />
            <h2 className="text-lg font-display font-semibold text-white">
              {t("pwa_settings_title")}
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mb-4 font-sans leading-relaxed">
            {t("pwa_settings_desc")}
          </p>

          {isStandalone ? (
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-400/35 px-3.5 py-2.5 text-xs font-medium text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>{t("pwa_installed_badge")}</span>
            </div>
          ) : canInstallPrompt ? (
            <div className="flex flex-col items-start gap-2.5">
              <Button
                type="button"
                aria-disabled={isInstalling ? "true" : undefined}
                onClick={async () => {
                  if (isInstalling) return
                  const outcome = await triggerInstall()
                  if (outcome === "installed") {
                    setPwaFeedback(t("pwa_install_success"))
                  } else if (outcome === "dismissed") {
                    setPwaFeedback(t("pwa_install_canceled"))
                  } else if (outcome === "error") {
                    setPwaFeedback(t("pwa_install_error"))
                  }
                }}
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>{isInstalling ? t("pwa_installing") : t("pwa_install_btn")}</span>
              </Button>
              {pwaFeedback && (
                <p role="status" className="text-xs font-mono text-purple-200">
                  {pwaFeedback}
                </p>
              )}
            </div>
          ) : isIOSInstallable ? (
            <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-3.5 text-xs text-zinc-200 font-sans leading-relaxed flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Share className="w-4 h-4 text-primary-hover shrink-0" aria-hidden="true" />
                <span>{t("pwa_ios_step_1")}</span>
              </div>
              <div className="flex items-center gap-2">
                <PlusSquare className="w-4 h-4 text-primary-hover shrink-0" aria-hidden="true" />
                <span>{t("pwa_ios_step_2")}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              {t("pwa_browser_menu_hint")}
            </p>
          )}
        </GlassPanel>

        {/* Section 5: Data Export / Backup */}
        <GlassPanel variant="accent">
          <div className="flex items-center gap-2.5 mb-1.5">
            <Download className="w-5 h-5 text-primary-hover" aria-hidden="true" />
            <h2 className="text-lg font-display font-semibold text-white">
              {t("backup_title") || "Copia de Seguridade"}
            </h2>
          </div>
          <p className="text-xs text-zinc-300/80 mb-5 font-sans leading-relaxed">
            {t("backup_desc") ||
              "Exporta toda a túa biblioteca, partidas, prezos e notas nun ficheiro JSON estándar."}
          </p>

          <Button
            type="button"
            variant="glass"
            onClick={handleExportData}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 text-primary-hover" aria-hidden="true" />
            <span>
              {isExporting
                ? t("backup_exporting") || "Xerando..."
                : t("backup_btn") || "Descargar Copia de Seguridade (JSON)"}
            </span>
          </Button>
        </GlassPanel>
      </div>
    </div>
  )
}
