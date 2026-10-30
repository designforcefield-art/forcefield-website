import { ArrowLeft, Bookmark, Check, Compass } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ConfigEditor } from '../components/ConfigEditor'
import { PackageComparison } from '../components/PackageComparison'
import { PriceBlock, ThemePreview } from '../components/catalogue'
import { Badge, Button, ButtonLink, Container, Eyebrow, SectionHeading } from '../components/ui/primitives'
import { useToast } from '../components/ui/Toast'
import { CHALLENGE_OPTIONS, INDUSTRY_OPTIONS, PACKAGE_INFO, featureById, solutionById } from '../data/catalogue'
import type { PackageTier } from '../data/types'
import { usePicks } from '../state/PickContext'
import NotFound from './NotFound'
import { SolutionIllustration } from '../components/SolutionIllustration'

export default function SolutionDetail() {
  const { id = '' } = useParams()
  const solution = solutionById(id)
  const { add, openDrawer } = usePicks()
  const toast = useToast()
  const [pkg, setPkg] = useState<PackageTier>('essential')
  const [features, setFeatures] = useState<string[]>([])

  if (!solution) return <NotFound />

  const save = () => {
    const r = add({
      kind: 'solution',
      solutionId: solution.id,
      recommendedPackage: null,
      selectedPackage: pkg,
      selectedFeatures: features,
      recommendedFeatures: [],
      featureMethod: 'manual',
      source: 'catalogue',
      answers: null,
    })
    toast(
      r.status === 'duplicate'
        ? { title: 'Already in My Pick', body: 'This exact setup is already saved.', tone: 'info', action: { label: 'Review', onClick: openDrawer } }
        : { title: 'Saved to My Pick', body: `${solution.name} · ${PACKAGE_INFO[pkg].name}`, action: { label: 'Review My Picks', onClick: openDrawer } },
    )
  }

  const industries = solution.industries === 'all' ? ['Every industry'] : solution.industries.map((i) => INDUSTRY_OPTIONS.find((o) => o.id === i)!.label)

  return (
    <>
      {/* Product hero + configurator */}
      <section className="relative -mt-header overflow-hidden pt-header">
                <Container className="relative grid gap-10 pt-10 pb-16 lg:grid-cols-[1.25fr_1fr] lg:gap-14 lg:pt-14">
          <div className="flex min-w-0 flex-col gap-6">
            <Link to="/solutions" className="flex w-fit items-center gap-1.5 rounded text-sm text-muted hover:text-fg">
              <ArrowLeft className="size-4" aria-hidden="true" /> All solutions
            </Link>
            <div className="w-full max-w-xl overflow-hidden rounded-panel">
              <SolutionIllustration id={solution.id} className="aspect-[16/9]" iconClassName="size-[8.8rem]" />
            </div>
            <div className="flex flex-col gap-3">
              <h1 className="text-h1 font-normal">{solution.name}</h1>
              <p className="text-xl font-medium text-fg">{solution.tagline}</p>
              <p className="max-w-[58ch] text-lead text-muted">{solution.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {industries.map((i) => <Badge key={i}>{i}</Badge>)}
            </div>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <div className="rounded-card border border-line bg-surface/70 p-5">
                <h2 className="mb-3 text-sm font-normal">Good for you if…</h2>
                <ul className="flex flex-col gap-2">
                  {solution.problems.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-muted">
                      <Check className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden="true" />
                      {CHALLENGE_OPTIONS.find((c) => c.id === p)!.label}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-card border border-line bg-surface/70 p-5">
                <h2 className="mb-3 text-sm font-normal">Always included</h2>
                <ul className="flex flex-col gap-2">
                  {solution.coreFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted">
                      <Check className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden="true" /> {featureById(f)!.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Configurator */}
          <aside aria-labelledby="configure-title" className="lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)] lg:self-start">
            <div className="flex flex-col gap-6 rounded-panel border border-line-strong bg-surface/90 p-6 shadow-float backdrop-blur-xl sm:p-7">
              <div>
                <p id="configure-title" className="text-lg font-semibold">Build your {solution.name}</p>
                <p className="text-sm text-muted">{PACKAGE_INFO[pkg].headline}</p>
              </div>
              <ConfigEditor solutionId={solution.id} pkg={pkg} features={features} onPackage={setPkg} onFeatures={setFeatures} idPrefix="detail" />
              <PriceBlock price={solution.pricing[pkg]} compact />
              <div className="flex flex-col gap-2">
                <Button size="lg" onClick={save}><Bookmark className="size-4" aria-hidden="true" /> Add to My Pick</Button>
              </div>
            </div>
          </aside>
        </Container>
      </section>

      <section className="py-section" aria-labelledby="compare-title">
        <Container className="flex flex-col gap-10">
          <SectionHeading eyebrow="Essential vs Dynamic" title={<span id="compare-title">Compare solutions</span>} lead="Same solution, two levels. Choose here or in the box above." />
          <PackageComparison solution={solution} selected={pkg} onSelect={(p) => { setPkg(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} highlightFeatures={features} />
        </Container>
      </section>

      <section className="pb-section" aria-labelledby="themes-title">
        <Container className="flex flex-col gap-10">
          <SectionHeading eyebrow="Designs" title={<span id="themes-title">Choose a look</span>} lead="Every solution comes with a ready-made design. We add your logo, colours, words and photos. These are simplified previews." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {solution.themes.map((t) => <ThemePreview key={t.name} theme={t} />)}
          </div>
        </Container>
      </section>

      <section aria-labelledby="disc-cta">
        <Container>
          <div className="flex flex-col gap-4 rounded-panel border border-line bg-surface p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
            <div className="flex items-start gap-4">
              <Compass className="mt-1 size-6 shrink-0 text-cyan" aria-hidden="true" />
              <div>
                <Eyebrow className="mb-2">Not sure yet?</Eyebrow>
                <h2 id="disc-cta" className="text-lg font-normal">{solution.discoveryWhen}</h2>
              </div>
            </div>
            <ButtonLink to="/discovery" variant="secondary" className="shrink-0">Discovery Consultation</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  )
}
