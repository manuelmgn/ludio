"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Library, LayoutDashboard, Settings } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  if (pathname === "/login" || pathname === "/register") return null

  const items = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/search", label: t("search"), icon: Search },
    { href: "/library", label: t("library"), icon: Library },
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/settings", label: t("settings"), icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <nav
      aria-label="Navegación móbil"
      className="md:hidden fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 pointer-events-none"
    >
      <div className="pointer-events-auto liquid-glass-pill mx-auto max-w-md rounded-[24px] p-1.5 grid grid-cols-5 gap-1">
        {items.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-[18px] transition-[background-color,color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-95 ${
                active
                  ? "bg-gradient-to-b from-purple-500/85 to-purple-700/85 text-white shadow-[0_4px_18px_-2px_rgba(168,85,247,0.55),inset_0_1px_0_rgba(255,255,255,0.32)]"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]"
              }`}
            >
              <Icon
                className={`w-[19px] h-[19px] transition-transform duration-200 ${
                  active ? "scale-105" : ""
                }`}
                aria-hidden="true"
              />
              <span className="text-[10px] font-sans font-medium leading-tight truncate max-w-full">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
