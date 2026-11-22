"use client"

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/contexts/LanguageContext"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"
import type { UserStats } from "./page"

interface DashboardClientProps {
  user?: {
    name?: string | null
    email?: string | null
  }
  stats: UserStats
  signOutAction: () => Promise<void>
}

export function DashboardClient({ user, stats, signOutAction }: DashboardClientProps) {
  const { language, setLanguage, t } = useLanguage()

  const statusBadges: Record<string, { label: string; color: string }> = {
    PLAYING: { label: t("filter_playing") || "Xogando", color: "bg-blue-950/80 text-blue-300 border-blue-500/40" },
    COMPLETED: { label: t("filter_completed") || "Completado", color: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40" },
    ON_HOLD: { label: t("filter_on_hold") || "En Pausa", color: "bg-amber-950/80 text-amber-300 border-amber-500/40" },
    ABANDONED: { label: t("filter_abandoned") || "Abandonado", color: "bg-rose-950/80 text-rose-300 border-rose-500/40" },
    WISH: { label: t("filter_wish") || "Desexado", color: "bg-purple-950/80 text-purple-300 border-purple-500/40" },
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-4 sm:p-8 relative">
      {/* Background decoration */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[140px] -z-10" />

      <div className="w-full max-w-5xl mt-6 flex flex-col gap-8">
        
        {/* Header Profile Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-purple-400 p-0.5 shadow-[0_0_20px_rgba(157,0,255,0.4)]">
              <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center text-2xl font-pixel text-purple-200">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "LU"}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-pixel text-white tracking-wider">
                  {user?.name || "Xogador"}
                </h1>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-purple-300 border border-primary/30">
                  Nivel 1
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5 backdrop-blur-md">
              <button
                onClick={() => setLanguage("gl")}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                  language === "gl" ? "bg-primary text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                GL
              </button>
              <button
                onClick={() => setLanguage("pt")}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                  language === "pt" ? "bg-primary text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                PT
              </button>
            </div>

            <Link
              href="/settings"
              className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-sans border border-white/10 transition-colors"
            >
              ⚙️ {t("settings")}
            </Link>

            <form action={signOutAction}>
              <Button type="submit" variant="glass" className="text-xs py-1.5 px-3">
                {t("logout")}
              </Button>
            </form>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassPanel className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-sans">
              <span>Colección Total</span>
              <span className="text-lg">📚</span>
            </div>
            <span className="text-3xl font-pixel text-white tracking-wider">
              {stats.totalGames}
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              {stats.totalGames === 1 ? "1 xogo rexistrado" : `${stats.totalGames} xogos rexistrados`}
            </span>
          </GlassPanel>

          <GlassPanel className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-sans">
              <span>Xogos Completados</span>
              <span className="text-lg">🏆</span>
            </div>
            <span className="text-3xl font-pixel text-emerald-400 tracking-wider">
              {stats.completedCount}
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              {stats.totalGames > 0
                ? `${Math.round((stats.completedCount / stats.totalGames) * 100)}% da colección`
                : "0% da colección"}
            </span>
          </GlassPanel>

          <GlassPanel className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-sans">
              <span>Actualmente Xogando</span>
              <span className="text-lg">🕹️</span>
            </div>
            <span className="text-3xl font-pixel text-blue-400 tracking-wider">
              {stats.playingCount}
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              Partidas en curso
            </span>
          </GlassPanel>

          <GlassPanel className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-sans">
              <span>Valoración Media</span>
              <span className="text-lg">⭐</span>
            </div>
            <span className="text-3xl font-pixel text-amber-400 tracking-wider">
              {stats.averageRating ? `${stats.averageRating} / 5` : "—"}
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              {stats.ratedGamesCount > 0 ? `${stats.ratedGamesCount} con puntuación` : "Sen valorar aínda"}
            </span>
          </GlassPanel>
        </div>

        {/* Status Distribution Pills */}
        <GlassPanel className="p-5 flex flex-col gap-4">
          <h2 className="text-sm font-sans text-zinc-300 font-medium uppercase tracking-wider">
            Distribución da Biblioteca
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs font-sans">
              <span className="text-blue-300">🕹️ {t("filter_playing")}</span>
              <strong className="text-white font-mono text-sm">{stats.playingCount}</strong>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs font-sans">
              <span className="text-emerald-300">🏆 {t("filter_completed")}</span>
              <strong className="text-white font-mono text-sm">{stats.completedCount}</strong>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs font-sans">
              <span className="text-amber-300">⏸️ {t("filter_on_hold")}</span>
              <strong className="text-white font-mono text-sm">{stats.onHoldCount}</strong>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs font-sans">
              <span className="text-rose-300">🛑 {t("filter_abandoned")}</span>
              <strong className="text-white font-mono text-sm">{stats.abandonedCount}</strong>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs font-sans col-span-2 sm:col-span-1">
              <span className="text-purple-300">⭐ {t("filter_wish")}</span>
              <strong className="text-white font-mono text-sm">{stats.wishlistCount}</strong>
            </div>
          </div>
        </GlassPanel>

        {/* Gamer Economy / Financial Section */}
        <GlassPanel className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">💶</span>
              <h2 className="text-sm font-sans text-zinc-300 font-medium uppercase tracking-wider">
                {t("economy_title") || "Economía Gamer & Prezos"}
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {stats.pricingGamesCount} {t("pricing_games_tracked") || "xogos con prezos rexistrados"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 flex flex-col gap-1">
              <span className="text-xs text-rose-300/80 font-sans flex items-center gap-1.5">
                <span>💸</span> {t("total_spent") || "Total Invertido (Compras)"}
              </span>
              <span className="text-2xl font-pixel text-rose-400 tracking-wider">
                {stats.totalSpent.toFixed(2)}€
              </span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col gap-1">
              <span className="text-xs text-emerald-300/80 font-sans flex items-center gap-1.5">
                <span>💰</span> {t("total_earned") || "Total Recuperado (Vendas)"}
              </span>
              <span className="text-2xl font-pixel text-emerald-400 tracking-wider">
                {stats.totalEarned.toFixed(2)}€
              </span>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-col gap-1">
              <span className="text-xs text-purple-300/80 font-sans flex items-center gap-1.5">
                <span>⚖️</span> {t("net_balance") || "Balance Neto"}
              </span>
              <span className={`text-2xl font-pixel tracking-wider ${stats.netBalance >= 0 ? "text-emerald-400" : "text-zinc-200"}`}>
                {stats.netBalance >= 0 ? `+${stats.netBalance.toFixed(2)}€` : `${stats.netBalance.toFixed(2)}€`}
              </span>
            </div>
          </div>
        </GlassPanel>

        {/* Recent Activity Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-pixel text-white tracking-wider flex items-center gap-2">
              <span>⏱️</span>
              <span>Actividade Recente</span>
            </h2>
            <Link href="/library" className="text-xs font-mono text-primary hover:underline">
              Ver toda a biblioteca →
            </Link>
          </div>

          {stats.recentEntries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.recentEntries.map((entry) => {
                const badge = entry.latestStatus ? statusBadges[entry.latestStatus] : null
                return (
                  <GlassPanel
                    key={entry.id}
                    className="p-4 flex gap-4 items-center group hover:border-primary/40 transition-all"
                  >
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-zinc-900/60 relative flex-shrink-0">
                      {entry.game.coverUrl ? (
                        <Image
                          src={entry.game.coverUrl}
                          alt={entry.game.title}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#3c006b] text-[10px] text-purple-200 text-center p-1">
                          {entry.game.title}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      <Link
                        href={`/games/${entry.game.id}`}
                        className="text-sm font-medium text-white hover:text-primary transition-colors line-clamp-1"
                      >
                        {entry.game.title}
                      </Link>

                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {badge && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${badge.color}`}>
                            {badge.label}
                          </span>
                        )}
                        {entry.rating && (
                          <span className="text-amber-400 text-xs font-mono">
                            ⭐ {entry.rating}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/5 text-[11px] font-mono">
                        <Link
                          href={`/games/${entry.game.id}/canvas`}
                          className="text-primary hover:underline"
                        >
                          🎨 Canvas
                        </Link>
                        <Link
                          href={`/games/${entry.game.id}/journal`}
                          className="text-zinc-400 hover:text-white"
                        >
                          📖 Diario
                        </Link>
                      </div>
                    </div>
                  </GlassPanel>
                )
              })}
            </div>
          ) : (
            <GlassPanel className="p-8 text-center flex flex-col items-center justify-center">
              <span className="text-4xl mb-3">🎮</span>
              <p className="text-sm text-zinc-300 font-sans mb-4">
                Aínda non tes xogos na túa biblioteca. Comeza explorando xogos!
              </p>
              <Link
                href="/search"
                className="text-xs font-medium px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
              >
                Buscar Xogos →
              </Link>
            </GlassPanel>
          )}
        </div>

      </div>
    </div>
  )
}
