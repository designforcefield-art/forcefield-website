import { AlertTriangle, Info } from 'lucide-react'
import { featureById, optionalFeaturesFor, PACKAGE_INFO } from '../data/catalogue'
import type { PackageTier, SolutionId } from '../data/types'
import { evaluateConfiguration, type Evaluation, type Note } from '../lib/recommend'
import { StatusBadge } from './catalogue'
import { Badge, cn } from './ui/primitives'

export function PackageToggle({
  value,
  onChange,
  recommended,
  name,
}: {
  value: PackageTier
  onChange: (p: PackageTier) => void
  recommended?: PackageTier | null
  name: string
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">Package</legend>
      <div className="grid grid-cols-2 gap-1 rounded-full border border-line bg-canvas p-1 shadow-pressed">
        {(['essential', 'dynamic'] as PackageTier[]).map((p) => (
          <label
            key={p}
            className={cn(
              'relative flex cursor-pointer flex-col items-center rounded-full px-3 py-2.5 text-center text-sm font-medium transition-all duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cyan',
              value === p ? 'bg-electric text-white shadow-btn-accent' : 'text-muted hover:bg-raised hover:text-fg',
            )}
          >
            <input type="radio" name={name} className="sr-only" checked={value === p} onChange={() => onChange(p)} />
            {PACKAGE_INFO[p].name}
            {recommended === p && <span className={cn('text-[0.7rem] font-normal', value === p ? 'text-white/75' : 'text-cyan')}>Recommended</span>}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function Notes({ notes }: { notes: Note[] }) {
  if (!notes.length) return null
  return (
    <ul className="flex flex-col gap-2" aria-label="Things to note">
      {notes.map((n) => (
        <li
          key={n.text}
          className={cn(
            'flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm',
            n.tone === 'warn' ? 'border-warning/30 bg-warning/8 text-fg' : 'border-line bg-elevated/50 text-muted',
          )}
        >
          {n.tone === 'warn' ? <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" /> : <Info className="mt-0.5 size-4 shrink-0 text-glow" aria-hidden="true" />}
          {n.text}
        </li>
      ))}
    </ul>
  )
}

/** List of every feature in a configuration with its status in the chosen package. */
export function ConfigLines({ evaluation, hideCore }: { evaluation: Evaluation; hideCore?: boolean }) {
  const lines = evaluation.lines.filter((l) => !hideCore || l.origin !== 'core')
  return (
    <ul className="divide-y divide-line">
      {lines.map((l) => (
        <li key={l.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
          <span className="min-w-0">
            <span className={cn(l.status === 'incompatible' || l.status === 'unavailable' ? 'text-subtle line-through decoration-danger/60' : 'text-fg')}>{l.name}</span>
            {l.origin === 'core' && <span className="ml-2 text-xs text-subtle">Standard</span>}
            {l.origin === 'dependency' && <span className="ml-2 text-xs text-subtle">Needed by {l.requiredBy}</span>}
            {l.additionalFee && l.status !== 'incompatible' && <span className="ml-2 text-xs text-glow">· may cost extra</span>}
          </span>
          <StatusBadge status={l.status} />
        </li>
      ))}
    </ul>
  )
}

/** Package + optional-feature editor for a solution (Solution Detail, My Pick edit). */
export function ConfigEditor({
  solutionId,
  pkg,
  features,
  onPackage,
  onFeatures,
  recommended,
  idPrefix,
}: {
  solutionId: SolutionId
  pkg: PackageTier
  features: string[]
  onPackage: (p: PackageTier) => void
  onFeatures: (ids: string[]) => void
  recommended?: PackageTier | null
  idPrefix: string
}) {
  const optional = optionalFeaturesFor(solutionId)
  const evaluation = evaluateConfiguration(solutionId, features, pkg)
  const toggle = (id: string) => onFeatures(features.includes(id) ? features.filter((x) => x !== id) : [...features, id])
  // features saved earlier that this solution doesn't support stay visible
  const foreign = features.filter((id) => !optional.some((f) => f.id === id))

  return (
    <div className="flex flex-col gap-6">
      <PackageToggle value={pkg} onChange={onPackage} recommended={recommended} name={`${idPrefix}-pkg`} />
      <fieldset className="flex flex-col gap-1">
        <legend className="mb-2 text-sm font-medium">Add extra features</legend>
        {optional.map((f) => {
          const a = f.availability[pkg]
          const on = features.includes(f.id)
          return (
            <label
              key={f.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cyan',
                on ? 'border-electric/50 bg-electric/10' : 'border-transparent hover:bg-raised',
              )}
            >
              <input type="checkbox" checked={on} onChange={() => toggle(f.id)} className="size-4 shrink-0 accent-electric-bright" />
              <span className="min-w-0 flex-1 text-sm">
                {f.name}
                {f.additionalFee && <span className="ml-1.5 text-xs text-glow">· may cost extra</span>}
              </span>
              {a === 'included' && <Badge tone="success">Included</Badge>}
              {a === 'addon' && <Badge tone="electric">Optional extra</Badge>}
              {a === 'unavailable' && <Badge tone={on ? 'warning' : 'neutral'}>{f.availability.dynamic !== 'unavailable' ? 'Dynamic only' : 'Unavailable'}</Badge>}
            </label>
          )
        })}
        {foreign.map((id) => (
          <label key={id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-danger/30 bg-danger/5 px-3 py-2.5">
            <input type="checkbox" checked onChange={() => toggle(id)} className="size-4 shrink-0 accent-electric-bright" />
            <span className="min-w-0 flex-1 text-sm">{featureById(id)?.name ?? id}</span>
            <Badge tone="danger">Not supported</Badge>
          </label>
        ))}
      </fieldset>
      <Notes notes={evaluation.notes} />
    </div>
  )
}
