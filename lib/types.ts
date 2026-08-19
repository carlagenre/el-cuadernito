export type Categoria =
  | 'Comida'
  | 'Transporte'
  | 'Vivienda'
  | 'Servicios'
  | 'Salud'
  | 'Ocio'
  | 'Otros'

export type PlazoUnidad = 'dias' | 'semanas' | 'meses'
export type Semaforo = 'verde' | 'amarillo' | 'rojo' | null

export interface Expense {
  id: string
  monto: number
  categoria: Categoria
  descripcion: string
  fecha: string // YYYY-MM-DD
}

export interface Goal {
  id: string
  nombre: string
  costoTotal: number
  ahorroAcumulado: number
  plazoCantidad: number
  plazoUnidad: PlazoUnidad
  ahorroMensual: number
  fechaObjetivo: string // YYYY-MM-DD
  semaforo: Semaforo
  hack: string
}

export interface CuadernitoData {
  income: number
  budgets: Record<string, number> // fracción del ingreso por categoría (0-1)
  categoriasActivas: Categoria[]
  expenses: Expense[]
  goals: Goal[]
}
