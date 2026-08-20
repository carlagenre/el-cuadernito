import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

export const maxDuration = 30

// Usa el tier gratuito de Google Gemini (sin tarjeta de crédito). Generá tu
// key gratis en aistudio.google.com y configurala como GOOGLE_GENERATIVE_AI_API_KEY
// en las variables de entorno de tu hosting.
const MODEL = google('gemini-flash-latest')

type Body =
  | { mode: 'text'; system: string; messages: { role: 'user' | 'assistant'; content: string }[] }
  | { mode: 'expenses'; text: string; categorias: string[] }

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return Response.json({ error: 'Body inválido' }, { status: 400 })
  }

  try {
    if (body.mode === 'expenses') {
      const { text, categorias } = body
      if (!categorias?.length) {
        return Response.json({ error: 'No hay categorías activas' }, { status: 400 })
      }
      const { output } = await generateText({
        model: MODEL,
        output: Output.object({
          schema: z.object({
            gastos: z.array(
              z.object({
                monto: z.number().describe('Monto en pesos argentinos, solo el número'),
                categoria: z
                  .enum(categorias as [string, ...string[]])
                  .describe('Una de las categorías permitidas'),
                descripcion: z
                  .string()
                  .describe('Descripción corta del gasto, en minúsculas'),
              }),
            ),
          }),
        }),
        system:
          'Sos un asistente que extrae gastos de un texto libre escrito por un argentino. ' +
          'Devolvé un gasto por cada compra/pago mencionado. El monto es el número en pesos. ' +
          'Asigná a cada gasto la categoría más adecuada, eligiendo ÚNICAMENTE entre las categorías permitidas: ' +
          categorias.join(', ') +
          '. Si no estás seguro, usá "Otros" si está disponible. La descripción debe ser breve y clara.',
        prompt: text,
      })
      return Response.json({ gastos: output.gastos })
    }

    // mode === 'text'
    const { system, messages } = body
    const { text } = await generateText({
      model: MODEL,
      system,
      messages,
    })
    return Response.json({ text })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.log('[v0] Error en /api/ai:', msg)
    const faltaKey = /api.?key|authentication|401|API_KEY_INVALID/i.test(msg)
    const sinCuota = /quota|rate.?limit|429|RESOURCE_EXHAUSTED/i.test(msg)
    return Response.json(
      {
        error: faltaKey
          ? 'Falta configurar GOOGLE_GENERATIVE_AI_API_KEY en las variables de entorno del hosting.'
          : sinCuota
            ? 'Se alcanzó el límite gratuito de Gemini por ahora. Esperá un minuto y probá de nuevo.'
            : 'No pude procesar el pedido',
        code: faltaKey ? 'needs_key' : sinCuota ? 'rate_limited' : 'error',
      },
      { status: faltaKey ? 402 : sinCuota ? 429 : 500 },
    )
  }
}
