import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ludio — Diario e Colección de Videoxogos",
    short_name: "Ludio",
    description:
      "O teu santuario persoal de videoxogos: biblioteca, partidas, caderno canvas e diario.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
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
  }
}
