import { AUTH_SESSION_KEY, AUTH_USERS_KEY } from './constants'

interface StoredUser {
  email: string
  passwordHash: string
}

export interface AuthResult {
  ok: boolean
  email?: string
  error?: string
}

export type AuthAction = 'login' | 'register'

// Hash simple con Web Crypto (SHA-256). No es seguridad real, alcanza para la demo.
async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function leerUsuarios(): StoredUser[] {
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY)
    return raw ? (JSON.parse(raw) as StoredUser[]) : []
  } catch {
    return []
  }
}

function guardarUsuarios(users: StoredUser[]) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users))
}

/**
 * Punto único de intercambio: hoy resuelve todo contra localStorage.
 * Para pasar a un backend real (por ejemplo el webhook de n8n contra Google Sheets),
 * reemplazá el cuerpo de esta función por algo como:
 *
 *   const res = await fetch(process.env.NEXT_PUBLIC_AUTH_WEBHOOK_URL!, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ action, email, password }),
 *   })
 *   const data = await res.json()
 *   return { ok: data.ok, email: data.email, error: data.error }
 *
 * El resto de la app no necesita cambiar.
 */
export async function authFetch(
  action: AuthAction,
  email: string,
  password: string,
): Promise<AuthResult> {
  const normalizado = email.trim().toLowerCase()
  await new Promise((r) => setTimeout(r, 500)) // simula latencia de red

  if (!normalizado || !password) {
    return { ok: false, error: 'Completá email y contraseña.' }
  }

  const hash = await hashPassword(password)
  const users = leerUsuarios()
  const existente = users.find((u) => u.email === normalizado)

  if (action === 'register') {
    if (existente) {
      return { ok: false, error: 'Ese email ya está registrado.' }
    }
    users.push({ email: normalizado, passwordHash: hash })
    guardarUsuarios(users)
    return { ok: true, email: normalizado }
  }

  // login
  if (!existente) {
    return { ok: false, error: 'No existe una cuenta con ese email.' }
  }
  if (existente.passwordHash !== hash) {
    return { ok: false, error: 'Contraseña incorrecta.' }
  }
  return { ok: true, email: normalizado }
}

export function guardarSesion(email: string) {
  localStorage.setItem(AUTH_SESSION_KEY, email)
}

export function leerSesion(): string | null {
  try {
    return localStorage.getItem(AUTH_SESSION_KEY)
  } catch {
    return null
  }
}

export function cerrarSesion() {
  localStorage.removeItem(AUTH_SESSION_KEY)
}
