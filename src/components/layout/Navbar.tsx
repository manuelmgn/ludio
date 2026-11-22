"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/contexts/LanguageContext"

export function Navbar() {
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const links = [
    { href: "/", label: t("home") },
    { href: "/search", label: t("search") },
    { href: "/library", label: t("library") },
    { href: "/settings", label: t("settings") },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2 group"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="font-pixel text-3xl text-primary font-bold tracking-widest drop-shadow-[0_0_12px_rgba(157,0,255,0.6)] group-hover:text-primary-hover transition-colors">
            LUDIO
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-purple-300 border border-primary/30">
            v0.2
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md">
          {links.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-sans px-4 py-1.5 rounded-full transition-all duration-200 ${
                  active
                    ? "bg-primary text-white font-medium shadow-[0_0_15px_rgba(157,0,255,0.4)]"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right side: Language Selector & Auth */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5 backdrop-blur-md">
            <button
              onClick={() => setLanguage("gl")}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                language === "gl"
                  ? "bg-primary text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Galego"
            >
              GL
            </button>
            <button
              onClick={() => setLanguage("pt")}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                language === "pt"
                  ? "bg-primary text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Português"
            >
              PT
            </button>
          </div>

          {/* Account link */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-lg transition-colors font-sans"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t("dashboard")}</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-3">
          <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setLanguage("gl")}
              className={`px-2 py-0.5 text-xs font-semibold rounded ${
                language === "gl" ? "bg-primary text-white" : "text-zinc-400"
              }`}
            >
              GL
            </button>
            <button
              onClick={() => setLanguage("pt")}
              className={`px-2 py-0.5 text-xs font-semibold rounded ${
                language === "pt" ? "bg-primary text-white" : "text-zinc-400"
              }`}
            >
              PT
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white rounded-lg bg-white/5 border border-white/10 focus:outline-none"
            aria-label="Abrir menú"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-2xl px-6 py-4 flex flex-col gap-3">
          {links.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-sans px-4 py-2.5 rounded-lg transition-colors ${
                  active
                    ? "bg-primary/20 text-white font-medium border border-primary/40"
                    : "text-zinc-300 hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-sans px-4 py-2.5 rounded-lg text-primary hover:bg-primary/10 transition-colors flex items-center justify-between"
            >
              <span>{t("dashboard")}</span>
              <span className="text-xs font-mono text-zinc-500">→</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
