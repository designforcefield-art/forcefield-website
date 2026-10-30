import { useNavigate } from 'react-router-dom'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { newId, pickSignature, type DiscoveryPick, type NewPick, type PickItem, type SolutionPick } from '../lib/picks'
import { readJSON, STORAGE_KEYS, writeJSON } from '../lib/storage'

export type AddResult = { status: 'added' | 'duplicate' | 'merged'; id: string }

interface PickState {
  picks: PickItem[]
  count: number
  /** Increments on every successful add — drives header feedback. */
  bump: number
  add: (p: NewPick) => AddResult
  replace: (id: string, p: NewPick) => void
  update: (id: string, patch: Partial<SolutionPick> | Partial<DiscoveryPick>) => void
  remove: (id: string) => void
  clear: () => void
  has: (p: NewPick) => boolean
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  /**
   * Go to the Get Started form. `service` = an explicit package choice (e.g. a
   * package CTA); `fromMyPick` = carry My Pick over (recommended package + brief).
   */
  startSignUp: (opts?: { service?: 'discovery' | 'essential' | 'dynamic'; fromMyPick?: boolean }) => void
}

const Ctx = createContext<PickState | null>(null)

export function PickProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [picks, setPicks] = useState<PickItem[]>(() => readJSON<PickItem[]>(STORAGE_KEYS.picks, []))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [bump, setBump] = useState(0)

  useEffect(() => writeJSON(STORAGE_KEYS.picks, picks), [picks])

  const has = useCallback((p: NewPick) => picks.some((x) => pickSignature(x) === pickSignature(p)), [picks])

  const add = useCallback(
    (p: NewPick): AddResult => {
      const sig = pickSignature(p)
      const existing = picks.find((x) => pickSignature(x) === sig)
      const now = new Date().toISOString()
      if (existing && p.kind === 'discovery' && existing.kind === 'discovery') {
        // Only one Discovery entry: merge services instead of duplicating.
        const services = [...new Set([...existing.services, ...p.services])]
        const changed = services.length !== existing.services.length
        if (changed) setPicks((xs) => xs.map((x) => (x.id === existing.id ? { ...existing, services, updatedAt: now } : x)))
        if (changed) setBump((b) => b + 1)
        return { status: changed ? 'merged' : 'duplicate', id: existing.id }
      }
      if (existing) return { status: 'duplicate', id: existing.id }
      const id = newId()
      setPicks((xs) => [...xs, { ...p, id, createdAt: now, updatedAt: now } as PickItem])
      setBump((b) => b + 1)
      return { status: 'added', id }
    },
    [picks],
  )

  const replace = useCallback((id: string, p: NewPick) => {
    setPicks((xs) => xs.map((x) => (x.id === id ? ({ ...p, id, createdAt: x.createdAt, updatedAt: new Date().toISOString() } as PickItem) : x)))
    setBump((b) => b + 1)
  }, [])

  const update = useCallback((id: string, patch: Partial<SolutionPick> | Partial<DiscoveryPick>) => {
    setPicks((xs) => xs.map((x) => (x.id === id ? ({ ...x, ...patch, updatedAt: new Date().toISOString() } as PickItem) : x)))
  }, [])

  const remove = useCallback((id: string) => setPicks((xs) => xs.filter((x) => x.id !== id)), [])
  const clear = useCallback(() => setPicks([]), [])

  const value = useMemo<PickState>(
    () => ({
      picks,
      count: picks.length,
      bump,
      add,
      replace,
      update,
      remove,
      clear,
      has,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      startSignUp: (opts) => {
        setDrawerOpen(false)
        const q = new URLSearchParams()
        if (opts?.service) q.set('service', opts.service)
        if (opts?.fromMyPick) q.set('from', 'mypick')
        const qs = q.toString()
        navigate(qs ? `/get-started?${qs}` : '/get-started')
      },
    }),
    [picks, bump, add, replace, update, remove, clear, has, drawerOpen, navigate],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePicks() {
  const v = useContext(Ctx)
  if (!v) throw new Error('usePicks must be used inside <PickProvider>')
  return v
}
