"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { useLanguage } from "@/contexts/LanguageContext"

export function Navbar() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const links = [
    { href: "/", label: t("home") || "Inicio" },
    { href: "/search", label: t("search") || "Buscar" },
    { href: "/library", label: t("library") || "Mi Biblioteca" },
    { href: "/settings", label: t("settings") || "Ajustes" },
  ]

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 py-4">
      {/* Left side: Logo */}
      <Link href="/" className="font-pixel text-2xl text-purple-500 font-bold tracking-widest hover:text-purple-400 transition-colors">
        LUDIO
      </Link>

      {/* Center: Navigation Links */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/" className="text-sm font-sans text-gray-300 hover:text-white transition-colors">
          Inicio
        </Link>
        <Link href="/search" className="text-sm font-sans text-gray-300 hover:text-white transition-colors">
          Buscar
        </Link>
        <Link href="/library" className="text-sm font-sans text-gray-300 hover:text-white transition-colors">
          Mi Biblioteca
        </Link>
      </div>

      {/* Right side: Language and Auth/Avatar */}
      <div className="flex items-center gap-6">
        <button className="text-sm font-sans text-gray-300 hover:text-white transition-colors">
          ES
        </button>
        <button className="text-sm font-sans text-gray-300 hover:text-white transition-colors">
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}
