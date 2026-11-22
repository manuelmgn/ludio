"use client"

import { useActionState } from "react"
import { registerUser } from "../actions/register"
import Link from "next/link"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useLanguage } from "@/contexts/LanguageContext"

export default function RegisterPage() {
  const { t } = useLanguage()
  const [state, formAction, isPending] = useActionState(registerUser, null)

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4 relative">
      {/* Background decoration */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-1/3 right-1/4 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[140px] -z-10" />

      <GlassPanel className="w-full max-w-md p-8 flex flex-col gap-6 border-white/15 shadow-2xl">
        <div className="text-center">
          <Link href="/" className="font-pixel text-4xl text-primary font-bold tracking-widest drop-shadow-[0_0_12px_rgba(157,0,255,0.6)]">
            LUDIO
          </Link>
          <h1 className="text-xl font-sans font-medium text-white mt-3">
            {t("register")}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {t("register_subtitle")}
          </p>
        </div>

        {state?.error && (
          <div className="p-3 bg-rose-500/10 text-rose-200 border border-rose-500/30 rounded-xl text-xs">
            {state.error}
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <Input
            label={t("email_label")}
            name="email"
            type="email"
            required
            placeholder="gamer@ludio.app"
            disabled={isPending}
          />

          <Input
            label={t("username_label")}
            name="username"
            type="text"
            required
            placeholder="pixel_warrior"
            disabled={isPending}
          />

          <Input
            label={t("password_label")}
            name="password"
            type="password"
            required
            placeholder="••••••••"
            disabled={isPending}
          />

          <Button type="submit" disabled={isPending} className="mt-2 w-full">
            {isPending ? t("register_pending") : t("register")}
          </Button>
        </form>

        <p className="text-center text-xs text-zinc-400 font-sans">
          {t("have_account")}{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            {t("login")}
          </Link>
        </p>
      </GlassPanel>
    </div>
  )
}
