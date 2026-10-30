import { Download, LogOut, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Field, Input, Select } from '../components/ui/Field'
import { Button, Container, Eyebrow, cn } from '../components/ui/primitives'
import { INDUSTRY_OPTIONS } from '../data/catalogue'
import { BUSINESS_GOALS, TOOL_CATEGORIES, digitalSolutionById } from '../data/solutionsCatalogue'

/**
 * Admin: All Solutions usage stats. Data comes from /api/stats (Cloudflare
 * Pages Function + D1), protected by the ADMIN_PASSWORD set in Cloudflare.
 * The password is kept for this browser tab only.
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

const KEY = 'ff.admin'
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
  const [password, setPassword] = useState(() => {
    try {
      return sessionStorage.getItem(KEY) ?? ''
    } catch {
      return ''
    }
  })
  const [draft, setDraft] = useState('')
  const [days, setDays] = useState(30)
  const [industry, setIndustry] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(
    async (pw: string) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/stats?days=${days}${industry ? `&industry=${industry}` : ''}`, {
          headers: { Authorization: `Bearer ${pw}` },
          cache: 'no-store',
        })
        const data = await res.json().catch(() => null)
        if (!res.ok || !data) {
          if (res.status === 401) signOut()
          setError(data?.error ?? (res.status === 404 ? 'Stats are only available on the live site (Cloudflare).' : `Could not load stats (HTTP ${res.status}).`))
          return
        }
        setStats(data as Stats)
        try {
          sessionStorage.setItem(KEY, pw)
        } catch {
          /* private mode */
        }
      } catch {
        setError('Could not reach the stats service. Stats are only available on the live site.')
      } finally {
        setLoading(false)
      }
    },
    [days, industry],
  )

  useEffect(() => {
    if (password) void load(password)
  }, [password, load])

  function signOut() {
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    setPassword('')
    setStats(null)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (draft.trim()) setPassword(draft.trim())
  }

  if (!password) {
    return (
      <section className="py-section">
        <Container>
          <div className="mx-auto flex w-full max-w-md flex-col gap-8 rounded-panel border border-line bg-surface p-8 sm:p-10">
            <div className="flex flex-col gap-2">
              <h1 className="text-[2rem] leading-[1.15] font-normal tracking-[-0.02em]">Welcome Admin</h1>
              <p className="text-small text-muted">Log in to view the solution stats.</p>
            </div>
            <form onSubmit={submit} className="flex flex-col gap-5">
              <Field id="admin-pw" label="Password" error={error ?? undefined}>
                {({ id, describedBy, invalid }) => (
                  <Input id={id} type="password" autoComplete="current-password" autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />
                )}
              </Field>
              <Button type="submit" size="lg" className="w-full">
                Login
              </Button>
            </form>
          </div>
        </Container>
      </section>
    )
  }

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
    <section className="py-section">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3">
            <Eyebrow>Admin</Eyebrow>
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
            <Button variant="secondary" onClick={() => load(password)} disabled={loading}>
              <RefreshCw className={cn('size-4', loading && 'animate-spin')} aria-hidden="true" /> Refresh
            </Button>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="size-4" aria-hidden="true" /> Sign out
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
      </Container>
    </section>
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
