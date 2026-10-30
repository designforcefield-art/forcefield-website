import { Check, Plus } from 'lucide-react'
import { PACKAGE_INFO } from '../data/catalogue'
import { recommendPackage, type DigitalSolution } from '../data/solutionsCatalogue'
import { track } from '../lib/track'
import { usePicks } from '../state/PickContext'
import { SolutionArtPanel } from './SolutionArt'
import { cn } from './ui/primitives'
import { useToast } from './ui/Toast'

/** My Pick toggle for one digital solution (reuses the existing My Pick store). */
export function useToolPick(id: string) {
  const { picks, add, remove, openDrawer } = usePicks()
  const toast = useToast()
  const existing = picks.find((p) => p.kind === 'tool' && p.toolId === id)
  const toggle = () => {
    if (existing) {
      track('remove', id)
      return remove(existing.id)
    }
    track('add', id)
    add({ kind: 'tool', toolId: id, source: 'solutions-catalogue', answers: null })
    // Recommendation updates automatically from everything now in My Pick.
    const rec = recommendPackage([...picks.flatMap((p) => (p.kind === 'tool' ? [p.toolId] : [])), id])
    if (rec)
      toast({
        title: 'Added to My Pick',
        body: rec.tier ? `Recommended for you: ${PACKAGE_INFO[rec.tier].name} Solution` : 'Recommendation pending review',
        action: { label: 'View My Pick', onClick: openDrawer },
      })
  }
  return { picked: !!existing, toggle }
}

/**
 * Self-explanatory solution card: graphic, name, short description and an
 * Add to My Pick toggle. No detail page, no modal.
 */
export function ToolCard({ tool, headingLevel = 'h3' }: { tool: DigitalSolution; headingLevel?: 'h2' | 'h3' }) {
  const { picked, toggle } = useToolPick(tool.id)
  const H = headingLevel
  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-panel border bg-surface p-6 transition-colors duration-300',
        picked ? 'border-electric/70' : 'border-line hover:border-line-strong',
      )}
    >
      <div className="-mx-2 -mt-2 overflow-hidden rounded-2xl">
        <SolutionArtPanel id={tool.illustration} className="aspect-[16/9]" />
      </div>
      <H className="mt-6 text-item-title font-normal">{tool.name}</H>
      <p className="mt-1.5 text-card-body text-muted">{tool.short}</p>
      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={toggle}
          aria-pressed={picked}
          aria-label={picked ? `${tool.name} added to My Pick. Select to remove` : `Add ${tool.name} to My Pick`}
          className={cn(
            'ff-btn inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all outline-none',
            'focus-visible:ring-2 focus-visible:ring-electric/60',
            picked
              ? 'bg-electric/15 text-glow ring-1 ring-electric/60 hover:bg-electric/25'
              : 'bg-raised text-fg shadow-btn hover:bg-raised-hover',
          )}
        >
          {picked ? <Check className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
          {picked ? 'Added to My Pick' : 'Add to My Pick'}
        </button>
      </div>
    </article>
  )
}
