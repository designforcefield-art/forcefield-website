import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

export const cn = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ')

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

type Variant = 'primary' | 'secondary' | 'ghost' | 'subtle'
type Size = 'sm' | 'md' | 'lg'

const base =
  'ff-btn group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-300 ease-out-expo disabled:opacity-45 disabled:pointer-events-none select-none'

const variants: Record<Variant, string> = {
  primary: 'bg-electric text-white shadow-btn-accent hover:bg-electric-hover hover:-translate-y-0.5 active:translate-y-px active:shadow-pressed',
  secondary: 'bg-raised text-fg shadow-btn hover:bg-raised-hover hover:-translate-y-0.5 active:translate-y-px active:shadow-pressed',
  ghost: 'text-muted hover:text-fg hover:bg-raised',
  subtle: 'bg-raised text-fg shadow-btn hover:bg-raised-hover active:translate-y-px active:shadow-pressed',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm rounded-full',
  md: 'h-11 px-5 text-[0.95rem] rounded-full',
  lg: 'h-12 px-6 text-base rounded-full',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props },
  ref,
) {
  return <button ref={ref} type={type} className={cn(base, variants[variant], sizes[size], className)} {...props} />
})

export function ButtonLink({ variant = 'primary', size = 'md', className, ...props }: LinkProps & { variant?: Variant; size?: Size }) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />
}

/* ------------------------------------------------------------------ */
/* Badge                                                               */
/* ------------------------------------------------------------------ */

type Tone = 'neutral' | 'electric' | 'cyan' | 'success' | 'warning' | 'danger'
const tones: Record<Tone, string> = {
  neutral: 'bg-raised text-muted border-transparent',
  electric: 'bg-electric/15 text-glow border-transparent',
  cyan: 'bg-electric/15 text-glow border-transparent',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
}

export function Badge({ tone = 'neutral', className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5 whitespace-nowrap', tones[tone], className)}>
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export function Card({
  className,
  interactive,
  highlight,
  ...props
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean; highlight?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-card border border-line bg-surface',
        interactive && 'transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-line-strong hover:shadow-float',
        highlight && 'ring-gradient border-transparent shadow-glow-soft',
        className,
      )}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Layout helpers                                                      */
/* ------------------------------------------------------------------ */

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('gutter mx-auto w-full max-w-[75rem]', className)} {...props} />
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('flex w-fit items-center gap-2 rounded-full bg-raised px-3 py-1 text-sm font-medium text-muted shadow-rim', className)}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-electric" />
      {children}
    </p>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  className,
  as: As = 'h2',
}: {
  eyebrow?: string
  title: ReactNode
  lead?: ReactNode
  align?: 'left' | 'center'
  className?: string
  as?: 'h1' | 'h2'
}) {
  return (
    <div className={cn('flex max-w-3xl flex-col gap-4', align === 'center' && 'mx-auto items-center text-center', className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <As className={cn('font-normal', As === 'h1' ? 'text-h1' : 'text-h2')}>{title}</As>
      {lead && <p className="max-w-[62ch] text-lead text-muted">{lead}</p>}
    </div>
  )
}

/** Step / principle number on a small card tile (replaces large display numbers). */
export function NumberTile({ n, className }: { n: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-11 shrink-0 place-items-center rounded-xl bg-elevated text-base font-medium text-glow tabular-nums shadow-rim',
        className,
      )}
    >
      {n}
    </span>
  )
}
