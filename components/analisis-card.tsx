'use client'

import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { Btn, Card } from './kit'
import { AiError, pedirTexto } from '@/lib/ai'
import { useCuadernito } from '@/lib/store'
import { formatARS } from '@/lib/format'

export function AnalisisCard() {
  const { data, gastadoPorCategoria, presupuestoPorCategoria, totalGastado } =
    useCuadernito()
  const [analisis, setAnalisis] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generar() {
    setCargando(true)
    setError(null)
    const detalle = data.categoriasActivas
      .map(
        (c) =>
          `${c}: gastó ${formatARS(gastadoPorCategoria[c] ?? 0)} de un presupuesto de ${formatARS(
            presupuestoPorCategoria[c] ?? 0,
          )}`,
      )
      .join('. ')
    const resumen = `Ingreso mensual: ${formatARS(data.income)}. Gasto total del mes: ${formatARS(
      totalGastado,
    )}. Detalle por categoría: ${detalle}.`
    try {
      const texto = await pedirTexto(
        'Sos un asesor financiero argentino, directo y con tono informal (tuteo rioplatense). ' +
          'Analizá el resumen del mes en 2 a 4 oraciones. Destacá el punto más importante ' +
          '(la categoría más pasada de presupuesto o el mejor manejo) y dá un consejo concreto y accionable. ' +
          'No uses markdown, no uses emojis, no uses listas. Escribí en prosa corrida.',
        [{ role: 'user', content: resumen }],
      )
      setAnalisis(texto.trim())
    } catch (e) {
      setError(
        e instanceof AiError && e.code === 'needs_billing'
          ? e.message
          : 'No pude generar el análisis ahora. Probá de nuevo en un ratito.',
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft">
            <Sparkles className="size-4 text-primary" />
          </span>
          <h2 className="text-base font-semibold text-foreground">Análisis del mes</h2>
        </div>
        <Btn
          variant="secondary"
          onClick={generar}
          disabled={cargando || totalGastado === 0}
          className="h-9 px-3 text-sm"
        >
          {cargando ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Pensando...
            </>
          ) : analisis ? (
            'Actualizar'
          ) : (
            'Generar'
          )}
        </Btn>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-negative">{error}</p>}

      {analisis ? (
        <p className="mt-3 text-sm leading-relaxed text-foreground text-pretty">{analisis}</p>
      ) : (
        !error && (
          <p className="mt-3 text-sm text-muted-foreground text-pretty">
            {totalGastado === 0
              ? 'Anotá algún gasto y después te tiro un análisis de cómo venís.'
              : 'Tocá “Generar” y te cuento cómo venís este mes.'}
          </p>
        )
      )}
    </Card>
  )
}
