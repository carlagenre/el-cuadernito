import { HACKS_AHORRO } from './constants'
import type { PlazoUnidad, Semaforo } from './types'

export function plazoAMeses(cantidad: number, unidad: PlazoUnidad): number {
  if (unidad === 'dias') return cantidad / 30
  if (unidad === 'semanas') return cantidad / 4.33
  return cantidad
}

export function calcularAhorroMensual(
  costoTotal: number,
  yaAhorrado: number,
  cantidad: number,
  unidad: PlazoUnidad,
): number {
  const meses = plazoAMeses(cantidad, unidad)
  const restante = Math.max(0, costoTotal - yaAhorrado)
  if (meses <= 0) return restante
  return restante / meses
}

export function fechaObjetivo(cantidad: number, unidad: PlazoUnidad): string {
  const d = new Date()
  if (unidad === 'dias') d.setDate(d.getDate() + cantidad)
  else if (unidad === 'semanas') d.setDate(d.getDate() + cantidad * 7)
  else d.setMonth(d.getMonth() + cantidad)
  return d.toISOString().slice(0, 10)
}

export function hackAleatorio(): string {
  return HACKS_AHORRO[Math.floor(Math.random() * HACKS_AHORRO.length)]
}

export function semaforoDesde(respuestas: (boolean | null)[]): {
  color: Semaforo
  texto: string
} {
  const contestadas = respuestas.filter((r) => r !== null)
  if (contestadas.length < 3) return { color: null, texto: '' }
  const sies = respuestas.filter((r) => r === true).length
  if (sies === 3) return { color: 'verde', texto: 'Adelante, parece una buena decisión' }
  if (sies === 2) return { color: 'amarillo', texto: 'Pensalo un poco más' }
  return { color: 'rojo', texto: 'Mejor esperá antes de decidir' }
}

export type Tamano = 'Pequeño' | 'Mediano' | 'Grande' | 'Aspiracional'

export function clasificarTamano(costo: number): Tamano {
  if (costo <= 25000) return 'Pequeño'
  if (costo <= 50000) return 'Mediano'
  if (costo <= 150000) return 'Grande'
  return 'Aspiracional'
}

export const COLOR_SEMAFORO: Record<Exclude<Semaforo, null>, string> = {
  verde: '#1E8E3E',
  amarillo: '#C87F0A',
  rojo: '#D93025',
}
