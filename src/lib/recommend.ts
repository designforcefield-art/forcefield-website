/**
 * SOLUTION RECOMMENDATION ENGINE — deterministic, rule-based (V1)
 * ------------------------------------------------------------------
 * Pure functions only: no React, no storage. Input is the customer's
 * answers; output is an explainable recommendation. Every rule below maps
 * to a matching principle in the project brief.
 */
import {
  CHALLENGE_OPTIONS,
  FEATURES,
  GOAL_OPTIONS,
  INDUSTRY_OPTIONS,
  SOLUTIONS,
  featureById,
  solutionById,
} from '../data/catalogue'
import type {
  ChallengeId,
  Feature,
  GoalId,
  IndustryId,
  PackageTier,
  Solution,
  SolutionId,
} from '../data/types'

export interface FinderAnswers {
  industry: IndustryId | null
  industryOther: string
  challenges: ChallengeId[]
  challengeNote: string
  goals: GoalId[]
  method: 'manual' | 'recommended' | null
  features: string[]
}

export const EMPTY_ANSWERS: FinderAnswers = {
  industry: null,
  industryOther: '',
  challenges: [],
  challengeNote: '',
  goals: [],
  method: null,
  features: [],
}

/* Tunable weights */
const W = {
  challenge: 3,
  goal: 3,
  industryExact: 2,
  industryAll: 1,
  featureCore: 3,
  featureCompatible: 1,
  featureIncompatible: -4,
}

/** Minimum specific features before an "unclear" profile gets a preliminary solution. */
export const PRELIMINARY_FEATURE_THRESHOLD = 3
/** Above this many selected features we suggest Discovery alongside the match. */
const COMPLEXITY_FEATURE_THRESHOLD = 9

const short = {
  challenge: (id: ChallengeId) => CHALLENGE_OPTIONS.find((o) => o.id === id)?.short ?? id,
  goal: (id: GoalId) => GOAL_OPTIONS.find((o) => o.id === id)?.short ?? id,
  industry: (id: IndustryId | null) => INDUSTRY_OPTIONS.find((o) => o.id === id)?.short ?? 'your',
}

/** "A", "A and B", "A, B and C" */
export const listJoin = (items: string[]) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`

const specific = <T extends string>(ids: T[]) => ids.filter((id) => id !== 'unsure')

export const isUnclear = (a: FinderAnswers) =>
  a.challenges.includes('unsure') && a.goals.includes('unsure')

/* ------------------------------------------------------------------ */
/* Configuration evaluation (shared by Finder, Solution page, My Pick) */
/* ------------------------------------------------------------------ */

export type LineStatus = 'included' | 'addon' | 'needs-dynamic' | 'unavailable' | 'incompatible'

export interface FeatureLine {
  id: string
  name: string
  origin: 'core' | 'selected' | 'dependency'
  status: LineStatus
  additionalFee: boolean
  requiredBy?: string
}

export interface Note {
  tone: 'info' | 'warn'
  text: string
}

export interface Evaluation {
  lines: FeatureLine[]
  notes: Note[]
  /** Lowest package that supports every compatible feature, or null if none does. */
  minimumPackage: PackageTier | null
  /** Features that block Essential. */
  dynamicOnly: string[]
  incompatible: string[]
}

/** Which solutions could support a feature — used to suggest alternatives, never to invent one. */
const solutionsSupporting = (f: Feature) =>
  f.compatibleWith.map((id) => solutionById(id)?.name).filter(Boolean) as string[]

export function evaluateConfiguration(
  solutionId: SolutionId,
  featureIds: string[],
  pkg: PackageTier,
): Evaluation {
  const solution = solutionById(solutionId)!
  const notes: Note[] = []

  // 1. Selected features (deduped, unknown IDs ignored — we never invent features)
  const selected = [...new Set(featureIds)].filter((id) => featureById(id))

  // 2. Resolve dependencies — added visibly, never silently
  const deps = new Map<string, string>() // dependency id → required by (name)
  let frontier = [...selected]
  while (frontier.length) {
    const next: string[] = []
    for (const id of frontier) {
      const f = featureById(id)
      if (!f?.compatibleWith.includes(solutionId)) continue // don't pull in deps for features this solution can't host
      for (const req of f.requires ?? []) {
        if (!selected.includes(req) && !solution.coreFeatures.includes(req) && !deps.has(req)) {
          deps.set(req, featureById(id)!.name)
          next.push(req)
        }
      }
    }
    frontier = next
  }

  const lineFor = (f: Feature, origin: FeatureLine['origin'], requiredBy?: string): FeatureLine => {
    let status: LineStatus
    if (origin === 'core') status = 'included'
    else if (!f.compatibleWith.includes(solutionId)) status = 'incompatible'
    else {
      const a = f.availability[pkg]
      if (a === 'included') status = 'included'
      else if (a === 'addon') status = 'addon'
      else status = pkg === 'essential' && f.availability.dynamic !== 'unavailable' ? 'needs-dynamic' : 'unavailable'
    }
    return { id: f.id, name: f.name, origin, status, additionalFee: origin !== 'core' && f.additionalFee, requiredBy }
  }

  const lines: FeatureLine[] = [
    ...solution.coreFeatures.map((id) => lineFor(featureById(id)!, 'core')),
    ...selected.filter((id) => !solution.coreFeatures.includes(id)).map((id) => lineFor(featureById(id)!, 'selected')),
    ...[...deps.entries()].map(([id, by]) => lineFor(featureById(id)!, 'dependency', by)),
  ]

  for (const [id, by] of deps) {
    notes.push({ tone: 'info', text: `${featureById(id)!.name} has been added because ${by} needs it to work.` })
  }

  // 3. Incompatible features — flagged with where they ARE supported
  const incompatible = lines.filter((l) => l.status === 'incompatible')
  for (const l of incompatible) {
    const where = solutionsSupporting(featureById(l.id)!)
    notes.push({
      tone: 'warn',
      text: `${l.name} isn't part of ${solution.name}. It's available with ${listJoin(where)}. You can save that as a separate pick.`,
    })
  }

  // 4. Conflicts between features in the configuration
  const present = new Set(lines.filter((l) => l.status !== 'incompatible').map((l) => l.id))
  const seen = new Set<string>()
  for (const id of present) {
    for (const c of featureById(id)?.conflictsWith ?? []) {
      const key = [id, c].sort().join('|')
      if (present.has(c) && !seen.has(key)) {
        seen.add(key)
        notes.push({
          tone: 'warn',
          text: `${featureById(id)!.name} and ${featureById(c)!.name} do a similar job. We'll help you choose one when we prepare your quote.`,
        })
      }
    }
  }

  // 5. Minimum package for the compatible, non-core features
  const nonCore = lines.filter((l) => l.origin !== 'core' && l.status !== 'incompatible')
  const dynamicOnly = nonCore.filter((l) => featureById(l.id)!.availability.essential === 'unavailable').map((l) => l.id)
  const impossible = nonCore.filter((l) => featureById(l.id)!.availability.dynamic === 'unavailable')
  const minimumPackage: PackageTier | null = impossible.length ? null : dynamicOnly.length ? 'dynamic' : 'essential'

  if (pkg === 'essential' && dynamicOnly.length) {
    notes.push({
      tone: 'warn',
      text: `Not available in Essential: ${listJoin(dynamicOnly.map((id) => featureById(id)!.name))}. Switch to Dynamic to include ${dynamicOnly.length > 1 ? 'them' : 'it'}.`,
    })
  }
  if (lines.some((l) => l.additionalFee && l.status !== 'incompatible')) {
    notes.push({ tone: 'info', text: "Some features may cost extra. They're marked, and we'll confirm the price in your quote." })
  }

  return { lines, notes, minimumPackage, dynamicOnly, incompatible: incompatible.map((l) => l.id) }
}

/* ------------------------------------------------------------------ */
/* Solution scoring                                                    */
/* ------------------------------------------------------------------ */

export interface ScoredSolution {
  solution: Solution
  score: number
  matchedChallenges: ChallengeId[]
  matchedGoals: GoalId[]
  industryMatch: 'exact' | 'all' | 'none'
  coreFeatureHits: number
  compatibleHits: number
}

export function scoreSolutions(a: FinderAnswers, opts: { ignoreFeatures?: boolean } = {}): ScoredSolution[] {
  const challenges = specific(a.challenges)
  const goals = specific(a.goals)
  const features = opts.ignoreFeatures ? [] : a.features

  return SOLUTIONS.map((solution, order) => {
    const matchedChallenges = challenges.filter((c) => solution.problems.includes(c))
    const matchedGoals = goals.filter((g) => solution.goals.includes(g))
    const industryMatch: ScoredSolution['industryMatch'] =
      a.industry && a.industry !== 'other' && Array.isArray(solution.industries) && solution.industries.includes(a.industry)
        ? 'exact'
        : solution.industries === 'all'
          ? 'all'
          : 'none'

    let coreFeatureHits = 0
    let compatibleHits = 0
    let featureScore = 0
    for (const id of features) {
      const f = featureById(id)
      if (!f) continue
      if (solution.coreFeatures.includes(id)) { coreFeatureHits++; featureScore += W.featureCore }
      else if (f.compatibleWith.includes(solution.id)) { compatibleHits++; featureScore += W.featureCompatible }
      else featureScore += W.featureIncompatible
    }

    const score =
      matchedChallenges.length * W.challenge +
      matchedGoals.length * W.goal +
      (industryMatch === 'exact' ? W.industryExact : industryMatch === 'all' ? W.industryAll : 0) +
      featureScore -
      order * 0.01 // stable tie-break: catalogue order

    return { solution, score, matchedChallenges, matchedGoals, industryMatch, coreFeatureHits, compatibleHits }
  }).sort((x, y) => y.score - x.score)
}

/* ------------------------------------------------------------------ */
/* Feature recommendations (Step 4 — "Recommend for me")               */
/* ------------------------------------------------------------------ */

export interface FeatureSuggestion {
  feature: Feature
  reason: string
  score: number
}

export function recommendFeatures(a: FinderAnswers, limit = 5): FeatureSuggestion[] {
  const top = scoreSolutions(a, { ignoreFeatures: true })[0].solution
  const challenges = specific(a.challenges)
  const goals = specific(a.goals)
  const skip = new Set(['pages', 'cms']) // too basic to be worth "recommending"

  const scored = FEATURES.filter((f) => f.compatibleWith.includes(top.id) && !skip.has(f.id))
    .map((f) => {
      const c = challenges.filter((id) => f.addresses.includes(id))
      const g = goals.filter((id) => f.supports.includes(id))
      const ind = !!a.industry && !!f.industries?.includes(a.industry)
      const core = top.coreFeatures.includes(f.id)
      const score = c.length * 3 + g.length * 2 + (ind ? 2 : 0) + (core ? 1 : 0)
      return { f, c, g, ind, score }
    })
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)

  // Explain each pick with the signal used least so far, so reasons don't repeat.
  const used = new Map<string, number>()
  const take = (key: string) => used.set(key, (used.get(key) ?? 0) + 1)
  return scored.map(({ f, c, g, ind, score }) => {
    const options: { key: string; text: string }[] = [
      ...c.map((id) => ({ key: `c:${id}`, text: `You said ${short.challenge(id)}. ${f.description}` })),
      ...g.map((id) => ({ key: `g:${id}`, text: `Helps you ${short.goal(id)}. ${f.description}` })),
      ...(ind ? [{ key: 'ind', text: `Popular with ${short.industry(a.industry)} businesses. ${f.description}` }] : []),
    ]
    const pick = options.sort((x, y) => (used.get(x.key) ?? 0) - (used.get(y.key) ?? 0))[0]
    if (pick) take(pick.key)
    const reason = pick?.text ?? `Part of ${top.name}, which fits your answers best. ${f.description}`
    return { feature: f, reason, score }
  })
}

/* ------------------------------------------------------------------ */
/* Main recommendation                                                 */
/* ------------------------------------------------------------------ */

export interface SolutionRecommendation {
  kind: 'solution'
  solutionId: SolutionId
  recommendedPackage: PackageTier
  packageReasons: string[]
  fitReasons: string[]
  evaluation: Evaluation
  alternatives: SolutionId[]
  /** Non-null when Discovery should be offered alongside the match. */
  discoveryNote: string | null
  preliminary: boolean
}

export interface DiscoveryRecommendation {
  kind: 'discovery'
  reasons: string[]
  /** Best guess if the customer wants to keep exploring. */
  fallbackSolutionId: SolutionId
}

export type Recommendation = SolutionRecommendation | DiscoveryRecommendation

export function recommend(a: FinderAnswers): Recommendation {
  const unclear = isUnclear(a)
  const ranked = scoreSolutions(a)

  // Rule 9 — unclear needs → Discovery stays the primary match
  if (unclear && a.features.length < PRELIMINARY_FEATURE_THRESHOLD) {
    return {
      kind: 'discovery',
      reasons: [
        "You're not yet sure what's getting in the way or what you'd like to achieve.",
        a.features.length
          ? "You've picked a few features, but not enough for us to recommend a solution with confidence."
          : "Without a clearer picture, any solution we suggest would be a guess.",
        'A Discovery Consultation maps your challenges first, so you invest in the right thing.',
      ],
      fallbackSolutionId: ranked[0].solution.id,
    }
  }

  const top = ranked[0]
  const solution = top.solution

  // Rules 2–3 — Essential unless Essential can't support the selection
  const evaluation0 = evaluateConfiguration(solution.id, a.features, 'essential')
  const recommendedPackage: PackageTier = evaluation0.minimumPackage === 'dynamic' ? 'dynamic' : 'essential'
  const evaluation = recommendedPackage === 'essential' ? evaluation0 : evaluateConfiguration(solution.id, a.features, 'dynamic')

  // Rule 5 — explain the package
  const packageReasons: string[] = []
  if (recommendedPackage === 'dynamic') {
    const names = evaluation0.dynamicOnly.map((id) => featureById(id)!.name)
    packageReasons.push(`${listJoin(names)} ${names.length > 1 ? 'are' : 'is'} only in the Dynamic package.`)
    packageReasons.push('Everything else you chose works in either package.')
  } else {
    packageReasons.push(
      a.features.length
        ? "Essential covers everything you picked, so there's no need to pay for more."
        : 'Essential covers what you described. You can upgrade later if you need more.',
    )
    const dynExtras = solution.packages.dynamic.capabilities.filter((c) => c !== 'Everything in Essential').slice(0, 2)
    packageReasons.push(`You can upgrade to Dynamic later if you want ${dynExtras.join(' or ').toLowerCase()}.`)
  }

  // Rule 1 / 5 — explain the fit
  const fitReasons: string[] = []
  for (const c of top.matchedChallenges) fitReasons.push(`It helps when ${short.challenge(c)}.`)
  for (const g of top.matchedGoals) fitReasons.push(`It's built to help you ${short.goal(g)}.`)
  if (top.industryMatch === 'exact') fitReasons.push(`Many ${short.industry(a.industry)} businesses use it.`)
  const compatibleCount = a.features.filter((id) => featureById(id)?.compatibleWith.includes(solution.id)).length
  if (a.features.length) fitReasons.push(`It includes ${compatibleCount} of the ${a.features.length} features you picked.`)
  if (!fitReasons.length) fitReasons.push(`${solution.name} is a good starting point for most businesses.`)

  // Rule 9 — when to also suggest Discovery
  let discoveryNote: string | null = null
  if (unclear) {
    discoveryNote = "This is a preliminary match based on your feature choices. Since your challenges and goals are still open, a Discovery Consultation could confirm it's the right investment."
  } else if (a.challenges.includes('unsure') || a.goals.includes('unsure')) {
    discoveryNote = "You weren't sure about some of your answers. If you'd like a second opinion, a Discovery Consultation can help."
  } else if (a.features.length >= COMPLEXITY_FEATURE_THRESHOLD || evaluation.incompatible.length >= 2) {
    discoveryNote = 'What you need covers several solutions. A Discovery Consultation can help plan how they fit together.'
  }

  const alternatives = ranked
    .slice(1)
    .filter((r) => r.score > 0)
    .slice(0, 2)
    .map((r) => r.solution.id)

  return {
    kind: 'solution',
    solutionId: solution.id,
    recommendedPackage,
    packageReasons,
    fitReasons,
    evaluation,
    alternatives,
    discoveryNote,
    preliminary: unclear,
  }
}
