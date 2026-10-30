import { ArrowRight, Check, FileText, Lightbulb, Map } from 'lucide-react'
import type { ReactNode } from 'react'
import { PackageGlyph } from '../components/AbstractIcon'
import { ButtonLink, Container, Eyebrow, cn } from '../components/ui/primitives'

/** Every Discovery CTA opens the Get Started form with Discovery preselected. */
const START = '/get-started?service=discovery'

function StartCta({ className }: { className?: string }) {
  return (
    <ButtonLink to={START} size="lg" className={cn('w-full sm:w-fit', className)}>
      Start Your Discovery <ArrowRight className="size-4" aria-hidden="true" />
    </ButtonLink>
  )
}

/** `last`: no bottom spacing, because the footer adds its own gap above it. */
function Section({ id, children, last }: { id: string; children: ReactNode; last?: boolean }) {
  return (
    <section aria-labelledby={id} className={last ? undefined : 'pb-section'}>
      <Container className="flex flex-col gap-12 sm:gap-14">{children}</Container>
    </section>
  )
}

function SectionIntro({ label, id, title, children }: { label: string; id: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <Eyebrow>{label}</Eyebrow>
      <h2 id={id} className="text-h2 font-normal">{title}</h2>
      {children}
    </div>
  )
}

const EXPLORE = [
  {
    title: 'Business understanding',
    heading: 'Get to the heart of your business.',
    body: 'We explore your business goals, challenges, and day-to-day needs to understand what matters most.',
    points: ['Business goals and priorities', 'Current challenges and pain points', 'Opportunities for improvement'],
  },
  {
    title: 'Process review',
    heading: 'Find better ways to work.',
    body: 'We examine your existing workflows to identify inefficiencies, repetitive tasks, and opportunities to simplify operations.',
    points: ['Existing workflows and processes', 'Manual tasks and operational bottlenecks', 'Opportunities to save time and effort'],
  },
  {
    title: 'Solution planning',
    heading: 'Turn insights into action.',
    body: 'We bring everything together to recommend practical digital solutions that address your needs and support your business goals.',
    points: ['Suitable digital tools and solutions', 'Recommended improvements and priorities', 'A practical direction for implementation'],
  },
]

const OUTCOMES = [
  { icon: FileText, title: 'A clearer understanding', body: 'A summary of your business challenges, needs, and opportunities.' },
  { icon: Lightbulb, title: 'Practical recommendations', body: 'Digital solutions and improvements that address your priorities.' },
  { icon: Map, title: 'A roadmap forward', body: 'A recommended direction to help you decide what to implement first and what can come later.' },
]

const PROCESS = [
  {
    title: 'Tell us about your business',
    body: "Share your goals, challenges, and what you'd like to improve. We'll review your needs and agree on the workshop scope.",
  },
  {
    title: 'Explore your challenges',
    body: "Through guided discussions and workshops, we'll understand your operations, identify pain points, and uncover opportunities.",
  },
  {
    title: 'Develop the right approach',
    body: "We'll bring our findings together and recommend practical digital solutions based on your business needs.",
  },
  {
    title: 'Plan your next steps',
    body: 'Walk away with clear recommendations and a direction for moving forward. Whether you implement with Forcefield or another provider, the choice is yours.',
  },
]

const num = (i: number) => String(i + 1).padStart(2, '0')

export default function Discovery() {
  return (
    <>
      {/* Hero — Discovery Workshop */}
      <section className="relative -mt-header overflow-hidden pt-header" aria-labelledby="disc-title">
        <Container className="flex flex-col gap-12 pt-14 pb-section sm:pt-20">
          <div className="flex max-w-4xl flex-col gap-6">
            <Eyebrow>Discovery workshop</Eyebrow>
            <h1 id="disc-title" className="text-h1 font-normal">
              Understand your business. <span className="text-gradient">Discover what's possible.</span>
            </h1>
          </div>
          <div className="grid gap-8 border-t border-line pt-10 lg:grid-cols-2 lg:gap-16">
            <p className="max-w-[34ch] text-statement font-display text-fg">
              Every business faces different challenges. Through guided workshops, we help you uncover pain points, review how things work, and identify practical digital solutions that make a difference.
            </p>
            <div className="flex flex-col gap-6">
              <p className="text-body-lg text-muted">
                Gain clarity on what your business needs before deciding what to build or improve.
              </p>
              <StartCta />
            </div>
          </div>
        </Container>
      </section>

      {/* What We Explore */}
      <Section id="explore-title">
        <SectionIntro label="What we explore" id="explore-title" title="Understand the challenges. Uncover the opportunities.">
          <p className="text-lead text-muted">
            We look beyond the surface to understand how your business operates, what's holding it back, and where digital solutions can make a meaningful difference.
          </p>
        </SectionIntro>
        {/* Subgrid on desktop so headings, text and lists line up across the three cards. */}
        <ol className="grid gap-3 lg:grid-cols-3 lg:gap-y-0">
          {EXPLORE.map((e, i) => (
            <li
              key={e.title}
              className="flex flex-col rounded-panel border border-line bg-surface p-6 sm:p-8 lg:row-span-4 lg:grid lg:grid-rows-subgrid lg:gap-y-0"
            >
              <p className="text-sm font-medium text-cyan">
                {num(i)} — {e.title}
              </p>
              <h3 className="mt-4 text-card-title font-normal">{e.heading}</h3>
              <p className="mt-2 text-card-body text-muted">{e.body}</p>
              <div className="mt-6 border-t border-line pt-5">
                <p className="text-xs font-medium text-subtle">What we'll explore:</p>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {e.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-sm text-fg">
                      <Check className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden="true" /> {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Your Discovery Outcome */}
      <Section id="outcome-title">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionIntro label="Your Discovery outcome" id="outcome-title" title="Clarity today. A better direction tomorrow." />
          <div className="flex flex-col gap-4 text-body-lg text-muted lg:pt-11">
            <p>Discovery is more than a conversation. It's about understanding your business and identifying practical next steps.</p>
            <p className="text-fg">Depending on the agreed workshop scope, you'll receive:</p>
          </div>
        </div>
        <ul className="grid gap-3 md:grid-cols-3">
          {OUTCOMES.map(({ icon: I, title, body }) => (
            <li key={title} className="flex h-full flex-col gap-4 rounded-panel border border-line bg-surface p-6 sm:p-8">
              <span className="grid size-11 place-items-center rounded-xl bg-elevated text-fg shadow-rim">
                <I className="size-5 [&>*:last-child]:stroke-cyan" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3 className="text-card-title font-normal">{title}</h3>
              <p className="text-card-body text-muted">{body}</p>
            </li>
          ))}
        </ul>
        <p className="border-l-2 border-electric pl-5 text-lead text-fg">
          The goal is simple: help you make informed decisions with confidence.
        </p>
      </Section>

      {/* How Discovery Works */}
      <Section id="process-title">
        <SectionIntro label="Our process" id="process-title" title="From questions to clear direction." />
        <ol className="relative grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((s, i) => (
            <li key={s.title} className="flex h-full flex-col gap-4 rounded-panel border border-line bg-surface p-6">
              <span
                aria-hidden="true"
                className="text-[2.25rem] leading-none font-normal tracking-[-0.03em] text-cyan tabular-nums [font-family:var(--font-display)]"
              >
                {num(i)}
              </span>
              <h3 className="text-card-title font-normal">
                <span className="sr-only">Step {i + 1}: </span>
                {s.title}
              </h3>
              <p className="text-small text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Discovery Investment */}
      <Section id="invest-title" last>
        <div className="grid gap-10 rounded-[2rem] border border-line bg-surface px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:px-16">
          <div className="flex flex-col gap-4">
            <Eyebrow>A service built around your business</Eyebrow>
            <h2 id="invest-title" className="text-h2 font-normal">A little clarity goes a long way.</h2>
            <p className="text-lead text-fg">Every business is different, and so is every Discovery engagement.</p>
          </div>
          <div className="flex flex-col gap-4 text-body-lg text-muted lg:pt-11">
            <p>Discovery is a paid professional service, with pricing based on the scope and complexity of your business requirements.</p>
            <p>We'll discuss your needs and provide a quotation before any work begins.</p>
            <p className="flex items-start gap-3 rounded-xl border border-line bg-canvas/40 p-4 text-small">
              <PackageGlyph tier="discovery" size="sm" className="size-8" />
              <span>Discovery is separate from our Essential and Dynamic website packages. This service will be quoted separately.</span>
            </p>
            <StartCta className="mt-2" />
          </div>
        </div>
      </Section>

    </>
  )
}
