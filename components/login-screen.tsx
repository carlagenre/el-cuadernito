'use client'

import { useState } from 'react'
import { Lock, Mail } from 'lucide-react'
import { Btn, Card } from './kit'
import { GoogleIcon, Logo, MicrosoftIcon } from './brand'
import { authFetch, guardarSesion } from '@/lib/auth'

export function LoginScreen({ onLogin }: { onLogin: (email: string) => void }) {
  const [modo, setModo] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  function entrarDemo() {
          const demoEmail = 'demo@catcash.app'
    guardarSesion(demoEmail)
    onLogin(demoEmail)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    const res = await authFetch(modo, email, password)
    setCargando(false)
    if (res.ok && res.email) {
      guardarSesion(res.email)
      onLogin(res.email)
    } else {
      setError(res.error ?? 'Algo salió mal. Probá de nuevo.')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <Card className="p-7">
          <div className="flex flex-col items-center text-center">
            <Logo size={64} />
            <h1 className="mt-4 font-mono text-2xl font-bold tracking-tight text-foreground">
                          <span className="text-primary">Cat</span> <span className="text-[#1e8e3e]">Cash</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              Tu plata, anotada y explicada
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <Btn variant="secondary" type="button" onClick={entrarDemo}>
              <GoogleIcon className="size-5" />
              Continuar con Google
            </Btn>
            <Btn variant="secondary" type="button" onClick={entrarDemo}>
              <MicrosoftIcon className="size-[18px]" />
              Continuar con Microsoft
            </Btn>
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">o</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-[10px] border border-border bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-[10px] border border-border bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-negative" role="alert">
                {error}
              </p>
            )}

            <Btn type="submit" disabled={cargando} className="mt-1">
              {cargando
                ? 'Un toque...'
                : modo === 'login'
                  ? 'Ingresar'
                  : 'Crear cuenta'}
            </Btn>
          </form>

          <button
            type="button"
            onClick={() => {
              setModo((m) => (m === 'login' ? 'register' : 'login'))
              setError(null)
            }}
            className="mt-4 w-full text-center text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            {modo === 'login' ? (
              <>
                ¿No tenés cuenta?{' '}
                <span className="font-semibold text-primary">Registrate</span>
              </>
            ) : (
              <>
                ¿Ya tenés cuenta?{' '}
                <span className="font-semibold text-primary">Ingresá</span>
              </>
            )}
          </button>
        </Card>
      </div>
    </main>
  )
}
