import type { Metadata, Viewport } from "next"
import "./globals.css"
import { auth } from "@/auth"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { PwaProvider } from "@/contexts/PwaContext"
import { Navbar } from "@/components/layout/Navbar"
import { BottomNav } from "@/components/layout/BottomNav"
import { PwaInstallBanner } from "@/components/pwa/PwaInstallBanner"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#08080d",
  colorScheme: "dark",
}

const appBaseUrl =
  process.env.AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:5020"

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl),
  title: {
    default: "Flux — Diario e Colección de Videoxogos",
    template: "%s · Flux",
  },
  applicationName: "Flux",
  description:
    "O teu santuario persoal de videoxogos: biblioteca, partidas, caderno canvas e diario.",
  keywords: [
    "Flux",
    "videoxogos",
    "diario gamer",
    "colección de videoxogos",
    "biblioteca",
    "partidas",
    "canvas",
  ],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: "Flux",
    statusBarStyle: "black-translucent",
    startupImage: [
      {
        url: "/pwa/splash?w=1320&h=2868",
        media:
          "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/pwa/splash?w=1290&h=2796",
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/pwa/splash?w=1206&h=2622",
        media:
          "(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/pwa/splash?w=1179&h=2556",
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/pwa/splash?w=1170&h=2532",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/pwa/splash?w=1125&h=2436",
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/pwa/splash?w=1284&h=2778",
        media:
          "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/pwa/splash?w=1242&h=2688",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/pwa/splash?w=828&h=1792",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/pwa/splash?w=750&h=1334",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/pwa/splash?w=1668&h=2388",
        media:
          "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/pwa/splash?w=2048&h=2732",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  openGraph: {
    type: "website",
    locale: "gl_ES",
    siteName: "Flux",
    title: "Flux — Diario e Colección de Videoxogos",
    description:
      "O teu santuario persoal de videoxogos: biblioteca, partidas, caderno canvas e diario.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flux — Diario e Colección de Videoxogos",
    description:
      "O teu santuario persoal de videoxogos: biblioteca, partidas, caderno canvas e diario.",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let isAuthenticated = false
  try {
    const session = await auth()
    isAuthenticated = Boolean(session?.user)
  } catch {
    isAuthenticated = false
  }

  return (
    <html lang="gl" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.igdb.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-dvh bg-background text-foreground flex flex-col font-sans relative selection:bg-primary/35 selection:text-white">
        {/* Global Obsidian Atmospheric Layer (pure radial gradients — zero GPU blur passes) */}
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-20 pointer-events-none overflow-hidden"
        >
          <div className="absolute inset-0 bg-obsidian-grid opacity-75" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: [
                "radial-gradient(640px circle at 35% 4%, rgba(147, 51, 234, 0.22), transparent 68%)",
                "radial-gradient(560px circle at 78% 92%, rgba(67, 56, 202, 0.20), transparent 68%)",
                "radial-gradient(420px circle at 4% 54%, rgba(8, 145, 178, 0.12), transparent 66%)",
                "radial-gradient(ellipse at top, transparent 0%, rgba(8, 8, 13, 0.72) 74%, rgba(8, 8, 13, 0.96) 100%)",
              ].join(", "),
            }}
          />
        </div>

        <LanguageProvider>
          <PwaProvider>
            {isAuthenticated && <Navbar />}
            <main
              className={
                isAuthenticated
                  ? "pt-[calc(5.25rem+env(safe-area-inset-top,0px))] sm:pt-[calc(5.75rem+env(safe-area-inset-top,0px))] pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:pb-[calc(2rem+env(safe-area-inset-bottom,0px))] min-h-dvh flex-1 flex flex-col"
                  : "pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] min-h-dvh flex-1 flex flex-col"
              }
            >
              <div className="flex-1 flex flex-col animate-page-enter">{children}</div>
            </main>
            {isAuthenticated && <BottomNav />}
            <PwaInstallBanner />
          </PwaProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
