'use client'

import { useMemo, useState } from 'react'
import { Btn } from './kit'
import { useCuadernito } from '@/lib/store'
import {
  COLOR_SEMAFORO,
  calcularAhorroMensual,
  fechaObjetivo,
  hackAleatorio,
  semaforoDesde,
} from '@/lib/goals'
import type { PlazoUnidad } from '@/lib/types'

const PREGUNTAS = [
  '¿Lo necesito ya?',
  '¿Me suma valor?',
  '¿Lo elijo por mí, no por presión externa?',
]

export function GoalForm({ onDone }: { onDone: () => void }) {
  const { agregarGoal } = useCuadernito()
  const [nombre, setNombre] = useState('')
  const [costo, setCosto] = useState('')
  const [plazoCantidad, setPlazoCantidad] = useState('')
  const [plazoUnidad, setPlazoUnidad] = useState<PlazoUnidad>('meses')
  const [yaAhorrado, setYaAhorrado] = useState('')
  const [respuestas, setRespuestas] = useState<(boolean | null)[]>([null, null, null])

  const semaforo = useMemo(() => semaforoDesde(respuestas), [respuestas])

  const valido =
    nombre.trim() !== '' && Number(costo) > 0 && Number(plazoCantidad) > 0

  function guardar() {
    if (!valido) return
    const costoTotal = Number(costo)
    const ahorroAcum = Number(yaAhorrado) || 0
    const cantidad = Number(plazoCantidad)
    agregarGoal({
      nombre: nombre.trim(),
      costoTotal,
      ahorroAcumulado: ahorroAcum,
      plazoCantidad: cantidad,
      plazoUnidad,
      ahorroMensual: calcularAhorroMensual(costoTotal, ahorroAcum, cantidad, plazoUnidad),
      fechaObjetivo: fechaObjetivo(cantidad, plazoUnidad),
      semaforo: semaforo.color,
      hack: hackAleatorio(),
    })
    onDone()
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col gap-4">
        <Field label="¿Qué querés comprar o lograr?">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: una notebook nueva"
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Costo total">
            <MoneyInput value={costo} onChange={setCosto} placeholder="80000" />
          </Field>
          <Field label="Ya tenés ahorrado (opcional)">
            <MoneyInput value={yaAhorrado} onChange={setYaAhorrado} placeholder="0" />
          </Field>
        </div>

        <Field label="¿En cuánto tiempo?">
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={plazoCantidad}
              onChange={(e) => setPlazoCantidad(e.target.value)}
              placeholder="6"
              className="input tabular w-24 font-mono"
            />
            <select
              value={plazoUnidad}
              onChange={(e) => setPlazoUnidad(e.target.value as PlazoUnidad)}
              className="input flex-1"
            >
              <option value="dias">días</option>
              <option value="semanas">semanas</option>
              <option value="meses">meses</option>
            </select>
          </div>
        </Field>

        <div className="rounded-xl bg-muted/60 p-4">
          <p className="text-sm font-semibold text-foreground">
            Antes de decidir, pensalo un poco
          </p>
          <div className="mt-3 flex flex-col gap-2.5">
            {PREGUNTAS.map((p, i) => (
              <div key={p} className="flex items-center justify-between gap-3">
                <span className="text-sm text-foreground">{p}</span>
                <div className="flex gap-1.5">
                  <SiNo
                    activo={respuestas[i] === true}
                    tono="si"
                    onClick={() =>
                      setRespuestas((r) => r.map((v, j) => (j === i ? true : v)))
                    }
                  >
                    Sí
                  </SiNo>
                  <SiNo
                    activo={respuestas[i] === false}
                    tono="no"
                    onClick={() =>
                      setRespuestas((r) => r.map((v, j) => (j === i ? false : v)))
                    }
                  >
                    No
                  </SiNo>
                </div>
              </div>
            ))}
          </div>

          {semaforo.color && (
            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: COLOR_SEMAFORO[semaforo.color] }}
              />
              <span className="text-sm font-medium text-foreground">{semaforo.texto}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Btn onClick={guardar} disabled={!valido} className="flex-1">
            Guardar objetivo
          </Btn>
          <Btn variant="secondary" onClick={onDone}>
            Cancelar
          </Btn>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
    </label>
  )
}

function MoneyInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
        $
      </span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input tabular pl-7 font-mono"
      />
    </div>
  )
}

function SiNo({
  children,
  activo,
  tono,
  onClick,
}: {
  children: React.ReactNode
  activo: boolean
  tono: 'si' | 'no'
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-8 w-11 rounded-lg border text-sm font-semibold transition-colors"
      style={
        activo
          ? tono === 'si'
            ? { backgroundColor: 'var(--positive)', color: '#fff', borderColor: 'var(--positive)' }
            : { backgroundColor: 'var(--negative)', color: '#fff', borderColor: 'var(--negative)' }
          : { borderColor: 'var(--border)', color: 'var(--muted-foreground)' }
      }
    >
      {children}
    </button>
  )
}
