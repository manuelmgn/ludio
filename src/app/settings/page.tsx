"use client"

import { useState, useTransition, useEffect } from "react"
import {
  Settings,
  Globe,
  Gamepad2,
  Store,
  Layers,
  Download,
  Check,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { usePwa } from "@/contexts/PwaContext"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"
import { PageContainer, PageHeader } from "@/components/ui/PageShell"
import { SettingsTagSection } from "./SettingsTagSection"
import { sortByNameAlphabetically } from "@/lib/game-utils"
import {
  addCustomPlatform,
  getCustomPlatforms,
  deleteCustomPlatform,
  getStores,
  addStore,
  deleteStore,
  getPlans,
  addPlan,
  deletePlan,
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

interface PlanItem {
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

  const [planName, setPlanName] = useState("")
  const [plansList, setPlansList] = useState<PlanItem[]>([])
  const [isPlanPending, startPlanTransition] = useTransition()
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null)
  const [planMessage, setPlanMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

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
        setPlatforms(sortByNameAlphabetically(res.data))
      }
    })
    getStores().then((res) => {
      if (isMounted && res.success && res.data) {
        setStoresList(sortByNameAlphabetically(res.data as StoreItem[]))
      }
    })
    getPlans().then((res) => {
      if (isMounted && res.success && res.data) {
        setPlansList(sortByNameAlphabetically(res.data as PlanItem[]))
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
        setPlatforms((prev) => sortByNameAlphabetically([...prev, result.data as CustomPlatform]))
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
        setStoresList((prev) => sortByNameAlphabetically([...prev, result.data as StoreItem]))
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

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planName.trim()) return

    setPlanMessage(null)
    startPlanTransition(async () => {
      const result = await addPlan(planName)
      if (result.success && result.data) {
        setPlanMessage({ type: "success", text: t("plan_added_success") })
        setPlansList((prev) => sortByNameAlphabetically([...prev, result.data as PlanItem]))
        setPlanName("")
        setTimeout(() => setPlanMessage(null), 3000)
      } else {
        setPlanMessage({ type: "error", text: result.error || t("plan_add_error") })
      }
    })
  }

  const handleDeletePlan = async (id: string) => {
    if (!confirm(t("plan_delete_confirm"))) return

    setDeletingPlanId(id)
    const result = await deletePlan(id)
    setDeletingPlanId(null)

    if (result.success) {
      setPlansList((prev) => prev.filter((p) => p.id !== id))
    } else {
      alert(result.error || t("plan_delete_error"))
    }
  }

  const defaultStores = sortByNameAlphabetically(storesList.filter((s) => s.isDefault))
  const customStores = sortByNameAlphabetically(storesList.filter((s) => !s.isDefault))
  const defaultPlans = sortByNameAlphabetically(plansList.filter((p) => p.isDefault))
  const customPlans = sortByNameAlphabetically(plansList.filter((p) => !p.isDefault))

  return (
    <PageContainer>
      <PageHeader
        icon={<Settings className="w-5 h-5" aria-hidden="true" />}
        title={t("settings")}
        description="Personaliza idioma, plataformas, tendas, plans e copias de seguridade."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
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
                  ? "bg-gradient-to-b from-purple-500/30 to-purple-700/30 text-white border-purple-400/55 shadow-[0_0_20px_rgba(168,85,247,0.28),inset_0_1px_0_rgba(255,255,255,0.2)]"
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
                  ? "bg-gradient-to-b from-purple-500/30 to-purple-700/30 text-white border-purple-400/55 shadow-[0_0_20px_rgba(168,85,247,0.28),inset_0_1px_0_rgba(255,255,255,0.2)]"
                  : "bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <span>Português</span>
              {language === "pt" && <Check className="w-4 h-4 text-primary-hover" aria-hidden="true" />}
            </button>
          </div>
        </GlassPanel>

        {/* Section 2: Custom Platforms */}
        <SettingsTagSection
          icon={<Gamepad2 className="w-5 h-5" aria-hidden="true" />}
          title={t("custom_platforms_title")}
          description={t("custom_platforms_desc")}
          inputValue={platformName}
          onInputChange={setPlatformName}
          placeholder={t("platform_name_placeholder")}
          addButtonLabel={t("add_platform_btn")}
          savingLabel={t("saving")}
          isPending={isPending}
          onSubmit={handleAddPlatform}
          feedback={message}
          customItems={platforms}
          customItemsLabel="As túas plataformas activas"
          emptyCustomText={t("no_custom_platforms")}
          deletingId={deletingId}
          deleteLabel={t("delete")}
          onDelete={handleDeletePlatform}
        />

        {/* Section 3: Stores */}
        <SettingsTagSection
          icon={<Store className="w-5 h-5" aria-hidden="true" />}
          title={t("stores_title")}
          description={t("stores_desc")}
          inputValue={storeName}
          onInputChange={setStoreName}
          placeholder={t("store_name_placeholder")}
          addButtonLabel={t("add_store_btn")}
          savingLabel={t("saving")}
          isPending={isStorePending}
          onSubmit={handleAddStore}
          feedback={storeMessage}
          defaultItems={defaultStores}
          defaultItemsLabel={t("stores_default_label")}
          defaultChipClassName="bg-amber-500/[0.07] border-amber-500/20"
          emptyDefaultText={t("no_stores")}
          customItems={customStores}
          customItemsLabel={t("stores_custom_label")}
          deletingId={deletingStoreId}
          deleteLabel={t("delete")}
          onDelete={handleDeleteStore}
        />

        {/* Section 4: Plans */}
        <SettingsTagSection
          icon={<Layers className="w-5 h-5" aria-hidden="true" />}
          title={t("plans_title")}
          description={t("plans_desc")}
          inputValue={planName}
          onInputChange={setPlanName}
          placeholder={t("plan_name_placeholder")}
          addButtonLabel={t("add_plan_btn")}
          savingLabel={t("saving")}
          isPending={isPlanPending}
          onSubmit={handleAddPlan}
          feedback={planMessage}
          defaultItems={defaultPlans}
          defaultItemsLabel={t("plans_default_label")}
          defaultChipClassName="bg-purple-500/[0.08] border-purple-400/25"
          emptyDefaultText={t("no_plans")}
          customItems={customPlans}
          customItemsLabel={t("plans_custom_label")}
          deletingId={deletingPlanId}
          deleteLabel={t("delete")}
          onDelete={handleDeletePlan}
        />

        {/* Section 5: Install as Mobile App (PWA) */}
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
    </PageContainer>
  )
}
