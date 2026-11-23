import type { Metadata } from "next"
import "./globals.css"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { Navbar } from "@/components/layout/Navbar"

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
          <div className="absolute inset-0 bg-obsidian-grid opacity-80" />
          <div className="absolute -top-32 left-1/4 w-[620px] h-[620px] rounded-full bg-purple-700/18 blur-[150px] animate-ambient-float" />
          <div className="absolute bottom-[-120px] right-1/5 w-[540px] h-[540px] rounded-full bg-indigo-900/20 blur-[150px] animate-ambient-float-delayed" />
          <div className="absolute top-1/2 -left-40 w-[380px] h-[380px] rounded-full bg-cyan-900/10 blur-[140px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(8,8,13,0.75)_75%,rgba(8,8,13,0.96)_100%)]" />
        </div>

        <LanguageProvider>
          <Navbar />
          <main className="pt-20 sm:pt-24 min-h-screen flex-1 flex flex-col">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  )
}
