import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Ludio — Diario e Colección de Videoxogos",
    short_name: "Ludio",
    description:
      "O teu santuario persoal de videoxogos: biblioteca, partidas, caderno canvas e diario.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "any",
    background_color: "#08080d",
    theme_color: "#08080d",
    lang: "gl",
    categories: ["games", "entertainment", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Buscar xogos",
        short_name: "Buscar",
        description: "Busca calquera videoxogo na base de datos",
        url: "/search",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "A miña biblioteca",
        short_name: "Biblioteca",
        description: "Explora a túa colección persoal de xogos",
        url: "/library",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Panel de control",
        short_name: "Panel",
        description: "Estatísticas, economía e actividade recente",
        url: "/dashboard",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
    screenshots: [
      {
        src: "/pwa/screenshot?type=narrow",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "Ludio en móbil — Biblioteca, diario e partidas",
      },
      {
        src: "/pwa/screenshot?type=wide",
        sizes: "1920x1080",
        type: "image/png",
        form_factor: "wide",
        label: "Ludio en escritorio e tablet — O teu santuario gamer",
      },
    ],
  }
}
