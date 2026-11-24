"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Library,
  Settings,
  LayoutDashboard,
  Gamepad2,
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { NavLinkHint } from "@/components/layout/NavLinkHint"
import { HeaderSearch } from "@/components/layout/HeaderSearch"

export function Navbar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)

  const isAuthPage =
    pathname === "/login" || pathname === "/register" || pathname === "/offline"

  useEffect(() => {
    if (isAuthPage) return
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [isAuthPage])

  if (isAuthPage) return null

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
    <header
      style={{ viewTransitionName: "site-header" }}
      className="fixed top-0 left-0 w-full z-50 pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] sm:pl-[max(1.5rem,env(safe-area-inset-left,0px))] sm:pr-[max(1.5rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,calc(env(safe-area-inset-top,0px)+0.4rem))] pointer-events-none"
    >
      <div
        className={`pointer-events-auto max-w-6xl mx-auto h-14 px-3.5 sm:px-5 rounded-2xl flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr] gap-3 transition-[background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled
            ? "liquid-glass-pill"
            : "bg-[#0d0d16]/55 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_8px_28px_-8px_rgba(0,0,0,0.6)]"
        }`}
      >
        {/* Left: Brand Logo (identical across every page) */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group shrink-0 justify-self-start whitespace-nowrap"
        >
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-800 border border-purple-300/40 flex items-center justify-center shadow-[0_0_18px_rgba(168,85,247,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <Gamepad2 className="w-4 h-4 text-white" aria-hidden="true" />
          </span>
          <span className="font-pixel text-[1.75rem] text-white tracking-widest leading-none drop-shadow-[0_0_14px_rgba(168,85,247,0.55)] group-hover:text-primary-hover transition-colors">
            FLUX
          </span>
          <span className="hidden lg:inline-flex items-center text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-primary/15 text-purple-200 border border-primary/25">
            v0.2
          </span>
        </Link>

        {/* Center: Desktop Navigation Links (locked dead-center on every page) */}
        <nav aria-label="Navegación principal" className="hidden md:block justify-self-center">
          <ul className="flex items-center gap-1">
            {links.map((link) => {
              const active = isActive(link.href)
              const Icon = link.icon
              return (
                <li key={link.href} className="shrink-0">
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`nav-link-item relative flex items-center gap-1.5 whitespace-nowrap text-[13px] font-sans px-3.5 py-1.5 rounded-xl transition-[background-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] ${
                      active
                        ? "bg-gradient-to-b from-purple-500/90 to-purple-700/90 text-white font-medium shadow-[0_2px_14px_rgba(168,85,247,0.45),inset_0_1px_0_rgba(255,255,255,0.28)] ring-1 ring-purple-300/30"
                        : "text-zinc-300/85 hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{link.label}</span>
                    <NavLinkHint className="absolute top-1.5 right-1.5" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Right: Uniform Expandable Search Icon (identical across every page) */}
        <div className="flex items-center justify-end justify-self-end shrink-0">
          <HeaderSearch key={pathname} />
        </div>
      </div>
    </header>
  )
}
