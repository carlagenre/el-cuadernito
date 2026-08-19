import type { Categoria } from './types'

export const CATEGORIAS: Categoria[] = [
  'Comida',
  'Transporte',
  'Vivienda',
  'Servicios',
  'Salud',
  'Ocio',
  'Otros',
]

// Peso base fijo de cada categoría (fracción del ingreso)
export const PESOS_BASE: Record<Categoria, number> = {
  Comida: 0.2,
  Transporte: 0.1,
  Vivienda: 0.3,
  Servicios: 0.1,
  Salud: 0.08,
  Ocio: 0.12,
  Otros: 0.1,
}

// Color categórico por categoría (paleta en orden fijo)
export const COLOR_CATEGORIA: Record<Categoria, string> = {
  Comida: '#0F6CBD',
  Transporte: '#2FA7A0',
  Vivienda: '#7C6FE0',
  Servicios: '#E0985B',
  Salud: '#4C9BE8',
  Ocio: '#C15FA0',
  Otros: '#8A8F98',
}

export const HACKS_AHORRO: string[] = [
  'Vendé algo que no uses',
  'Pausá una suscripción que no uses',
  'Cociná en casa 3 veces por semana',
  'Hacé una changa para sumar un extra',
  'Usá apps de cashback y cupones',
  'Apartá el ahorro apenas cobrás',
  'Hacé una venta de garage virtual',
  'Llevá termo y snack desde casa',
  'Compartí gastos de transporte',
  'Ofrecé un servicio (cuidar mascotas, dar clases)',
]

export const STORAGE_KEY = 'cuadernito-data'
export const AUTH_USERS_KEY = 'cuadernito-users'
export const AUTH_SESSION_KEY = 'cuadernito-session'

// Reparte los pesos base entre las categorías activas para que sumen 1
export function calcularBudgets(activas: Categoria[]): Record<string, number> {
  const total = activas.reduce((acc, c) => acc + PESOS_BASE[c], 0)
  const budgets: Record<string, number> = {}
  for (const c of CATEGORIAS) {
    budgets[c] = activas.includes(c) && total > 0 ? PESOS_BASE[c] / total : 0
  }
  return budgets
}
