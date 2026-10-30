import { BUILD } from '../../version'
import { SocialLinks } from '../SocialLinks'
import { Link } from 'react-router-dom'
import { INDUSTRIES, SITE } from '../../data/catalogue'
import { TOOL_CATEGORIES, type ToolCategoryId } from '../../data/solutionsCatalogue'
import { Container } from '../ui/primitives'
import { Logo } from './Header'

/**
 * Footer links follow common SEO practice: descriptive anchor text, links to
 * category and industry listings (not every individual solution, which would
 * dilute the links), and one consistent destination per topic.
 */
const CATEGORY_LINK_TEXT: Record<ToolCategoryId, string> = {
  enquiries: 'Customer Enquiry Tools',
  showcase: 'Galleries & Showcases',
  bookings: 'Online Booking Systems',
  sales: 'Online Sales & Payments',
  marketing: 'Marketing Tools',
  seo: 'SEO Services',
  courses: 'Courses & Events',
  tools: 'Business Automation Tools',
}

type FooterLink = { to: string; label: string }

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Solutions',
    links: [
      { to: '/solutions', label: 'All Solutions' },
      ...TOOL_CATEGORIES.map((c) => ({ to: `/solutions?category=${c.id}`, label: CATEGORY_LINK_TEXT[c.id] })),
    ],
  },
  {
    title: 'Industries',
    links: [
      { to: '/industries', label: 'All Industries' },
      ...INDUSTRIES.map((i) => ({ to: `/solutions?industry=${i.id}`, label: i.name })),
    ],
  },
  {
    title: 'Services',
    links: [
      { to: '/discovery', label: 'Discovery Consultation' },
      { to: '/industries', label: 'Essential Solution' },
      { to: '/industries', label: 'Dynamic Solution' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About Forcefield Design' },
      { to: '/get-started', label: 'Get Started' },
      { to: '/contact', label: 'Contact Us' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative mt-section border-t border-line bg-surface/40">
      <Container className="grid gap-x-8 gap-y-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1.35fr_1fr_0.75fr]">
        <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="max-w-[40ch] text-sm text-muted">
            We make going digital simple with professional websites, smart business tools, and dedicated support. From getting started to scaling up, we provide the right solutions to help your business grow.
          </p>
          <SocialLinks />
        </div>
        {COLUMNS.map((c) => (
          <FooterCol key={c.title} title={c.title} links={c.links} />
        ))}
      </Container>
      {/* Build number kept as a hidden attribute for reference, not shown on the page. */}
      <Container data-build={BUILD} className="border-t border-line py-6 text-xs text-subtle">
        <p>
          © {new Date().getFullYear()} {SITE.legalName} (UEN {SITE.uen}). All rights reserved.
          <span aria-hidden="true" className="mx-2">·</span>
          <Link to="/admin" rel="nofollow" className="underline-offset-2 hover:text-fg hover:underline">
            Admin
          </Link>
        </p>
      </Container>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={`Footer: ${title}`}>
      <h2 className="text-sm font-normal text-subtle">{title}</h2>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="rounded text-sm text-muted transition-colors hover:text-fg">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
