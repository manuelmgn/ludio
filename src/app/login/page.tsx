"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Gamepad2, Mail, Lock, AlertCircle } from "lucide-react"
import { authenticate } from "../actions/login"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useLanguage } from "@/contexts/LanguageContext"

export default function LoginPage() {
  const { t } = useLanguage()
  const [state, formAction, isPending] = useActionState(authenticate, null)

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <GlassPanel variant="elevated" className="w-full max-w-md p-8 flex flex-col gap-6">
        <div className="text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-800 border border-purple-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.45)]">
              <Gamepad2 className="w-5 h-5 text-white" aria-hidden="true" />
            </span>
            <span className="font-pixel text-4xl text-white tracking-widest drop-shadow-[0_0_16px_rgba(168,85,247,0.6)]">
              LUDIO
            </span>
          </div>
          <h1 className="text-xl font-display font-semibold text-white">{t("login")}</h1>
          <p className="text-xs text-zinc-400 mt-1">{t("login_subtitle")}</p>
        </div>

        {state?.error && (
          <div className="p-3 bg-rose-500/10 text-rose-200 border border-rose-500/30 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <Input
            id="login-email"
            label={t("email_label")}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="gamer@ludio.app"
            disabled={isPending}
            icon={<Mail className="w-4 h-4" aria-hidden="true" />}
          />

          <Input
            id="login-password"
            label={t("password_label")}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            disabled={isPending}
            icon={<Lock className="w-4 h-4" aria-hidden="true" />}
          />

          <input type="hidden" name="redirectTo" value="/dashboard" />

          <Button type="submit" disabled={isPending} className="mt-2 w-full">
            {isPending ? t("login_pending") : t("login")}
          </Button>
        </form>

        <p className="text-center text-xs text-zinc-400 font-sans">
          {t("no_account")}{" "}
          <Link href="/register" className="text-primary-hover hover:underline font-medium">
            {t("register")}
          </Link>
        </p>
      </GlassPanel>
    </div>
  )
}
