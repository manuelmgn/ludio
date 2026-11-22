import type { Metadata } from "next"
import "./globals.css"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { Navbar } from "@/components/layout/Navbar"

export const metadata: Metadata = {
  title: "Ludio - Diario e Colección de Videoxogos",
  description: "Videogame tracking and personal journaling",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="gl" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased min-h-screen bg-background text-foreground flex flex-col font-sans"
      >
        <LanguageProvider>
          <Navbar />
          <main className="pt-24 min-h-screen">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  )
}
