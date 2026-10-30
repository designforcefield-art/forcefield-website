import type { SolutionId } from '../data/types'
import { SolutionGlyph, SolutionLines } from './AbstractIcon'
import { cn } from './ui/primitives'

/**
 * Solution artwork: the monoline icon for the solution, centred on a plain
 * tile. Same component names as before so call sites don't change.
 */
export function SolutionIllustration({ id, className, iconClassName }: { id: SolutionId; className?: string; iconClassName?: string }) {
  return (
    <div aria-hidden="true" className={cn('grid w-full place-items-center bg-elevated text-fg', className)}>
      <SolutionLines id={id} className={cn('size-[6.6rem] transition-transform duration-500 ease-out-expo group-hover:scale-105', iconClassName)} strokeWidth={1.25} />
    </div>
  )
}

/** Small square tile for lists, the drawer and the quote summary. */
export function SolutionThumb({ id, className }: { id: SolutionId; className?: string }) {
  return <SolutionGlyph id={id} size="sm" className={className} />
}
