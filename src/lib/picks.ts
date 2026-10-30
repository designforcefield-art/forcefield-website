import type { DiscoveryService, PackageTier, SolutionId } from '../data/types'
import type { FinderAnswers } from './recommend'

/**
 * A saved configuration in My Pick. This is a quotation shortlist entry —
 * never an order. Original Finder answers are kept verbatim in `answers`.
 */
export type PickItem = SolutionPick | DiscoveryPick | ToolPick

interface PickBase {
  id: string
  createdAt: string
  updatedAt: string
  source: 'finder' | 'catalogue' | 'industry' | 'discovery-page' | 'solutions-catalogue'
  /** Finder answers at the time of saving (null when added from the catalogue). */
  answers: FinderAnswers | null
}

export interface SolutionPick extends PickBase {
  kind: 'solution'
  solutionId: SolutionId
  recommendedPackage: PackageTier | null
  selectedPackage: PackageTier
  /** Features the customer chose themselves. */
  selectedFeatures: string[]
  /** Features Forcefield suggested and the customer accepted. */
  recommendedFeatures: string[]
  featureMethod: FinderAnswers['method']
}

export interface DiscoveryPick extends PickBase {
  kind: 'discovery'
  services: DiscoveryService['id'][]
}

/**
 * An individual digital solution (e.g. WhatsApp Chat) added from a solution
 * card. Older saved picks never contain this kind, so existing saved
 * shortlists load unchanged.
 */
export interface ToolPick extends PickBase {
  kind: 'tool'
  /** id from src/data/solutionsCatalogue.ts */
  toolId: string
}

export type NewPick =
  | Omit<SolutionPick, 'id' | 'createdAt' | 'updatedAt'>
  | Omit<DiscoveryPick, 'id' | 'createdAt' | 'updatedAt'>
  | Omit<ToolPick, 'id' | 'createdAt' | 'updatedAt'>

export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

/** Two picks with the same signature are duplicates. */
export function pickSignature(p: NewPick) {
  if (p.kind === 'discovery') return 'discovery'
  if (p.kind === 'tool') return `tool:${p.toolId}`
  const feats = [...new Set([...p.selectedFeatures, ...p.recommendedFeatures])].sort().join(',')
  return `solution:${p.solutionId}:${p.selectedPackage}:${feats}`
}

export const allFeatures = (p: SolutionPick) => [...new Set([...p.selectedFeatures, ...p.recommendedFeatures])]
