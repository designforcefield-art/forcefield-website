import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
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
  className?: string
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode
}

/** Wires label, hint and error to the control for screen readers. */
export function Field({ id: idProp, label, hint, error, optional, className, children }: FieldProps) {
  const auto = useId()
  const id = idProp ?? auto
  const hintId = hint ? `${id}-hint` : undefined
  const errId = error ? `${id}-err` : undefined
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-fg">
        {label}
        {optional && <span className="text-xs font-normal text-subtle">Optional</span>}
      </label>
      {children({ id, describedBy, invalid: !!error })}
      {hint && !error && <p id={hintId} className="text-xs text-subtle">{hint}</p>}
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
