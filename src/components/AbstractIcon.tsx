import type { ReactNode } from 'react'
import type { PackageTier, SolutionId } from '../data/types'
import { cn } from './ui/primitives'

/**
 * Monoline abstract icon set: thin, even strokes forming simple geometric
 * figures (arches, rings, nested squares, chevrons, circles), one colour,
 * shown on a plain square tile. Stroke width stays constant at any size
 * (vector-effect: non-scaling-stroke). Each figure loosely suggests its subject.
 */

/** The one highlighted element in each icon (purple; the lighter tint stays visible on charcoal). */
const H = 'var(--color-cyan)'

export const SOLUTION_LINES: Record<SolutionId, ReactNode> = {
  // Nested arches: a solid foundation, a front door for your business
  'business-website': (
    <>
      <path d="M9 40V24a15 15 0 0 1 30 0v16" />
      <path d="M14.5 40V24a9.5 9.5 0 0 1 19 0v16" />
      <path d="M20 40V24a4 4 0 0 1 8 0v16" stroke={H} />
    </>
  ),
  // A ring of people drawn towards the centre: enquiries coming in
  'lead-generation': (
    <>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2
        return <circle key={i} cx={24 + Math.cos(a) * 14} cy={24 + Math.sin(a) * 14} r="3.2" />
      })}
      <circle cx="24" cy="24" r="2" stroke={H} />
    </>
  ),
  // Square, diamond, square: a product in its box
  ecommerce: (
    <>
      <rect x="10" y="10" width="28" height="28" />
      <path d="M24 10 38 24 24 38 10 24Z" />
      <rect x="17" y="17" width="14" height="14" stroke={H} />
    </>
  ),
  // A circle with an inner orbit: time, slots, the calendar turning
  booking: (
    <>
      <circle cx="24" cy="24" r="15" />
      <circle cx="28" cy="20" r="9" stroke={H} />
      <circle cx="24" cy="24" r="2" />
    </>
  ),
  // Three overlapping chevrons: work moving forward on its own
  automation: (
    <>
      <path d="M9 13 21 24 9 35Z" />
      <path d="M18 13 30 24 18 35Z" />
      <path d="M27 13 39 24 27 35Z" stroke={H} />
    </>
  ),
  // Three overlapping circles: you, your customers, the relationship
  'customer-management': (
    <>
      <circle cx="17.5" cy="28.5" r="9.5" />
      <circle cx="30.5" cy="28.5" r="9.5" />
      <circle cx="24" cy="17.5" r="9.5" stroke={H} />
    </>
  ),
}

export type OfferingTier = PackageTier | 'discovery'

const PACKAGE_LINES: Record<OfferingTier, ReactNode> = {
  // A compass: finding direction (needle highlighted)
  discovery: (
    <>
      <circle cx="24" cy="24" r="15" />
      <path d="M24 13 28 24 24 35 20 24Z" stroke={H} />
    </>
  ),
  // One clean form
  essential: (
    <>
      <path d="M24 9 39 24 24 39 9 24Z" />
      <circle cx="24" cy="24" r="2.5" stroke={H} />
    </>
  ),
  // Layers stacked: more on top of the essentials
  dynamic: (
    <>
      <path d="M24 15 37 28 24 41 11 28Z" />
      <path d="M24 7 37 20 24 33 11 20Z" stroke={H} />
    </>
  ),
}

export function LineIcon({ children, className, strokeWidth = 1.5 }: { children: ReactNode; className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('block', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <g style={{ vectorEffect: 'non-scaling-stroke' }} className="[&_*]:[vector-effect:non-scaling-stroke]">
        {children}
      </g>
    </svg>
  )
}

type Size = 'sm' | 'md' | 'lg'
/* Square tile like the reference: plain surface, icon centred with breathing room */
const tile: Record<Size, { box: string; icon: string }> = {
  sm: { box: 'size-10 rounded-xl', icon: 'size-[1.65rem]' },
  md: { box: 'size-14 rounded-2xl', icon: 'size-[2.2rem]' },
  lg: { box: 'size-20 rounded-[1.25rem]', icon: 'size-[3.3rem]' },
}

function Tile({ children, size = 'md', className }: { children: ReactNode; size?: Size; className?: string }) {
  const t = tile[size]
  return (
    <span className={cn('grid shrink-0 place-items-center bg-elevated text-fg', t.box, className)}>
      <LineIcon className={t.icon}>{children}</LineIcon>
    </span>
  )
}

export function SolutionGlyph({ id, size, className }: { id: SolutionId; size?: Size; className?: string }) {
  return <Tile size={size} className={className}>{SOLUTION_LINES[id]}</Tile>
}

export function PackageGlyph({ tier, size, className }: { tier: OfferingTier; size?: Size; className?: string }) {
  return <Tile size={size} className={className}>{PACKAGE_LINES[tier]}</Tile>
}

/** Raw shapes, for larger compositions (solution cards and page banners). */
export function SolutionLines({ id, className, strokeWidth }: { id: SolutionId; className?: string; strokeWidth?: number }) {
  return <LineIcon className={className} strokeWidth={strokeWidth}>{SOLUTION_LINES[id]}</LineIcon>
}
