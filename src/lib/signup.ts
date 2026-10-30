/**
 * GET STARTED (SIGN-UP) SUBMISSION
 * ------------------------------------------------------------------
 * Sent by email to support@forcefield.design via FormSubmit, like the leads
 * landing pages (settings in src/config/forms.ts). Set VITE_SIGNUP_ENDPOINT to
 * post to your own backend instead (multipart: a `payload` JSON field + files).
 *
 * Browser checks are for convenience. FormSubmit's own honeypot (_honey) and
 * spam filtering apply on its side; a custom backend must re-validate fields,
 * file types and sizes, rate-limit, and store uploads privately.
 * The shared link is sent as text only and is never opened or fetched.
 */
import { CONSENT_TEXT } from './quote'
import { FORMS, UPLOAD_LIMITS } from '../config/forms'
import { sendErrorMessage, sendViaFormSubmit } from './formsubmit'
import type { PickItem } from './picks'
import { DISCOVERY_SERVICES, solutionById } from '../data/catalogue'
import { digitalSolutionById, recommendPackage } from '../data/solutionsCatalogue'
import { PACKAGE_INFO } from '../data/catalogue'
import { readJSON, STORAGE_KEYS, writeJSON } from './storage'

/** Existing package identifiers (OfferingTier). */
export type ServiceId = 'discovery' | 'essential' | 'dynamic'
export const SERVICE_IDS: ServiceId[] = ['discovery', 'essential', 'dynamic']
export const isServiceId = (x: unknown): x is ServiceId => SERVICE_IDS.includes(x as ServiceId)

export const SERVICE_CARDS: { id: ServiceId; name: string; headline: string; description: string }[] = [
  {
    id: 'discovery',
    name: 'Discovery',
    headline: 'Find the right solution',
    description: 'Workshops to uncover your business challenges and identify the right digital solutions.',
  },
  {
    id: 'essential',
    name: 'Essential',
    headline: 'Get online, hassle-free',
    description: 'A professional 3-page website, fully managed by our team.',
  },
  {
    id: 'dynamic',
    name: 'Dynamic',
    headline: 'Build, manage & grow',
    description: 'A scalable website with full control, AI SEO tools, and dedicated support.',
  },
]

/* ---------- Files ---------- */

export const MAX_FILES = UPLOAD_LIMITS.maxFiles
/** Combined size of all files in one submission (FormSubmit's attachment limit). */
export const MAX_TOTAL_BYTES = UPLOAD_LIMITS.maxTotalBytes
export const ACCEPTED_EXT = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
const ACCEPTED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]
export const ACCEPT_ATTR = '.pdf,.doc,.docx,.jpg,.jpeg,.png'

export const formatBytes = (n: number) =>
  n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`

/** Returns a problem message, or null when the file is acceptable. */
export function checkFile(f: File): string | null {
  const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ACCEPTED_EXT.includes(ext) || (f.type && !ACCEPTED_MIME.includes(f.type)))
    return `${f.name}: this file type isn't supported. Use PDF, DOC, DOCX, JPG or PNG.`
  if (f.size > MAX_TOTAL_BYTES) return `${f.name} is ${formatBytes(f.size)}. Files can be up to 10 MB in total.`
  if (f.size === 0) return `${f.name} is empty.`
  return null
}

/**
 * Shrinks large JPG/PNG photos in the browser so more fit in the 10 MB total:
 * long edge capped at 2400px; JPGs re-saved at 82% quality, PNGs stay PNG
 * (keeps logo transparency). Returns the original if it can't be made smaller.
 * PDFs and Word files are sent as they are.
 */
export async function shrinkImage(file: File): Promise<File> {
  const isJpg = /^image\/jpe?g$/.test(file.type)
  const isPng = file.type === 'image/png'
  if ((!isJpg && !isPng) || file.size <= UPLOAD_LIMITS.compressAboveBytes || typeof createImageBitmap !== 'function') return file
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, UPLOAD_LIMITS.maxImageEdge / Math.max(bmp.width, bmp.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bmp.width * scale)
    canvas.height = Math.round(bmp.height * scale)
    canvas.getContext('2d')?.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    bmp.close?.()
    const type = isJpg ? 'image/jpeg' : 'image/png'
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, type, isJpg ? 0.82 : undefined))
    if (!blob || blob.size >= file.size) return file
    return new File([blob], file.name, { type, lastModified: file.lastModified })
  } catch {
    return file
  }
}

/* ---------- Link ---------- */

/** Accepts any valid https:// address. The link is stored as text and never fetched. */
export function checkLink(raw: string): string | null {
  const v = raw.trim()
  if (!v) return null
  try {
    const u = new URL(v)
    if (u.protocol !== 'https:') return 'Please use a secure link that starts with https://'
    if (!u.hostname.includes('.')) return "That link doesn't look complete."
    return null
  } catch {
    return "That doesn't look like a link. Paste the full address, starting with https://"
  }
}

/* ---------- Form ---------- */

export interface SignUpForm {
  name: string
  company: string
  email: string
  phone: string
  service: ServiceId | ''
  brief: string
  link: string
  consent: boolean
}

export const EMPTY_SIGNUP: SignUpForm = { name: '', company: '', email: '', phone: '', service: '', brief: '', link: '', consent: false }

export type SignUpErrors = Partial<Record<keyof SignUpForm | 'captcha', string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE = /^[+\d][\d\s()-]{6,}$/

/** `spamError` comes from the spam check (null when the sum is right). */
export function validateSignUp(f: SignUpForm, spamError: string | null): SignUpErrors {
  const e: SignUpErrors = {}
  if (!f.name.trim()) e.name = 'Please enter your full name.'
  if (!f.company.trim()) e.company = 'Please enter your company or business name.'
  if (!f.email.trim()) e.email = 'Please enter your email.'
  else if (!EMAIL.test(f.email.trim())) e.email = 'That email doesn’t look right. Check for a missing “@” or domain.'
  if (!f.phone.trim()) e.phone = 'Please enter a contact number.'
  else if (!PHONE.test(f.phone.trim())) e.phone = 'Use digits only, with an optional + country code.'
  if (!f.service) e.service = 'Please choose a service.'
  const link = checkLink(f.link)
  if (link) e.link = link
  if (!f.consent) e.consent = 'Please confirm so we can use your details to get you started.'
  if (spamError) e.captcha = spamError
  return e
}

/* ---------- Service source, draft and My Pick brief ---------- */

/** manual = clicked by the visitor; explicit = from a package link; recommended = our suggestion. */
export type ServiceSource = 'manual' | 'explicit' | 'recommended' | ''

/** Kept for this browser tab only, so returning from My Pick doesn't lose typing. Files and consent are never stored. */
export interface SignUpDraft {
  name: string
  company: string
  email: string
  phone: string
  service: ServiceId | ''
  serviceSource: ServiceSource
  brief: string
  link: string
}
export const loadDraft = (): Partial<SignUpDraft> => readJSON<Partial<SignUpDraft>>(STORAGE_KEYS.getStarted, {}, 'session')
export const saveDraft = (d: SignUpDraft) => writeJSON(STORAGE_KEYS.getStarted, d, 'session')
export const clearDraft = () => writeJSON(STORAGE_KEYS.getStarted, {}, 'session')

export const BRIEF_MARKER = "I'm interested in the following digital solutions for my business:"

type Tier = 'essential' | 'dynamic'
const SERVICE_LABEL: Record<ServiceId, string> = { discovery: 'Discovery', essential: 'Essential', dynamic: 'Dynamic' }

/**
 * The package line under the My Pick list. It always agrees with the service
 * selected on the form, so the brief never says one package while another is ticked.
 */
export function packageLine(service: ServiceId | '', tier: Tier | null): string | null {
  if (!service || service === tier) return tier ? `Recommended solution: ${PACKAGE_INFO[tier].name} Solution` : null
  const chosen = service === 'discovery' ? 'Discovery Consultation' : `${SERVICE_LABEL[service]} Solution`
  return tier ? `Selected service: ${chosen} (recommended: ${SERVICE_LABEL[tier]} Solution)` : `Selected service: ${chosen}`
}
const PACKAGE_LINE_RE = /\n+(?:Recommended [Pp]ackage|Recommended solution|Selected service): [^\n]*/

/** Rewrites the package line in the brief's My Pick section to match the selected service. */
export function syncBriefPackageLine(brief: string, service: ServiceId | '', tier: Tier | null): string {
  const at = brief.indexOf(BRIEF_MARKER)
  if (at < 0) return brief
  const m = brief.slice(at).match(/^I'm interested in the following digital solutions for my business:\n(?:\n?- .*)*(?:\n+(?:Recommended [Pp]ackage|Recommended solution|Selected service): .*)?/)
  if (!m) return brief
  const list = m[0].replace(PACKAGE_LINE_RE, '')
  const line = packageLine(service, tier)
  return brief.slice(0, at) + list + (line ? `\n\n${line}` : '') + brief.slice(at + m[0].length)
}

function myPickBlock(names: string[], line: string | null, withTrailer: boolean) {
  const lines = [BRIEF_MARKER, '', ...names.map((n) => `- ${n}`)]
  if (line) lines.push('', line)
  if (withTrailer) lines.push('', 'Additional information:', '')
  return lines.join('\n')
}

/**
 * Adds the My Pick solutions to the brief without losing anything the visitor wrote:
 *  - empty brief       → the full template
 *  - brief with a list → that list (and its package line) is updated in place, no duplicates
 *  - other text        → kept, with the list added below as its own section
 * The package line is left out when the recommendation is pending review.
 */
export function mergeMyPickBrief(existing: string, names: string[], tier: Tier | null, service: ServiceId | '' = ''): string {
  if (!names.length) return existing
  const line = packageLine(service, tier)
  if (!existing.trim()) return myPickBlock(names, line, true)
  const at = existing.indexOf(BRIEF_MARKER)
  if (at >= 0) {
    const rest = existing.slice(at)
    const m = rest.match(/^I'm interested in the following digital solutions for my business:\n(?:\n?- .*)*(?:\n+(?:Recommended [Pp]ackage|Recommended solution|Selected service): .*)?/)
    const len = m ? m[0].length : BRIEF_MARKER.length
    return existing.slice(0, at) + myPickBlock(names, line, false) + existing.slice(at + len)
  }
  return `${existing.trimEnd()}\n\n${myPickBlock(names, line, false)}`
}

/* ---------- Payload ---------- */

export interface SignUpPayload {
  submittedAt: string
  fullName: string
  companyName: string
  businessEmail: string
  contactNumber: string
  /** The customer's own choice (package identifier: discovery | essential | dynamic). */
  service: ServiceId
  /** How that choice was made: picked by the customer, from a package link, or our preselected suggestion they kept. */
  serviceSource: ServiceSource
  /** Our automated suggestion from My Pick, kept separate from the customer's choice. */
  recommendedPackage: { status: 'recommended' | 'pending'; tier: 'essential' | 'dynamic' | null } | null
  /** Individual solutions from My Pick, as structured data. */
  selectedSolutions: { id: string; name: string }[]
  businessBrief: string
  sharedLink: string
  files: { name: string; size: number; type: string }[]
  /** Everything in My Pick (solutions, Discovery, packaged solutions). */
  myPick: { type: string; id: string; name: string; detail?: string }[]
  consent: { given: boolean; text: string; at: string }
  /** Bot signals for the server (same approach as the leads pages). */
  spamCheck: { honeypot: string; elapsedMs: number }
}

export function buildSignUpPayload(
  f: SignUpForm,
  serviceSource: ServiceSource,
  files: File[],
  picks: PickItem[],
  spamCheck: SignUpPayload['spamCheck'],
): SignUpPayload {
  const now = new Date().toISOString()
  const toolIds = picks.flatMap((p) => (p.kind === 'tool' ? [p.toolId] : []))
  const rec = recommendPackage(toolIds)
  return {
    submittedAt: now,
    fullName: f.name.trim(),
    companyName: f.company.trim(),
    businessEmail: f.email.trim(),
    contactNumber: f.phone.trim(),
    service: f.service as ServiceId,
    serviceSource,
    recommendedPackage: rec ? { status: rec.status, tier: rec.tier } : null,
    selectedSolutions: toolIds.map((id) => ({ id, name: digitalSolutionById(id)?.name ?? id })),
    businessBrief: f.brief.trim(),
    sharedLink: f.link.trim(),
    files: files.map((x) => ({ name: x.name, size: x.size, type: x.type })),
    myPick: picks.map((p) =>
      p.kind === 'tool'
        ? { type: 'solution', id: p.toolId, name: digitalSolutionById(p.toolId)?.name ?? p.toolId }
        : p.kind === 'discovery'
          ? { type: 'discovery', id: 'discovery', name: 'Discovery Consultation', detail: p.services.map((s) => DISCOVERY_SERVICES.find((d) => d.id === s)?.name ?? s).join(', ') }
          : { type: 'package', id: p.solutionId, name: solutionById(p.solutionId)?.name ?? p.solutionId, detail: p.selectedPackage },
    ),
    consent: { given: f.consent, text: SIGNUP_CONSENT_TEXT, at: now },
    spamCheck,
  }
}

export const SIGNUP_CONSENT_TEXT = CONSENT_TEXT.replace('my quotation request', 'my sign-up and enquiry')

/* ---------- Submit ---------- */

export type SignUpResult = { ok: true; reference: string } | { ok: false; error: string; showFallback: boolean }

const ENDPOINT = import.meta.env.VITE_SIGNUP_ENDPOINT as string | undefined

/** Soft client-side throttle (FormSubmit / your backend do the real limiting). */
let lastSubmit = 0
const MIN_GAP_MS = 15_000

const SERVICE_NAME: Record<ServiceId, string> = { discovery: 'Discovery', essential: 'Essential', dynamic: 'Dynamic' }
const SOURCE_TEXT: Record<ServiceSource, string> = {
  manual: 'Chosen by the visitor',
  explicit: 'From a solution link',
  recommended: 'Our My Pick suggestion (kept by the visitor)',
  '': '-',
}

/** Readable email fields for FormSubmit's table template. */
function emailFields(p: SignUpPayload): Record<string, string> {
  const rec = p.recommendedPackage
  const otherPicks = p.myPick.filter((x) => x.type !== 'solution')
  return {
    Form: 'Get Started (sign-up)',
    'Full name': p.fullName,
    'Company / business name': p.companyName,
    Email: p.businessEmail,
    'Contact number': p.contactNumber,
    'Service chosen': SERVICE_NAME[p.service],
    'How the service was chosen': SOURCE_TEXT[p.serviceSource],
    'Recommended solution (My Pick)': rec ? (rec.tier ? SERVICE_NAME[rec.tier] : 'Pending review') : '-',
    'Selected solutions': p.selectedSolutions.map((s) => s.name).join(', ') || '-',
    'Other My Pick items': otherPicks.map((x) => (x.detail ? `${x.name} (${x.detail})` : x.name)).join('; ') || '-',
    'Business brief': p.businessBrief || '-',
    'Shared link (not opened by the site)': p.sharedLink || '-',
    'Uploaded files': p.files.map((f) => `${f.name} (${formatBytes(f.size)})`).join(', ') || '-',
    Consent: `Agreed at ${p.consent.at}: ${p.consent.text}`,
    'Sent from': typeof location !== 'undefined' ? location.href : '-',
    'Submitted at': p.submittedAt,
    // Structured copy for importing into a CRM later.
    'Data (JSON)': JSON.stringify({
      service: p.service,
      serviceSource: p.serviceSource,
      recommendedPackage: p.recommendedPackage,
      selectedSolutions: p.selectedSolutions,
    }),
    _subject: `New sign-up: ${p.companyName} (${SERVICE_NAME[p.service]})`,
    _replyto: p.businessEmail,
    _honey: p.spamCheck.honeypot,
  }
}

export async function submitSignUp(payload: SignUpPayload, files: File[]): Promise<SignUpResult> {
  const now = Date.now()
  if (now - lastSubmit < MIN_GAP_MS) return { ok: false, error: 'Please wait a few seconds before sending again.', showFallback: false }
  lastSubmit = now
  const reference = `FF-${now.toString(36).toUpperCase().slice(-6)}`

  if (ENDPOINT) {
    try {
      const body = new FormData()
      body.append('payload', JSON.stringify(payload))
      files.forEach((f) => body.append('files', f, f.name))
      const res = await fetch(ENDPOINT, { method: 'POST', body })
      if (res.status === 429) return { ok: false, error: 'Too many attempts. Please try again in a minute.', showFallback: false }
      if (!res.ok) return { ok: false, error: `The server responded with ${res.status}. Please try again.`, showFallback: true }
      const data = (await res.json().catch(() => ({}))) as { reference?: string }
      return { ok: true, reference: data.reference ?? reference }
    } catch {
      return { ok: false, error: "We couldn't reach the server. Check your connection and try again.", showFallback: true }
    }
  }

  const r = await sendViaFormSubmit({ ...emailFields(payload), Reference: reference }, files)
  if (r.ok) return { ok: true, reference }
  lastSubmit = 0 // let them retry straight away
  return { ok: false, error: sendErrorMessage(r), showFallback: true }
}

export const FALLBACK = { whatsapp: FORMS.whatsappNumber, email: FORMS.contactEmail }
