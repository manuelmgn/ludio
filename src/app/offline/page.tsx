"use client"

import Link from "next/link"
import { WifiOff, RefreshCw, Home } from "lucide-react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"
import { LudioLogo } from "@/components/brand/LudioLogo"
import { useLanguage } from "@/contexts/LanguageContext"

export default function OfflinePage() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <GlassPanel
        variant="elevated"
        className="w-full max-w-md p-8 text-center flex flex-col items-center gap-5"
      >
        <LudioLogo size="md" />

        <span className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/35 flex items-center justify-center text-primary-hover shadow-[0_0_28px_rgba(168,85,247,0.3)]">
          <WifiOff className="w-7 h-7" aria-hidden="true" />
        </span>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">
            {t("pwa_offline_title")}
          </h1>
          <p className="text-sm text-zinc-400 font-sans leading-relaxed">
            {t("pwa_offline_desc")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-2">
          <Button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:flex-1"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>{t("pwa_offline_retry")}</span>
          </Button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>{t("home")}</span>
          </Link>
        </div>
      </GlassPanel>
    </div>
  )
}
