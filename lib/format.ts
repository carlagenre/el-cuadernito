export function formatARS(n: number): string {
  const rounded = Math.round(n || 0)
  return '$' + rounded.toLocaleString('es-AR', { maximumFractionDigits: 0 })
}

export function hoyISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function mesActual(): string {
  return hoyISO().slice(0, 7) // YYYY-MM
}

export function esMesActual(fechaISO: string): boolean {
  return fechaISO.slice(0, 7) === mesActual()
}

export function fechaLegible(fechaISO: string): string {
  const [y, m, d] = fechaISO.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function nuevoId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
