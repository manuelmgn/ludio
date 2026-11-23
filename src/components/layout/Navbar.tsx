"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Search,
  Library,
  Settings,
  LayoutDashboard,
  Gamepad2,
  Menu,
  X,
  ArrowRight,
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        router.push("/search")
      }
      if (e.key === "Escape") {
        setMobileMenuOpen(false)
      }
    }
    const handleScroll = () => {
      setScrolled(window.scrollY > 12)
    }
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [router])

  const links = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/search", label: t("search"), icon: Search },
    { href: "/library", label: t("library"), icon: Library },
    { href: "/settings", label: t("settings"), icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#09090f]/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
          : "bg-[#09090f]/50 backdrop-blur-xl border-b border-white/[0.05]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group shrink-0"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-800 border border-purple-400/40 flex items-center justify-center shadow-[0_0_18px_rgba(168,85,247,0.45)] group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-4 h-4 text-white" aria-hidden="true" />
          </span>
          <span className="font-pixel text-3xl text-white tracking-widest leading-none drop-shadow-[0_0_14px_rgba(168,85,247,0.55)] group-hover:text-primary-hover transition-colors">
            LUDIO
          </span>
          <span className="hidden sm:inline-flex items-center text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-primary/15 text-purple-300 border border-primary/25">
            v0.2
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-1 bg-white/[0.035] border border-white/[0.08] rounded-full p-1 backdrop-blur-md"
        >
          {links.map((link) => {
            const active = isActive(link.href)
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-1.5 text-sm font-sans px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-b from-purple-500 to-purple-700 text-white font-medium shadow-[0_2px_14px_rgba(168,85,247,0.45)] ring-1 ring-purple-300/30"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right side: Quick Search, Language Selector & Dashboard */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <Link
            href="/search"
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/15 px-2.5 py-1.5 rounded-xl transition-all font-mono"
            title="Busca rápida (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
            <kbd className="text-[10px] text-zinc-300 bg-black/40 px-1.5 py-0.5 rounded border border-white/10">
              ⌘K
            </kbd>
          </Link>

          {/* Language Switcher */}
          <div
            className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl p-0.5"
            role="group"
            aria-label="Idioma"
          >
            <button
              type="button"
              onClick={() => setLanguage("gl")}
              aria-pressed={language === "gl"}
              className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg transition-all cursor-pointer ${
                language === "gl"
                  ? "bg-primary/90 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Galego"
            >
              GL
            </button>
            <button
              type="button"
              onClick={() => setLanguage("pt")}
              aria-pressed={language === "pt"}
              className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg transition-all cursor-pointer ${
                language === "pt"
                  ? "bg-primary/90 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Português"
            >
              PT
            </button>
          </div>

          {/* Dashboard / Account link */}
          <Link
            href="/dashboard"
            aria-current={isActive("/dashboard") ? "page" : undefined}
            className={`flex items-center gap-2 text-sm px-3.5 py-1.5 rounded-xl border transition-all font-sans ${
              isActive("/dashboard")
                ? "bg-primary/20 text-white border-primary/40 shadow-[0_0_16px_rgba(168,85,247,0.25)] font-medium"
                : "text-zinc-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.09]"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-primary-hover" aria-hidden="true" />
            <span>{t("dashboard")}</span>
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2.5">
          <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setLanguage("gl")}
              aria-pressed={language === "gl"}
              className={`px-2 py-1 text-[11px] font-mono font-semibold rounded-lg ${
                language === "gl" ? "bg-primary text-white" : "text-zinc-400"
              }`}
            >
              GL
            </button>
            <button
              type="button"
              onClick={() => setLanguage("pt")}
              aria-pressed={language === "pt"}
              className={`px-2 py-1 text-[11px] font-mono font-semibold rounded-lg ${
                language === "pt" ? "bg-primary text-white" : "text-zinc-400"
              }`}
            >
              PT
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-300 hover:text-white rounded-xl bg-white/[0.05] border border-white/10 transition-colors"
            aria-label={mobileMenuOpen ? "Pechar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="md:hidden border-t border-white/[0.08] bg-[#0a0a12]/95 backdrop-blur-2xl px-4 py-4 flex flex-col gap-1.5 shadow-2xl"
        >
          {links.map((link) => {
            const active = isActive(link.href)
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 text-sm font-sans px-4 py-2.5 rounded-xl transition-colors ${
                  active
                    ? "bg-primary/20 text-white font-medium border border-primary/40"
                    : "text-zinc-300 hover:bg-white/[0.06]"
                }`}
              >
                <Icon className="w-4 h-4 text-primary-hover" aria-hidden="true" />
                <span>{link.label}</span>
              </Link>
            )
          })}

          <div className="pt-2 mt-1 border-t border-white/[0.08]">
            <Link
              href="/dashboard"
              aria-current={isActive("/dashboard") ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-sans px-4 py-2.5 rounded-xl text-purple-200 bg-primary/10 hover:bg-primary/20 border border-primary/25 transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 text-primary-hover" aria-hidden="true" />
                <span>{t("dashboard")}</span>
              </span>
              <ArrowRight className="w-4 h-4 text-purple-300" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
