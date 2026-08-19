'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { LoginScreen } from '@/components/login-screen'
import { CuadernitoProvider } from '@/lib/store'
import { cerrarSesion, leerSesion } from '@/lib/auth'

export default function Page() {
  const [sesion, setSesion] = useState<string | null>(null)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    setSesion(leerSesion())
    setListo(true)
  }, [])

  if (!listo) {
    return <div className="min-h-screen bg-background" />
  }

  if (!sesion) {
    return <LoginScreen onLogin={(email) => setSesion(email)} />
  }

  return (
    <CuadernitoProvider>
      <AppShell
        onLogout={() => {
          cerrarSesion()
          setSesion(null)
        }}
      />
    </CuadernitoProvider>
  )
}
