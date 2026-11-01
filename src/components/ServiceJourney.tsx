import { ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { PackageLines, type OfferingTier } from './AbstractIcon'
import { cn } from './ui/primitives'

/**
 * "What We Do" interactive wavy journey (About page).
 * Desktop/tablet (md+): one flowing SVG wave with three clickable nodes and a
 * stable information panel below it (a connector follows the active node, so
 * the layout never jumps). Mobile: a vertical journey with wavy connectors;
 * the selected stage opens beneath its node.
 * The three stages are independent starting points, not a required sequence.
 */

interface Stage {
  id: OfferingTier
  num: string
  name: string
  heading: string
  description: string
  bestFor: string
  cta: string
  /** Existing destinations: Discovery page; By Industry for the website solutions. */
  to: string
}

const STAGES: Stage[] = [
  {
    id: 'discovery',
    num: '01',
    name: 'Discovery',
    heading: 'Find your direction.',
    description:
      'Not sure where to begin? Through guided workshops, we help you understand your challenges and identify practical digital solutions.',
    bestFor: 'Businesses that want clarity before investing in digital solutions.',
    cta: 'Explore Discovery',
    to: '/discovery',
  },
  {
    id: 'essential',
    num: '02',
    name: 'Essential',
    heading: 'Get online, hassle-free.',
    description:
      'A professional 3-page website, set up and managed by our team, so you can focus on running your business.',
    bestFor: 'Businesses that want a professional online presence without managing a website themselves.',
    cta: 'Explore Essential',
    to: '/industries',
  },
  {
    id: 'dynamic',
    num: '03',
    name: 'Dynamic',
    heading: 'More control. More possibilities.',
    description:
      'Manage your own website with an admin panel and AI SEO tools, with room to add more as your business grows.',
    bestFor: 'Businesses that want greater control, flexibility, and room to grow.',
    cta: 'Explore Dynamic',
    to: '/industries',
  },
]

const DEFAULT: OfferingTier = 'discovery'
/** Wave gradient: pink → Forcefield purple → blue, kept soft. */
const STOPS = [
  { o: 0, c: '#e4489a' },
  { o: 0.3, c: '#d24fb4' },
  { o: 0.5, c: '#7b4dff' },
  { o: 0.68, c: '#4b3cff' },
  { o: 1, c: '#2f7bff' },
]
const NODE_COLOR: Record<OfferingTier, string> = { discovery: '#e04fa6', essential: '#7b4dff', dynamic: '#3a86ff' }
/** Readable text tints of the node colours (on dark cards). */
const STAGE_TEXT: Record<OfferingTier, string> = { discovery: '#f08cc6', essential: '#a996ff', dynamic: '#8fb8ff' }

const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Starts the entrance once, the first time the element is mostly in view. */
function useEnteredOnce<T extends Element>() {
  const ref = useRef<T>(null)
  const [entered, setEntered] = useState(() => reducedMotion())
  useEffect(() => {
    if (entered || !ref.current) return
    if (!('IntersectionObserver' in window)) return setEntered(true)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setEntered(true)
          io.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [entered])
  return { ref, entered }
}


/* ------------------------------------------------------------------ */
/* Desktop / tablet: full-width wave ribbon                            */
/* ------------------------------------------------------------------ */

/** Node positions along the content width (0–1). The wave dips at 01 and 03 and peaks at 02. */
const NODE_U = [0.15, 0.5, 0.85]
const BAND = 0.7 // distance between the two dips
/** Wave height area (px) and ribbon thickness, by breakpoint. */
const GEOM = {
  lg: { h: 250, mid: 128, amp: 66, ribbon: 16, node: 52, nodeActive: 66 },
  md: { h: 200, mid: 102, amp: 50, ribbon: 12, node: 46, nodeActive: 56 },
}

interface Layout {
  width: number // full-bleed width
  left: number // content box start within the bleed
  content: number // content box width
}

function waveFns(l: Layout, g: (typeof GEOM)['lg']) {
  const y = (x: number) => {
    // Beyond one crest either side the ribbon levels out, so wide screens don't repeat the wave.
    const u = Math.min(Math.max((x - l.left) / l.content, 0.5 - BAND), 0.5 + BAND)
    return g.mid - g.amp * Math.cos((2 * Math.PI * (u - 0.5)) / BAND)
  }
  const pts: [number, number][] = []
  const step = 16
  for (let x = -step; x <= l.width + step; x += step) pts.push([x, y(x)])
  let d = `M ${pts[0][0]} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    d += ` C ${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)}, ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)}, ${p2[0]} ${p2[1].toFixed(1)}`
  }
  // Arc length to each node, as a share of the whole path (for the active highlight).
  const x0 = pts[0][0]
  const x1 = pts[pts.length - 1][0]
  const acc = (xEnd: number) => {
    let s = 0
    for (let x = x0 + 2; x <= xEnd; x += 2) s += Math.hypot(2, y(x) - y(x - 2))
    return s
  }
  const total = acc(x1)
  const nodes = NODE_U.map((u) => {
    const x = l.left + u * l.content
    return { x, y: y(x), frac: acc(x) / total }
  })
  return { d, nodes, y, width: l.width }
}

function useBleedLayout() {
  const wrap = useRef<HTMLDivElement>(null)
  const bleed = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<Layout | null>(null)
  useEffect(() => {
    const measure = () => {
      if (!wrap.current || !bleed.current) return
      const w = wrap.current.getBoundingClientRect()
      const b = bleed.current.getBoundingClientRect()
      if (!w.width) return
      setLayout({ width: Math.round(b.width), left: Math.round(w.left - b.left), content: Math.round(w.width) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (wrap.current) ro.observe(wrap.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])
  return { wrap, bleed, layout }
}

function useMinWidth(px: number) {
  const q = `(min-width: ${px}px)`
  const [on, setOn] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const f = () => setOn(m.matches)
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [q])
  return on
}

/** The card that hangs under the selected node (reference layout). */
function JourneyCard({ stage, header = true }: { stage: Stage; header?: boolean }) {
  return (
    <div className="flex flex-col gap-5">
      {header && (
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-elevated text-fg shadow-rim">
          <PackageLines tier={stage.id} className="size-6" />
        </span>
        <p className="flex items-center gap-2 text-sm font-medium">
          <span className="tabular-nums" style={{ color: STAGE_TEXT[stage.id] }}>{stage.num}</span>
          <span className="text-fg">{stage.name}</span>
        </p>
      </div>
      )}
      <div className="flex flex-col gap-3">
        <h3 className="text-statement font-normal">{stage.heading}</h3>
        <p className="text-card-body text-muted">{stage.description}</p>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-t border-line pt-5">
        <div className="flex max-w-[34ch] min-w-[14rem] flex-1 flex-col gap-1.5">
          <p className="text-xs font-medium text-subtle">Best for</p>
          <p className="text-small text-fg">{stage.bestFor}</p>
        </div>
        <Link
          to={stage.to}
          className="group ff-btn inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-electric px-5 text-sm font-medium text-white shadow-btn-accent transition-colors outline-none hover:bg-electric-hover focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          {stage.cta}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const NODE_M = 48 // mobile node size (px)
const CONNECT = 44 // dotted connector length under each node

function Wave() {
  const lg = useMinWidth(1024)
  const g = lg ? GEOM.lg : GEOM.md
  const { wrap, bleed, layout } = useBleedLayout()
  const geo = useMemo(() => (layout ? waveFns(layout, g) : null), [layout, g])
  const [active, setActive] = useState<OfferingTier>(DEFAULT)
  const [hover, setHover] = useState<number | null>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const { ref, entered } = useEnteredOnce<HTMLDivElement>()
  const index = STAGES.findIndex((s) => s.id === active)
  const stage = STAGES[index]

  // The card's tallest version, measured once per width, so switching never changes the section height.
  const cardsRef = useRef<HTMLDivElement>(null)
  const [cardH, setCardH] = useState(0)
  useEffect(() => {
    const el = cardsRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setCardH(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [lg, layout === null])

  // Glow that travels along the curve to the selected node.
  const [haloX, setHaloX] = useState<number | null>(null)
  const anim = useRef<number>(0)
  useEffect(() => {
    if (!geo) return
    const target = geo.nodes[index].x
    if (haloX === null || reducedMotion()) {
      setHaloX(target)
      return
    }
    const from = haloX
    const start = performance.now()
    cancelAnimationFrame(anim.current)
    const tick = (t: number) => {
      const k = Math.min((t - start) / 420, 1)
      const e = 1 - Math.pow(1 - k, 3)
      setHaloX(from + (target - from) * e)
      if (k < 1) anim.current = requestAnimationFrame(tick)
    }
    anim.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(anim.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, geo])

  const onKey = (e: KeyboardEvent) => {
    const last = STAGES.length - 1
    const next =
      e.key === 'ArrowRight' ? Math.min(last, index + 1)
      : e.key === 'ArrowLeft' ? Math.max(0, index - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null
    if (next === null) return
    e.preventDefault()
    setActive(STAGES[next].id)
    tabs.current[next]?.focus()
  }

  // Card geometry (lg): hangs under the active node, kept inside the content box and clear of the other labels.
  const cardW = layout ? Math.min(600, Math.round(layout.content * 0.5 - 72)) : 520
  const nodeOf = (i: number) => geo?.nodes[i]
  const activeNode = nodeOf(index)
  const cardLeft =
    layout && activeNode ? Math.min(Math.max(activeNode.x - cardW / 2, layout.left), layout.left + layout.content - cardW) : 0
  const lowest = geo ? Math.max(...geo.nodes.map((n) => n.y)) : g.h
  const hang = (i: number) => (geo ? geo.nodes[i].y + (i === index ? g.nodeActive : g.node) / 2 + 6 : 0)
  const floatHeight = lg ? Math.max(g.h, lowest + g.nodeActive / 2 + 6 + CONNECT + Math.max(cardH, 110)) + 24 : g.h + 120

  return (
    <div ref={ref} className="hidden md:block">
      <div ref={wrap} className="relative">
        {/* Full-bleed stage: the ribbon runs edge to edge; nodes sit on the content grid. */}
        <div ref={bleed} className="relative ml-[calc(50%-50vw)] w-screen" style={{ height: floatHeight }}>
          {geo && (
            <svg width={geo.width} height={g.h} viewBox={`0 0 ${geo.width} ${g.h}`} className="absolute top-0 left-0 overflow-visible" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="ff-ribbon" x1="0" y1="0" x2={geo.width} y2="0" gradientUnits="userSpaceOnUse">
                  {STOPS.map((s) => <stop key={s.o} offset={s.o} stopColor={s.c} />)}
                </linearGradient>
                <linearGradient id="ff-ribbon-shade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
                  <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
                  <stop offset="1" stopColor="#000" stopOpacity="0.25" />
                </linearGradient>
                <filter id="ff-ribbon-glow" x="-5%" y="-80%" width="110%" height="260%">
                  <feGaussianBlur stdDeviation="14" />
                </filter>
              </defs>
              <g style={{ strokeDasharray: '1 1', strokeDashoffset: entered ? 0 : 1, transition: `stroke-dashoffset 1.3s ${EASE}` }}>
                {/* Ambient glow */}
                <path d={geo.d} pathLength={1} fill="none" stroke="url(#ff-ribbon)" strokeWidth={g.ribbon + 12} strokeLinecap="round" opacity="0.35" filter="url(#ff-ribbon-glow)" />
                {/* Ribbon body */}
                <path d={geo.d} pathLength={1} fill="none" stroke="url(#ff-ribbon)" strokeWidth={g.ribbon} strokeLinecap="round" opacity="0.92" />
                {/* Dimension: light top edge, darker underside */}
                <path d={geo.d} pathLength={1} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.28" transform={`translate(0 ${-g.ribbon / 2 + 3})`} />
                <path d={geo.d} pathLength={1} fill="none" stroke="#000" strokeWidth={g.ribbon / 2.5} strokeLinecap="round" opacity="0.14" transform={`translate(0 ${g.ribbon / 4})`} />
              </g>
            </svg>
          )}

          {/* Soft halo that travels along the curve to the selected node */}
          {geo && haloX !== null && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute size-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              style={{ left: haloX, top: geo.y(haloX), background: NODE_COLOR[stage.id], opacity: entered ? 0.32 : 0, transition: 'background-color 0.42s, opacity 0.5s ease 1s' }}
            />
          )}

          {/* Nodes, connectors, labels */}
          {geo && (
            <div role="tablist" aria-label="Our services" onKeyDown={onKey}>
              {STAGES.map((s, i) => {
                const on = s.id === active
                const n = geo.nodes[i]
                const size = on ? g.nodeActive : g.node
                const showLabel = !lg || !on
                const delay = 0.35 + i * 0.3
                return (
                  <div key={s.id}>
                    <button
                      ref={(el) => {
                        tabs.current[i] = el
                      }}
                      id={`journey-tab-${s.id}`}
                      role="tab"
                      type="button"
                      aria-selected={on}
                      aria-controls="journey-panel"
                      aria-label={`${s.num} ${s.name}`}
                      tabIndex={on ? 0 : -1}
                      onClick={() => setActive(s.id)}
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(i)}
                      onBlur={() => setHover(null)}
                      className="group absolute z-10 grid cursor-pointer place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
                      style={{
                        left: n.x,
                        top: n.y,
                        width: size,
                        height: size,
                        translate: '-50% -50%',
                        opacity: entered ? 1 : 0,
                        scale: entered ? (hover === i && !on ? '1.08' : '1') : '0.6',
                        transition: `width 0.42s ${EASE}, height 0.42s ${EASE}, scale 0.3s ${EASE}, opacity 0.4s ease ${entered ? 0 : delay}s`,
                      }}
                    >
                      <span
                        className="grid size-full place-items-center rounded-full bg-canvas font-semibold text-fg tabular-nums transition-[box-shadow,border-color] duration-300"
                        style={{
                          border: `3px solid ${NODE_COLOR[s.id]}`,
                          fontSize: on ? '1.125rem' : '1rem',
                          boxShadow: on
                            ? `0 0 0 5px ${NODE_COLOR[s.id]}33, 0 0 28px ${NODE_COLOR[s.id]}aa, inset 0 0 14px ${NODE_COLOR[s.id]}55`
                            : hover === i
                              ? `0 0 22px ${NODE_COLOR[s.id]}99`
                              : `0 0 12px ${NODE_COLOR[s.id]}44`,
                        }}
                      >
                        {s.num}
                      </span>
                    </button>

                    {/* Dotted connector */}
                    <span
                      aria-hidden="true"
                      className="absolute w-0 -translate-x-1/2 border-l-2 border-dotted"
                      style={{
                        left: n.x,
                        top: hang(i),
                        height: CONNECT - 6,
                        borderColor: NODE_COLOR[s.id],
                        opacity: entered ? (on ? 1 : 0.7) : 0,
                        transition: `opacity 0.4s ease ${entered ? 0 : delay + 0.2}s, top 0.42s ${EASE}`,
                      }}
                    >
                      <span className="absolute -top-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full" style={{ background: NODE_COLOR[s.id], marginLeft: -1 }} />
                      <span className="absolute -bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full" style={{ background: NODE_COLOR[s.id], marginLeft: -1 }} />
                    </span>

                    {/* Icon + name for the other stages (and all stages on tablet) */}
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-hidden="true"
                      onClick={() => setActive(s.id)}
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(null)}
                      className="group absolute flex -translate-x-1/2 cursor-pointer flex-col items-center gap-2.5"
                      style={{
                        left: n.x,
                        top: hang(i) + CONNECT,
                        opacity: entered && showLabel ? 1 : 0,
                        pointerEvents: showLabel ? 'auto' : 'none',
                        transition: `opacity 0.3s ease ${entered ? (showLabel ? 0.15 : 0) : delay + 0.25}s`,
                      }}
                    >
                      <span
                        className={cn(
                          'grid size-14 place-items-center rounded-2xl bg-elevated shadow-rim transition-colors duration-300',
                          on ? 'text-fg' : 'text-muted group-hover:text-fg',
                        )}
                        style={on ? { boxShadow: `0 0 0 1px ${NODE_COLOR[s.id]}, 0 0 20px ${NODE_COLOR[s.id]}55` } : undefined}
                      >
                        <PackageLines tier={s.id} className="size-7" />
                      </span>
                      <span className={cn('text-base font-medium whitespace-nowrap transition-colors', on ? 'text-fg' : 'text-muted group-hover:text-fg')}>{s.name}</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Desktop: the card hangs under the selected node */}
          {lg && geo && (
            <div
              className="absolute"
              style={{
                left: cardLeft,
                top: hang(index) + CONNECT,
                width: cardW,
                opacity: entered ? 1 : 0,
                transition: `left 0.42s ${EASE}, top 0.42s ${EASE}, opacity 0.5s ease ${entered ? 0 : 1.1}s`,
              }}
            >
              <div
                id="journey-panel"
                role="tabpanel"
                aria-labelledby={`journey-tab-${stage.id}`}
                ref={cardsRef}
                className="relative overflow-hidden rounded-panel border bg-surface/95 p-7 backdrop-blur-sm"
                style={{ borderColor: `${NODE_COLOR[stage.id]}66`, boxShadow: `0 24px 60px -24px rgb(0 0 0 / 0.7), 0 0 40px -10px ${NODE_COLOR[stage.id]}55`, transition: 'border-color 0.42s, box-shadow 0.42s' }}
              >
                {/* All three cards share one cell; the tallest sets the height, so nothing below moves. */}
                <div className="grid">
                  {STAGES.map((s) => (
                    <div
                      key={s.id}
                      aria-hidden={s.id !== active}
                      inert={s.id !== active}
                      className="[grid-area:1/1] transition-[opacity,translate] duration-[420ms]"
                      style={{ opacity: s.id === active ? 1 : 0, translate: s.id === active ? '0 0' : '0 6px', pointerEvents: s.id === active ? 'auto' : 'none' }}
                    >
                      <JourneyCard stage={s} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tablet: one stable card below the wave */}
        {!lg && (
          <div
            id="journey-panel"
            role="tabpanel"
            aria-labelledby={`journey-tab-${stage.id}`}
            className="relative rounded-panel border bg-surface p-7"
            style={{ borderColor: `${NODE_COLOR[stage.id]}55`, opacity: entered ? 1 : 0, transition: 'opacity 0.5s ease 0.9s, border-color 0.42s' }}
          >
            <div key={stage.id} className="animate-journey-in">
              <JourneyCard stage={stage} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Mobile: vertical wavy journey                                       */
/* ------------------------------------------------------------------ */

/** Mobile: the same ribbon, nodes and card as desktop, turned vertical. */
function VerticalJourney() {
  const [open, setOpen] = useState<OfferingTier>(DEFAULT)
  const { ref, entered } = useEnteredOnce<HTMLOListElement>()
  const items = useRef<(HTMLLIElement | null)[]>([])
  const [ys, setYs] = useState<number[]>([])
  const [h, setH] = useState(0)

  // Node centres, re-measured whenever a card opens or the layout changes.
  useEffect(() => {
    const ol = ref.current
    if (!ol) return
    const measure = () => {
      setYs(items.current.map((li) => (li ? li.offsetTop + NODE_M / 2 : 0)))
      setH(ol.offsetHeight)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(ol)
    return () => ro.disconnect()
  }, [ref])

  // Wavy vertical ribbon through every node centre.
  const x = NODE_M / 2
  const d =
    ys.length === STAGES.length
      ? ys.reduce((acc, y, i) => {
          if (i === 0) return `M ${x} ${y}`
          const y0 = ys[i - 1]
          const dy = y - y0
          return `${acc} C ${x - 20} ${y0 + dy * 0.33}, ${x + 20} ${y0 + dy * 0.67}, ${x} ${y}`
        }, '')
      : ''

  return (
    <ol ref={ref} className="relative flex flex-col gap-8 md:hidden">
      {d && (
        <svg width={NODE_M} height={h} viewBox={`0 0 ${NODE_M} ${h}`} className="pointer-events-none absolute top-0 left-0 overflow-visible" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="ff-ribbon-v" x1="0" y1={ys[0]} x2="0" y2={ys[ys.length - 1]} gradientUnits="userSpaceOnUse">
              {/* Colour matches each node: pink at 01, purple at 02, blue at 03 */}
              {STAGES.map((s, i) => (
                <stop key={s.id} offset={(ys[i] - ys[0]) / Math.max(ys[ys.length - 1] - ys[0], 1)} stopColor={NODE_COLOR[s.id]} />
              ))}
            </linearGradient>
            <filter id="ff-ribbon-v-glow" x="-200%" y="-10%" width="500%" height="120%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          <g style={{ strokeDasharray: '1 1', strokeDashoffset: entered ? 0 : 1, transition: `stroke-dashoffset 1.2s ${EASE}` }}>
            <path d={d} pathLength={1} fill="none" stroke="url(#ff-ribbon-v)" strokeWidth="14" strokeLinecap="round" opacity="0.35" filter="url(#ff-ribbon-v-glow)" />
            <path d={d} pathLength={1} fill="none" stroke="url(#ff-ribbon-v)" strokeWidth="7" strokeLinecap="round" opacity="0.92" />
            <path d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth="1.25" strokeLinecap="round" opacity="0.25" transform="translate(-1.6 0)" />
          </g>
        </svg>
      )}
      {STAGES.map((s, i) => {
        const on = open === s.id
        const panelId = `journey-m-${s.id}`
        return (
          <li
            key={s.id}
            ref={(el) => {
              items.current[i] = el
            }}
            className="relative pl-[4.25rem]"
          >
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={panelId}
                onClick={() => setOpen(s.id)}
                className="group flex min-h-12 w-full items-center gap-3 rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                {/* Ring node with the number, as on desktop */}
                <span
                  className="absolute top-0 left-0 grid place-items-center rounded-full bg-canvas font-semibold text-fg tabular-nums"
                  style={{
                    width: NODE_M,
                    height: NODE_M,
                    border: `3px solid ${NODE_COLOR[s.id]}`,
                    boxShadow: on
                      ? `0 0 0 4px ${NODE_COLOR[s.id]}33, 0 0 22px ${NODE_COLOR[s.id]}aa, inset 0 0 12px ${NODE_COLOR[s.id]}55`
                      : `0 0 10px ${NODE_COLOR[s.id]}44`,
                    opacity: entered ? 1 : 0,
                    transition: `opacity 0.4s ease ${entered ? 0 : 0.2 + i * 0.3}s, box-shadow 0.3s`,
                  }}
                >
                  {s.num}
                </span>
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-elevated shadow-rim">
                  <PackageLines tier={s.id} className={cn('size-6', on ? 'text-fg' : 'text-muted')} />
                </span>
                <span className={cn('text-base font-medium', on ? 'text-fg' : 'text-muted group-hover:text-fg')}>{s.name}</span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-label={s.name}
              inert={!on}
              className={cn('grid transition-[grid-template-rows,opacity] duration-300 ease-out', on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}
            >
              <div className="overflow-hidden">
                <div
                  className="mt-4 rounded-panel border bg-surface p-5"
                  style={{ borderColor: `${NODE_COLOR[s.id]}66`, boxShadow: `0 20px 50px -24px rgb(0 0 0 / 0.7), 0 0 32px -12px ${NODE_COLOR[s.id]}66` }}
                >
                  <JourneyCard stage={s} header={false} />
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function ServiceJourney() {
  return (
    <>
      <Wave />
      <VerticalJourney />
    </>
  )
}
