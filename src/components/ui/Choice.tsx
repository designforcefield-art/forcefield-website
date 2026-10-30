import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from './primitives'

/**
 * Selectable card backed by a real radio/checkbox input, so keyboard,
 * screen-reader state ("checked", "1 of 8") and form semantics come for free.
 */
export function ChoiceCard({
  type,
  name,
  checked,
  disabled,
  onChange,
  icon,
  label,
  description,
  className,
  compact,
}: {
  type: 'radio' | 'checkbox'
  name: string
  checked: boolean
  disabled?: boolean
  onChange: () => void
  icon?: ReactNode
  label: ReactNode
  description?: ReactNode
  className?: string
  compact?: boolean
}) {
  return (
    <label
      className={cn(
        'group relative flex cursor-pointer gap-3 rounded-card border bg-surface transition-all duration-300 ease-out-expo',
        compact ? 'items-center p-4' : 'items-start p-5',
        checked
          ? 'border-electric-bright bg-electric/10 shadow-glow'
          : 'border-line hover:-translate-y-0.5 hover:border-line-strong hover:bg-elevated',
        disabled && !checked && 'cursor-not-allowed opacity-45 hover:translate-y-0 hover:border-line hover:bg-surface',
        'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cyan',
        className,
      )}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="peer sr-only"
      />
      {icon && (
        <span
          className={cn(
            'grid size-11 shrink-0 place-items-center rounded-xl border transition-colors',
            checked ? 'border-electric-bright/50 bg-electric/25 text-glow' : 'border-line bg-elevated text-muted group-hover:text-fg',
          )}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-medium leading-snug text-fg">{label}</span>
        {description && <span className="mt-1 block text-sm text-muted">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'grid size-6 shrink-0 place-items-center border transition-all duration-200',
          type === 'radio' ? 'rounded-full' : 'rounded-md',
          checked ? 'scale-100 border-electric-bright bg-electric-bright text-white' : 'scale-90 border-line-strong text-transparent',
        )}
      >
        <Check className="size-4" strokeWidth={3} />
      </span>
    </label>
  )
}
