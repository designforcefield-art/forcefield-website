import { ArrowRight, Check, FileText, Lightbulb, Map } from 'lucide-react'
import type { ReactNode } from 'react'
import { PackageGlyph } from '../components/AbstractIcon'
import { ButtonLink, Container, Eyebrow, NumberTile, cn } from '../components/ui/primitives'

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
    body: 'We learn your goals, challenges, and day-to-day needs.',
    points: ['Business goals and priorities', 'Current challenges and pain points', 'Opportunities for improvement'],
  },
  {
    title: 'Process review',
    heading: 'Find better ways to work.',
    body: 'We review how work gets done today, and where time and effort are lost.',
    points: ['Existing workflows and processes', 'Manual tasks and operational bottlenecks', 'Opportunities to save time and effort'],
  },
  {
    title: 'Solution planning',
    heading: 'Turn insights into action.',
    body: 'We turn what we learn into practical recommendations for your business.',
    points: ['Suitable digital tools and solutions', 'Recommended improvements and priorities', 'A practical direction for implementation'],
  },
]

const OUTCOMES = [
  { icon: FileText, title: 'A clearer understanding', body: 'A summary of your challenges, needs, and opportunities.' },
  { icon: Lightbulb, title: 'Practical recommendations', body: 'Digital solutions and improvements matched to your priorities.' },
  { icon: Map, title: 'A direction for next steps', body: 'What to do first, and what can come later.' },
]

const PROCESS = [
  {
    title: 'Tell us about your business',
    body: "Share your goals and challenges. We'll agree the workshop scope and send you a quotation.",
  },
  {
    title: 'Explore your challenges',
    body: 'Guided discussions and workshops on how your business runs today.',
  },
  {
    title: 'Develop the right approach',
    body: 'We bring our findings together into practical recommendations.',
  },
  {
    title: 'Plan your next steps',
    body: 'Choose Essential, Dynamic, another provider, or no further action. The choice is yours.',
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
              Not sure where to start? <span className="text-gradient">Let's find your direction.</span>
            </h1>
          </div>
          <div className="grid gap-8 border-t border-line pt-10 lg:grid-cols-2 lg:gap-16">
            <p className="max-w-[34ch] text-statement font-display text-fg">
              Through guided workshops, we help you understand your business challenges, explore opportunities, and identify practical digital solutions.
            </p>
            <div className="flex flex-col gap-6">
              <p className="text-body-lg text-muted">
                Discovery is optional. If you already know what you need, you can choose Essential or Dynamic directly.
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
            We look at how your business runs, what's holding it back, and where digital tools can help.
          </p>
        </SectionIntro>
        {/* Subgrid on desktop so headings, text and lists line up across the three cards. */}
        <ol className="grid gap-3 lg:grid-cols-3 lg:gap-y-0">
          {EXPLORE.map((e, i) => (
            <li
              key={e.title}
              className="flex flex-col rounded-panel border border-line bg-surface p-6 sm:p-8 lg:row-span-4 lg:grid lg:grid-rows-subgrid lg:gap-y-0"
            >
              <p className="flex gap-2.5 text-sm font-medium text-cyan">
                <span className="tabular-nums opacity-70">{num(i)}</span>
                <span>{e.title}</span>
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
        <SectionIntro label="Your Discovery outcome" id="outcome-title" title="Clarity today. A better direction tomorrow.">
          <p className="text-lead text-muted">
            You'll leave with practical next steps, not just a conversation. Depending on the agreed workshop scope, you'll receive:
          </p>
        </SectionIntro>
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
          The goal is simple: to help you decide with confidence.
        </p>
      </Section>

      {/* How Discovery Works */}
      <Section id="process-title">
        <SectionIntro label="Our process" id="process-title" title="From questions to clear direction." />
        <ol className="relative grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((s, i) => (
            <li key={s.title} className="flex h-full flex-col gap-4 rounded-panel border border-line bg-surface p-6">
              <NumberTile n={num(i)} />
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
            <p>Discovery is a paid professional service. Pricing depends on the agreed scope, and we'll send you a quotation before any work begins.</p>
            <p className="flex items-start gap-3 rounded-xl border border-line bg-canvas/40 p-4 text-small">
              <PackageGlyph tier="discovery" size="sm" className="size-8" />
              <span>Discovery is separate from Essential and Dynamic. You don't need it to sign up for either.</span>
            </p>
            <StartCta className="mt-2" />
          </div>
        </div>
      </Section>

    </>
  )
}
