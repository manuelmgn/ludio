"use client"

import Link from "next/link"
import Image from "next/image"
import {
  Settings,
  LogOut,
  Library,
  Trophy,
  Gamepad2,
  Star,
  Wallet,
  TrendingDown,
  TrendingUp,
  Scale,
  Clock,
  Palette,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button, buttonVariants } from "@/components/ui/Button"
import { EmptyState, PageContainer } from "@/components/ui/PageShell"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { LibraryStatusKey } from "@/lib/game-utils"
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
  const { t } = useLanguage()

  const completionPct =
    stats.totalGames > 0 ? Math.round((stats.completedCount / stats.totalGames) * 100) : 0
  const playerLevel = Math.max(1, Math.floor((stats.completedCount * 2 + stats.totalGames) / 5) + 1)

  const distributionSegments = [
    {
      key: "PLAYING",
      label: t("filter_playing") || "Xogando",
      count: stats.playingCount,
      barColor: "bg-sky-400",
      dotColor: "bg-sky-400",
      tileClass: "bg-sky-950/25 border-sky-500/20 text-sky-200",
    },
    {
      key: "COMPLETED",
      label: t("filter_completed") || "Completado",
      count: stats.completedCount,
      barColor: "bg-emerald-400",
      dotColor: "bg-emerald-400",
      tileClass: "bg-emerald-950/25 border-emerald-500/20 text-emerald-200",
    },
    {
      key: "ON_HOLD",
      label: t("filter_on_hold") || "En Pausa",
      count: stats.onHoldCount,
      barColor: "bg-amber-400",
      dotColor: "bg-amber-400",
      tileClass: "bg-amber-950/25 border-amber-500/20 text-amber-200",
    },
    {
      key: "ABANDONED",
      label: t("filter_abandoned") || "Abandonado",
      count: stats.abandonedCount,
      barColor: "bg-rose-400",
      dotColor: "bg-rose-400",
      tileClass: "bg-rose-950/25 border-rose-500/20 text-rose-200",
    },
    {
      key: "WISH",
      label: t("filter_wish") || "Desexado",
      count: stats.wishlistCount,
      barColor: "bg-purple-400",
      dotColor: "bg-purple-400",
      tileClass: "bg-purple-950/25 border-purple-500/20 text-purple-200",
    },
  ]

  return (
    <PageContainer innerClassName="gap-7">
        {/* Header Profile Card */}
        <GlassPanel variant="elevated" className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-primary to-cyan-400 p-[2px] shadow-[0_0_26px_rgba(168,85,247,0.4)] shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#0b0b13] flex items-center justify-center text-2xl font-pixel text-purple-100 tracking-wider">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "LU"}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                    {user?.name || "Xogador"}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/15 text-purple-200 border border-primary/35">
                    <Sparkles className="w-3 h-3 text-primary-hover" aria-hidden="true" />
                    <span>Nivel {playerLevel}</span>
                  </span>
                </div>
                <p className="text-xs font-mono text-zinc-400 mt-1">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href="/settings"
                className={buttonVariants({ variant: "glass", size: "sm" })}
              >
                <Settings className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                <span>{t("settings")}</span>
              </Link>

              <form
                action={signOutAction}
                onSubmit={() => {
                  if ("serviceWorker" in navigator) {
                    navigator.serviceWorker.controller?.postMessage({
                      type: "CLEAR_USER_CACHE",
                    })
                  }
                }}
              >
                <Button type="submit" variant="glass" size="sm">
                  <LogOut className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                  <span>{t("logout")}</span>
                </Button>
              </form>
            </div>
          </div>
        </GlassPanel>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassPanel className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans text-zinc-400">Colección Total</span>
              <span className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-400/25 flex items-center justify-center text-purple-300">
                <Library className="w-4 h-4" aria-hidden="true" />
              </span>
            </div>
            <span className="text-3xl font-display font-bold text-white tabular-nums tracking-tight">
              {stats.totalGames}
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              {stats.totalGames === 1 ? "1 xogo rexistrado" : `${stats.totalGames} xogos rexistrados`}
            </span>
          </GlassPanel>

          <GlassPanel className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans text-zinc-400">Xogos Completados</span>
              <span className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center text-emerald-300">
                <Trophy className="w-4 h-4" aria-hidden="true" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-emerald-400 tabular-nums tracking-tight">
                {stats.completedCount}
              </span>
              <span className="text-xs font-mono text-emerald-300/70 tabular-nums">
                {completionPct}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </GlassPanel>

          <GlassPanel className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans text-zinc-400">Actualmente Xogando</span>
              <span className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-400/25 flex items-center justify-center text-sky-300">
                <Gamepad2 className="w-4 h-4" aria-hidden="true" />
              </span>
            </div>
            <span className="text-3xl font-display font-bold text-sky-400 tabular-nums tracking-tight">
              {stats.playingCount}
            </span>
            <span className="text-[11px] font-mono text-zinc-500">Partidas en curso</span>
          </GlassPanel>

          <GlassPanel className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans text-zinc-400">Valoración Media</span>
              <span className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-400/25 flex items-center justify-center text-amber-300">
                <Star className="w-4 h-4" aria-hidden="true" />
              </span>
            </div>
            <span className="text-3xl font-display font-bold text-amber-400 tabular-nums tracking-tight">
              {stats.averageRating ? `${stats.averageRating} / 5` : "—"}
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              {stats.ratedGamesCount > 0
                ? `${stats.ratedGamesCount} con puntuación`
                : "Sen valorar aínda"}
            </span>
          </GlassPanel>
        </div>

        {/* Status Distribution with Visual Stacked Bar */}
        <GlassPanel className="p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono text-zinc-300 font-medium uppercase tracking-wider">
              Distribución da Biblioteca
            </h2>
            <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
              {stats.totalGames} total
            </span>
          </div>

          {stats.totalGames > 0 && (
            <div
              className="w-full h-2.5 rounded-full bg-white/[0.05] overflow-hidden flex gap-0.5"
              aria-hidden="true"
            >
              {distributionSegments.map((seg) => {
                const pct = (seg.count / stats.totalGames) * 100
                if (pct <= 0) return null
                return (
                  <div
                    key={seg.key}
                    className={`h-full ${seg.barColor} first:rounded-l-full last:rounded-r-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                    title={`${seg.label}: ${seg.count}`}
                  />
                )
              })}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {distributionSegments.map((seg, idx) => (
              <div
                key={seg.key}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-sans ${seg.tileClass} ${
                  idx === 4 ? "col-span-2 sm:col-span-1" : ""
                }`}
              >
                <span className="inline-flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${seg.dotColor}`} />
                  <span className="truncate">{seg.label}</span>
                </span>
                <strong className="text-white font-mono text-sm tabular-nums ml-2">
                  {seg.count}
                </strong>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Gamer Economy / Financial Section */}
        <GlassPanel className="p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary-hover" aria-hidden="true" />
              <h2 className="text-xs font-mono text-zinc-300 font-medium uppercase tracking-wider">
                {t("economy_title") || "Economía Gamer & Prezos"}
              </h2>
            </div>
            <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
              {stats.pricingGamesCount}{" "}
              {t("pricing_games_tracked") || "xogos con prezos rexistrados"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 flex flex-col gap-1.5">
              <span className="text-xs text-rose-300/85 font-sans flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
                <span>{t("total_spent") || "Total Invertido (Compras)"}</span>
              </span>
              <span className="text-2xl font-display font-bold text-rose-300 tabular-nums tracking-tight">
                {stats.totalSpent.toFixed(2)}€
              </span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col gap-1.5">
              <span className="text-xs text-emerald-300/85 font-sans flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>{t("total_earned") || "Total Recuperado (Vendas)"}</span>
              </span>
              <span className="text-2xl font-display font-bold text-emerald-300 tabular-nums tracking-tight">
                {stats.totalEarned.toFixed(2)}€
              </span>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-col gap-1.5">
              <span className="text-xs text-purple-300/85 font-sans flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-purple-300" aria-hidden="true" />
                <span>{t("net_balance") || "Balance Neto"}</span>
              </span>
              <span
                className={`text-2xl font-display font-bold tabular-nums tracking-tight ${
                  stats.netBalance >= 0 ? "text-emerald-300" : "text-zinc-100"
                }`}
              >
                {stats.netBalance >= 0
                  ? `+${stats.netBalance.toFixed(2)}€`
                  : `${stats.netBalance.toFixed(2)}€`}
              </span>
            </div>
          </div>
        </GlassPanel>

        {/* Recent Activity Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-hover" aria-hidden="true" />
              <span>Actividade Recente</span>
            </h2>
            <Link
              href="/library"
              className="inline-flex items-center gap-1 text-xs font-mono text-primary-hover hover:text-white transition-colors"
            >
              <span>Ver toda a biblioteca</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          {stats.recentEntries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.recentEntries.map((entry) => {
                const statusKey = (entry.latestStatus as LibraryStatusKey | null) ?? null
                return (
                  <GlassPanel
                    key={entry.id}
                    interactive
                    className="p-3.5 flex gap-3.5 items-center group"
                  >
                    <Link
                      href={`/games/${entry.game.id}`}
                      transitionTypes={["nav-forward"]}
                      className="w-16 h-20 rounded-xl overflow-hidden bg-[#0c0c14] relative shrink-0 ring-1 ring-white/[0.08]"
                    >
                      {entry.game.coverUrl ? (
                        <Image
                          src={entry.game.coverUrl}
                          alt={entry.game.title}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-950 to-[#11111a] p-1">
                          <Gamepad2 className="w-5 h-5 text-primary-hover/60" aria-hidden="true" />
                        </div>
                      )}
                    </Link>

                    <div className="flex flex-col flex-1 min-w-0">
                      <Link
                        href={`/games/${entry.game.id}`}
                        transitionTypes={["nav-forward"]}
                        className="text-sm font-medium text-zinc-100 hover:text-primary-hover transition-colors line-clamp-1"
                      >
                        {entry.game.title}
                      </Link>

                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {statusKey && <StatusBadge status={statusKey} />}
                        {entry.game.firstReleaseDate && (
                          <span className="text-zinc-400 text-[10px] font-mono bg-white/[0.05] px-1.5 py-0.5 rounded-md border border-white/10">
                            {new Date(entry.game.firstReleaseDate).getFullYear()}
                          </span>
                        )}
                        {entry.rating ? (
                          <span className="inline-flex items-center gap-0.5 text-amber-300 text-[11px] font-mono">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                            <span>{entry.rating}</span>
                          </span>
                        ) : entry.game.igdbRating !== null ? (
                          <span className="text-zinc-400 text-[10px] font-mono">
                            IGDB {entry.game.igdbRating}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-white/[0.06] text-[11px] font-mono">
                        <Link
                          href={`/games/${entry.game.id}/canvas`}
                          transitionTypes={["nav-forward"]}
                          className="inline-flex items-center gap-1 text-primary-hover hover:text-white transition-colors"
                        >
                          <Palette className="w-3 h-3" aria-hidden="true" />
                          <span>Canvas</span>
                        </Link>
                        <Link
                          href={`/games/${entry.game.id}/journal`}
                          transitionTypes={["nav-forward"]}
                          className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                        >
                          <BookOpen className="w-3 h-3" aria-hidden="true" />
                          <span>Diario</span>
                        </Link>
                      </div>
                    </div>
                  </GlassPanel>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Gamepad2 className="w-6 h-6" aria-hidden="true" />}
              title="Aínda non tes xogos na túa biblioteca."
              description="Comeza explorando xogos e engádeos para rexistrar partidas, valoracións e prezos."
              action={
                <Link
                  href="/search"
                  className={buttonVariants({ variant: "primary", size: "sm" })}
                >
                  <span>Buscar Xogos</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              }
            />
          )}
        </section>
    </PageContainer>
  )
}
