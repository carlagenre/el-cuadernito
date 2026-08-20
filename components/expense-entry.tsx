'use client'

import { useState } from 'react'
import { Loader2, Plus, Sparkles } from 'lucide-react'
import { Btn } from './kit'
import { AiError, parsearGastos } from '@/lib/ai'
import { useCuadernito } from '@/lib/store'
import { formatARS } from '@/lib/format'
import { COLOR_CATEGORIA } from '@/lib/constants'
import type { Categoria } from '@/lib/types'

type Modo = 'ia' | 'manual'

export function ExpenseEntry() {
  const { data, agregarGastos, gastosDelMes } = useCuadernito()
  const [abierto, setAbierto] = useState(false)
  const [modo, setModo] = useState<Modo>('ia')

  // modo IA
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // modo manual
  const activas = data.categoriasActivas as Categoria[]
  const [mCategoria, setMCategoria] = useState<Categoria>(activas[0] ?? 'Otros')
  const [mMonto, setMMonto] = useState('')
  const [mDescripcion, setMDescripcion] = useState('')

  async function anotarIa() {
    if (!texto.trim()) return
    setCargando(true)
    setError(null)
    try {
      const gastos = await parsearGastos(texto, activas)
      agregarGastos(gastos)
      setTexto('')
    } catch (e) {
      if (e instanceof AiError) {
        if (e.code === 'needs_key') {
          setError(`${e.message} Mientras tanto, usá la carga manual.`)
          setModo('manual')
        } else if (e.code === 'rate_limited') {
          setError(`${e.message} Mientras tanto, usá la carga manual.`)
          setModo('manual')
        } else if (e.code === 'empty') {
          setError(
            'No identifiqué ningún gasto en ese texto. Probá algo tipo "gasté 3500 en el super y 1200 en bondi".',
          )
        } else {
          setError(`No pude procesar el pedido: ${e.message}`)
        }
      } else {
        setError('No pude conectar con el servidor. Probá de nuevo en un rato.')
      }
    } finally {
      setCargando(false)
    }
  }

  function anotarManual() {
    const monto = Number(mMonto)
    if (!Number.isFinite(monto) || monto <= 0) {
      setError('Ingresá un monto mayor a cero.')
      return
    }
    setError(null)
    agregarGastos([
      { categoria: mCategoria, monto, descripcion: mDescripcion.trim() || mCategoria },
    ])
    setMMonto('')
    setMDescripcion('')
  }

  function cerrar() {
    setAbierto(false)
    setError(null)
  }

  const ultimas = gastosDelMes.slice(0, 4)

  return (
    <div>
      {!abierto ? (
        <Btn onClick={() => setAbierto(true)} className="w-full">
          <Plus className="size-4" />
          Anotar gasto
        </Btn>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-4">
          {/* Selector de modo */}
          <div className="mb-3 flex gap-1 rounded-[10px] bg-primary-soft p-1">
            <button
              onClick={() => setModo('ia')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                modo === 'ia'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="size-3.5" />
              Con IA
            </button>
            <button
              onClick={() => setModo('manual')}
              className={`flex flex-1 items-center justify-center rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                modo === 'manual'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Manual
            </button>
          </div>

          {modo === 'ia' ? (
            <>
              <label htmlFor="gasto-texto" className="text-sm font-semibold text-foreground">
                Contame qué gastaste
              </label>
              <textarea
                id="gasto-texto"
                autoFocus
                rows={3}
                placeholder="Ej: pagué 12000 de luz y gasté 3500 en el kiosco"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                className="mt-1.5 w-full resize-none rounded-[10px] border border-border bg-card p-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {error && <p className="mt-2 text-sm font-medium text-negative">{error}</p>}
              <div className="mt-3 flex gap-2">
                <Btn onClick={anotarIa} disabled={cargando || !texto.trim()} className="flex-1">
                  {cargando ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Anotando...
                    </>
                  ) : (
                    'Anotar en el cuadernito'
                  )}
                </Btn>
                <Btn variant="secondary" onClick={cerrar}>
                  Cerrar
                </Btn>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <div>
                  <label htmlFor="m-categoria" className="text-sm font-semibold text-foreground">
                    Categoría
                  </label>
                  <select
                    id="m-categoria"
                    value={mCategoria}
                    onChange={(e) => setMCategoria(e.target.value as Categoria)}
                    className="mt-1.5 h-11 w-full rounded-[10px] border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {activas.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="m-monto" className="text-sm font-semibold text-foreground">
                    Monto
                  </label>
                  <input
                    id="m-monto"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    autoFocus
                    placeholder="Ej: 3500"
                    value={mMonto}
                    onChange={(e) => setMMonto(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-[10px] border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label htmlFor="m-desc" className="text-sm font-semibold text-foreground">
                    Descripción <span className="font-normal text-muted-foreground">(opcional)</span>
                  </label>
                  <input
                    id="m-desc"
                    placeholder="Ej: super del barrio"
                    value={mDescripcion}
                    onChange={(e) => setMDescripcion(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-[10px] border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              {error && <p className="mt-2 text-sm font-medium text-negative">{error}</p>}
              <div className="mt-3 flex gap-2">
                <Btn onClick={anotarManual} disabled={!mMonto.trim()} className="flex-1">
                  Anotar en el cuadernito
                </Btn>
                <Btn variant="secondary" onClick={cerrar}>
                  Cerrar
                </Btn>
              </div>
            </>
          )}

          {ultimas.length > 0 && (
            <ul className="mt-4 flex flex-col gap-1.5 border-t border-border pt-3">
              {ultimas.map((g) => (
                <li key={g.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: COLOR_CATEGORIA[g.categoria] }}
                    />
                    <span className="truncate text-muted-foreground">
                      {g.descripcion || g.categoria}
                    </span>
                  </span>
                  <span className="tabular shrink-0 font-mono font-semibold text-negative">
                    {formatARS(g.monto)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
