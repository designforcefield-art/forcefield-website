import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { Container, SectionHeading, cn } from '../components/ui/primitives'
import { INDUSTRIES } from '../data/catalogue'
import { INDUSTRY_DEMOS, INDUSTRY_SOLUTIONS, demoUrl, digitalSolutionById, type IndustryDemos } from '../data/solutionsCatalogue'
import type { Industry } from '../data/types'

type Tier = 'essential' | 'dynamic'

const PACKAGES: Record<Tier, { name: string; description: string; note: string }> = {
  essential: {
    name: 'Essential Solution',
    description:
      'A professional 3-page website, fully managed by our team. We handle the setup, updates, and maintenance so you can focus on your business.',
    note: 'Pages and features are preset. The layout is fixed; your logo, images and colours can be customised.',
  },
  dynamic: {
    name: 'Dynamic Solution',
    description:
      'A flexible website with unlimited pages, an easy-to-use admin panel, AI-powered SEO tools, and dedicated support as your business grows.',
    note: 'Starts with baseline features you can customise. The layout is fixed; your logo, images and colours can be customised.',
  },
}

/** Demo links per package: Essential has a website demo, Dynamic adds the admin panel. */
const DEMO_LINKS: Record<Tier, { key: keyof IndustryDemos; label: string }[]> = {
  essential: [{ key: 'essential', label: 'View Website Demo' }],
  dynamic: [
    { key: 'dynamic', label: 'View Website Demo' },
    { key: 'admin', label: 'View Admin Panel Demo' },
  ],
}

const pill = 'flex h-10 w-full items-center justify-between gap-3 rounded-full px-4 text-sm font-medium'

function DemoLinks({ demos, tier }: { demos: IndustryDemos | undefined; tier: Tier }) {
  const links = DEMO_LINKS[tier].filter((l) => demos?.[l.key])
  if (!links.length)
    return <p className={cn(pill, 'justify-center border border-dashed border-line-strong text-subtle')}>Demo Coming Soon</p>
  return (
    <ul className="flex flex-col gap-6 py-1 sm:flex-row">
      {links.map((l) => {
        const href = demoUrl(demos![l.key]!)
        return (
          <li key={l.key} className="sm:flex-1">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener"
                className={cn(
                  pill,
                  // Standard embossed dark button with soft grey halo rings (styles.css .demo-glow).
                  'group demo-glow bg-raised text-fg transition-[background-color,box-shadow] duration-300 outline-none hover:bg-raised-hover focus-visible:ring-2 focus-visible:ring-electric/60',
                )}
              >
                {l.label}
                <ArrowRight className="size-4 text-muted transition-[color,transform] group-hover:text-fg duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              // Prototype build without hosted demo files: shown as pending, never a dead link.
              <span
                aria-disabled="true"
                title="This demo opens once the demo files are hosted"
                className={cn(pill, 'border border-dashed border-line-strong text-subtle')}
              >
                {l.label.replace('View ', '')}
                <span className="text-xs">link pending</span>
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function IndustryCard({ ind, expanded, onToggle }: { ind: Industry; expanded: boolean; onToggle: () => void }) {
  const demos = INDUSTRY_DEMOS[ind.id]
  const solutions = INDUSTRY_SOLUTIONS[ind.id]
  const [tier, setTier] = useState<Tier>('essential')
  const regionId = `industry-${ind.id}-details`

  // Each time the card opens, start on Essential.
  useEffect(() => {
    if (expanded) setTier('essential')
  }, [expanded])

  return (
    <article
      className={cn(
        'flex w-full flex-col rounded-panel border bg-surface p-6 transition-colors duration-300 sm:p-7',
        expanded ? 'border-line-strong' : 'border-line',
      )}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-elevated text-fg shadow-rim">
          <Icon name={ind.icon} className="size-5" />
        </span>
        <h2 className="text-item-title font-normal">{ind.name}</h2>
      </div>
      <p className="mt-3 text-small text-muted">{ind.intro}</p>

      {/* Expandable details (grid-rows trick for a subtle height transition). */}
      <div
        id={regionId}
        role="region"
        aria-label={`${ind.name}: solutions and demos`}
        inert={!expanded}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none',
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        {/* Negative margin + padding: the clip edge sits at the card edge, so the demo button glow isn't cut off. */}
        <div className="-mx-6 overflow-hidden px-6 sm:-mx-7 sm:px-7">
          <div className="mt-6 flex flex-col gap-4 border-y border-line py-6">
            <p className="text-sm font-medium text-fg">Choose your solution</p>
            <div
              role="group"
              aria-label={`Solution for ${ind.name}`}
              className="grid grid-cols-2 gap-1 rounded-full bg-canvas p-1 shadow-pressed"
            >
              {(['essential', 'dynamic'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tier === t}
                  onClick={() => setTier(t)}
                  className={cn(
                    'h-9 rounded-full text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-electric/60',
                    tier === t ? 'bg-electric text-white shadow-btn-accent' : 'text-muted hover:text-fg',
                  )}
                >
                  {PACKAGES[t].name}
                </button>
              ))}
            </div>
            <div aria-live="polite">
              <p className="text-sm font-medium text-fg">{PACKAGES[tier].name}</p>
              <p className="mt-1 text-small text-muted">{PACKAGES[tier].description}</p>
              <p className="mt-2 text-xs leading-[1.5] text-subtle">{PACKAGES[tier].note}</p>
            </div>
            <DemoLinks demos={demos} tier={tier} />
          </div>
          <p className="mt-6 text-xs font-medium text-subtle">Recommended solutions</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {solutions.map((sid) => (
              <li key={sid}>
                <span className="inline-flex rounded-full border border-line bg-elevated/60 px-2.5 py-1 text-xs text-muted">
                  {digitalSolutionById(sid)?.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>


      <div className="mt-auto pt-6">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={regionId}
          onClick={onToggle}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-raised px-4 text-sm font-medium text-fg shadow-btn transition-colors outline-none hover:bg-raised-hover focus-visible:ring-2 focus-visible:ring-electric/60"
        >
          {expanded ? 'Show Less' : 'Explore Solutions'}
          {expanded ? <ChevronUp className="size-4" aria-hidden="true" /> : <ChevronDown className="size-4" aria-hidden="true" />}
        </button>
      </div>
    </article>
  )
}

export function Industries() {
  // Only one card is open at a time.
  const [open, setOpen] = useState<string | null>(null)

  return (
    <Container className="flex flex-col gap-12 pt-12 sm:pt-16">
      <SectionHeading
        as="h1"
        title="Find the right solutions for your business."
        lead="Discover the features that work best for businesses like yours, and explore ready-made website designs built around your industry's needs."
      />
      {/* Cards in a row share a height. The open card grows in place; its row neighbour
          keeps its own height (md:self-start) rather than stretching. Reading order is unchanged. */}
      <ul className="grid gap-4 md:grid-cols-2">
        {INDUSTRIES.map((ind, i) => {
          const openIndex = INDUSTRIES.findIndex((x) => x.id === open)
          const isNeighbour = openIndex >= 0 && i !== openIndex && Math.floor(i / 2) === Math.floor(openIndex / 2)
          return (
            <li key={ind.id} className={cn('flex', isNeighbour && 'md:self-start')}>
              <IndustryCard
                ind={ind}
                expanded={open === ind.id}
                onToggle={() => setOpen((cur) => (cur === ind.id ? null : ind.id))}
              />
            </li>
          )
        })}
      </ul>
      <p className="text-sm text-muted">
        Don't see your industry?{' '}
        <Link to="/solutions" className="font-medium text-cyan hover:underline">
          Browse all solutions
        </Link>
        . They work for every business.
      </p>
    </Container>
  )
}
