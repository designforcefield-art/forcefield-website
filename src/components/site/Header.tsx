import { ChevronDown, Compass, LayoutGrid, Menu, Bookmark, X, Factory } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { usePicks } from '../../state/PickContext'
import { cn, Container } from '../ui/primitives'

const SOLUTION_LINKS = [
  { to: '/solutions', label: 'All Solutions', desc: 'Explore digital features for your business', icon: LayoutGrid },
  { to: '/industries', label: 'By Industry', desc: 'Discover what works for businesses like yours', icon: Factory },
  { to: '/discovery', label: 'Discovery Consultation', desc: 'Not sure where to start? We’ll help you find the right solution', icon: Compass },
]

/** Forcefield stepped mark. 100×100 box; rounded joins match the supplied logo. */
export function LogoMark({ className, color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M7 7H93V27H63V60H28V93H7Z"
        fill={color}
        stroke={color}
        strokeWidth="14"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5 rounded-lg', className)} aria-label="Forcefield.design, home">
      <span className="grid size-8 place-items-center rounded-[0.55rem] bg-white shadow-btn">
        <LogoMark className="size-[0.85rem]" color="#000" />
      </span>
      <span className="text-[1.1rem] font-semibold tracking-[-0.035em]">Forcefield.design</span>
    </Link>
  )
}

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn('rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'text-fg' : 'text-muted hover:text-fg')

export function Header() {
  const { count, openDrawer, bump } = usePicks()
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [pulse, setPulse] = useState(false)
  const ddRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const solutionsActive = ['/solutions', '/industries', '/discovery'].some((p) => location.pathname.startsWith(p))

  useEffect(() => {
    setSolutionsOpen(false)
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!bump) return
    setPulse(true)
    const t = setTimeout(() => setPulse(false), 500)
    return () => clearTimeout(t)
  }, [bump])

  useEffect(() => {
    if (!solutionsOpen) return
    const onDown = (e: MouseEvent) => !ddRef.current?.contains(e.target as Node) && setSolutionsOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSolutionsOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [solutionsOpen])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
  }, [mobileOpen])

  return (
    <header
      className={cn(
        'sticky top-[env(safe-area-inset-top,0px)] z-50 border-b transition-colors duration-300',
        scrolled || mobileOpen ? 'glass-bar border-line' : 'border-transparent bg-transparent',
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-electric focus:px-4 focus:py-2">
        Skip to content
      </a>
      <Container className="flex h-header items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={navLink}>Home</NavLink>
          <NavLink to="/about" className={navLink}>About</NavLink>
          <div className="relative" ref={ddRef}>
            <button
              aria-expanded={solutionsOpen}
              aria-controls="solutions-menu"
              onClick={() => setSolutionsOpen((o) => !o)}
              className={cn('flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors', solutionsActive || solutionsOpen ? 'text-fg' : 'text-muted hover:text-fg')}
            >
              Solutions
              <ChevronDown className={cn('size-4 transition-transform duration-300', solutionsOpen && 'rotate-180')} aria-hidden="true" />
            </button>
            <div
              id="solutions-menu"
              hidden={!solutionsOpen}
              className="absolute top-full left-1/2 mt-3 w-[25.5rem] -translate-x-1/2 animate-rise rounded-panel border border-line-strong bg-surface p-2 shadow-float"
            >
              <ul className="flex flex-col gap-1">
                {SOLUTION_LINKS.map(({ to, label, desc, icon: I }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className={cn(
                        'flex items-start gap-3 rounded-card p-3 transition-colors hover:bg-raised',
                      )}
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-elevated text-fg shadow-rim">
                        <I className="size-5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-fg">{label}</span>
                        <span className="block text-sm text-muted">{desc}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <NavLink to="/contact" className={navLink}>Contact Us</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={openDrawer}
            aria-label={`My Pick, ${count} saved`}
            className={cn(
              'flex h-10 items-center gap-2 rounded-full bg-raised pr-1.5 pl-3.5 text-sm font-medium shadow-btn transition-all hover:bg-raised-hover active:shadow-pressed',
              pulse && 'animate-pop',
            )}
          >
            <Bookmark className="size-4" aria-hidden="true" />
            <span className="hidden xs:inline">My Pick</span>
            <span
              className={cn(
                'grid h-7 min-w-7 place-items-center rounded-full px-1.5 text-xs font-semibold tabular-nums',
                count ? 'bg-electric text-white shadow-btn-accent' : 'bg-canvas text-muted shadow-pressed',
              )}
            >
              {count}
            </span>
          </button>
          <button
            className="grid size-10 place-items-center rounded-full border border-line text-fg md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </Container>

      {/* Mobile navigation */}
      <div id="mobile-nav" hidden={!mobileOpen} className="h-[calc(100dvh-var(--spacing-header))] overflow-y-auto border-t border-line md:hidden">
        <Container className="flex flex-col gap-1 py-6">
          {[
            { to: '/', label: 'Home' },
            { to: '/about', label: 'About' },
          ].map((l) => (
            <NavLink key={l.to} to={l.to} end className={({ isActive }) => cn('rounded-xl px-3 py-3 text-lg font-medium', isActive ? 'text-fg' : 'text-muted')}>
              {l.label}
            </NavLink>
          ))}
          <p className="px-3 pt-4 pb-1 text-sm font-medium text-subtle">Solutions</p>
          {SOLUTION_LINKS.map(({ to, label, icon: I }) => (
            <NavLink key={to} to={to} className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-3 text-lg font-medium', isActive ? 'bg-elevated text-fg' : 'text-muted')}>
              <I className="size-5 text-glow" aria-hidden="true" /> {label}
            </NavLink>
          ))}
          <NavLink to="/discovery" className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-3 text-lg font-medium', isActive ? 'bg-elevated text-fg' : 'text-muted')}>
            <Compass className="size-5 text-glow" aria-hidden="true" /> Discovery Consultation
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => cn('mt-4 rounded-xl px-3 py-3 text-lg font-medium', isActive ? 'text-fg' : 'text-muted')}>
            Contact Us
          </NavLink>
        </Container>
      </div>
    </header>
  )
}
