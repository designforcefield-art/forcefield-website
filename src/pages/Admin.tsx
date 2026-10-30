import { AlertTriangle, ArrowLeft, Download, LogOut, Mail, RefreshCw, Search } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Field, Input, Select } from '../components/ui/Field'
import { Badge, Button, Container, cn } from '../components/ui/primitives'
import { INDUSTRY_OPTIONS } from '../data/catalogue'
import { BUSINESS_GOALS, TOOL_CATEGORIES, digitalSolutionById } from '../data/solutionsCatalogue'

/**
 * Admin: enquiries from both website forms, and All Solutions usage stats.
 * Data comes from Cloudflare Pages Functions + D1. The password is checked on
 * the server (/api/admin/login), which returns a signed 12-hour session; only
 * that session is kept, for this browser tab.
 */
type Row = { value: string; n: number }
type AddRow = { value: string; adds: number; removes: number }
interface Stats {
  days: number
  industry: string | null
  totals: { adds?: number; removes?: number; sessions?: number; sessionsWithAdds?: number }
  adds: AddRow[]
  industries: Row[]
  goals: Row[]
  categories: Row[]
  searches: Row[]
  daily: { day: string; adds: number; sessions: number }[]
}

const KEY = 'ff.admin.session'
const RANGES = [
  { v: 7, label: 'Last 7 days' },
  { v: 30, label: 'Last 30 days' },
  { v: 90, label: 'Last 90 days' },
  { v: 3650, label: 'All time' },
]
const industryName = (id: string) => INDUSTRY_OPTIONS.find((o) => o.id === id)?.label ?? id
const goalName = (id: string) => BUSINESS_GOALS.find((g) => g.id === id)?.name ?? id
const categoryName = (id: string) => TOOL_CATEGORIES.find((c) => c.id === id)?.name ?? id
const solutionName = (id: string) => digitalSolutionById(id)?.name ?? id
const fmt = (n: number | undefined) => (n ?? 0).toLocaleString('en-SG')

export default function Admin() {
  const [session, setSession] = useState<string | null>(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem(KEY) || 'null') as { token: string; expiresAt: number } | null
      return s && s.expiresAt > Date.now() ? s.token : null
    } catch {
      return null
    }
  })
  const [tab, setTab] = useState<'enquiries' | 'stats'>('enquiries')
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const signOut = useCallback((message?: string) => {
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    setSession(null)
    setError(message ?? null)
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!draft) return
    setBusy(true)
    setError(null)
    try {
      // The password is checked on the server; the browser only keeps a signed, expiring session.
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: draft }) })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.token) {
        setError(data?.error ?? (res.status === 404 ? 'Admin is only available on the live site.' : `Could not log in (HTTP ${res.status}).`))
        return
      }
      try {
        sessionStorage.setItem(KEY, JSON.stringify(data))
      } catch {
        /* private mode: session lasts until reload */
      }
      setDraft('')
      setSession(data.token)
    } catch {
      setError('Could not reach the server. Admin is only available on the live site.')
    } finally {
      setBusy(false)
    }
  }

  if (!session) {
    return (
      <section className="py-section">
        <Container>
          <div className="mx-auto flex w-full max-w-md flex-col gap-8 rounded-panel border border-line bg-surface p-8 sm:p-10">
            <div className="flex flex-col gap-2">
              <h1 className="text-[2rem] leading-[1.15] font-normal tracking-[-0.02em]">Welcome Admin</h1>
              <p className="text-small text-muted">Log in to view enquiries and solution stats.</p>
            </div>
            <form onSubmit={submit} className="flex flex-col gap-5">
              <Field id="admin-pw" label="Password" error={error ?? undefined}>
                {({ id, describedBy, invalid }) => (
                  <Input id={id} type="password" autoComplete="current-password" autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />
                )}
              </Field>
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? 'Logging in…' : 'Login'}
              </Button>
            </form>
          </div>
        </Container>
      </section>
    )
  }

  const expired = () => signOut('Your session has ended. Please log in again.')
  return (
    <section className="py-section">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div role="tablist" aria-label="Admin sections" className="flex gap-1 rounded-full border border-line bg-surface p-1">
            {(
              [
                ['enquiries', 'Enquiries'],
                ['stats', 'All solution stats'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn('rounded-full px-4 py-2 text-sm font-medium transition-colors', tab === id ? 'bg-raised text-fg' : 'text-muted hover:text-fg')}
              >
                {label}
              </button>
            ))}
          </div>
          <Button variant="ghost" onClick={() => signOut()}>
            <LogOut className="size-4" aria-hidden="true" /> Sign out
          </Button>
        </div>
        {tab === 'enquiries' ? <EnquiriesView token={session} onExpired={expired} /> : <StatsView token={session} onExpired={expired} />}
      </Container>
    </section>
  )
}

function StatsView({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [days, setDays] = useState(30)
  const [industry, setIndustry] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/stats?days=${days}${industry ? `&industry=${industry}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      const data = await res.json().catch(() => null)
      if (res.status === 401) return onExpired()
      if (!res.ok || !data) {
        setError(data?.error ?? `Could not load stats (HTTP ${res.status}).`)
        return
      }
      setStats(data as Stats)
    } catch {
      setError('Could not reach the stats service.')
    } finally {
      setLoading(false)
    }
  }, [days, industry, token, onExpired])

  useEffect(() => {
    void load()
  }, [load])

  const t = stats?.totals ?? {}
  const conversion = t.sessions ? Math.round(((t.sessionsWithAdds ?? 0) / t.sessions) * 100) : 0

  const exportCsv = () => {
    if (!stats) return
    const lines = [['Solution', 'Added', 'Removed'], ...stats.adds.map((r) => [solutionName(r.value), r.adds, r.removes])]
    const csv = lines.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `my-pick-adds-${days}d${industry ? `-${industry}` : ''}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3">
            <h1 className="text-h2 font-normal">All solution stats</h1>
            <p className="text-small text-muted">Anonymous activity on the All Solutions page and solution cards. Times in Singapore time.</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <Field id="admin-range" label="Period">
              {({ id }) => (
                <Select id={id} value={days} onChange={(e) => setDays(Number(e.target.value))}>
                  {RANGES.map((r) => <option key={r.v} value={r.v}>{r.label}</option>)}
                </Select>
              )}
            </Field>
            <Field id="admin-industry" label="Industry">
              {({ id }) => (
                <Select id={id} value={industry} onChange={(e) => setIndustry(e.target.value)}>
                  <option value="">All industries</option>
                  {INDUSTRY_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </Select>
              )}
            </Field>
            <Button variant="secondary" onClick={() => load()} disabled={loading}>
              <RefreshCw className={cn('size-4', loading && 'animate-spin')} aria-hidden="true" /> Refresh
            </Button>
          </div>
        </div>

        {error && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-fg">{error}</p>}

        {stats && (
          <>
            {industry && <p className="text-small text-muted">Showing activity where the visitor had chosen <span className="text-fg">{industryName(industry)}</span>.</p>}
            <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Stat label="Added to My Pick" value={fmt(t.adds)} />
              <Stat label="Removed from My Pick" value={fmt(t.removes)} />
              <Stat label="Visits (browser tabs)" value={fmt(t.sessions)} />
              <Stat label="Visits that added a solution" value={`${conversion}%`} />
            </dl>

            <Daily rows={fillDays(stats.daily, days)} />

            <div className="grid gap-6 lg:grid-cols-2">
              <Panel
                title="Solutions added to My Pick"
                action={stats.adds.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={exportCsv}>
                    <Download className="size-4" aria-hidden="true" /> CSV
                  </Button>
                )}
              >
                <Bars rows={stats.adds.map((r) => ({ label: solutionName(r.value), n: r.adds, note: r.removes ? `${r.removes} removed` : undefined }))} empty="No solutions added yet." />
              </Panel>
              <div className="flex flex-col gap-6">
                <Panel title="Industries chosen (Step 1)">
                  <Bars rows={stats.industries.map((r) => ({ label: industryName(r.value), n: r.n }))} empty="No industries chosen yet." />
                </Panel>
                <Panel title="Goals chosen (Step 2)">
                  <Bars rows={stats.goals.map((r) => ({ label: goalName(r.value), n: r.n }))} empty="No goals chosen yet." />
                </Panel>
                <Panel title="Categories filtered">
                  <Bars rows={stats.categories.map((r) => ({ label: categoryName(r.value), n: r.n }))} empty="No categories used yet." />
                </Panel>
                <Panel title="Searches">
                  <Bars rows={stats.searches.map((r) => ({ label: `“${r.value}”`, n: r.n }))} empty="No searches yet." />
                </Panel>
              </div>
            </div>
          </>
        )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-panel border border-line bg-surface p-5">
      <dt className="text-small text-muted">{label}</dt>
      <dd className="mt-2 text-[2rem] leading-none font-normal tabular-nums [font-family:var(--font-display)]">{value}</dd>
    </div>
  )
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-panel border border-line bg-surface p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-item-title font-normal">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function Bars({ rows, empty }: { rows: { label: string; n: number; note?: string }[]; empty: string }) {
  const shown = rows.filter((r) => r.n > 0 || r.note)
  if (!shown.length) return <p className="text-small text-subtle">{empty}</p>
  const max = Math.max(...shown.map((r) => r.n), 1)
  return (
    <ol className="flex flex-col gap-2.5">
      {shown.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,11rem)_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[minmax(0,14rem)_1fr_auto]">
          <span className="truncate text-fg" title={r.label}>{r.label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-raised">
            <span className="block h-full rounded-full bg-electric" style={{ width: `${(r.n / max) * 100}%` }} />
          </span>
          <span className="text-right tabular-nums text-muted">
            {fmt(r.n)}
            {r.note && <span className="ml-2 text-xs text-subtle">{r.note}</span>}
          </span>
        </li>
      ))}
    </ol>
  )
}

/** One entry per day (Singapore time) across the period, so quiet days show as gaps. Max 90 days. */
function fillDays(rows: Stats['daily'], days: number): Stats['daily'] {
  const byDay = new Map(rows.map((r) => [r.day, r]))
  const sgToday = new Date(Date.now() + 8 * 3600_000)
  let span = Math.min(days, 90)
  if (days > 90 && rows.length) {
    const first = Date.parse(rows[0].day)
    span = Math.min(Math.max(Math.ceil((sgToday.getTime() - first) / 86400_000) + 1, 1), 365)
  }
  const out: Stats['daily'] = []
  for (let i = span - 1; i >= 0; i--) {
    const day = new Date(sgToday.getTime() - i * 86400_000).toISOString().slice(0, 10)
    out.push(byDay.get(day) ?? { day, adds: 0, sessions: 0 })
  }
  return out
}

function Daily({ rows }: { rows: Stats['daily'] }) {
  if (!rows.length) return null
  const max = Math.max(...rows.map((r) => r.adds), 1)
  return (
    <div className="rounded-panel border border-line bg-surface p-6">
      <h2 className="mb-4 text-item-title font-normal">Added to My Pick per day</h2>
      <div className="flex h-32 items-end gap-1" role="img" aria-label="Daily additions to My Pick">
        {rows.map((r) => (
          <div key={r.day} className="group relative flex h-full flex-1 items-end" title={`${r.day}: ${r.adds} added, ${r.sessions} visits`}>
            <div className="w-full rounded-t bg-electric/80 group-hover:bg-electric" style={{ height: `${Math.max((r.adds / max) * 100, r.adds ? 4 : 1)}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-subtle">
        <span>{rows[0].day}</span>
        <span>{rows[rows.length - 1].day}</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Enquiries                                                           */
/* ------------------------------------------------------------------ */
type EnquiryStatus = 'new' | 'contacted' | 'in_progress' | 'closed'
type EmailStatus = 'pending' | 'sent' | 'failed'
interface EnquiryRow {
  id: number
  reference: string
  form: 'get-started' | 'general'
  enquiry_type: string
  service: string | null
  name: string
  email: string
  company: string | null
  status: EnquiryStatus
  email_status: EmailStatus
  created_at: string
}
interface EnquiryDetail extends EnquiryRow {
  phone: string | null
  message: string | null
  shared_link: string | null
  consent_text: string
  source_page: string | null
  email_attempts: number
  email_error: string | null
  updated_at: string
  details: { serviceSource?: string; recommendation?: string; selectedSolutions?: { id: string; name: string }[]; otherPicks?: string[] } | null
  attachments: { name: string; size: number }[]
}
const STATUS_LABEL: Record<EnquiryStatus, string> = { new: 'New', contacted: 'Contacted', in_progress: 'In progress', closed: 'Closed' }
const SERVICE_LABEL: Record<string, string> = { discovery: 'Discovery Consultation', essential: 'Essential Solution', dynamic: 'Dynamic Solution' }
const when = (iso: string) => new Date(iso).toLocaleString('en-SG', { timeZone: 'Asia/Singapore', dateStyle: 'medium', timeStyle: 'short' })
const what = (r: EnquiryRow) => (r.form === 'get-started' ? `Sign up · ${SERVICE_LABEL[r.service ?? ''] ?? r.service}` : r.enquiry_type)

function EmailBadge({ s }: { s: EmailStatus }) {
  if (s === 'sent') return <Badge tone="success">Email sent</Badge>
  if (s === 'failed') return <Badge tone="danger">Email failed</Badge>
  return <Badge tone="warning">Email pending</Badge>
}

function useAdminFetch(token: string, onExpired: () => void) {
  return useCallback(
    async (path: string, init?: RequestInit) => {
      const res = await fetch(path, { ...init, headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, cache: 'no-store' })
      const data = await res.json().catch(() => null)
      if (res.status === 401) {
        onExpired()
        throw new Error('expired')
      }
      if (!res.ok) throw new Error(data?.error ?? `Request failed (HTTP ${res.status}).`)
      return data
    },
    [token, onExpired],
  )
}

function EnquiriesView({ token, onExpired }: { token: string; onExpired: () => void }) {
  const api = useAdminFetch(token, onExpired)
  const [status, setStatus] = useState('')
  const [email, setEmail] = useState('')
  const [form, setForm] = useState('')
  const [q, setQ] = useState('')
  const [query, setQuery] = useState('')
  const [offset, setOffset] = useState(0)
  const [data, setData] = useState<{ items: EnquiryRow[]; total: number; pageSize: number; counts: Record<string, number> } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [openId, setOpenId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const p = new URLSearchParams()
    if (status) p.set('status', status)
    if (email) p.set('email', email)
    if (form) p.set('form', form)
    if (query) p.set('q', query)
    if (offset) p.set('offset', String(offset))
    try {
      setData(await api(`/api/admin/enquiries?${p}`))
    } catch (e) {
      if ((e as Error).message !== 'expired') setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [api, status, email, form, query, offset])

  useEffect(() => {
    void load()
  }, [load])

  if (openId !== null) return <EnquiryDetailView id={openId} api={api} onBack={() => { setOpenId(null); void load() }} />

  const c = data?.counts ?? {}
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-h2 font-normal">Enquiries</h1>
        <p className="text-small text-muted">From the Get Started and General Enquiry forms. Times in Singapore time.</p>
      </div>

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="New" value={fmt(c.new)} />
        <Stat label="In progress" value={fmt((c.contacted ?? 0) + (c.in_progress ?? 0))} />
        <Stat label="Closed" value={fmt(c.closed)} />
        <Stat label="Email failed" value={fmt(c.failed)} />
      </dl>

      {(c.failed ?? 0) > 0 && !email && (
        <button type="button" onClick={() => { setEmail('failed'); setOffset(0) }} className="flex items-center gap-2 self-start rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-left text-sm text-fg">
          <AlertTriangle className="size-4 shrink-0 text-danger" aria-hidden="true" />
          {c.failed} notification email{c.failed === 1 ? '' : 's'} failed. The enquiries are saved here. Show them
        </button>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <form
          className="flex min-w-[14rem] flex-1 items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            setOffset(0)
            setQuery(q.trim())
          }}
        >
          <Field id="enq-q" label="Search" className="flex-1">
            {({ id }) => <Input id={id} type="search" placeholder="Name, email, company or reference" value={q} onChange={(e) => setQ(e.target.value)} />}
          </Field>
          <Button type="submit" variant="secondary" aria-label="Search">
            <Search className="size-4" aria-hidden="true" />
          </Button>
        </form>
        <Field id="enq-status" label="Status">
          {({ id }) => (
            <Select id={id} value={status} onChange={(e) => { setStatus(e.target.value); setOffset(0) }}>
              <option value="">All statuses</option>
              {(Object.keys(STATUS_LABEL) as EnquiryStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </Select>
          )}
        </Field>
        <Field id="enq-form" label="Form">
          {({ id }) => (
            <Select id={id} value={form} onChange={(e) => { setForm(e.target.value); setOffset(0) }}>
              <option value="">Both forms</option>
              <option value="get-started">Get Started</option>
              <option value="general">General Enquiry</option>
            </Select>
          )}
        </Field>
        <Field id="enq-email" label="Email">
          {({ id }) => (
            <Select id={id} value={email} onChange={(e) => { setEmail(e.target.value); setOffset(0) }}>
              <option value="">Any</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </Select>
          )}
        </Field>
        <Button variant="secondary" onClick={() => load()} disabled={loading}>
          <RefreshCw className={cn('size-4', loading && 'animate-spin')} aria-hidden="true" /> Refresh
        </Button>
      </div>

      {error && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-fg">{error}</p>}

      {data && (
        <div className="overflow-hidden rounded-panel border border-line bg-surface">
          {data.items.length === 0 ? (
            <p className="p-6 text-small text-subtle">No enquiries match these filters.</p>
          ) : (
            <ul className="divide-y divide-line">
              {data.items.map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => setOpenId(r.id)} className="grid w-full gap-2 px-5 py-4 text-left transition-colors hover:bg-raised/60 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_auto_auto] md:items-center md:gap-4">
                    <span className="min-w-0">
                      <span className="block truncate text-fg">{r.name}{r.company ? <span className="text-muted"> · {r.company}</span> : null}</span>
                      <span className="block truncate text-xs text-subtle">{r.email} · {r.reference}</span>
                    </span>
                    <span className="min-w-0 truncate text-sm text-muted">{what(r)}</span>
                    <span className="flex flex-wrap gap-2">
                      <Badge tone={r.status === 'new' ? 'electric' : r.status === 'closed' ? 'neutral' : 'cyan'}>{STATUS_LABEL[r.status]}</Badge>
                      {r.email_status !== 'sent' && <EmailBadge s={r.email_status} />}
                    </span>
                    <span className="text-xs whitespace-nowrap text-subtle md:text-right">{when(r.created_at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {data && data.total > data.pageSize && (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            {offset + 1}–{Math.min(offset + data.pageSize, data.total)} of {fmt(data.total)}
          </span>
          <span className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(offset - data.pageSize, 0))}>Previous</Button>
            <Button variant="secondary" size="sm" disabled={offset + data.pageSize >= data.total} onClick={() => setOffset(offset + data.pageSize)}>Next</Button>
          </span>
        </div>
      )}
    </div>
  )
}

function EnquiryDetailView({ id, api, onBack }: { id: number; api: (path: string, init?: RequestInit) => Promise<any>; onBack: () => void }) {
  const [d, setD] = useState<EnquiryDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      setD(await api(`/api/admin/enquiries/${id}`))
    } catch (e) {
      if ((e as Error).message !== 'expired') setError((e as Error).message)
    }
  }, [api, id])
  useEffect(() => {
    void load()
  }, [load])

  const setStatus = async (status: EnquiryStatus) => {
    setBusy(true)
    setNote(null)
    try {
      await api(`/api/admin/enquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setD((x) => (x ? { ...x, status } : x))
      setNote('Status updated.')
    } catch (e) {
      if ((e as Error).message !== 'expired') setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const resend = async () => {
    setBusy(true)
    setNote(null)
    setError(null)
    try {
      await api(`/api/admin/enquiries/${id}/resend`, { method: 'POST' })
      setNote('Notification email sent.')
      await load()
    } catch (e) {
      if ((e as Error).message !== 'expired') setError((e as Error).message)
      await load()
    } finally {
      setBusy(false)
    }
  }

  const isSignUp = d?.form === 'get-started'
  const rows: [string, React.ReactNode][] = d
    ? ([
        ['Reference', d.reference],
        ['Received', when(d.created_at)],
        ['Form', isSignUp ? 'Get Started (sign-up)' : 'General Enquiry'],
        ['Enquiry type', d.enquiry_type],
        isSignUp && ['Service chosen', SERVICE_LABEL[d.service ?? ''] ?? d.service],
        isSignUp && d.details?.serviceSource && ['How it was chosen', d.details.serviceSource],
        isSignUp && ['Recommended (My Pick)', d.details?.recommendation || '-'],
        isSignUp && ['Selected solutions', d.details?.selectedSolutions?.map((s) => s.name).join(', ') || '-'],
        isSignUp && d.details?.otherPicks?.length && ['Other My Pick items', d.details.otherPicks.join('; ')],
        ['Name', d.name],
        d.company && ['Company', d.company],
        ['Email', <a key="e" className="text-fg underline underline-offset-2" href={`mailto:${d.email}?subject=${encodeURIComponent(`Re: your enquiry ${d.reference}`)}`}>{d.email}</a>],
        ['Contact number', d.phone || '-'],
        [isSignUp ? 'Business brief' : 'Message', <span key="m" className="whitespace-pre-wrap">{d.message || '-'}</span>],
        // Shared links are untrusted: shown as text to copy, never opened by this page.
        isSignUp && ['Shared link (copy to open)', <span key="l" className="break-all select-all">{d.shared_link || '-'}</span>],
        isSignUp && ['Files (in the original email)', d.attachments.length ? d.attachments.map((f) => `${f.name} (${Math.round(f.size / 1024)} KB)`).join(', ') : '-'],
        ['Consent', d.consent_text],
        ['Page', d.source_page || '-'],
      ].filter(Boolean) as [string, React.ReactNode][])
    : []

  return (
    <div className="flex flex-col gap-8">
      <button type="button" onClick={onBack} className="flex items-center gap-2 self-start text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden="true" /> All enquiries
      </button>
      {error && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-fg">{error}</p>}
      {d && (
        <>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-small text-muted">{d.reference}</p>
              <h1 className="text-h2 font-normal">{d.name}</h1>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <Field id="enq-set-status" label="Status">
                {({ id: fid }) => (
                  <Select id={fid} value={d.status} disabled={busy} onChange={(e) => setStatus(e.target.value as EnquiryStatus)}>
                    {(Object.keys(STATUS_LABEL) as EnquiryStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </Select>
                )}
              </Field>
            </div>
          </div>
          {note && <p role="status" className="text-small text-success">{note}</p>}

          <div className={cn('flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm', d.email_status === 'failed' ? 'border-danger/40 bg-danger/10' : 'border-line bg-surface')}>
            <Mail className="size-4 shrink-0 text-muted" aria-hidden="true" />
            <EmailBadge s={d.email_status} />
            <span className="text-muted">
              {d.email_attempts} attempt{d.email_attempts === 1 ? '' : 's'}
              {d.email_error && d.email_status !== 'sent' ? ` · ${d.email_error}` : ''}
            </span>
            {d.email_status !== 'sent' && (
              <Button size="sm" variant="secondary" className="ml-auto" onClick={resend} disabled={busy}>
                Send notification again
              </Button>
            )}
          </div>

          <dl className="divide-y divide-line rounded-panel border border-line bg-surface">
            {rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 px-5 py-3.5 text-sm sm:grid-cols-[13rem_1fr] sm:gap-4">
                <dt className="text-muted">{k}</dt>
                <dd className="min-w-0 break-words text-fg">{v}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  )
}
