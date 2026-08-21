import type { Metadata } from "next"
import { Inter, VT323 } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/contexts/LanguageContext"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const vt323 = VT323({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Ludio",
  description: "Videogame tracking and personal journaling",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${vt323.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
