import { ShieldCheck } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { cn } from './ui/primitives'

/**
 * SPAM CHECK — same approach as the Forcefield leads landing pages:
 *  1. a quick random sum the visitor answers (a new sum after a wrong answer)
 *  2. a hidden "honeypot" field people never see; bots tend to fill it in
 *  3. a minimum time on the form (very fast submissions are treated as bots)
 * The honeypot value and time-on-form are sent with the submission so the
 * server can reject bots too. The sum is a browser-side deterrent.
 */
const MIN_MS = 2500

const newSum = () => {
  const a = 2 + Math.floor(Math.random() * 8)
  const b = 1 + Math.floor(Math.random() * 9)
  return { a, b }
}

export function useSpamCheck() {
  const [sum, setSum] = useState(newSum)
  const [answer, setAnswer] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const startedAt = useRef(Date.now())

  const regenerate = useCallback(() => {
    setSum(newSum())
    setAnswer('')
  }, [])

  /** Error message for the sum, or null when it's right. */
  const error = (): string | null => {
    if (!answer.trim()) return 'Answer the quick sum so we know you’re not a robot.'
    if (Number(answer.trim()) !== sum.a + sum.b) return 'That’s not quite right. Please try the new sum.'
    return null
  }

  /** Bot signals: honeypot filled, or submitted unrealistically fast. */
  const tooFast = () => Date.now() - startedAt.current < MIN_MS
  const isBot = () => honeypot.trim() !== ''

  const reset = () => {
    regenerate()
    startedAt.current = Date.now()
  }

  return {
    sum,
    answer,
    setAnswer,
    honeypot,
    setHoneypot,
    error,
    regenerate,
    reset,
    tooFast,
    isBot,
    meta: () => ({ honeypot, elapsedMs: Date.now() - startedAt.current }),
  }
}

export type SpamCheckState = ReturnType<typeof useSpamCheck>

export function SpamCheck({ id, state, error }: { id: string; state: SpamCheckState; error?: string }) {
  const hintId = `${id}-hint`
  const errId = `${id}-err`
  return (
    <div className="flex flex-col gap-1.5 sm:max-w-80">
      {/* Honeypot: hidden from people and assistive tech; bots often fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-site`}>Leave this field empty</label>
        <input
          id={`${id}-site`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          name="company_site"
          value={state.honeypot}
          onChange={(e) => state.setHoneypot(e.target.value)}
        />
      </div>
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-fg">
        <ShieldCheck className="size-4 shrink-0 text-subtle" aria-hidden="true" />
        <span>
          Spam check: what is <span className="tabular-nums">{state.sum.a} + {state.sum.b}</span>?
        </span>
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={state.answer}
        onChange={(e) => state.setAnswer(e.target.value)}
        aria-required="true"
        aria-invalid={!!error}
        aria-describedby={error ? `${hintId} ${errId}` : hintId}
        className={cn(
          'h-12 w-full rounded-control border bg-canvas/60 px-4 text-fg placeholder:text-subtle transition-colors focus:border-cyan focus:ring-2 focus:ring-cyan/25 focus:outline-none',
          error ? 'border-danger ring-danger/20' : 'border-line',
        )}
      />
      <p id={hintId} className="text-xs text-subtle">Helps us keep spam out of our inbox.</p>
      {error && (
        <p id={errId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
