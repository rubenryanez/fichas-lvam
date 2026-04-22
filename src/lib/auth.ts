// Sistema simple de autenticación con clave de acceso compartida.
// Sesión guardada en localStorage con validez de 8 horas.

const PASSWORD = 'LVAM2026';
const STORAGE_KEY = 'lvam_auth';
const SESSION_HOURS = 8;

export interface Session {
  expiresAt: number; // epoch ms
}

export function checkPassword(pwd: string): boolean {
  return pwd === PASSWORD;
}

export function setSession(): void {
  if (typeof window === 'undefined') return;
  const session: Session = {
    expiresAt: Date.now() + SESSION_HOURS * 60 * 60 * 1000,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore (modo incognito sin permisos, etc.)
  }
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (!s?.expiresAt || typeof s.expiresAt !== 'number') return null;
    return s;
  } catch {
    return null;
  }
}

export function isSessionValid(): boolean {
  const s = getSession();
  if (!s) return false;
  return s.expiresAt > Date.now();
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
