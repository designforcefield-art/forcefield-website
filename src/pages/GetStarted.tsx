import { AlertCircle, Check, CheckCircle2, FileText, Loader2, RotateCcw, Upload, X } from 'lucide-react'
import { useToast } from '../components/ui/Toast'
import { useEffect, useId, useMemo, useRef, useState, type DragEvent, type FormEvent } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { SocialLinks } from '../components/SocialLinks'
import { PackageGlyph } from '../components/AbstractIcon'
import { SpamCheck, useSpamCheck } from '../components/SpamCheck'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { Button, Container, SectionHeading, cn } from '../components/ui/primitives'
import { SITE } from '../data/catalogue'
import { submitContactEnquiry, type ContactEnquiry } from '../lib/quote'
import {
  ACCEPT_ATTR,
  EMPTY_SIGNUP,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  FALLBACK,
  shrinkImage,
  SERVICE_CARDS,
  SIGNUP_CONSENT_TEXT,
  buildSignUpPayload,
  checkFile,
  clearDraft,
  loadDraft,
  mergeMyPickBrief,
  syncBriefPackageLine,
  saveDraft,
  type ServiceSource,
  type SignUpDraft,
  formatBytes,
  isServiceId,
  submitSignUp,
  validateSignUp,
  type SignUpErrors,
  type SignUpForm,
} from '../lib/signup'
import { usePicks } from '../state/PickContext'
import { digitalSolutionById, recommendPackage } from '../data/solutionsCatalogue'

type Tab = 'signup' | 'enquiry'

/**
 * Combined Sign Up & Enquiry page.
 *  /get-started            → Get Started tab (?service=discovery|essential|dynamic preselects)
 *  /contact                → General Enquiry tab
 * Both forms stay mounted, so switching tabs keeps what the visitor entered.
 */
export default function GetStarted() {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const initialTab: Tab = params.get('tab') === 'enquiry' || (pathname.startsWith('/contact') && params.get('tab') !== 'signup') ? 'enquiry' : 'signup'
  const [tab, setTab] = useState<Tab>(initialTab)
  const tabIds = { signup: 'tab-signup', enquiry: 'tab-enquiry' }
  const panelIds = { signup: 'panel-signup', enquiry: 'panel-enquiry' }
  const tabs: { id: Tab; label: string }[] = [
    { id: 'signup', label: 'Get Started' },
    { id: 'enquiry', label: 'General Enquiry' },
  ]
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ signup: null, enquiry: null })
  const onTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const next: Tab = tab === 'signup' ? 'enquiry' : 'signup'
    setTab(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <Container className="grid gap-12 pt-12 sm:pt-16 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
      <div className="flex flex-col gap-8">
        <SectionHeading
          as="h1"
          title="Let's get started."
          lead="Sign up for a package, or send us a general question. We'll review your details and get back to you."
        />
        {(SITE.email || SITE.phone) && (
          <dl className="flex flex-col gap-3 text-sm">
            {SITE.email && (<div><dt className="text-subtle">Email</dt><dd className="select-all">{SITE.email}</dd></div>)}
            {SITE.phone && (<div><dt className="text-subtle">Phone</dt><dd className="select-all">{SITE.phone}</dd></div>)}
          </dl>
        )}
        <SocialLinks />
      </div>

      <div className="min-w-0 rounded-panel border border-line bg-surface p-6 sm:p-9">
        <div role="tablist" aria-label="Choose a form" className="mb-8 grid grid-cols-2 gap-1 rounded-full bg-canvas p-1 shadow-pressed" onKeyDown={onTabKey}>
          {tabs.map((t) => (
            <button
              key={t.id}
              ref={(el) => { tabRefs.current[t.id] = el }}
              id={tabIds[t.id]}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              aria-controls={panelIds[t.id]}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
              className={cn(
                'h-10 rounded-full text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-electric/60',
                tab === t.id ? 'bg-electric text-white shadow-btn-accent' : 'text-muted hover:text-fg',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div id={panelIds.signup} role="tabpanel" aria-labelledby={tabIds.signup} hidden={tab !== 'signup'}>
          <GetStartedForm initialService={params.get('service')} fromMyPick={params.get('from') === 'mypick'} />
        </div>
        <div id={panelIds.enquiry} role="tabpanel" aria-labelledby={tabIds.enquiry} hidden={tab !== 'enquiry'}>
          <EnquiryForm />
        </div>
      </div>
    </Container>
  )
}

/* ================================================================== */
/* Get Started                                                         */
/* ================================================================== */

function GetStartedForm({ initialService, fromMyPick }: { initialService: string | null; fromMyPick: boolean }) {
  const { picks } = usePicks()
  // Initial state: saved draft → explicit package link → My Pick recommendation.
  // Coming from My Pick is a fresh request, so its recommendation replaces an earlier choice.
  const [init] = useState(() => {
    const draft = loadDraft()
    const form: SignUpForm = { ...EMPTY_SIGNUP, ...pickFormFields(draft) }
    let source: ServiceSource = draft.serviceSource ?? ''
    if (isServiceId(initialService)) {
      form.service = initialService
      source = 'explicit'
    } else if (fromMyPick) {
      const toolIds = picks.flatMap((p) => (p.kind === 'tool' ? [p.toolId] : []))
      const rec = recommendPackage(toolIds)
      if (rec?.tier) {
        form.service = rec.tier
        source = 'recommended'
      }
      const names = toolIds.map((id) => digitalSolutionById(id)?.name ?? id)
      form.brief = mergeMyPickBrief(form.brief, names, rec?.tier ?? null, form.service)
    }
    return { form, source }
  })
  const [f, setF] = useState<SignUpForm>(init.form)
  // Current My Pick recommendation (only meaningful when the brief carries the My Pick list).
  const recTier = useMemo(() => {
    const ids = picks.flatMap((p) => (p.kind === 'tool' ? [p.toolId] : []))
    return ids.length ? (recommendPackage(ids)?.tier ?? null) : null
  }, [picks])
  const [serviceSource, setServiceSource] = useState<ServiceSource>(init.source)
  useEffect(() => {
    const { consent: _c, ...rest } = f
    void _c
    saveDraft({ ...rest, serviceSource })
  }, [f, serviceSource])
  const [files, setFiles] = useState<File[]>([])
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const spam = useSpamCheck()
  const [errors, setErrors] = useState<SignUpErrors>({})
  const [tried, setTried] = useState(false)
  const [phase, setPhase] = useState<'form' | 'sending' | 'done'>('form')
  const [result, setResult] = useState<{ reference: string } | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showFallback, setShowFallback] = useState(false)

  const set = <K extends keyof SignUpForm>(k: K, val: SignUpForm[K]) => {
    const next = { ...f, [k]: val }
    setF(next)
    if (tried) setErrors(validateSignUp(next, errors.captcha ? spam.error() : null))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    setServerError(null)
    const spamError = spam.error()
    if (spamError && spam.answer.trim()) spam.regenerate() // wrong answer: new sum
    const errs = validateSignUp(f, spamError)
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) {
      document.getElementById(first === 'service' ? 'gs-service-discovery' : `gs-${first}`)?.focus()
      return
    }
    if (spam.isBot()) return // silently drop, like the leads pages
    if (spam.tooFast()) {
      setServerError('That was quick! Please check your details and submit again.')
      return
    }
    setPhase('sending')
    setShowFallback(false)
    const r = await submitSignUp(buildSignUpPayload(f, serviceSource, files, picks, spam.meta()), files)
    if (!r.ok) {
      setServerError(r.error)
      setShowFallback(r.showFallback)
      setPhase('form')
      spam.regenerate()
      return
    }
    clearDraft()
    setResult({ reference: r.reference })
    setPhase('done')
  }

  const toast = useToast()
  /** Clear every field (files, link, brief, service, consent, spam check), with Undo. */
  const clearAll = () => {
    const snapshot = { f, files, serviceSource }
    setF(EMPTY_SIGNUP)
    setServiceSource('')
    setFiles([])
    setFileErrors([])
    setErrors({})
    setTried(false)
    setServerError(null)
    spam.regenerate()
    clearDraft()
    document.getElementById('gs-name')?.focus()
    toast({
      title: 'Form cleared',
      tone: 'info',
      action: {
        label: 'Undo',
        onClick: () => {
          setF(snapshot.f)
          setFiles(snapshot.files)
          setServiceSource(snapshot.serviceSource)
        },
      },
    })
  }

  const reset = () => {
    setF(EMPTY_SIGNUP)
    setServiceSource('')
    setFiles([])
    setFileErrors([])
    setErrors({})
    setTried(false)
    setResult(null)
    spam.reset()
    setPhase('form')
  }

  if (phase === 'done' && result)
    return (
      <div className="flex flex-col items-center gap-5 py-10 text-center">
        <span className="grid size-16 animate-pop place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </span>
        <h2 className="text-h3 font-normal">Thanks, {f.name.split(' ')[0]}. You're signed up.</h2>
        <p className="max-w-md text-muted">
          We'll review your details for {SERVICE_CARDS.find((s) => s.id === f.service)?.name} and get in touch to confirm the next steps.
          {result.reference && <> Your reference is <span className="font-mono text-fg">{result.reference}</span>.</>}
        </p>
        <Button variant="secondary" onClick={reset}>Start a new sign-up</Button>
      </div>
    )

  const toolCount = picks.filter((p) => p.kind === 'tool').length

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-8">
      {/* 1–4: Contact details */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="gs-name" label="Full Name" error={errors.name}>
          {({ id, describedBy, invalid }) => <Input id={id} autoComplete="name" value={f.name} onChange={(e) => set('name', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} aria-required />}
        </Field>
        <Field id="gs-company" label="Company / Business Name" error={errors.company}>
          {({ id, describedBy, invalid }) => <Input id={id} autoComplete="organization" value={f.company} onChange={(e) => set('company', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} aria-required />}
        </Field>
        <Field id="gs-email" label="Email" error={errors.email}>
          {({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="email" inputMode="email" value={f.email} onChange={(e) => set('email', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} aria-required />}
        </Field>
        <Field id="gs-phone" label="Contact Number" error={errors.phone}>
          {({ id, describedBy, invalid }) => <Input id={id} type="tel" autoComplete="tel" inputMode="tel" placeholder="+65" value={f.phone} onChange={(e) => set('phone', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} aria-required />}
        </Field>
      </div>

      {/* 5: Service */}
      <ServiceCards
        value={f.service}
        onChange={(v) => {
          setF((prev) => ({ ...prev, service: v, brief: syncBriefPackageLine(prev.brief, v, recTier) }))
          setServiceSource(v === recTier ? 'recommended' : 'manual')
        }}
        error={errors.service}
        note={
          recTier && f.service === recTier
            ? `Recommended from your My Pick selection. You can change it.`
            : recTier && f.service
              ? `We recommended ${recTier === 'essential' ? 'Essential' : 'Dynamic'} for your My Pick selection. You’ve chosen ${f.service === 'discovery' ? 'Discovery' : f.service === 'essential' ? 'Essential' : 'Dynamic'}.`
              : undefined
        }
      />

      {/* 6–8: Tell us more */}
      <fieldset className="flex flex-col gap-5 border-t border-line pt-8">
        <legend className="sr-only">Tell us more about your business (Optional)</legend>
        <div aria-hidden="true">
          <p className="text-base font-medium text-fg">
            Tell us more about your business <span className="font-normal text-subtle">(Optional)</span>
          </p>
          <p className="mt-1 text-sm text-muted">Share your business details, requirements, or brand materials in whichever way is easiest for you.</p>
        </div>
        <Field id="gs-brief" label="Business Brief" optional>
          {({ id }) => (
            <Textarea
              id={id}
              rows={4}
              placeholder="Tell us about your business, what you need, or what you're hoping to achieve."
              value={f.brief}
              onChange={(e) => set('brief', e.target.value)}
            />
          )}
        </Field>
        <Field id="gs-link" label="Share a Link" optional hint="Please make sure our team has permission to access your shared files." error={errors.link}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="Paste a Google Drive, Dropbox, or other shared link"
              value={f.link}
              onChange={(e) => set('link', e.target.value)}
              aria-invalid={invalid}
              aria-describedby={describedBy}
            />
          )}
        </Field>
        <FileUpload files={files} setFiles={setFiles} problems={fileErrors} setProblems={setFileErrors} />
      </fieldset>

      {toolCount > 0 && (
        <p className="flex items-center gap-2 rounded-xl border border-line bg-canvas/40 px-4 py-3 text-sm text-muted">
          <Check className="size-4 shrink-0 text-cyan" aria-hidden="true" />
          {toolCount} {toolCount === 1 ? 'solution' : 'solutions'} from My Pick will be included.
        </p>
      )}

      {/* 9–10: Consent, CAPTCHA */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm', errors.consent ? 'border-danger/60' : 'border-line')}>
            <input
              id="gs-consent"
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 accent-electric-bright"
              checked={f.consent}
              onChange={(e) => set('consent', e.target.checked)}
              aria-invalid={!!errors.consent}
              aria-describedby={errors.consent ? 'gs-consent-err' : undefined}
            />
            <span className="text-muted">{SIGNUP_CONSENT_TEXT}</span>
          </label>
          {errors.consent && <p id="gs-consent-err" role="alert" className="text-xs font-medium text-danger">{errors.consent}</p>}
        </div>
        <SpamCheck id="gs-captcha" state={spam} error={errors.captcha} />
      </div>

      {serverError && <SendError message={serverError} fallback={showFallback} />}

      {/* 11: Submit, plus Clear All */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={phase === 'sending'} className="w-full sm:w-fit">
          {phase === 'sending' ? <><Loader2 className="size-4 animate-spin" aria-hidden="true" /> Sending your details…</> : 'Get Started'}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={clearAll} disabled={phase === 'sending'} className="w-full sm:w-fit">
          <RotateCcw className="size-4" aria-hidden="true" /> Clear All
        </Button>
      </div>
    </form>
  )
}

function ServiceCards({ value, onChange, error, note }: { value: string; onChange: (v: SignUpForm['service']) => void; error?: string; note?: string }) {
  const name = useId()
  return (
    <fieldset className="flex flex-col gap-3" aria-describedby={error ? 'gs-service-err' : undefined}>
      <legend className="mb-3 text-base font-medium text-fg">Choose your service</legend>
      <div role="radiogroup" aria-required="true" aria-invalid={!!error} className="grid gap-3 md:grid-cols-3">
        {SERVICE_CARDS.map((s) => {
          const on = value === s.id
          return (
            <label
              key={s.id}
              className={cn(
                'relative flex h-full cursor-pointer flex-col gap-3 rounded-card border p-4 transition-colors',
                'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-electric/60',
                on ? 'border-electric bg-electric/12' : error ? 'border-danger/50 bg-canvas/40 hover:border-line-strong' : 'border-line bg-canvas/40 hover:border-line-strong',
              )}
            >
              <input
                id={`gs-service-${s.id}`}
                type="radio"
                name={name}
                value={s.id}
                checked={on}
                onChange={() => onChange(s.id)}
                className="sr-only"
              />
              <span className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2.5">
                  <PackageGlyph tier={s.id} size="sm" className="size-9" />
                  <span className="text-sm font-medium text-fg">{s.name}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={cn('grid size-5 place-items-center rounded-full border', on ? 'border-electric bg-electric text-white' : 'border-line-strong')}
                >
                  {on && <Check className="size-3" />}
                </span>
              </span>
              <span className="text-base leading-snug text-fg">{s.headline}</span>
              <span className="text-small text-muted">{s.description}</span>
            </label>
          )
        })}
      </div>
      {error && <p id="gs-service-err" role="alert" className="text-xs font-medium text-danger">{error}</p>}
      {!error && note && <p className="text-xs text-subtle">{note}</p>}
    </fieldset>
  )
}

function FileUpload({
  files,
  setFiles,
  problems,
  setProblems,
}: {
  files: File[]
  setFiles: (f: File[]) => void
  problems: string[]
  setProblems: (p: string[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const [preparing, setPreparing] = useState(false)
  const total = files.reduce((n, f) => n + f.size, 0)

  const addFiles = async (list: FileList | null) => {
    if (!list || !list.length) return
    const incoming = Array.from(list)
    if (inputRef.current) inputRef.current.value = ''
    setPreparing(true)
    const next = [...files]
    const issues: string[] = []
    let running = next.reduce((n, f) => n + f.size, 0)
    for (const original of incoming) {
      if (next.some((x) => x.name === original.name)) continue
      if (next.length >= MAX_FILES) {
        issues.push(`You can upload up to ${MAX_FILES} files. ${original.name} wasn't added.`)
        continue
      }
      const problem = checkFile(original)
      if (problem && !/^image\//.test(original.type)) {
        issues.push(problem)
        continue
      }
      const file = await shrinkImage(original) // large photos are reduced first
      const after = checkFile(file)
      if (after) {
        issues.push(after)
        continue
      }
      if (running + file.size > MAX_TOTAL_BYTES) {
        issues.push(`${file.name} (${formatBytes(file.size)}) would take you over the 10 MB total. Try a smaller file, or share it as a link instead.`)
        continue
      }
      running += file.size
      next.push(file)
    }
    setFiles(next)
    setProblems(issues)
    setPreparing(false)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p id="gs-files-label" className="flex items-baseline justify-between text-sm font-medium text-fg">
        Upload Files <span className="text-xs font-normal text-subtle">Optional</span>
      </p>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors',
          dragging ? 'border-electric bg-electric/10' : 'border-line-strong bg-canvas/40',
        )}
      >
        <Upload className="size-5 text-subtle" aria-hidden="true" />
        <p className="text-sm text-muted">
          Drag files here, or{' '}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={files.length >= MAX_FILES}
            className="font-medium text-cyan underline-offset-2 hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-electric/60 focus-visible:outline-none disabled:text-subtle"
            aria-describedby="gs-files-hint"
          >
            browse
          </button>
        </p>
        <input
          ref={inputRef}
          id="gs-files"
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          className="sr-only"
          tabIndex={-1}
          aria-labelledby="gs-files-label"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
      <p id="gs-files-hint" className="text-xs text-subtle">
        Upload your company profile, business requirements, brand guidelines, or other relevant documents. PDF, DOC, DOCX, JPG or PNG, up to {MAX_FILES} files and 10 MB in total. Large photos are reduced automatically.
      </p>
      {preparing && (
        <p className="flex items-center gap-2 text-xs text-subtle" role="status">
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> Preparing files…
        </p>
      )}
      {files.length > 0 && (
        <p className="text-xs text-subtle" aria-live="polite">
          {formatBytes(total)} of 10 MB used
        </p>
      )}
      {problems.length > 0 && (
        <ul role="alert" className="flex flex-col gap-1">
          {problems.map((p) => (
            <li key={p} className="text-xs font-medium text-danger">{p}</li>
          ))}
        </ul>
      )}
      {files.length > 0 && (
        <ul className="mt-1 flex flex-col gap-2" aria-label="Selected files">
          {files.map((file, i) => (
            <li key={`${file.name}-${file.size}`} className="flex items-center gap-3 rounded-xl border border-line bg-canvas/40 px-3 py-2.5">
              <FileText className="size-4 shrink-0 text-subtle" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-sm text-fg">{file.name}</span>
              <span className="shrink-0 text-xs text-subtle">{formatBytes(file.size)}</span>
              <button
                type="button"
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
                aria-label={`Remove ${file.name}`}
                className="grid size-7 shrink-0 place-items-center rounded-full text-subtle hover:bg-raised hover:text-fg focus-visible:ring-2 focus-visible:ring-electric/60 focus-visible:outline-none"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ================================================================== */
/* General Enquiry (the former Contact form, plus CAPTCHA)             */
/* ================================================================== */

const EMPTY_ENQUIRY: ContactEnquiry = { name: '', email: '', phone: '', type: '', message: '', consent: false }
const TYPES = ['General Enquiry', 'Package Enquiry', 'Careers & Opportunities', 'Other Enquiries']
type EnquiryErrors = Partial<Record<keyof ContactEnquiry | 'captcha', string>>

function validateEnquiry(e: ContactEnquiry, spamError: string | null): EnquiryErrors {
  const x: EnquiryErrors = {}
  if (!e.name.trim()) x.name = 'Please enter your name.'
  if (!e.email.trim()) x.email = 'Please enter your email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.email.trim())) x.email = 'That email doesn’t look right. Check for a missing “@” or domain.'
  if (e.phone.trim() && !/^[+\d][\d\s()-]{6,}$/.test(e.phone.trim())) x.phone = 'Use digits only, with an optional + country code.'
  if (!e.type) x.type = 'Choose the option closest to your enquiry.'
  if (e.message.trim().length < 10) x.message = 'Tell us a little more (at least 10 characters).'
  if (!e.consent) x.consent = 'Please confirm so we can use your details to reply.'
  if (spamError) x.captcha = spamError
  return x
}

function EnquiryForm() {
  const [v, setV] = useState(EMPTY_ENQUIRY)
  const spam = useSpamCheck()
  const [errors, setErrors] = useState<EnquiryErrors>({})
  const [tried, setTried] = useState(false)
  const [phase, setPhase] = useState<'form' | 'sending' | 'done'>('form')
  const [serverError, setServerError] = useState<string | null>(null)
  const [showFallback, setShowFallback] = useState(false)

  const toast = useToast()
  const clearAll = () => {
    const snapshot = v
    setV(EMPTY_ENQUIRY)
    setErrors({})
    setTried(false)
    setServerError(null)
    spam.regenerate()
    document.getElementById('c-name')?.focus()
    toast({ title: 'Form cleared', tone: 'info', action: { label: 'Undo', onClick: () => setV(snapshot) } })
  }

  const set = <K extends keyof ContactEnquiry>(k: K, val: ContactEnquiry[K]) => {
    const next = { ...v, [k]: val }
    setV(next)
    if (tried) setErrors(validateEnquiry(next, errors.captcha ? spam.error() : null))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    const spamError = spam.error()
    if (spamError && spam.answer.trim()) spam.regenerate()
    const errs = validateEnquiry(v, spamError)
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) {
      document.getElementById(`c-${first}`)?.focus()
      return
    }
    if (spam.isBot()) return
    if (spam.tooFast()) {
      setServerError('That was quick! Please check your details and submit again.')
      return
    }
    setServerError(null)
    setPhase('sending')
    setShowFallback(false)
    const r = await submitContactEnquiry({ ...v, spamCheck: spam.meta() })
    if (!r.ok) {
      setServerError(r.error)
      setShowFallback(r.showFallback)
      setPhase('form')
      spam.regenerate()
      return
    }
    setPhase('done')
  }

  if (phase === 'done')
    return (
      <div className="flex flex-col items-center gap-5 py-10 text-center">
        <span className="grid size-16 animate-pop place-items-center rounded-full bg-success/15 text-success"><CheckCircle2 className="size-8" aria-hidden="true" /></span>
        <h2 className="text-h3 font-normal">Thanks, {v.name.split(' ')[0]}.</h2>
        <p className="text-muted">We've received your message and will be in touch.</p>
        <Button variant="secondary" onClick={() => { setV(EMPTY_ENQUIRY); setTried(false); setErrors({}); spam.reset(); setPhase('form') }}>Send another message</Button>
      </div>
    )

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="c-name" label="Name" error={errors.name}>
          {({ id, describedBy, invalid }) => <Input id={id} autoComplete="name" value={v.name} onChange={(e) => set('name', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} aria-required />}
        </Field>
        <Field id="c-email" label="Email" error={errors.email}>
          {({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="email" value={v.email} onChange={(e) => set('email', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} aria-required />}
        </Field>
        <Field id="c-phone" label="Contact number" optional error={errors.phone}>
          {({ id, describedBy, invalid }) => <Input id={id} type="tel" autoComplete="tel" placeholder="+65" value={v.phone} onChange={(e) => set('phone', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />}
        </Field>
        <Field id="c-type" label="Enquiry type" error={errors.type}>
          {({ id, describedBy, invalid }) => (
            <Select id={id} value={v.type} onChange={(e) => set('type', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} aria-required>
              <option value="" disabled>Choose one</option>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </Select>
          )}
        </Field>
        <Field id="c-message" label="Message" error={errors.message} className="sm:col-span-2">
          {({ id, describedBy, invalid }) => <Textarea id={id} rows={5} value={v.message} onChange={(e) => set('message', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} aria-required />}
        </Field>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm', errors.consent ? 'border-danger/60' : 'border-line')}>
          <input id="c-consent" type="checkbox" className="mt-0.5 size-4 shrink-0 accent-electric-bright" checked={v.consent} onChange={(e) => set('consent', e.target.checked)} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'c-consent-err' : undefined} />
          <span className="text-muted">I agree that Forcefield Design may use these details to reply to my enquiry.</span>
        </label>
        {errors.consent && <p id="c-consent-err" role="alert" className="text-xs font-medium text-danger">{errors.consent}</p>}
      </div>
      <SpamCheck id="c-captcha" state={spam} error={errors.captcha} />
      {serverError && <SendError message={serverError} fallback={showFallback} />}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={phase === 'sending'} className="w-full sm:w-fit">
          {phase === 'sending' ? <><Loader2 className="size-4 animate-spin" aria-hidden="true" /> Sending…</> : 'Send message'}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={clearAll} disabled={phase === 'sending'} className="w-full sm:w-fit">
          <RotateCcw className="size-4" aria-hidden="true" /> Clear All
        </Button>
      </div>
    </form>
  )
}

/** Only the text fields we keep in the session draft. */
function pickFormFields(d: Partial<SignUpDraft>): Partial<SignUpForm> {
  const out: Partial<SignUpForm> = {}
  for (const k of ['name', 'company', 'email', 'phone', 'brief', 'link'] as const) if (typeof d[k] === 'string') out[k] = d[k]
  if (isServiceId(d.service)) out.service = d.service
  return out
}

/** Send error, with the WhatsApp / email fallback used on the leads pages. */
function SendError({ message, fallback }: { message: string; fallback: boolean }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="font-medium text-fg">{message}</p>
        {fallback && (
          <p className="text-muted">
            You can also reach us{' '}
            <a className="font-medium text-fg underline underline-offset-2" href={`https://wa.me/${FALLBACK.whatsapp}`} target="_blank" rel="noopener noreferrer">
              on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
            </a>{' '}
            or email{' '}
            <a className="font-medium text-fg underline underline-offset-2" href={`mailto:${FALLBACK.email}`}>
              {FALLBACK.email}
            </a>
            .
          </p>
        )}
      </div>
    </div>
  )
}
