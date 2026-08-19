'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { STORAGE_KEY, calcularBudgets } from './constants'
import { esMesActual, nuevoId } from './format'
import type { Categoria, CuadernitoData, Expense, Goal } from './types'

const DATA_VACIA: CuadernitoData = {
  income: 0,
  budgets: {},
  categoriasActivas: [],
  expenses: [],
  goals: [],
}

interface CuadernitoContextValue {
  data: CuadernitoData
  cargado: boolean
  configurado: boolean
  // config
  configurarMes: (income: number, activas: Categoria[]) => void
  // gastos
  agregarGastos: (gastos: Omit<Expense, 'id' | 'fecha'>[]) => void
  editarGasto: (id: string, cambios: Partial<Omit<Expense, 'id' | 'fecha'>>) => void
  eliminarGasto: (id: string) => void
  // objetivos
  agregarGoal: (goal: Omit<Goal, 'id'>) => void
  sumarAhorro: (id: string, monto: number) => void
  eliminarGoal: (id: string) => void
  // derivados
  gastosDelMes: Expense[]
  gastadoPorCategoria: Record<Categoria, number>
  presupuestoPorCategoria: Record<Categoria, number>
  totalGastado: number
}

const CuadernitoContext = createContext<CuadernitoContextValue | null>(null)

export function CuadernitoProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CuadernitoData>(DATA_VACIA)
  const [cargado, setCargado] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as CuadernitoData
        setData({ ...DATA_VACIA, ...parsed })
      }
    } catch {
      // ignorar
    }
    setCargado(true)
  }, [])

  useEffect(() => {
    if (cargado) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }, [data, cargado])

  const configurarMes = useCallback((income: number, activas: Categoria[]) => {
    setData((prev) => ({
      ...prev,
      income,
      categoriasActivas: activas,
      budgets: calcularBudgets(activas),
    }))
  }, [])

  const agregarGastos = useCallback((gastos: Omit<Expense, 'id' | 'fecha'>[]) => {
    setData((prev) => {
      const nuevos: Expense[] = gastos.map((g) => ({
        ...g,
        id: nuevoId(),
        fecha: new Date().toISOString().slice(0, 10),
      }))
      return { ...prev, expenses: [...prev.expenses, ...nuevos] }
    })
  }, [])

  const editarGasto = useCallback(
    (id: string, cambios: Partial<Omit<Expense, 'id' | 'fecha'>>) => {
      setData((prev) => ({
        ...prev,
        expenses: prev.expenses.map((e) => (e.id === id ? { ...e, ...cambios } : e)),
      }))
    },
    [],
  )

  const eliminarGasto = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }))
  }, [])

  const agregarGoal = useCallback((goal: Omit<Goal, 'id'>) => {
    setData((prev) => ({
      ...prev,
      goals: [{ ...goal, id: nuevoId() }, ...prev.goals],
    }))
  }, [])

  const sumarAhorro = useCallback((id: string, monto: number) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === id
          ? { ...g, ahorroAcumulado: Math.max(0, g.ahorroAcumulado + monto) }
          : g,
      ),
    }))
  }, [])

  const eliminarGoal = useCallback((id: string) => {
    setData((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }))
  }, [])

  const gastosDelMes = useMemo(
    () =>
      [...data.expenses]
        .filter((e) => esMesActual(e.fecha))
        .sort((a, b) => (a.fecha < b.fecha ? 1 : -1)),
    [data.expenses],
  )

  const gastadoPorCategoria = useMemo(() => {
    const acc = {} as Record<Categoria, number>
    for (const c of data.categoriasActivas) acc[c] = 0
    for (const e of gastosDelMes) {
      if (acc[e.categoria] === undefined) acc[e.categoria] = 0
      acc[e.categoria] += e.monto
    }
    return acc
  }, [gastosDelMes, data.categoriasActivas])

  const presupuestoPorCategoria = useMemo(() => {
    const acc = {} as Record<Categoria, number>
    for (const c of data.categoriasActivas) {
      acc[c] = (data.budgets[c] ?? 0) * data.income
    }
    return acc
  }, [data.budgets, data.income, data.categoriasActivas])

  const totalGastado = useMemo(
    () => gastosDelMes.reduce((acc, e) => acc + e.monto, 0),
    [gastosDelMes],
  )

  const value: CuadernitoContextValue = {
    data,
    cargado,
    configurado: data.income > 0 && data.categoriasActivas.length > 0,
    configurarMes,
    agregarGastos,
    editarGasto,
    eliminarGasto,
    agregarGoal,
    sumarAhorro,
    eliminarGoal,
    gastosDelMes,
    gastadoPorCategoria,
    presupuestoPorCategoria,
    totalGastado,
  }

  return <CuadernitoContext.Provider value={value}>{children}</CuadernitoContext.Provider>
}

export function useCuadernito() {
  const ctx = useContext(CuadernitoContext)
  if (!ctx) throw new Error('useCuadernito debe usarse dentro de CuadernitoProvider')
  return ctx
}
