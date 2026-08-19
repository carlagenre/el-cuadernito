'use client'

import { useState } from 'react'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import { Card } from './kit'
import { COLOR_CATEGORIA } from '@/lib/constants'
import { formatARS } from '@/lib/format'
import { useCuadernito } from '@/lib/store'
import type { Categoria, Expense } from '@/lib/types'

function FilaEdicion({
  gasto,
  categorias,
  onGuardar,
  onCancelar,
}: {
  gasto: Expense
  categorias: Categoria[]
  onGuardar: (cambios: Partial<Omit<Expense, 'id' | 'fecha'>>) => void
  onCancelar: () => void
}) {
  const [categoria, setCategoria] = useState<Categoria>(gasto.categoria)
  const [descripcion, setDescripcion] = useState(gasto.descripcion)
  const [monto, setMonto] = useState(String(gasto.monto))

  return (
    <div className="flex flex-col gap-2 rounded-[10px] border border-primary/40 bg-primary-soft/40 p-3">
      <div className="flex gap-2">
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as Categoria)}
          className="h-9 flex-1 rounded-lg border border-border bg-card px-2 text-sm outline-none focus:border-primary"
        >
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="tabular h-9 w-28 rounded-lg border border-border bg-card px-2 font-mono text-sm outline-none focus:border-primary"
        />
      </div>
      <input
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Descripción"
        className="h-9 w-full rounded-lg border border-border bg-card px-2 text-sm outline-none focus:border-primary"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancelar}
          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
        >
          <X className="size-3.5" />
          Cancelar
        </button>
        <button
          type="button"
          onClick={() =>
            onGuardar({
              categoria,
              descripcion,
              monto: Number(monto) || gasto.monto,
            })
          }
          className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          <Check className="size-3.5" />
          Guardar
        </button>
      </div>
    </div>
  )
}

export function ExpenseList() {
  const { gastosDelMes, data, editarGasto, eliminarGasto } = useCuadernito()
  const [editando, setEditando] = useState<string | null>(null)

  return (
    <Card>
      <h2 className="text-base font-semibold text-foreground">Últimas entradas</h2>
      {gastosDelMes.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Todavía no anotaste nada este mes.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {gastosDelMes.map((g) =>
            editando === g.id ? (
              <li key={g.id}>
                <FilaEdicion
                  gasto={g}
                  categorias={data.categoriasActivas as Categoria[]}
                  onGuardar={(cambios) => {
                    editarGasto(g.id, cambios)
                    setEditando(null)
                  }}
                  onCancelar={() => setEditando(null)}
                />
              </li>
            ) : (
              <li
                key={g.id}
                className="flex items-center justify-between gap-3 rounded-[10px] border border-border px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: COLOR_CATEGORIA[g.categoria] }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {g.descripcion || g.categoria}
                    </p>
                    <p className="text-xs text-muted-foreground">{g.categoria}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="tabular mr-1 font-mono text-sm font-semibold text-negative">
                    {formatARS(g.monto)}
                  </span>
                  <button
                    type="button"
                    aria-label="Editar"
                    onClick={() => setEditando(g.id)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Eliminar"
                    onClick={() => {
                      if (confirm('¿Borrar este gasto?')) eliminarGasto(g.id)
                    }}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-negative"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </Card>
  )
}
