"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Download, Share, PlusSquare, X, WifiOff, Smartphone } from "lucide-react"
import { usePwa } from "@/contexts/PwaContext"
import { useLanguage } from "@/contexts/LanguageContext"

export function PwaInstallBanner() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const {
    isStandalone,
    isOnline,
    canInstallPrompt,
    isIOSInstallable,
    isInstalling,
    bannerDismissed,
    dismissBanner,
    triggerInstall,
  } = usePwa()
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const isAuthPage =
    pathname === "/login" || pathname === "/register" || pathname === "/offline"

  const showInstallBanner =
    !isStandalone &&
    !bannerDismissed &&
    !isAuthPage &&
    (canInstallPrompt || isIOSInstallable)

  const handleInstallClick = async () => {
    if (isInstalling) return
    const result = await triggerInstall()
    if (result === "installed") {
      setStatusMessage(t("pwa_install_success"))
    } else if (result === "dismissed") {
      setStatusMessage(t("pwa_install_canceled"))
    } else if (result === "error") {
      setStatusMessage(t("pwa_install_error"))
    }
  }

  return (
    <>
      {/* Live Offline Connectivity Pill */}
      {!isOnline && pathname !== "/offline" && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 top-0 z-[60] flex justify-center px-3 pt-[max(0.5rem,env(safe-area-inset-top,0px))] pointer-events-none"
        >
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-amber-950/90 border border-amber-400/35 px-3.5 py-1.5 text-xs font-sans text-amber-100 shadow-lg backdrop-blur-xl">
            <WifiOff className="w-3.5 h-3.5 text-amber-300 shrink-0" aria-hidden="true" />
            <span>{t("pwa_offline_banner")}</span>
          </div>
        </div>
      )}

      {/* Install Prompt Banner (Android/Chromium native prompt or iOS Safari guide) */}
      {showInstallBanner && (
        <aside
          aria-label={t("pwa_install_title")}
          className="fixed inset-x-3 md:inset-x-auto md:right-6 bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] md:bottom-6 z-40 md:w-96 animate-page-enter"
        >
          <div className="liquid-glass rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-800 border border-purple-300/35 flex items-center justify-center text-white shrink-0 shadow-[0_6px_20px_-4px_rgba(168,85,247,0.55)]">
                  <Smartphone className="w-5 h-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-display font-semibold text-white leading-tight">
                    {t("pwa_install_title")}
                  </p>
                  <p className="text-xs text-zinc-300/85 font-sans mt-0.5 leading-snug">
                    {t("pwa_install_subtitle")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={dismissBanner}
                aria-label={t("pwa_dismiss")}
                className="p-2 -mr-1 -mt-1 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {canInstallPrompt ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  aria-disabled={isInstalling ? "true" : undefined}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 px-4 py-2.5 text-xs font-medium text-white border border-purple-300/35 shadow-[0_6px_20px_-4px_rgba(168,85,247,0.55)] transition-all active:scale-[0.98] cursor-pointer aria-disabled:opacity-60"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>{isInstalling ? t("pwa_installing") : t("pwa_install_btn")}</span>
                </button>
                <button
                  type="button"
                  onClick={dismissBanner}
                  className="px-3.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-sans text-zinc-300 transition-colors cursor-pointer"
                >
                  {t("pwa_later")}
                </button>
              </div>
            ) : (
              <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-3 text-xs text-zinc-200 font-sans leading-relaxed flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Share className="w-4 h-4 text-primary-hover shrink-0" aria-hidden="true" />
                  <span>{t("pwa_ios_step_1")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlusSquare className="w-4 h-4 text-primary-hover shrink-0" aria-hidden="true" />
                  <span>{t("pwa_ios_step_2")}</span>
                </div>
              </div>
            )}

            {statusMessage && (
              <p role="status" className="text-[11px] font-mono text-purple-200">
                {statusMessage}
              </p>
            )}
          </div>
        </aside>
      )}
    </>
  )
}
