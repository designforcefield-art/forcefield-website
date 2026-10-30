import { RotateCcw, Search, SearchX, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ToolCard } from '../components/ToolCard'
import { Input } from '../components/ui/Field'
import { SolutionArtTile } from '../components/SolutionArt'
import { Button, Container, SectionHeading, cn } from '../components/ui/primitives'
import { INDUSTRY_OPTIONS } from '../data/catalogue'
import type { IndustryId } from '../data/types'
import { Icon } from '../components/ui/Icon'
import {
  BUSINESS_GOALS,
  DIGITAL_SOLUTIONS,
  TOOL_CATEGORIES,
  businessGoalById,
  filterSolutions,
  type BusinessGoalId,
  type ToolCategoryId,
} from '../data/solutionsCatalogue'

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function Solutions() {
  const [query, setQuery] = useState('')
  const [params] = useSearchParams()
  const [category, setCategory] = useState<ToolCategoryId | 'all'>(() => {
    const c = params.get('category')
    return TOOL_CATEGORIES.some((x) => x.id === c) ? (c as ToolCategoryId) : 'all'
  })
  const [goal, setGoal] = useState<BusinessGoalId | null>(null)
  const [industry, setIndustry] = useState<IndustryId | null>(() => {
    const q = params.get('industry')
    return INDUSTRY_OPTIONS.some((o) => o.id === q) ? (q as IndustryId) : null
  })
  const catalogueRef = useRef<HTMLElement>(null)
  const goalsRef = useRef<HTMLElement>(null)

  const results = useMemo(
    () => filterSolutions({ query: query.trim(), category, goal, industry }),
    [query, category, goal, industry],
  )
  const filtered = query.trim() !== '' || category !== 'all' || goal !== null || industry !== null
  const activeGoal = goal ? businessGoalById(goal) : undefined
  const activeIndustry = industry ? INDUSTRY_OPTIONS.find((o) => o.id === industry) : undefined

  const scrollTo = (el: HTMLElement | null) =>
    el?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
  const scrollToCatalogue = () => scrollTo(catalogueRef.current)

  const chooseIndustry = (id: IndustryId) => {
    const next = industry === id ? null : id
    setIndustry(next)
    if (next) requestAnimationFrame(() => scrollTo(goalsRef.current))
  }

  const chooseGoal = (id: BusinessGoalId) => {
    const next = goal === id ? null : id
    setGoal(next)
    if (next) requestAnimationFrame(scrollToCatalogue)
  }

  const reset = () => {
    setQuery('')
    setCategory('all')
    setGoal(null)
    setIndustry(null)
  }

  return (
    <>
      {/* ---------- Step 1: Industry ---------- */}
      <section className="pt-12 sm:pt-16" aria-labelledby="industry-title">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            as="h1"
            eyebrow="Step 1 of 3"
            title={<span id="industry-title">What type of business do you run?</span>}
            lead="Choose your industry and we'll show the solutions that suit it."
          />
          <ul className="grid gap-3 xs:grid-cols-2 lg:grid-cols-4" role="list">
            {INDUSTRY_OPTIONS.map((o) => {
              const on = industry === o.id
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => chooseIndustry(o.id)}
                    className={cn(
                      'flex h-full w-full items-center gap-4 rounded-card border p-4 text-left transition-[border-color,background-color] duration-300 outline-none',
                      'focus-visible:ring-2 focus-visible:ring-electric/60',
                      on ? 'border-electric bg-electric/15' : 'border-line bg-surface hover:border-line-strong hover:bg-elevated/60',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn('grid size-11 shrink-0 place-items-center rounded-xl bg-elevated', on ? 'text-glow ring-1 ring-electric/70' : 'text-fg')}
                    >
                      <Icon name={o.icon ?? 'Sparkles'} strokeWidth={1.25} className="size-5" />
                    </span>
                    <span className="text-base font-medium text-fg">{o.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Container>
      </section>

      {/* ---------- Step 2: Goals ---------- */}
      <section
        ref={goalsRef}
        className="scroll-mt-[calc(var(--spacing-header)+1rem)] pt-section"
        aria-labelledby="goals-title"
      >
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Step 2 of 3"
            title={<span id="goals-title">What would you like to achieve?</span>}
            lead="Tell us what you're looking to improve, and explore solutions that can help."
          />
          <ul className="grid gap-3 xs:grid-cols-2 lg:grid-cols-4" role="list">
            {BUSINESS_GOALS.map((g) => {
              const on = goal === g.id
              return (
                <li key={g.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => chooseGoal(g.id)}
                    className={cn(
                      'flex h-full w-full flex-col gap-4 rounded-card border p-5 text-left transition-[border-color,background-color] duration-300 outline-none',
                      'focus-visible:ring-2 focus-visible:ring-electric/60',
                      on ? 'border-electric bg-electric/15' : 'border-line bg-surface hover:border-line-strong hover:bg-elevated/60',
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <SolutionArtTile id={g.illustration} className={cn('size-12 rounded-2xl', on && 'ring-1 ring-electric/70')} iconClassName="size-8" />
                      {on && <span aria-hidden="true" className="text-xs font-medium text-glow">Selected</span>}
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="text-base font-medium text-fg">{g.name}</span>
                      <span className="text-small text-muted">{g.description}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Container>
      </section>

      {/* ---------- Catalogue ---------- */}
      <section
        ref={catalogueRef}
        id="catalogue"
        aria-labelledby="catalogue-title"
        className="scroll-mt-[calc(var(--spacing-header)+1rem)] pt-section"
      >
        <Container className="flex flex-col gap-8">
          <SectionHeading
            eyebrow="Step 3 of 3"
            title={<span id="catalogue-title">Explore our digital solutions.</span>}
            lead="Add the ones you like to My Pick. We'll recommend Essential or Dynamic based on your picks."
          />

          <div className="sticky top-[calc(env(safe-area-inset-top,0px)+var(--spacing-header))] z-30 -mx-4 flex flex-col gap-3 border-b border-line bg-canvas px-4 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative md:flex-1">
                <label htmlFor="sol-search" className="sr-only">Search for a solution</label>
                <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
                <Input
                  id="sol-search"
                  type="search"
                  placeholder="Search for a solution..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-11 pl-10"
                />
              </div>
              {filtered && (
                <Button variant="ghost" onClick={reset} className="self-start md:self-auto">
                  <RotateCcw className="size-4" aria-hidden="true" /> Reset Filters
                </Button>
              )}
            </div>
            <div role="group" aria-label="Filter by category" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
              {[{ id: 'all' as const, name: 'All Solutions' }, ...TOOL_CATEGORIES].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={category === c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    'h-9 shrink-0 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-electric/60',
                    category === c.id
                      ? 'bg-electric text-white shadow-btn-accent'
                      : 'bg-raised text-muted shadow-btn hover:bg-raised-hover hover:text-fg',
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="-mt-2 flex flex-wrap items-center gap-2 text-sm">
            <p className="text-muted" aria-live="polite">
              {filtered
                ? `${results.length} of ${DIGITAL_SOLUTIONS.length} solutions`
                : `${DIGITAL_SOLUTIONS.length} solutions`}
            </p>
            {activeIndustry && (
              <span className="inline-flex items-center gap-1 rounded-full border border-electric/50 bg-electric/15 py-1 pr-1 pl-3 text-glow">
                Industry: {activeIndustry.label}
                <button
                  type="button"
                  onClick={() => setIndustry(null)}
                  aria-label={`Clear industry: ${activeIndustry.label}`}
                  className="grid size-6 place-items-center rounded-full hover:bg-electric/30 focus-visible:ring-2 focus-visible:ring-electric/60 focus-visible:outline-none"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </span>
            )}
            {activeGoal && (
              <span className="inline-flex items-center gap-1 rounded-full border border-electric/50 bg-electric/15 py-1 pr-1 pl-3 text-glow">
                Goal: {activeGoal.name}
                <button
                  type="button"
                  onClick={() => setGoal(null)}
                  aria-label={`Clear goal: ${activeGoal.name}`}
                  className="grid size-6 place-items-center rounded-full hover:bg-electric/30 focus-visible:ring-2 focus-visible:ring-electric/60 focus-visible:outline-none"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </span>
            )}
          </div>

          {results.length ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((t) => (
                <li key={t.id}>
                  <ToolCard tool={t} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-panel border border-dashed border-line-strong px-6 py-16 text-center">
              <SearchX className="size-8 text-subtle" aria-hidden="true" />
              <p className="max-w-md font-medium">No solutions found. Try another search or explore a different category.</p>
              <Button variant="secondary" onClick={reset}>
                <RotateCcw className="size-4" aria-hidden="true" /> Reset Filters
              </Button>
            </div>
          )}

        </Container>
      </section>
    </>
  )
}
