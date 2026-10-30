/** Storage that never throws (private windows, blocked storage, sandboxed previews). */
type Kind = 'local' | 'session'

const store = (kind: Kind): Storage | null => {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export function readJSON<T>(key: string, fallback: T, kind: Kind = 'local'): T {
  try {
    const raw = store(kind)?.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeJSON(key: string, value: unknown, kind: Kind = 'local') {
  try {
    store(kind)?.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable — state still works in memory */
  }
}

export const STORAGE_KEYS = {
  picks: 'forcefield.mypick.v1',
  getStarted: 'forcefield.getstarted.v1',
} as const
