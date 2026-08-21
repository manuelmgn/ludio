"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"

interface DashboardClientProps {
  user?: {
    name?: string | null
    email?: string | null
  }
  signOutAction: () => Promise<void>
}

export function DashboardClient({ user, signOutAction }: DashboardClientProps) {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative">
      {/* Background decoration for the glass effect to be visible */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[100px] -z-10 mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] -z-10 mix-blend-screen" />

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="text-sm font-medium text-white/50">{t("language")}:</span>
        <div className="flex gap-1 bg-black/20 p-1 rounded-lg backdrop-blur-sm border border-white/5">
          <button
            onClick={() => setLanguage("gl")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              language === "gl" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            GL
          </button>
          <button
            onClick={() => setLanguage("pt")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              language === "pt" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            PT
          </button>
        </div>
      </div>

      <GlassPanel className="max-w-lg w-full flex flex-col items-center text-center">
        <h1 className="text-4xl mb-4 text-white drop-shadow-sm font-pixel tracking-wider">
          {t("welcome")}
        </h1>
        
        <p className="text-zinc-300 mb-8 font-sans">
          {user?.name} <span className="text-white/40">({user?.email})</span>
        </p>
        
        <form action={signOutAction}>
          <Button type="submit" variant="glass">
            {t("logout")}
          </Button>
        </form>
      </GlassPanel>
    </div>
  )
}
