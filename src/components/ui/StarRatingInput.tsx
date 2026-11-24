"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "./GlassPanel"

interface StarRatingInputProps {
  value: number
  onChange: (nextValue: number) => void
  disabled?: boolean
  size?: "sm" | "md"
  showValue?: boolean
  className?: string
}

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
  size = "md",
  showValue = false,
  className,
}: StarRatingInputProps) {
  const [hovered, setHovered] = useState(0)
  const activeStars = hovered || value

  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHovered(star)}
          onClick={() => {
            setHovered(0)
            onChange(value === star ? 0 : star)
          }}
          className={cn(
            "transition-transform hover:scale-110 disabled:opacity-50 cursor-pointer",
            size === "sm" ? "p-1" : "p-1.5 sm:p-1"
          )}
          title={`${star} estrela(s)`}
          aria-label={`${star} estrela(s)`}
        >
          <Star
            className={cn(
              "w-5 h-5 transition-colors",
              star <= activeStars
                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]"
                : "text-zinc-600 hover:text-zinc-400"
            )}
            aria-hidden="true"
          />
        </button>
      ))}
      {showValue && value > 0 && (
        <span className="text-xs font-mono text-amber-300 ml-1.5 tabular-nums">{value}/5</span>
      )}
    </div>
  )
}
