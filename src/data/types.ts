/**
 * Catalogue types. These mirror how records would be stored in a CMS/backend:
 * every cross-reference is by ID, never by duplicated object.
 */

export type PackageTier = 'essential' | 'dynamic'

export type IndustryId =
  | 'fnb'
  | 'beauty'
  | 'retail'
  | 'interior'
  | 'professional'
  | 'property'
  | 'education'
  | 'other'

export type ChallengeId =
  | 'visibility'
  | 'enquiries'
  | 'conversion'
  | 'repetitive'
  | 'tracking'
  | 'performance'
  | 'tools'
  | 'unsure'

export type GoalId =
  | 'online'
  | 'reach'
  | 'more-enquiries'
  | 'sales'
  | 'save-time'
  | 'retention'
  | 'insight'
  | 'scale'
  | 'unsure'

export type FeatureCategoryId =
  | 'website'
  | 'lead'
  | 'booking'
  | 'commerce'
  | 'customer'
  | 'automation'
  | 'analytics'
  | 'integrations'

export type SolutionCategoryId = 'presence' | 'growth' | 'commerce' | 'operations'

export type SolutionId =
  | 'business-website'
  | 'lead-generation'
  | 'ecommerce'
  | 'booking'
  | 'automation'
  | 'customer-management'

/** How a feature is offered within a package. */
export type Availability = 'included' | 'addon' | 'unavailable'

export interface Option<Id extends string> {
  id: Id
  label: string
  /** Short phrase used when explaining a recommendation, e.g. "trouble being found online". */
  short: string
  icon?: string
}

export interface FeatureCategory {
  id: FeatureCategoryId
  name: string
  icon: string
}

export interface Feature {
  id: string
  name: string
  description: string
  category: FeatureCategoryId
  /** Solutions this feature can be added to. */
  compatibleWith: SolutionId[]
  availability: Record<PackageTier, Availability>
  /** True when choosing this feature may add a fee on top of the package. */
  additionalFee: boolean
  /** Feature IDs that must be present for this feature to work. */
  requires?: string[]
  /** Feature IDs that cannot be combined with this one. */
  conflictsWith?: string[]
  /** Signals used by the recommendation engine. */
  addresses: ChallengeId[]
  supports: GoalId[]
  industries?: IndustryId[]
}

export interface PackageDefinition {
  summary: string
  capabilities: string[]
}

export interface PriceBand {
  /** null = not yet defined → UI shows "Request quote". Never invent prices. */
  setup: string | null
  recurring: string | null
}

export interface Theme {
  name: string
  mood: string
  /** Swatches for the preview card: [background, surface, accent] */
  swatches: [string, string, string]
  layout: 'split' | 'stacked' | 'grid'
}

export interface Solution {
  id: SolutionId
  name: string
  tagline: string
  description: string
  category: SolutionCategoryId
  icon: string
  /** 'all' = suitable for every industry. */
  industries: IndustryId[] | 'all'
  problems: ChallengeId[]
  goals: GoalId[]
  /** Features that define this solution (always part of it). */
  coreFeatures: string[]
  packages: Record<PackageTier, PackageDefinition>
  pricing: Record<PackageTier, PriceBand>
  themes: Theme[]
  /** Situations where we'd rather start with Discovery. */
  discoveryWhen: string
}

export interface Industry {
  id: Exclude<IndustryId, 'other'>
  name: string
  icon: string
  intro: string
  challenges: string[]
  recommendedSolutions: SolutionId[]
  popularFeatures: string[]
}

export interface DiscoveryService {
  id: 'business' | 'process' | 'solution'
  name: string
  description: string
  outcomes: string[]
  icon: string
}

export interface Partnership {
  id: 'care' | 'growth'
  name: string
  tagline: string
  points: string[]
  icon: string
}
