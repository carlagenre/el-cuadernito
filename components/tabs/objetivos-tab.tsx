"use client"

import { useState } from "react"
import { Target, Plus } from "lucide-react"
import { useCuadernito } from "@/lib/store"
import { GoalCard } from "@/components/goal-card"
import { GoalForm } from "@/components/goal-form"
import { PrimaryButton } from "@/components/kit"

export function ObjetivosTab() {
  const { data } = useCuadernito()
  const goals = data.goals
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Tus objetivos</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Planificá tus metas de ahorro</p>
        </div>
        {!showForm && (
          <PrimaryButton onClick={() => setShowForm(true)}>
            <Plus className="size-4" />
            Nuevo
          </PrimaryButton>
        )}
      </div>

      {showForm && <GoalForm onDone={() => setShowForm(false)} />}

      {goals.length === 0 && !showForm ? (
        <div className="rounded-[16px] border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-[var(--primary)]">
            <Target className="size-6" />
          </div>
          <p className="mt-3 font-medium text-[var(--foreground)]">Todavía no tenés objetivos</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Creá tu primera meta y te ayudamos a planificar cuánto ahorrar.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} />
          ))}
        </div>
      )}
    </div>
  )
}
