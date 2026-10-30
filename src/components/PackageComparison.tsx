import { Check, Minus, Sparkles } from 'lucide-react'
import { featureById, optionalFeaturesFor, PACKAGE_INFO } from '../data/catalogue'
import type { Availability, PackageTier, Solution } from '../data/types'
import { Badge, cn } from './ui/primitives'
import { PackageGlyph } from './AbstractIcon'

/**
 * Side-by-side Essential vs Dynamic for one solution: positioning, included
 * capabilities and how each optional feature is offered.
 */
export function PackageComparison({
  solution,
  recommended,
  selected,
  onSelect,
  highlightFeatures = [],
}: {
  solution: Solution
  recommended?: PackageTier | null
  selected?: PackageTier
  onSelect?: (p: PackageTier) => void
  highlightFeatures?: string[]
}) {
  const optional = optionalFeaturesFor(solution.id)
  const tiers: PackageTier[] = ['essential', 'dynamic']

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        {tiers.map((t) => {
          const info = PACKAGE_INFO[t]
          const isSel = selected === t
          return (
            <div
              key={t}
              className={cn(
                'relative flex flex-col rounded-panel border p-6 transition-all duration-300',
                isSel ? 'border-electric bg-electric/8' : 'border-line bg-surface',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <PackageGlyph tier={t} size="sm" />
                  <span className="text-sm font-medium text-cyan">{info.name}</span>
                </span>
                {recommended === t && (
                  <Badge tone="cyan">
                    <Sparkles className="size-3" aria-hidden="true" /> Recommended for you
                  </Badge>
                )}
              </div>
              <h3 className="mt-3 text-h3 font-normal">{info.headline}</h3>
              <p className="mt-2 text-sm text-muted">{solution.packages[t].summary}</p>
              <ul className="mt-5 flex flex-col gap-2.5">
                {solution.packages[t].capabilities.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden="true" /> {c}
                  </li>
                ))}
              </ul>
              {onSelect && (
                <button
                  type="button"
                  onClick={() => onSelect(t)}
                  aria-pressed={isSel}
                  className={cn(
                    'mt-6 h-11 rounded-full border text-sm font-medium transition-all',
                    isSel ? 'border-transparent bg-electric text-white shadow-btn-accent' : 'border-transparent bg-raised shadow-btn hover:bg-raised-hover',
                  )}
                >
                  {isSel ? `${info.name} chosen` : `Choose ${info.name}`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {optional.length > 0 && (
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[30rem] text-sm">
            <caption className="sr-only">Extra features by package for {solution.name}</caption>
            <thead>
              <tr className="border-b border-line bg-elevated/50 text-left">
                <th scope="col" className="px-4 py-3 font-medium text-muted">Extra feature</th>
                <th scope="col" className="w-32 px-4 py-3 font-medium text-muted">Essential</th>
                <th scope="col" className="w-32 px-4 py-3 font-medium text-muted">Dynamic</th>
              </tr>
            </thead>
            <tbody>
              {optional.map((f) => {
                const hl = highlightFeatures.includes(f.id)
                return (
                  <tr key={f.id} className={cn('border-b border-line last:border-0', hl && 'bg-electric/8')}>
                    <th scope="row" className="px-4 py-3 text-left font-normal">
                      <span className={cn(hl && 'font-medium text-fg')}>{featureById(f.id)!.name}</span>
                      {hl && <span className="ml-2 text-xs text-cyan">· your pick</span>}
                    </th>
                    <td className="px-4 py-3"><Cell a={f.availability.essential} /></td>
                    <td className="px-4 py-3"><Cell a={f.availability.dynamic} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Cell({ a }: { a: Availability }) {
  if (a === 'included') return <span className="inline-flex items-center gap-1.5 text-success"><Check className="size-4" aria-hidden="true" /> Included</span>
  if (a === 'addon') return <span className="text-glow">Optional extra</span>
  return <span className="inline-flex items-center gap-1.5 text-subtle"><Minus className="size-4" aria-hidden="true" /> Not available</span>
}
