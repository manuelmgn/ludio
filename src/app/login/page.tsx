"use client"

import { useActionState } from "react"
import { authenticate } from "../actions/login"
import Link from "next/link"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/contexts/LanguageContext"

export default function LoginPage() {
  const { t } = useLanguage()
  const [state, formAction, isPending] = useActionState(authenticate, null)

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4 relative">
      {/* Background decoration */}
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-1/3 left-1/4 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[140px] -z-10" />

      <GlassPanel className="w-full max-w-md p-8 flex flex-col gap-6 border-white/15 shadow-2xl">
        <div className="text-center">
          <Link href="/" className="font-pixel text-4xl text-primary font-bold tracking-widest drop-shadow-[0_0_12px_rgba(157,0,255,0.6)]">
            LUDIO
          </Link>
          <h1 className="text-xl font-sans font-medium text-white mt-3">
            {t("login")}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Entra no teu santuario persoal de videoxogos
          </p>
        </div>

        {state?.error && (
          <div className="p-3 bg-rose-500/10 text-rose-200 border border-rose-500/30 rounded-xl text-xs">
            {state.error}
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans text-zinc-300 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="gamer@ludio.app"
              disabled={isPending}
              className="p-3 rounded-xl bg-black/40 text-white border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none font-sans text-sm placeholder-zinc-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans text-zinc-300 uppercase tracking-wider">
              Contrasinal
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              disabled={isPending}
              className="p-3 rounded-xl bg-black/40 text-white border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none font-sans text-sm placeholder-zinc-500 transition-all"
            />
          </div>

          <input type="hidden" name="redirectTo" value="/dashboard" />

          <Button type="submit" disabled={isPending} className="mt-2 w-full">
            {isPending ? "Iniciando sesión..." : t("login")}
          </Button>
        </form>

        <p className="text-center text-xs text-zinc-400 font-sans">
          ¿Aínda non tes conta?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            {t("register")}
          </Link>
        </p>
      </GlassPanel>
    </div>
  )
}
