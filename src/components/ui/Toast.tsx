import { CheckCircle2, Info } from 'lucide-react'
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { cn } from './primitives'

interface ToastMsg {
  id: number
  title: string
  body?: string
  tone?: 'success' | 'info'
  action?: { label: string; onClick: () => void }
}

const Ctx = createContext<(t: Omit<ToastMsg, 'id'>) => void>(() => {})
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const n = useRef(0)
  const push = useCallback((t: Omit<ToastMsg, 'id'>) => {
    const id = ++n.current
    setToasts((xs) => [...xs.slice(-2), { ...t, id }])
    setTimeout(() => setToasts((xs) => xs.filter((x) => x.id !== id)), 5000)
  }, [])

  return (
    <Ctx.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top,0px)+0.75rem)] z-[90] flex flex-col items-center gap-2 px-4 sm:top-auto sm:bottom-0 sm:items-start sm:pb-6 sm:pl-[max(1.5rem,env(safe-area-inset-left,0px))]"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto bg-elevated flex w-full max-w-sm animate-rise items-start gap-3 rounded-card border border-line-strong p-4 shadow-float"
          >
            {t.tone === 'info' ? <Info className="mt-0.5 size-5 shrink-0 text-glow" /> : <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />}
            <div className="min-w-0 flex-1">
              <p className="font-medium">{t.title}</p>
              {t.body && <p className="mt-0.5 text-sm text-muted">{t.body}</p>}
            </div>
            {t.action && (
              <button
                onClick={() => {
                  t.action!.onClick()
                  setToasts((xs) => xs.filter((x) => x.id !== t.id))
                }}
                className={cn('shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-cyan hover:bg-elevated')}
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
