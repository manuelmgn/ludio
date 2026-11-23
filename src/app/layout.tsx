import type { Metadata } from "next"
import "./globals.css"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { Navbar } from "@/components/layout/Navbar"
import { BottomNav } from "@/components/layout/BottomNav"

export const metadata: Metadata = {
  title: "Ludio — Diario e Colección de Videoxogos",
  description: "O teu santuario persoal de videoxogos: biblioteca, partidas, caderno canvas e diario.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="gl" className="dark">
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground flex flex-col font-sans relative selection:bg-primary/35 selection:text-white">
        {/* Global Obsidian Atmospheric Layer */}
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-20 pointer-events-none overflow-hidden"
        >
          <div className="absolute inset-0 bg-obsidian-grid opacity-75" />
          <div className="absolute -top-36 left-1/4 w-[640px] h-[640px] rounded-full bg-purple-600/20 blur-[160px]" />
          <div className="absolute bottom-[-140px] right-1/5 w-[560px] h-[560px] rounded-full bg-indigo-700/20 blur-[160px]" />
          <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full bg-cyan-600/12 blur-[150px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(8,8,13,0.72)_74%,rgba(8,8,13,0.96)_100%)]" />
        </div>

        <LanguageProvider>
          <Navbar />
          <main className="pt-22 sm:pt-24 pb-28 md:pb-8 min-h-screen flex-1 flex flex-col">
            <div className="flex-1 flex flex-col animate-page-enter">{children}</div>
          </main>
          <BottomNav />
        </LanguageProvider>
      </body>
    </html>
  )
}
