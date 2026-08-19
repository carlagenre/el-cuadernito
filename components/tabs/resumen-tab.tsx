'use client'

import { AnalisisCard } from '../analisis-card'
import { ExpenseEntry } from '../expense-entry'
import { ExpenseList } from '../expense-list'
import { GastoChart } from '../gasto-chart'
import { formatARS } from '@/lib/format'
import { useCuadernito } from '@/lib/store'
import { cn } from '@/lib/utils'

function Metrica({
  label,
  valor,
  tono,
}: {
  label: string
  valor: number
  tono: 'neutro' | 'gasto' | 'auto'
}) {
  const color =
    tono === 'gasto'
      ? 'text-negative'
      : tono === 'auto'
        ? valor >= 0
          ? 'text-positive'
          : 'text-negative'
        : 'text-foreground'
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn('tabular mt-1 font-mono text-xl font-bold sm:text-2xl', color)}>
        {formatARS(valor)}
      </p>
    </div>
  )
}

export function ResumenTab() {
  const { data, totalGastado } = useCuadernito()
  const disponible = data.income - totalGastado

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <Metrica label="Ingreso" valor={data.income} tono="neutro" />
        <Metrica label="Gastado este mes" valor={totalGastado} tono="gasto" />
        <Metrica label="Disponible" valor={disponible} tono="auto" />
      </div>

      <ExpenseEntry />
      <GastoChart />
      <AnalisisCard />
      <ExpenseList />
    </div>
  )
}
