import { track } from '../lib/track'
import { ArrowRight, Bookmark, Compass, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DISCOVERY_SERVICES, featureById, industryLabel, PACKAGE_INFO, solutionById } from '../data/catalogue'
import type { DiscoveryService, PackageTier } from '../data/types'
import { allFeatures, type DiscoveryPick, type PickItem, type SolutionPick, type ToolPick } from '../lib/picks'
import { digitalSolutionById, listNames, recommendPackage } from '../data/solutionsCatalogue'
import { SolutionArtTile } from './SolutionArt'
import { evaluateConfiguration } from '../lib/recommend'
import { usePicks } from '../state/PickContext'
import { ConfigEditor } from './ConfigEditor'
import { Drawer } from './ui/Overlay'
import { Badge, Button, cn } from './ui/primitives'
import { PackageGlyph } from './AbstractIcon'
import { useToast } from './ui/Toast'
import { SolutionThumb } from './SolutionIllustration'

export function MyPickDrawer() {
  const { picks, drawerOpen, closeDrawer, startSignUp, count } = usePicks()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  useEffect(() => closeDrawer(), [pathname]) // eslint-disable-line react-hooks/exhaustive-deps
  const go = (to: string) => {
    closeDrawer()
    navigate(to)
  }
  const tools = picks.filter((p): p is ToolPick => p.kind === 'tool')
  const others = picks.filter((p) => p.kind !== 'tool')

  return (
    <Drawer
      open={drawerOpen}
      onClose={closeDrawer}
      title={
        <span className="flex items-center gap-2">
          My Pick <span className="text-muted tabular-nums">({count})</span>
        </span>
      }
      description="Your selected solutions, all in one place."
      footer={
        count > 0 ? (
          <Button size="lg" className="w-full" onClick={() => startSignUp({ fromMyPick: true })} data-autofocus>
            Get Started <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        ) : undefined
      }
    >
      {count === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="grid size-16 place-items-center rounded-2xl border border-line-strong bg-elevated text-glow">
            <Bookmark className="size-7" aria-hidden="true" />
          </span>
          <div>
            <p className="text-lg font-normal text-fg">Let's find what works for your business.</p>
            <p className="mx-auto mt-2 max-w-xs text-small text-muted">
              Explore our digital solutions and save the features that interest you. We'll help you find the right solution to get started.
            </p>
          </div>
          <Button className="mt-2" onClick={() => go('/solutions')} data-autofocus>
            Explore Solutions <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {tools.length > 0 && (
            <section aria-labelledby="mp-selected">
              <h3 id="mp-selected" className="mb-3 text-xs font-medium text-subtle">Selected solutions</h3>
              <ul className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface">
                {tools.map((p) => (
                  <li key={p.id}>
                    <ToolPickRow pick={p} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {others.length > 0 && (
            <ul className="flex flex-col gap-4">
              {others.map((p) => (
                <li key={p.id}>{p.kind === 'solution' ? <SolutionPickCard pick={p} /> : p.kind === 'discovery' ? <DiscoveryPickCard pick={p} /> : null}</li>
              ))}
            </ul>
          )}
          <PackageRecommendationCard toolIds={tools.map((p) => p.toolId)} />
        </div>
      )}
    </Drawer>
  )
}

function useRemove() {
  const { remove, add } = usePicks()
  const toast = useToast()
  return (pick: PickItem, name: string) => {
    remove(pick.id)
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = pick
    void _id; void _c; void _u
    toast({ title: `Removed ${name}`, tone: 'info', action: { label: 'Undo', onClick: () => add(rest) } })
  }
}

function SolutionPickCard({ pick }: { pick: SolutionPick }) {
  const solution = solutionById(pick.solutionId)!
  const { update } = usePicks()
  const removePick = useRemove()
  const [editing, setEditing] = useState(false)
  const [draftPkg, setDraftPkg] = useState<PackageTier>(pick.selectedPackage)
  const [draftFeatures, setDraftFeatures] = useState<string[]>(allFeatures(pick))
  const evaluation = evaluateConfiguration(pick.solutionId, allFeatures(pick), pick.selectedPackage)
  const warnings = evaluation.notes.filter((n) => n.tone === 'warn').length

  const startEdit = () => {
    setDraftPkg(pick.selectedPackage)
    setDraftFeatures(allFeatures(pick))
    setEditing(true)
  }
  const save = () => {
    const recommendedFeatures = pick.recommendedFeatures.filter((id) => draftFeatures.includes(id))
    update(pick.id, {
      selectedPackage: draftPkg,
      recommendedFeatures,
      selectedFeatures: draftFeatures.filter((id) => !recommendedFeatures.includes(id)),
    })
    setEditing(false)
  }

  return (
    <article className={cn('rounded-card border bg-elevated/40 p-4 transition-colors', editing ? 'border-electric/60' : 'border-line')}>
      <div className="flex items-start gap-3">
        <SolutionThumb id={solution.id} />
        <div className="min-w-0 flex-1">
          <h3 className="font-normal">{solution.name}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge tone={pick.selectedPackage === 'dynamic' ? 'electric' : 'neutral'}>{PACKAGE_INFO[pick.selectedPackage].name}</Badge>
            {pick.recommendedPackage && pick.recommendedPackage !== pick.selectedPackage && (
              <Badge tone="cyan">We recommended {PACKAGE_INFO[pick.recommendedPackage].name}</Badge>
            )}
            {warnings > 0 && <Badge tone="warning">{warnings} to review</Badge>}
          </div>
          {pick.answers && (
            <p className="mt-2 text-xs text-subtle">
              From Solution Finder · {industryLabel(pick.answers.industry, pick.answers.industryOther)}
            </p>
          )}
        </div>
      </div>

      {!editing && (
        <>
          {pick.selectedFeatures.length + pick.recommendedFeatures.length > 0 ? (
            <div className="mt-4 flex flex-col gap-2.5">
              {pick.selectedFeatures.length > 0 && (
                <FeatureChips label="Your features" ids={pick.selectedFeatures} />
              )}
              {pick.recommendedFeatures.length > 0 && (
                <FeatureChips label="Features we suggested" ids={pick.recommendedFeatures} tone="cyan" />
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Standard {solution.name} features, no extras.</p>
          )}
          <div className="mt-4 flex flex-wrap gap-1">
            <Button variant="ghost" size="sm" onClick={startEdit} aria-label={`Edit ${solution.name}`}>
              <Pencil className="size-3.5" aria-hidden="true" /> Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => removePick(pick, solution.name)} aria-label={`Remove ${solution.name}`} className="hover:text-danger">
              <Trash2 className="size-3.5" aria-hidden="true" /> Remove
            </Button>
          </div>
        </>
      )}

      {editing && (
        <div className="mt-4 flex flex-col gap-4 border-t border-line pt-4">
          <ConfigEditor
            solutionId={pick.solutionId}
            pkg={draftPkg}
            features={draftFeatures}
            onPackage={setDraftPkg}
            onFeatures={setDraftFeatures}
            recommended={pick.recommendedPackage}
            idPrefix={`edit-${pick.id}`}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={save}>Save changes</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </article>
  )
}

function FeatureChips({ label, ids, tone }: { label: string; ids: string[]; tone?: 'cyan' }) {
  return (
    <div>
      <p className="mb-1.5 text-xs text-subtle">{label}</p>
      <ul className="flex flex-wrap gap-1.5">
        {ids.map((id) => (
          <li key={id}>
            <Badge tone={tone ?? 'neutral'}>{featureById(id)?.name ?? id}</Badge>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DiscoveryPickCard({ pick }: { pick: DiscoveryPick }) {
  const { update } = usePicks()
  const removePick = useRemove()
  const [editing, setEditing] = useState(false)
  const toggle = (id: DiscoveryService['id']) => {
    const next = pick.services.includes(id) ? pick.services.filter((s) => s !== id) : [...pick.services, id]
    if (next.length) update(pick.id, { services: next })
  }
  return (
    <article className="rounded-card border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-electric/40 bg-electric/20 text-glow">
          <Compass className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-normal">Discovery Consultation</h3>
          <p className="mt-0.5 text-xs text-muted">Paid service, priced separately.</p>
        </div>
      </div>
      {editing ? (
        <fieldset className="mt-4 flex flex-col gap-1">
          <legend className="mb-2 text-sm font-medium">Services you're interested in</legend>
          {DISCOVERY_SERVICES.map((s) => (
            <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 hover:bg-elevated">
              <input type="checkbox" className="size-4 accent-electric-bright" checked={pick.services.includes(s.id)} onChange={() => toggle(s.id)} />
              <span className="text-sm">{s.name}</span>
            </label>
          ))}
          <p className="px-2 text-xs text-subtle">Keep at least one selected, or remove the consultation.</p>
          <Button size="sm" className="mt-2 w-fit" onClick={() => setEditing(false)}>Done</Button>
        </fieldset>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {pick.services.map((s) => (
            <li key={s}><Badge tone="electric">{DISCOVERY_SERVICES.find((d) => d.id === s)?.name}</Badge></li>
          ))}
        </ul>
      )}
      {!editing && (
        <div className="mt-4 flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)} aria-label="Edit Discovery Consultation">
            <Pencil className="size-3.5" aria-hidden="true" /> Edit
          </Button>
          <Button variant="ghost" size="sm" className="hover:text-danger" onClick={() => removePick(pick, 'Discovery Consultation')} aria-label="Remove Discovery Consultation">
            <Trash2 className="size-3.5" aria-hidden="true" /> Remove
          </Button>
        </div>
      )}
    </article>
  )
}

function ToolPickRow({ pick }: { pick: ToolPick }) {
  const removePick = useRemove()
  const t = digitalSolutionById(pick.toolId)
  const name = t?.name ?? pick.toolId
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <SolutionArtTile id={t?.illustration ?? ''} className="size-9" iconClassName="size-6" />
      <span className="min-w-0 flex-1 text-sm text-fg">{name}</span>
      <button
        type="button"
        onClick={() => {
          track('remove', pick.toolId)
          removePick(pick, name)
        }}
        aria-label={`Remove ${name}`}
        className="grid size-8 shrink-0 place-items-center rounded-full text-subtle transition-colors hover:bg-raised hover:text-danger focus-visible:ring-2 focus-visible:ring-electric/60 focus-visible:outline-none"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

const TIER_COPY = {
  essential: 'A fully managed 3-page website with the essential features your business needs.',
  dynamic: 'A scalable website with an admin panel, AI SEO tools, and dedicated support.',
} as const

/** Rule-based Essential / Dynamic recommendation from the selected solutions. */
function PackageRecommendationCard({ toolIds }: { toolIds: string[] }) {
  const rec = recommendPackage(toolIds)
  if (!rec) return null
  return (
    <section
      aria-labelledby="rec-title"
      aria-live="polite"
      className={cn('rounded-card border p-4', rec.tier === 'dynamic' ? 'border-electric/60 bg-electric/10' : 'border-line-strong bg-elevated/40')}
    >
      <p className="text-xs font-medium text-subtle">Recommended for you</p>
      {rec.tier ? (
        <>
          <div className="mt-2 flex items-center gap-3">
            <PackageGlyph tier={rec.tier} size="sm" />
            <h3 id="rec-title" className="text-lg font-normal">{PACKAGE_INFO[rec.tier].name} Solution</h3>
          </div>
          <p className="mt-2 text-small text-muted">{TIER_COPY[rec.tier]}</p>
          <p className="mt-3 text-small text-fg">
            Based on your selected solutions, the {PACKAGE_INFO[rec.tier].name} Solution may be a suitable fit for your business.
          </p>
        </>
      ) : (
        <>
          <h3 id="rec-title" className="mt-2 text-lg font-normal">Recommendation pending review.</h3>
          <p className="mt-2 text-small text-muted">
            We'll check how {listNames(rec.needsReview)} {rec.needsReview.length === 1 ? 'fits' : 'fit'} our Essential and Dynamic Solutions.
          </p>
        </>
      )}
      {rec.additionalScope.length > 0 && (
        <p className="mt-2 text-xs leading-[1.5] text-muted">
          May involve additional scope: {listNames(rec.additionalScope)}.
        </p>
      )}
      <p className="mt-2 text-xs leading-[1.5] text-subtle">Our team will review your requirements and confirm the most suitable solution.</p>
    </section>
  )
}
