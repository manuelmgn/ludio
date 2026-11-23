"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Search,
  Library,
  Settings,
  LayoutDashboard,
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { LudioLogo } from "@/components/brand/LudioLogo"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [quickQuery, setQuickQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  const isAuthPage =
    pathname === "/login" || pathname === "/register" || pathname === "/offline"
  const pageHasHeroSearch = pathname === "/" || pathname === "/search"

  useEffect(() => {
    if (isAuthPage) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        if (!pageHasHeroSearch && searchInputRef.current && window.innerWidth >= 768) {
          searchInputRef.current.focus()
        } else {
          router.push("/search")
        }
      }
    }
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [router, pageHasHeroSearch, isAuthPage])

  if (isAuthPage) return null

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = quickQuery.trim()
    if (trimmed.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
      setQuickQuery("")
      searchInputRef.current?.blur()
    } else {
      router.push("/search")
    }
  }

  const links = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/library", label: t("library"), icon: Library },
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/settings", label: t("settings"), icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] sm:pl-[max(1.5rem,env(safe-area-inset-left,0px))] sm:pr-[max(1.5rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,calc(env(safe-area-inset-top,0px)+0.4rem))] pointer-events-none">
      <div
        className={`pointer-events-auto max-w-6xl mx-auto h-14 px-3.5 sm:px-5 rounded-2xl flex items-center justify-between gap-3 transition-[background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled
            ? "liquid-glass-pill"
            : "bg-[#0d0d16]/55 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_8px_28px_-8px_rgba(0,0,0,0.6)]"
        }`}
      >
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center group shrink-0">
          <LudioLogo size="md" showVersion />
        </Link>

        {/* Center: Desktop Navigation Links (no duplicate Search link) */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-1"
        >
          {links.map((link) => {
            const active = isActive(link.href)
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-1.5 text-[13px] font-sans px-3.5 py-1.5 rounded-xl transition-[background-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] ${
                  active
                    ? "bg-gradient-to-b from-purple-500/90 to-purple-700/90 text-white font-medium shadow-[0_2px_14px_rgba(168,85,247,0.45),inset_0_1px_0_rgba(255,255,255,0.28)] ring-1 ring-purple-300/30"
                    : "text-zinc-300/80 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right: Single Unified Search (hidden on Home & Search to avoid 2 search bars) */}
        {!pageHasHeroSearch && (
          <div className="hidden md:flex items-center shrink-0">
            <form
              onSubmit={handleQuickSearch}
              className="flex items-center gap-2 bg-black/30 hover:bg-black/40 focus-within:bg-black/50 border border-white/[0.1] focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 rounded-xl px-2.5 h-9 w-48 focus-within:w-60 transition-[width,background-color,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              <button
                type="submit"
                aria-label={t("search")}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <Search className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <input
                ref={searchInputRef}
                type="search"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder={`${t("search")}...`}
                aria-label={t("search")}
                className="flex-1 min-w-0 bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none font-sans"
              />
              <kbd className="text-[10px] font-mono text-zinc-400 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/10 shrink-0">
                ⌘K
              </kbd>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
