"use client"

import { useState } from "react"
import { PiggyBank, Trash2, Plus } from "lucide-react"
import type { Goal } from "@/lib/types"
import { formatARS } from "@/lib/format"
import { calcularAhorroMensual, clasificarTamano } from "@/lib/goals"
import { useCuadernito } from "@/lib/store"
import { PrimaryButton } from "@/components/kit"

const TAMANO_STYLE: Record<string, string> = {
  Pequeño: "bg-[var(--chip)] text-[var(--muted-foreground)]",
  Mediano: "bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] text-[var(--primary)]",
  Grande: "bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[color-mix(in_srgb,var(--accent)_70%,black)]",
  Aspiracional: "bg-[color-mix(in_srgb,var(--negative)_15%,transparent)] text-[var(--negative)]",
}

export function GoalCard({ goal }: { goal: Goal }) {
  const { sumarAhorro, eliminarGoal } = useCuadernito()
  const [monto, setMonto] = useState("")

  const restante = Math.max(0, goal.costoTotal - goal.ahorroAcumulado)
  const progreso = goal.costoTotal > 0 ? Math.min(100, (goal.ahorroAcumulado / goal.costoTotal) * 100) : 0
  const mensual = calcularAhorroMensual(goal.costoTotal, goal.ahorroAcumulado, goal.plazoCantidad, goal.plazoUnidad)
  const tamano = clasificarTamano(goal.costoTotal)
  const completado = restante <= 0

  function aportar() {
    const n = Number.parseFloat(monto)
    if (!Number.isFinite(n) || n <= 0) return
    sumarAhorro(goal.id, n)
    setMonto("")
  }

  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-[var(--primary)]">
            <PiggyBank className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold leading-tight text-[var(--foreground)]">{goal.nombre}</h3>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${TAMANO_STYLE[tamano]}`}
            >
              {tamano}
            </span>
          </div>
        </div>
        <button
          onClick={() => eliminarGoal(goal.id)}
          className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--negative-soft)] hover:text-[var(--negative)]"
          aria-label="Eliminar objetivo"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between text-sm">
          <span className="text-[var(--muted-foreground)]">Ahorrado</span>
          <span className="tabular font-semibold text-[var(--foreground)]">
            {formatARS(goal.ahorroAcumulado)} <span className="text-[var(--muted-foreground)]">de</span>{" "}
            {formatARS(goal.costoTotal)}
          </span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[var(--chip)]">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-500"
            style={{ width: `${progreso}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-[var(--muted-foreground)]">
          <span className="tabular">{progreso.toFixed(0)}%</span>
          <span className="tabular">Faltan {formatARS(restante)}</span>
        </div>
      </div>

      {completado ? (
        <div className="mt-4 rounded-[12px] bg-[var(--positive-soft)] px-4 py-3 text-center text-sm font-medium text-[var(--positive)]">
          Meta cumplida, felicitaciones
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-[12px] bg-[var(--chip)] px-4 py-3">
            <p className="text-xs text-[var(--muted-foreground)]">Ahorro sugerido por mes</p>
            <p className="tabular text-lg font-bold text-[var(--foreground)]">{formatARS(mensual)}</p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              className="input flex-1"
              inputMode="numeric"
              placeholder="Aportar monto"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) aportar()
              }}
            />
            <PrimaryButton onClick={aportar} className="h-11 shrink-0 px-4">
              <Plus className="size-4" />
              Aportar
            </PrimaryButton>
          </div>
        </>
      )}
    </div>
  )
}
