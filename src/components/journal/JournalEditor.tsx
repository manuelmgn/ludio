"use client"

import { useState, useTransition, useRef } from "react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"
import { addJournalEntry } from "@/lib/actions/journal"

interface JournalEditorProps {
  libraryEntryId: string
}

export function JournalEditor({ libraryEntryId }: JournalEditorProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await addJournalEntry(libraryEntryId, formData)
      
      if (result.success) {
        formRef.current?.reset()
      } else {
        setError(result.error || "Error al guardar")
      }
    })
  }

  return (
    <GlassPanel className="w-full mb-8">
      <h3 className="text-xl font-pixel text-white mb-4">Añadir al Diario</h3>
      
      {error && (
        <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <textarea
            name="content"
            placeholder="¿Qué ha pasado hoy en el juego? Escribe aquí tus notas..."
            disabled={isPending}
            rows={4}
            className="rounded-lg border border-white/10 bg-black/40 p-4 text-white placeholder-white/30 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans resize-y"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-white/70 font-sans text-sm">Captura de pantalla (opcional)</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              disabled={isPending}
              className="text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover file:transition-colors file:cursor-pointer bg-black/40 rounded-lg p-2 border border-white/10"
            />
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <label className="text-white/70 font-sans text-sm">Privacidad de la captura</label>
            <select
              name="privacyLevel"
              disabled={isPending}
              className="rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans appearance-none"
            >
              <option value="PRIVATE">Privada (Solo yo)</option>
              <option value="FOLLOWERS">Solo Seguidores</option>
              <option value="PUBLIC">Pública</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar en el Diario"}
          </Button>
        </div>
      </form>
    </GlassPanel>
  )
}
