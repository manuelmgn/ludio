import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") === "wide" ? "wide" : "narrow"
  const width = type === "wide" ? 1920 : 1080
  const height = type === "wide" ? 1080 : 1920
  const isWide = type === "wide"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#08080d",
          backgroundImage:
            "radial-gradient(circle at 25% 20%, rgba(168, 85, 247, 0.28), transparent 48%), radial-gradient(circle at 80% 80%, rgba(34, 211, 238, 0.16), transparent 45%)",
          color: "#f4f4f7",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          padding: isWide ? "80px 120px" : "120px 72px",
          gap: isWide ? "44px" : "56px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            padding: "16px 32px",
            borderRadius: "999px",
            backgroundColor: "rgba(168, 85, 247, 0.14)",
            border: "1px solid rgba(168, 85, 247, 0.35)",
            color: "#e9d5ff",
            fontSize: isWide ? "24px" : "28px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          DIARIO & COLECCIÓN DE VIDEOXOGOS
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: isWide ? "128px" : "152px",
              height: isWide ? "128px" : "152px",
              borderRadius: "36px",
              background: "linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)",
              border: "2px solid rgba(255, 255, 255, 0.25)",
              boxShadow: "0 24px 70px rgba(168, 85, 247, 0.45)",
              fontSize: isWide ? "64px" : "76px",
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            L
          </div>
          <div
            style={{
              fontSize: isWide ? "96px" : "112px",
              fontWeight: 800,
              letterSpacing: "0.16em",
              color: "#ffffff",
            }}
          >
            LUDIO
          </div>
          <div
            style={{
              fontSize: isWide ? "34px" : "38px",
              color: "#a1a1aa",
              maxWidth: isWide ? "1040px" : "820px",
              lineHeight: 1.4,
            }}
          >
            Rexistra as túas partidas, organiza a túa biblioteca, escribe no teu diario e garda capturas no Canvas.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: isWide ? "row" : "column",
            gap: "24px",
            width: "100%",
            maxWidth: isWide ? "1440px" : "880px",
          }}
        >
          {[
            { title: "Biblioteca", desc: "Xogando, Completados, Desexados e En Pausa" },
            { title: "Diario & Partidas", desc: "Seguimento detallado, valoracións e prezos" },
            { title: "Canvas Creativo", desc: "Notas en Markdown e galería de capturas" },
          ].map((card) => (
            <div
              key={card.title}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: isWide ? "32px" : "36px",
                borderRadius: "28px",
                backgroundColor: "rgba(20, 20, 34, 0.78)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
              }}
            >
              <div
                style={{
                  fontSize: isWide ? "30px" : "34px",
                  fontWeight: 700,
                  color: "#f4f4f7",
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  fontSize: isWide ? "22px" : "26px",
                  color: "#a1a1aa",
                  lineHeight: 1.4,
                }}
              >
                {card.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width,
      height,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  )
}
