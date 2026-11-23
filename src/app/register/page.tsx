"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Mail, User, Lock, AlertCircle } from "lucide-react"
import { registerUser } from "../actions/register"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { LudioLogo } from "@/components/brand/LudioLogo"
import { useLanguage } from "@/contexts/LanguageContext"

export default function RegisterPage() {
  const { t } = useLanguage()
  const [state, formAction, isPending] = useActionState(registerUser, null)

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <GlassPanel variant="elevated" className="w-full max-w-md p-8 flex flex-col gap-6">
        <div className="text-center flex flex-col items-center">
          <div className="mb-4">
            <LudioLogo size="lg" />
          </div>
          <h1 className="text-xl font-display font-semibold text-white">{t("register")}</h1>
          <p className="text-xs text-zinc-400 mt-1">{t("register_subtitle")}</p>
        </div>

        {state?.error && (
          <div className="p-3 bg-rose-500/10 text-rose-200 border border-rose-500/30 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <Input
            id="register-email"
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
            id="register-username"
            label={t("username_label")}
            name="username"
            type="text"
            autoComplete="username"
            required
            placeholder="pixel_warrior"
            disabled={isPending}
            icon={<User className="w-4 h-4" aria-hidden="true" />}
          />

          <Input
            id="register-password"
            label={t("password_label")}
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            disabled={isPending}
            icon={<Lock className="w-4 h-4" aria-hidden="true" />}
          />

          <Button type="submit" disabled={isPending} className="mt-2 w-full">
            {isPending ? t("register_pending") : t("register")}
          </Button>
        </form>

        <p className="text-center text-xs text-zinc-400 font-sans">
          {t("have_account")}{" "}
          <Link href="/login" className="text-primary-hover hover:underline font-medium">
            {t("login")}
          </Link>
        </p>
      </GlassPanel>
    </div>
  )
}
