"use client"

import { useEffect, useRef, useState } from "react"
import { Send, Sparkles } from "lucide-react"
import { useCuadernito } from "@/lib/store"
import { AiError, pedirTexto } from "@/lib/ai"
import { formatARS } from "@/lib/format"
import { calcularAhorroMensual } from "@/lib/goals"

interface Msg {
  role: "user" | "assistant"
  content: string
}

const SUGERENCIAS = [
  "¿En qué gasté más este mes?",
  "¿Cómo puedo llegar a mi objetivo más rápido?",
  "Dame tres consejos para ahorrar",
]

export function ChatTab() {
  const { data, gastosDelMes, totalGastado, gastadoPorCategoria } = useCuadernito()
  const goals = data.goals
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, loading])

  function construirSystem(): string {
    const resumenCat = Object.entries(gastadoPorCategoria)
      .filter(([, m]) => m > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([c, m]) => `${c}: ${formatARS(m)}`)
      .join(", ")
    const resumenObj = goals.length
      ? goals
          .map(
            (g) =>
              `"${g.nombre}" (meta ${formatARS(g.costoTotal)}, ahorrado ${formatARS(g.ahorroAcumulado)}, sugerido/mes ${formatARS(
                calcularAhorroMensual(g.costoTotal, g.ahorroAcumulado, g.plazoCantidad, g.plazoUnidad),
              )})`,
          )
          .join("; ")
      : "sin objetivos cargados"

    return (
      "Sos el asistente financiero de El cuadernito, una app argentina de finanzas personales. " +
      "Hablás en español rioplatense, con tono cercano, claro y práctico. Usás pesos argentinos. " +
      "Respondés corto y accionable, sin listas larguísimas. No inventes datos que no tengas. " +
      `Ingreso mensual del usuario: ${data.income ? formatARS(data.income) : "no informado"}. ` +
      `Gasto total del mes: ${formatARS(totalGastado)} en ${gastosDelMes.length} movimientos. ` +
      `Gastos por categoría: ${resumenCat || "sin gastos"}. ` +
      `Objetivos: ${resumenObj}.`
    )
  }

  async function enviar(texto: string) {
    const contenido = texto.trim()
    if (!contenido || loading) return
    const nuevos: Msg[] = [...messages, { role: "user", content: contenido }]
    setMessages(nuevos)
    setInput("")
    setLoading(true)
    try {
      const respuesta = await pedirTexto(construirSystem(), nuevos)
      setMessages((m) => [...m, { role: "assistant", content: respuesta }])
    } catch (e) {
      const msg =
        e instanceof AiError && e.code === "needs_billing"
          ? e.message
          : "Uy, no pude responder en este momento. Probá de nuevo en un ratito."
      setMessages((m) => [...m, { role: "assistant", content: msg }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100dvh-13rem)] flex-col rounded-[16px] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-card)]">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-[var(--primary)]">
              <Sparkles className="size-6" />
            </div>
            <p className="mt-3 font-semibold text-[var(--foreground)]">Preguntame lo que quieras</p>
            <p className="mt-1 max-w-xs text-sm text-[var(--muted-foreground)]">
              Conozco tus gastos y objetivos. Te ayudo a entender tu plata y a ahorrar mejor.
            </p>
            <div className="mt-5 flex w-full max-w-sm flex-col gap-2">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  className="rounded-[12px] border border-[var(--border)] bg-[var(--chip)] px-4 py-2.5 text-left text-sm text-[var(--foreground)] transition-colors hover:border-[var(--primary)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-[16px] px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "rounded-br-sm bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "rounded-bl-sm bg-[var(--chip)] text-[var(--foreground)]"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-[16px] rounded-bl-sm bg-[var(--chip)] px-4 py-3">
              <span className="size-2 animate-bounce rounded-full bg-[var(--muted-foreground)] [animation-delay:-0.3s]" />
              <span className="size-2 animate-bounce rounded-full bg-[var(--muted-foreground)] [animation-delay:-0.15s]" />
              <span className="size-2 animate-bounce rounded-full bg-[var(--muted-foreground)]" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border)] p-3">
        <div className="flex items-center gap-2">
          <input
            className="input flex-1"
            placeholder="Escribí tu pregunta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) enviar(input)
            }}
          />
          <button
            onClick={() => enviar(input)}
            disabled={loading || !input.trim()}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] transition-opacity disabled:opacity-40"
            aria-label="Enviar mensaje"
          >
            <Send className="size-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
