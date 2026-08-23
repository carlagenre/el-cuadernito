'use client'

import { useState } from 'react'
import { LogOut, MessageCircle, PiggyBank, Settings, Wallet } from 'lucide-react'
import { Logo } from './brand'
import { ConfigModal } from './config-modal'
import { ResumenTab } from './tabs/resumen-tab'
import { ObjetivosTab } from './tabs/objetivos-tab'
import { ChatTab } from './tabs/chat-tab'
import { useCuadernito } from '@/lib/store'
import { formatARS } from '@/lib/format'
import { cn } from '@/lib/utils'

type TabId = 'resumen' | 'objetivos' | 'chat'

const TABS: { id: TabId; label: string; icon: typeof Wallet }[] = [
  { id: 'resumen', label: 'Resumen del mes', icon: Wallet },
  { id: 'objetivos', label: 'Objetivos', icon: PiggyBank },
  { id: 'chat', label: 'Preguntale a la IA', icon: MessageCircle },
]

export function AppShell({ onLogout }: { onLogout: () => void }) {
  const { data, configurado } = useCuadernito()
  const [tab, setTab] = useState<TabId>('resumen')
  const [configAbierto, setConfigAbierto] = useState(false)

  const mostrarConfig = configAbierto || !configurado

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Logo size={36} />
            <div className="leading-tight">
                                      <p className="font-mono text-base font-bold text-foreground"><span className="text-primary">Cat</span> <span className="text-[#1e8e3e]">Cash</span></p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Tu plata, anotada y explicada
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setConfigAbierto(true)}
              className="flex items-center gap-2 rounded-[10px] border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary-soft"
            >
              <Settings className="size-4 text-muted-foreground" />
              <span className="tabular hidden font-mono sm:inline">
                {configurado ? formatARS(data.income) : 'Configurar'}
              </span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Cerrar sesión"
              className="rounded-[10px] border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-3xl gap-1 px-2">
          {TABS.map((t) => {
            const activo = tab === t.id
            const Icon = t.icon
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors',
                  activo ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{t.label}</span>
                {activo && (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {tab === 'resumen' && <ResumenTab />}
        {tab === 'objetivos' && <ObjetivosTab />}
        {tab === 'chat' && <ChatTab />}
      </main>

      {mostrarConfig && (
        <ConfigModal
          onClose={configurado ? () => setConfigAbierto(false) : undefined}
        />
      )}
    </div>
  )
}
