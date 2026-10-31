import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { ServiceJourney } from '../components/ServiceJourney'
import { ButtonLink, Container, Eyebrow, NumberTile, cn } from '../components/ui/primitives'


/** Section wrapper: one consistent vertical rhythm. */
function Section({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={cn('py-section', className)}>
      <Container className="flex flex-col gap-12 sm:gap-14">{children}</Container>
    </section>
  )
}

const PRINCIPLES = [
  {
    title: 'Understand before we build',
    body: 'We take time to understand your business, challenges, and goals before recommending solutions.',
  },
  {
    title: 'Keep things practical',
    body: 'We use ready-made designs and proven solutions wherever possible, helping you launch faster without unnecessary complexity.',
  },
  {
    title: 'Make digital effortless',
    body: 'From setup to ongoing support, we simplify the technical side so you can focus on running your business.',
  },
  {
    title: 'Grow with you',
    body: "Your needs will evolve. We're here to support, improve, and expand your digital capabilities as your business grows.",
  },
]

export default function About() {
  return (
    <>
      {/* About Forcefield */}
      <section className="relative -mt-header overflow-hidden pt-header" aria-labelledby="about-title">
        <Container className="flex flex-col gap-12 pt-14 sm:pt-20">
          <div className="flex max-w-4xl flex-col gap-6">
            <Eyebrow>About Forcefield Design</Eyebrow>
            <h1 id="about-title" className="text-h1 font-normal">
              Making digital simple <span className="text-gradient">for every business.</span>
            </h1>
          </div>
          <div className="grid gap-6 border-t border-line pt-10 lg:grid-cols-2 lg:gap-16">
            <p className="max-w-[28ch] text-statement font-display text-fg">
              We believe getting online and growing your business shouldn't be complicated.
            </p>
            <div className="flex flex-col gap-4 text-body-lg text-muted">
              <p>
                With over a decade of experience in design and digital development, we help businesses find the right solutions, get everything set up, and make the most of technology without the unnecessary hassle.
              </p>
              <p>Whether you're starting out or ready to grow, we're here to make digital work for you.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Our Story */}
      <Section id="story-title">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-4 lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:self-start">
            <Eyebrow>Our story</Eyebrow>
            <h2 id="story-title" className="text-h2 font-normal">From design studio to digital partner.</h2>
          </div>
          {/* lg:pt-11 = label height + gap, so the story starts level with the heading. */}
          <div className="flex max-w-[62ch] flex-col gap-5 text-body-lg text-muted lg:pt-11">
            <p>Forcefield Design began as a creative design studio, building websites, applications, and brand experiences for businesses.</p>
            <p>
              Over the years, we realised something important: businesses don't always need complicated, custom-built solutions. They need practical tools that solve real problems, work reliably, and grow with them.
            </p>
            <p>That's why we've evolved beyond traditional design services.</p>
            <p>
              Today, we combine ready-made digital solutions, thoughtful design, and dedicated support to help businesses establish their online presence, simplify everyday operations, and create opportunities for growth.
            </p>
            <p className="mt-2 border-l-2 border-electric pl-5 text-lead text-fg">
              You focus on your business. We'll take care of the digital side.
            </p>
          </div>
        </div>
      </Section>

      {/* What We Do — interactive timeline */}
      <Section id="what-title" className="overflow-x-clip pt-0">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <Eyebrow>What we do</Eyebrow>
          <h2 id="what-title" className="text-h2 font-normal">The right solution, at every stage.</h2>
          <p className="text-lead text-muted">
            Every business is at a different stage. Explore how we can help you find the right direction, get online, and grow with confidence.
          </p>
        </div>
        <ServiceJourney />
      </Section>

      {/* How We Work */}
      <Section id="how-title" className="pt-0">
        <div className="flex max-w-3xl flex-col gap-4">
          <Eyebrow>How we work</Eyebrow>
          <h2 id="how-title" className="text-h2 font-normal">Four principles. One simple approach.</h2>
        </div>
        <ol className="grid gap-3 md:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <li key={p.title} className="flex flex-col gap-5 rounded-panel border border-line bg-surface p-6 sm:p-8">
              <NumberTile n={String(i + 1).padStart(2, '0')} />
              <div className="flex flex-col gap-2">
                <h3 className="text-card-title font-normal">
                  <span className="sr-only">Principle {i + 1}: </span>
                  {p.title}
                </h3>
                <p className="text-card-body text-muted">{p.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Our Commitment */}
      <section aria-labelledby="commit-title">
        <Container>
          <div className="grid gap-10 rounded-[2rem] border border-line bg-surface px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:px-16">
            <div className="flex flex-col gap-4">
              <Eyebrow>Our commitment</Eyebrow>
              <h2 id="commit-title" className="text-h2 font-normal">Your business comes first.</h2>
              <p className="text-lead text-fg">The right solutions for your business. Nothing more, nothing less.</p>
            </div>
            <div className="flex flex-col gap-4 text-body-lg text-muted lg:pt-11">
              <p>
                We believe going digital should be simple. That's why we take the time to understand your needs, recommend practical solutions, and make technology work for your business.
              </p>
              <p>Whether you're just getting started or ready to grow, we're here to make every step easier.</p>
              <ButtonLink to="/get-started" size="lg" className="mt-4 w-full sm:w-fit">
                Get Started <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
