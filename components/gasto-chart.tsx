'use client'

import { useState } from 'react'
import { BarChart3, ChartPie, Donut } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'
import { Card } from './kit'
import { COLOR_CATEGORIA } from '@/lib/constants'
import { formatARS } from '@/lib/format'
import { useCuadernito } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { Categoria } from '@/lib/types'

type TipoGrafico = 'barras' | 'torta' | 'dona'

const POSITIVE = '#1E8E3E'
const NEGATIVE = '#D93025'

export function GastoChart() {
  const { gastadoPorCategoria, presupuestoPorCategoria, data } = useCuadernito()
  const [tipo, setTipo] = useState<TipoGrafico>('barras')

  const activas = data.categoriasActivas as Categoria[]
  const filas = activas.map((cat) => ({
    categoria: cat,
    gasto: gastadoPorCategoria[cat] ?? 0,
    presupuesto: presupuestoPorCategoria[cat] ?? 0,
  }))
  const conGasto = filas.filter((f) => f.gasto > 0)
  const hayGasto = conGasto.length > 0

  const opciones: { id: TipoGrafico; icon: typeof BarChart3; label: string }[] = [
    { id: 'barras', icon: BarChart3, label: 'Barras' },
    { id: 'torta', icon: ChartPie, label: 'Torta' },
    { id: 'dona', icon: Donut, label: 'Dona' },
  ]

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">Por categoría</h2>
        <div className="flex gap-1 rounded-[10px] border border-border p-1">
          {opciones.map((o) => {
            const Icon = o.icon
            const activo = tipo === o.id
            return (
              <button
                key={o.id}
                type="button"
                aria-label={o.label}
                onClick={() => setTipo(o.id)}
                className={cn(
                  'flex size-8 items-center justify-center rounded-md transition-colors',
                  activo
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <Icon className="size-4" />
              </button>
            )
          })}
        </div>
      </div>

      {!hayGasto ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Todavía no anotaste gastos este mes. Empezá arriba con “Anotar gasto”.
        </p>
      ) : (
        <div className="mt-4">
          {tipo === 'barras' ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={filas} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <XAxis
                  dataKey="categoria"
                  tick={{ fontSize: 11, fill: '#66707E' }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(15,108,189,0.06)' }}
                  formatter={(v) => [formatARS(Number(v)), 'Gasto']}
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #E1E6EE',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="gasto" radius={[6, 6, 0, 0]}>
                  {filas.map((f) => (
                    <Cell
                      key={f.categoria}
                      fill={
                        f.presupuesto > 0 && f.gasto > f.presupuesto ? NEGATIVE : POSITIVE
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={conGasto}
                    dataKey="gasto"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    innerRadius={tipo === 'dona' ? 55 : 0}
                    outerRadius={90}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {conGasto.map((f) => (
                      <Cell key={f.categoria} fill={COLOR_CATEGORIA[f.categoria]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [formatARS(Number(v)), String(n)]}
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #E1E6EE',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-1.5">
                {conGasto.map((f) => (
                  <li
                    key={f.categoria}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-sm"
                        style={{ backgroundColor: COLOR_CATEGORIA[f.categoria] }}
                      />
                      <span className="text-muted-foreground">{f.categoria}</span>
                    </span>
                    <span className="tabular font-mono font-semibold text-foreground">
                      {formatARS(f.gasto)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
