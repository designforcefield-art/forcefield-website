import { X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { cn } from './primitives'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/** Focus trap, Escape to close, scroll lock and focus restore for dialogs. */
function useDialog(open: boolean, onClose: () => void, panel: RefObject<HTMLElement | null>) {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)

  // keep mounted during exit animation
  useEffect(() => {
    if (open) {
      setMounted(true)
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
      return () => cancelAnimationFrame(r)
    }
    setVisible(false)
    const t = setTimeout(() => setMounted(false), 320)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusFirst = setTimeout(() => {
      const el = panel.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panel.current
      el?.focus()
    }, 30)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
      if (e.key === 'Tab' && panel.current) {
        const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((x) => x.offsetParent !== null)
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(focusFirst)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previouslyFocused?.focus?.()
    }
  }, [open, onClose, panel])

  return { mounted, visible }
}

interface OverlayProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function Drawer({ open, onClose, title, description, children, footer, className }: OverlayProps) {
  const panel = useRef<HTMLDivElement>(null)
  const { mounted, visible } = useDialog(open, onClose, panel)
  const titleId = useId()
  if (!mounted) return null
  return createPortal(
    <div className="fixed inset-0 z-[70]">
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn('absolute inset-0 bg-black/70 transition-opacity duration-300', visible ? 'opacity-100' : 'opacity-0')}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-[30rem] flex-col border-l border-line bg-surface shadow-float outline-none transition-transform duration-500 ease-out-expo',
          'pt-[env(safe-area-inset-top,0px)] pr-[env(safe-area-inset-right,0px)] pb-[env(safe-area-inset-bottom,0px)]',
          visible ? 'translate-x-0' : 'translate-x-full',
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-h3 font-normal">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <CloseButton onClick={onClose} />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="border-t border-line bg-canvas/40 px-6 py-5">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}

export function Modal({ open, onClose, title, description, children, footer, className }: OverlayProps) {
  const panel = useRef<HTMLDivElement>(null)
  const { mounted, visible } = useDialog(open, onClose, panel)
  const titleId = useId()
  if (!mounted) return null
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn('absolute inset-0 bg-black/75 transition-opacity duration-300', visible ? 'opacity-100' : 'opacity-0')}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[min(92dvh,56rem)] w-full max-w-3xl flex-col overflow-hidden rounded-t-panel border border-line bg-surface shadow-float outline-none transition-all duration-500 ease-out-expo sm:rounded-panel',
          'pb-[env(safe-area-inset-bottom,0px)] sm:pb-0',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5 sm:px-8">
          <div className="min-w-0">
            <h2 id={titleId} className="text-h3 font-normal sm:text-2xl">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <CloseButton onClick={onClose} />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">{children}</div>
        {footer && <footer className="border-t border-line bg-canvas/40 px-6 py-4 sm:px-8">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Close"
      className="-mr-2 grid size-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-elevated hover:text-fg"
    >
      <X className="size-5" />
    </button>
  )
}
