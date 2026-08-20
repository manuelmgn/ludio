"use client"

import { useActionState } from "react"
import { authenticate } from "../actions/login"
import Link from "next/link"

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(authenticate, null)

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form action={formAction} className="w-full max-w-md p-8 bg-zinc-900 rounded-lg shadow-xl flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center text-white mb-4">Iniciar sesión</h1>
        
        {state?.error && (
          <div className="p-3 bg-red-900/50 text-red-200 border border-red-700 rounded text-sm">
            {state.error}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">Email</label>
          <input name="email" type="email" required className="p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-zinc-500 outline-none" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">Contraseña</label>
          <input name="password" type="password" required className="p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-zinc-500 outline-none" />
        </div>

        {/* This hidden input helps NextAuth know where to redirect after successful login */}
        <input type="hidden" name="redirectTo" value="/dashboard" />

        <button disabled={isPending} type="submit" className="mt-4 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium disabled:opacity-50">
          {isPending ? "Iniciando sesión..." : "Entrar"}
        </button>

        <p className="text-center text-sm text-zinc-400 mt-2">
          ¿No tienes cuenta? <Link href="/register" className="text-blue-400 hover:underline">Regístrate</Link>
        </p>
      </form>
    </div>
  )
}
