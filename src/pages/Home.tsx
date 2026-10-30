import { ArrowRight, Check, Rocket } from 'lucide-react'
import { ToolCard } from '../components/ToolCard'
import { getFeaturedSolutions } from '../data/solutionsCatalogue'
import { HeroVisual } from '../components/site/HeroVisual'
import { Badge, ButtonLink, Container, SectionHeading, cn } from '../components/ui/primitives'
import { OFFERINGS } from '../data/catalogue'
import { PackageGlyph } from '../components/AbstractIcon'

export default function Home() {
  return (
    <>
      <Hero />
      <ThreeSteps />
      <Packages />
      <FeaturedTools />
      <LaunchCta />
    </>
  )
}

function Hero() {
  return (
    <section className="relative -mt-header overflow-hidden pt-header">
      <Container className="relative flex flex-col items-center gap-14 pt-16 pb-20 text-center sm:pt-24 lg:pb-28">
        <div className="flex flex-col items-center gap-7">
          <h1 className="max-w-5xl text-h1 font-normal">
            Digital solutions <span className="text-gradient">for every stage of business.</span>
          </h1>
          <div className="flex max-w-[40rem] flex-col gap-3">
            <p className="text-lead text-fg">From getting started to scaling up, we make going digital effortless.</p>
            <p className="text-muted">
              Professional websites, smart tools, and dedicated support, all tailored to your business needs, so you can focus on what matters most.
            </p>
          </div>
          <div className="flex flex-col gap-3 xs:flex-row">
            <ButtonLink to="/solutions" size="lg">Explore Our Solutions</ButtonLink>
          </div>
        </div>
        <HeroVisual />
      </Container>
    </section>
  )
}

const STEPS_SIMPLE: { title: string; body: string }[] = [
  {
    title: 'Tell us about your business',
    body: "Choose a solution and share your business needs. Not sure where to start? We'll guide you.",
  },
  {
    title: 'We build & set up',
    body: 'From design to technical setup, our team takes care of everything and gets your website ready to launch.',
  },
  {
    title: 'Launch & grow',
    body: 'Your website goes live! Manage it yourself or leave it to us, with dedicated support as your business grows.',
  },
]

function ThreeSteps() {
  return (
    <section className="py-section" aria-labelledby="steps-title">
      <Container className="flex flex-col gap-10 sm:gap-12">
        <SectionHeading
          align="center"
          title={
            <span id="steps-title">
              <span className="whitespace-nowrap">Three simple steps.</span>
              <br />
              <span className="text-gradient">Zero hassle.</span>
            </span>
          }
          lead="Tell us about your business. We'll handle the rest."
        />
        <ol className="grid gap-3 md:grid-cols-3">
          {STEPS_SIMPLE.map((st, i) => (
            <li key={st.title} className="flex h-full flex-col gap-4 rounded-panel border border-line bg-surface p-6 sm:p-8">
              <span
                aria-hidden="true"
                className="text-[2.5rem] leading-none font-normal tracking-[-0.03em] text-cyan tabular-nums [font-family:var(--font-display)] sm:text-[2.75rem]"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="text-card-title font-normal text-fg">
                  <span className="sr-only">Step {i + 1}: </span>
                  {st.title}
                </h3>
                <p className="text-card-body text-muted">{st.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}

/**
 * Featured digital solutions. The six cards come from `featured` in
 * src/data/solutionsCatalogue.ts; change them there, not here.
 */
function FeaturedTools() {
  return (
    <section className="py-section" aria-labelledby="tools-title">
      <Container className="flex flex-col gap-10 sm:gap-12">
        <SectionHeading
          align="center"
          title={<span id="tools-title">Digital tools that work for your business.</span>}
          lead="From customer enquiries and online bookings to payments and marketing, explore practical features that make running your business easier."
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {getFeaturedSolutions().map((t) => (
            <li key={t.id}>
              <ToolCard tool={t} />
            </li>
          ))}
        </ul>
        <ButtonLink to="/solutions" size="lg" variant="secondary" className="self-center">
          Explore All Solutions <ArrowRight className="size-4" aria-hidden="true" />
        </ButtonLink>
      </Container>
    </section>
  )
}

function Packages() {
  return (
    <section className="py-section" aria-labelledby="packages-title">
      <Container className="flex flex-col gap-10 sm:gap-12">
        <SectionHeading
          align="center"
          title={<span id="packages-title">The right solution for every business.</span>}
          lead="Whether you're looking to solve business challenges, establish your online presence, or scale your digital capabilities, we've got you covered."
        />
        <ul className="mx-auto grid w-full max-w-xl gap-3 lg:max-w-none lg:grid-cols-3 lg:gap-y-0">
          {OFFERINGS.map((o) => (
            <li
              key={o.id}
              className={cn(
                // On desktop each card is a subgrid row-set, so headlines, descriptions,
                // dividers and buttons line up across all three cards.
                'flex h-full flex-col rounded-panel border bg-surface p-6 sm:p-8 lg:row-span-5 lg:grid lg:grid-rows-subgrid lg:gap-y-0',
                o.recommended ? 'border-electric/70' : 'border-line',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <PackageGlyph tier={o.id} size="sm" />
                  <p className="text-sm font-medium text-fg">{o.name}</p>
                </div>
                {o.recommended && <Badge tone="electric">Recommended</Badge>}
              </div>
              <h3 className="mt-6 text-card-title font-normal">{o.headline}</h3>
              <p className="mt-2 text-card-body text-muted">{o.description}</p>
              <ul className="mt-6 flex flex-col gap-3 self-start border-t border-line pt-6 lg:w-full">
                {o.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden="true" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8 lg:self-end">
                <ButtonLink
                  to={o.cta.to}
                  variant={o.recommended ? 'primary' : 'secondary'}
                  className="w-full"
                >
                  {o.cta.label}
                </ButtonLink>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

/** Closing call to action: sign up. */
function LaunchCta() {
  return (
    <section className="pt-section" aria-labelledby="launch-title">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
            <span className="grid size-12 place-items-center rounded-full bg-raised shadow-rim"><Rocket className="size-6" aria-hidden="true" /></span>
            <h2 id="launch-title" className="text-h2 font-normal">Ready to launch your website?</h2>
            <p className="text-lead text-muted">
              Tell us about your business, and we'll take care of the setup so you can focus on what matters.
            </p>
            <ButtonLink to="/get-started" className="mt-2">
              Get Started <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  )
}
