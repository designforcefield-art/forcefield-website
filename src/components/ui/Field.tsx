import { Info } from 'lucide-react'
import { useEffect, useId, useRef, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from './primitives'

const control =
  'w-full rounded-control border bg-canvas/60 px-4 text-fg placeholder:text-subtle transition-colors duration-200 focus:outline-none focus-visible:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/25 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20'

interface FieldProps {
  /** Optional stable id for the control (otherwise generated). */
  id?: string
  label: string
  hint?: string
  error?: string
  optional?: boolean
  /** Show the hint in a tooltip (info icon next to the label) instead of under the field. */
  hintTooltip?: boolean
  className?: string
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode
}

/** Wires label, hint and error to the control for screen readers. */
export function Field({ id: idProp, label, hint, error, optional, hintTooltip, className, children }: FieldProps) {
  const auto = useId()
  const id = idProp ?? auto
  const hintId = hint ? `${id}-hint` : undefined
  const errId = error ? `${id}-err` : undefined
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between gap-3">
        {/* relative: the tooltip lines up with the start of the label */}
        <span className="relative flex items-center gap-1.5">
          <label htmlFor={id} className="text-sm font-medium text-fg">
            {label}
          </label>
          {hint && hintTooltip && <InfoTip label={label} text={hint} />}
        </span>
        {optional && <span className="text-xs font-normal text-subtle">Optional</span>}
      </div>
      {children({ id, describedBy, invalid: !!error })}
      {/* In tooltip mode the hint stays available to screen readers via aria-describedby. */}
      {hint && !error && <p id={hintId} className={hintTooltip ? 'sr-only' : 'text-xs text-subtle'}>{hint}</p>}
      {error && (
        <p id={errId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export function Input({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, 'h-12 border-line', className)} {...p} />
}

export function Textarea({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, 'min-h-28 resize-y border-line py-3 leading-relaxed', className)} {...p} />
}

export function Select({ className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(control, 'h-12 appearance-none border-line pr-10', className)} {...p}>
        {children}
      </select>
      <svg aria-hidden="true" viewBox="0 0 20 20" className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 fill-none stroke-subtle stroke-2">
        <path d="m5 8 5 5 5-5" />
      </svg>
    </div>
  )
}

/**
 * Small info icon that shows helper text on hover, keyboard focus or tap.
 * Place it inside a `relative` wrapper; the tooltip aligns to that wrapper's left edge.
 * The same text is also linked to the field for screen readers, so this is visual only.
 */
export function InfoTip({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const tipId = useId()
  useEffect(() => {
    if (!open) return
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', close)
    return () => {
      document.removeEventListener('keydown', close)
      document.removeEventListener('pointerdown', close)
    }
  }, [open])
  return (
    <span ref={ref} className="inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-label={`More about ${label}`}
        aria-describedby={open ? tipId : undefined}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="grid size-5 place-items-center rounded-full text-subtle transition-colors outline-none hover:text-fg focus-visible:ring-2 focus-visible:ring-electric/60"
      >
        <Info className="size-4" aria-hidden="true" />
      </button>
      <span
        id={tipId}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-0 z-30 mb-2 w-[min(20rem,calc(100vw-3rem))] rounded-xl border border-line-strong bg-elevated px-3 py-2 text-xs leading-[1.5] font-normal text-muted shadow-float transition-[opacity,translate] duration-200',
          open ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
        )}
      >
        {text}
      </span>
    </span>
  )
}
