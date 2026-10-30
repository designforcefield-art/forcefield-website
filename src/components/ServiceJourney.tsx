import { ArrowRight, ChevronDown } from 'lucide-react'
import { useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { PackageGlyph, type OfferingTier } from './AbstractIcon'
import { cn } from './ui/primitives'

/**
 * "What We Do" interactive timeline (About page).
 * Three INDEPENDENT starting points, not a required sequence: any milestone can
 * be selected at any time. Desktop/tablet: horizontal tabs + one content panel.
 * Mobile: vertical accordion, one section open at a time.
 */

interface Stage {
  id: OfferingTier
  num: string
  name: string
  heading: string
  description: string
  bestFor: string
  cta: string
  /** Existing destinations: Discovery page; By Industry for the website packages. */
  to: string
}

const STAGES: Stage[] = [
  {
    id: 'discovery',
    num: '01',
    name: 'Discovery',
    heading: 'Find your direction.',
    description:
      'Not sure where to begin? Through guided workshops, we uncover your challenges, understand your processes, and recommend practical digital solutions.',
    bestFor: 'Businesses seeking clarity before investing in digital solutions.',
    cta: 'Explore Discovery',
    to: '/discovery',
  },
  {
    id: 'essential',
    num: '02',
    name: 'Essential',
    heading: 'Get online, hassle-free.',
    description:
      'Launch a professional 3-page website, set up and fully managed by our team. Focus on running your business while we take care of the technical details.',
    bestFor: 'Businesses that want a professional online presence without managing a website themselves.',
    cta: 'Explore Essential',
    to: '/industries',
  },
  {
    id: 'dynamic',
    num: '03',
    name: 'Dynamic',
    heading: 'More control. More possibilities.',
    description:
      'Take control of your website with an admin panel, AI SEO tools, and the flexibility to expand your digital capabilities as your business grows.',
    bestFor: 'Businesses that want greater control, flexibility, and room to grow.',
    cta: 'Explore Dynamic',
    to: '/industries',
  },
]

const DEFAULT: OfferingTier = 'essential'

function StageCta({ stage }: { stage: Stage }) {
  return (
    <Link
      to={stage.to}
      className="group inline-flex h-11 w-fit items-center gap-2 rounded-full bg-raised px-5 text-sm font-medium text-fg shadow-btn transition-colors outline-none hover:bg-raised-hover focus-visible:ring-2 focus-visible:ring-electric/60"
    >
      {stage.cta}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  )
}

/* ---------------- Desktop / tablet: horizontal timeline + panel ---------------- */

function Timeline() {
  const [active, setActive] = useState<OfferingTier>(DEFAULT)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const index = STAGES.findIndex((s) => s.id === active)
  const stage = STAGES[index]

  const onKey = (e: KeyboardEvent) => {
    const last = STAGES.length - 1
    const next =
      e.key === 'ArrowRight' ? Math.min(last, index + 1)
      : e.key === 'ArrowLeft' ? Math.max(0, index - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null
    if (next === null) return
    e.preventDefault()
    setActive(STAGES[next].id)
    tabs.current[next]?.focus()
  }

  return (
    <div className="hidden flex-col gap-6 md:flex">
      {/* Milestones */}
      <div className="relative">
        {/* Connecting line between the first and last indicator (indicator centres sit at 1/6 and 5/6). */}
        <div aria-hidden="true" className="absolute top-6 right-[16.667%] left-[16.667%] h-px bg-line-strong">
          {/* Active segment: a short purple highlight centred on the selected milestone (not a progress bar). */}
          <span
            className="absolute top-1/2 h-[2px] w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric shadow-[0_0_12px_rgba(59,43,238,0.6)] transition-[left] duration-300 ease-out"
            style={{ left: `${index * 50}%` }}
          />
        </div>
        <div role="tablist" aria-label="Our services" className="relative grid grid-cols-3" onKeyDown={onKey}>
          {STAGES.map((s, i) => {
            const on = s.id === active
            return (
              <button
                key={s.id}
                ref={(el) => {
                  tabs.current[i] = el
                }}
                id={`journey-tab-${s.id}`}
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls="journey-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(s.id)}
                className="group flex flex-col items-center gap-3 rounded-card px-2 pb-2 outline-none focus-visible:ring-2 focus-visible:ring-electric/60"
              >
                <span
                  className={cn(
                    'grid size-12 place-items-center rounded-full border text-sm font-medium tabular-nums transition-all duration-300',
                    on
                      ? 'border-electric bg-electric text-white shadow-[0_0_0_6px_rgba(59,43,238,0.18)]'
                      : 'border-line-strong bg-surface text-muted group-hover:border-cyan/70 group-hover:text-glow',
                  )}
                >
                  {s.num}
                </span>
                <span className="flex items-center gap-2">
                  <PackageGlyph tier={s.id} size="sm" className={cn('size-8 transition-opacity', on ? 'opacity-100' : 'opacity-60 group-hover:opacity-90')} />
                  <span className={cn('text-base font-medium transition-colors', on ? 'text-fg' : 'text-muted group-hover:text-glow')}>
                    {s.name}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content panel */}
      <div
        id="journey-panel"
        role="tabpanel"
        aria-labelledby={`journey-tab-${stage.id}`}
        className="rounded-panel border border-line bg-surface p-8 lg:p-10"
      >
        <div key={stage.id} className="grid min-h-[15rem] animate-fade-in gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
          <div className="flex flex-col gap-4">
            <p className="flex gap-2.5 text-sm font-medium text-cyan">
              <span className="tabular-nums opacity-70">{stage.num}</span>
              <span>{stage.name}</span>
            </p>
            <h3 className="text-statement font-normal">{stage.heading}</h3>
            <p className="max-w-[56ch] text-body-lg text-muted">{stage.description}</p>
          </div>
          <div className="flex flex-col gap-5 border-t border-line pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
            <PackageGlyph tier={stage.id} size="md" />
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-subtle">Best for</p>
              <p className="text-base leading-[1.55] text-fg">{stage.bestFor}</p>
            </div>
            <div className="mt-auto pt-2">
              <StageCta stage={stage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Mobile: vertical accordion ---------------- */

function Accordion() {
  const [open, setOpen] = useState<OfferingTier | null>(DEFAULT)
  return (
    <ol className="relative flex flex-col gap-3 md:hidden">
      {/* Vertical connecting line behind the indicators */}
      <span aria-hidden="true" className="absolute top-8 bottom-8 left-[2.25rem] w-px bg-line-strong" />
      {STAGES.map((s) => {
        const on = open === s.id
        const panelId = `journey-m-${s.id}`
        return (
          <li key={s.id} className={cn('relative rounded-panel border bg-surface transition-colors', on ? 'border-electric/60' : 'border-line')}>
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={panelId}
                onClick={() => setOpen(on ? null : s.id)}
                className="flex w-full items-center gap-4 rounded-panel p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-electric/60"
              >
                <span
                  className={cn(
                    'grid size-10 shrink-0 place-items-center rounded-full border text-sm font-medium tabular-nums transition-colors',
                    on ? 'border-electric bg-electric text-white' : 'border-line-strong bg-surface text-muted',
                  )}
                >
                  {s.num}
                </span>
                <PackageGlyph tier={s.id} size="sm" className="size-8" />
                <span className={cn('flex-1 text-base font-medium', on ? 'text-fg' : 'text-muted')}>{s.name}</span>
                <ChevronDown className={cn('size-5 text-subtle transition-transform duration-300', on && 'rotate-180')} aria-hidden="true" />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-label={s.name}
              inert={!on}
              className={cn(
                'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
                on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-4 px-4 pb-5 pl-[4.5rem]">
                  <p className="text-item-title font-normal text-fg">{s.heading}</p>
                  <p className="text-card-body text-muted">{s.description}</p>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium text-subtle">Best for</p>
                    <p className="text-small text-fg">{s.bestFor}</p>
                  </div>
                  <StageCta stage={s} />
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function ServiceJourney() {
  return (
    <>
      <Timeline />
      <Accordion />
    </>
  )
}
