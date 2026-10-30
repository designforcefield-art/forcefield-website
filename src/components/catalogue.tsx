import { ArrowUpRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FEATURE_CATEGORIES } from '../data/catalogue'
import type { Feature, PriceBand, Solution, Theme } from '../data/types'
import type { LineStatus } from '../lib/recommend'
import { ChoiceCard } from './ui/Choice'
import { Icon } from './ui/Icon'
import { Badge, cn } from './ui/primitives'
import { SolutionIllustration } from './SolutionIllustration'

/* ------------------------------------------------------------------ */

export function StatusBadge({ status }: { status: LineStatus }) {
  switch (status) {
    case 'included':
      return <Badge tone="success">Included</Badge>
    case 'addon':
      return <Badge tone="electric">Optional extra</Badge>
    case 'needs-dynamic':
      return <Badge tone="warning">Dynamic only</Badge>
    case 'unavailable':
      return <Badge tone="danger">Not available</Badge>
    case 'incompatible':
      return <Badge tone="danger">Not in this solution</Badge>
  }
}

/** One plain-language line about where a feature is available. */
export function availabilitySummary(f: Feature): { text: string; tone: 'success' | 'electric' | 'neutral' } {
  const { essential: e, dynamic: d } = f.availability
  if (e === 'included') return { text: 'Included in both packages', tone: 'success' }
  if (e === 'addon') return { text: d === 'included' ? 'Optional extra, or included in Dynamic' : 'Optional extra', tone: 'electric' }
  if (d === 'included') return { text: 'Dynamic package only', tone: 'neutral' }
  return { text: 'Optional extra in Dynamic', tone: 'neutral' }
}

export function AvailabilityRow({ feature }: { feature: Feature }) {
  const a = availabilitySummary(feature)
  return (
    <span className="flex flex-wrap gap-1.5">
      <Badge tone={a.tone}>{a.text}</Badge>
      {feature.additionalFee && <Badge>May cost extra</Badge>}
    </span>
  )
}

/* ------------------------------------------------------------------ */

export function SolutionCard({ solution, className }: { solution: Solution; className?: string }) {
  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-panel border border-line bg-surface p-7 transition-colors duration-300 hover:border-line-strong hover:bg-elevated/60',
        className,
      )}
    >
      <div className="-mx-2 -mt-2 overflow-hidden rounded-2xl">
        <SolutionIllustration id={solution.id} className="aspect-[16/10]" />
      </div>
      <h3 className="mt-6 text-item-title font-normal">
        <Link to={`/solutions/${solution.id}`} className="after:absolute after:inset-0 after:rounded-panel focus-visible:outline-none">
          {solution.name}
        </Link>
      </h3>
      <p className="mt-1.5 text-muted">{solution.tagline}</p>
      <ul className="mt-6 flex flex-col gap-2">
        {solution.packages.essential.capabilities.slice(0, 3).map((c) => (
          <li key={c} className="flex items-center gap-2 text-sm text-fg">
            <Check className="size-4 shrink-0 text-cyan" aria-hidden="true" /> {c}
          </li>
        ))}
      </ul>
      <span className="mt-auto flex items-center gap-1 pt-8 text-sm font-medium text-fg">
        See details <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      </span>
    </article>
  )
}

/* ------------------------------------------------------------------ */

export function FeatureCard({
  feature,
  selected,
  onToggle,
  reason,
}: {
  feature: Feature
  selected: boolean
  onToggle: () => void
  reason?: string
  /** @deprecated kept for call-site compatibility */
  showCompat?: boolean
}) {
  return (
    <ChoiceCard
      type="checkbox"
      name="features"
      checked={selected}
      onChange={onToggle}
      label={
        <span>{feature.name}</span>
      }
      description={
        <span className="flex flex-col gap-2.5">
          {reason ? (
            <span className="rounded-lg bg-electric/10 px-3 py-2 text-sm text-fg">
              <span className="font-medium text-glow">Why we suggest it: </span>
              {reason}
            </span>
          ) : (
            <span>{feature.description}</span>
          )}
          <AvailabilityRow feature={feature} />
        </span>
      }
    />
  )
}

/** Feature list grouped by category, used in the Finder and configurators. */
export function GroupedFeatures({
  features,
  selected,
  onToggle,
}: {
  features: Feature[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-10">
      {FEATURE_CATEGORIES.map((cat) => {
        const items = features.filter((f) => f.category === cat.id)
        if (!items.length) return null
        const n = items.filter((f) => selected.includes(f.id)).length
        return (
          <fieldset key={cat.id} className="flex flex-col gap-4">
            <legend className="mb-4 flex w-full items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-raised shadow-rim text-fg">
                <Icon name={cat.icon} className="size-4.5" />
              </span>
              <span className="font-semibold">{cat.name}</span>
              {n > 0 && <Badge tone="electric">{n} selected</Badge>}
            </legend>
            <div className="grid gap-3 md:grid-cols-2">
              {items.map((f) => (
                <FeatureCard key={f.id} feature={f} selected={selected.includes(f.id)} onToggle={() => onToggle(f.id)} />
              ))}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */

export function PriceBlock({ price, compact }: { price: PriceBand; compact?: boolean }) {
  const rows = [
    { label: 'One-time setup', value: price.setup },
    { label: 'Monthly fee', value: price.recurring },
  ]
  return (
    <dl className={cn('grid gap-3', compact ? 'grid-cols-2' : 'sm:grid-cols-2')}>
      {rows.map((r) => (
        <div key={r.label} className="rounded-xl border border-dashed border-line-strong bg-canvas/40 px-4 py-3">
          <dt className="text-xs text-subtle">{r.label}</dt>
          <dd className="mt-0.5 font-medium">{r.value ?? <span className="text-glow">Ask for a quote</span>}</dd>
        </div>
      ))}
    </dl>
  )
}

/* ------------------------------------------------------------------ */
/* Theme preview — a miniature wireframe drawn from the theme's swatches */

export function ThemePreview({ theme }: { theme: Theme }) {
  const [bg, surface, accent] = theme.swatches
  return (
    <figure className="flex flex-col gap-3">
      <div
        aria-hidden="true"
        className="aspect-[4/3] max-w-full overflow-hidden rounded-card border border-line p-3"
        style={{ background: bg }}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="h-2 w-10 rounded-full" style={{ background: accent }} />
          <span className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1.5 w-5 rounded-full opacity-40" style={{ background: accent }} />
            ))}
          </span>
        </div>
        {theme.layout === 'split' && (
          <div className="grid h-[70%] grid-cols-2 gap-2">
            <div className="flex flex-col justify-center gap-1.5">
              <span className="h-2.5 w-11/12 rounded-full opacity-90" style={{ background: accent }} />
              <span className="h-2.5 w-2/3 rounded-full opacity-60" style={{ background: accent }} />
              <span className="mt-2 h-3 w-1/3 rounded-md" style={{ background: accent }} />
            </div>
            <div className="rounded-lg" style={{ background: surface }} />
          </div>
        )}
        {theme.layout === 'stacked' && (
          <div className="flex h-[70%] flex-col gap-2">
            <div className="flex-1 rounded-lg" style={{ background: surface }} />
            <span className="mx-auto h-2.5 w-2/3 rounded-full opacity-80" style={{ background: accent }} />
            <span className="mx-auto h-2 w-1/3 rounded-full opacity-40" style={{ background: accent }} />
          </div>
        )}
        {theme.layout === 'grid' && (
          <div className="grid h-[70%] grid-cols-3 gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-md" style={{ background: i === 0 ? accent : surface, opacity: i === 0 ? 0.85 : 1 }} />
            ))}
          </div>
        )}
      </div>
      <figcaption>
        <p className="font-medium">{theme.name}</p>
        <p className="text-sm text-muted">{theme.mood}</p>
      </figcaption>
    </figure>
  )
}
