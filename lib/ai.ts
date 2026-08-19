import type { Categoria } from './types'

export interface GastoParseado {
  monto: number
  categoria: Categoria
  descripcion: string
}

export class AiError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.code = code
  }
}

async function postAi(body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    throw new AiError(
      (data.error as string) || 'No pude procesar el pedido',
      (data.code as string) || 'error',
    )
  }
  return data
}

export async function parsearGastos(
  text: string,
  categorias: Categoria[],
): Promise<GastoParseado[]> {
  const data = await postAi({ mode: 'expenses', text, categorias })
  const gastos = ((data.gastos as GastoParseado[]) ?? []).filter(
    (g) => typeof g.monto === 'number' && g.monto > 0 && categorias.includes(g.categoria),
  )
  if (!gastos.length) throw new AiError('sin-gastos', 'empty')
  return gastos
}

export async function pedirTexto(
  system: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
): Promise<string> {
  const data = await postAi({ mode: 'text', system, messages })
  return (data.text as string) ?? ''
}
