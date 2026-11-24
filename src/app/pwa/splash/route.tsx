import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "nodejs"

function clampDimension(raw: string | null, fallback: number): number {
  const parsed = Number.parseInt(raw || "", 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(parsed, 320), 2800)
}

export async function GET(request: NextRequest) {
  const width = clampDimension(request.nextUrl.searchParams.get("w"), 1179)
  const height = clampDimension(request.nextUrl.searchParams.get("h"), 2556)
  const minSide = Math.min(width, height)
  const badgeSize = Math.round(minSide * 0.18)
  const titleSize = Math.round(minSide * 0.085)

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
            "radial-gradient(circle at 50% 42%, rgba(168, 85, 247, 0.24), transparent 52%)",
          color: "#f4f4f7",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          gap: `${Math.round(minSide * 0.04)}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: `${badgeSize}px`,
            height: `${badgeSize}px`,
            borderRadius: `${Math.round(badgeSize * 0.26)}px`,
            background: "linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)",
            border: "2px solid rgba(255, 255, 255, 0.22)",
            boxShadow: "0 20px 60px rgba(168, 85, 247, 0.42)",
            fontSize: `${Math.round(badgeSize * 0.5)}px`,
            fontWeight: 800,
            color: "#ffffff",
          }}
        >
          F
        </div>
        <div
          style={{
            fontSize: `${titleSize}px`,
            fontWeight: 800,
            letterSpacing: "0.2em",
            color: "#ffffff",
          }}
        >
          FLUX
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
