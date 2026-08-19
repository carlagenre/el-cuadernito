'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Btn } from './kit'
import { PillSwitch } from './pill-switch'
import { CATEGORIAS } from '@/lib/constants'
import { useCuadernito } from '@/lib/store'
import type { Categoria } from '@/lib/types'

export function ConfigModal({ onClose }: { onClose?: () => void }) {
  const { data, configurado, configurarMes } = useCuadernito()
  const [income, setIncome] = useState<string>(data.income ? String(data.income) : '')
  const [activas, setActivas] = useState<Categoria[]>(
    data.categoriasActivas.length ? data.categoriasActivas : [...CATEGORIAS],
  )
  const cerrable = configurado && !!onClose

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  function toggle(cat: Categoria, next: boolean) {
    setActivas((prev) =>
      next ? [...prev, cat] : prev.filter((c) => c !== cat),
    )
  }

  function guardar() {
    const monto = Number(income)
    if (!monto || monto <= 0 || activas.length === 0) return
    configurarMes(
      monto,
      CATEGORIAS.filter((c) => activas.includes(c)),
    )
    onClose?.()
  }

  const valido = Number(income) > 0 && activas.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-6 shadow-xl sm:max-h-[90vh] sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-mono text-xl font-bold text-foreground">Arrancá tu mes</h2>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              Contanos cuánto entra y en qué solés gastar. Con eso armamos tu presupuesto.
            </p>
          </div>
          {cerrable && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        <div className="mt-5">
          <label htmlFor="income" className="text-sm font-semibold text-foreground">
            Ingreso mensual (ARS)
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
              $
            </span>
            <input
              id="income"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="250000"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="tabular h-12 w-full rounded-[10px] border border-border bg-card pl-7 pr-3 font-mono text-lg outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <p className="mt-5 text-sm text-muted-foreground text-pretty">
          Marcá en cuáles de estas categorías solés gastar. Con eso armamos tu presupuesto
          automático — el peso de cada una se reparte entre las que elijas.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {CATEGORIAS.map((cat) => (
            <PillSwitch
              key={cat}
              label={cat}
              checked={activas.includes(cat)}
              onChange={(next) => toggle(cat, next)}
            />
          ))}
        </div>

        <Btn onClick={guardar} disabled={!valido} className="mt-6 w-full">
          Guardar y arrancar
        </Btn>
      </div>
    </div>
  )
}
