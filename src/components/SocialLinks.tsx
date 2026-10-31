import type { ReactNode } from 'react'
import { SITE } from '../data/catalogue'
import { cn } from './ui/primitives'

/** Solid (filled) social icons, drawn on a 24×24 grid. */
const ICONS: Record<'instagram' | 'facebook' | 'linkedin', ReactNode> = {
  // Rounded square with the lens and flash cut out (even-odd fill).
  instagram: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm4.5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 1.9a3.1 3.1 0 1 1 0 6.2 3.1 3.1 0 0 1 0-6.2ZM17.6 5.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z"
    />
  ),
  facebook: <path d="M14 22v-8.2h2.8l.45-3.3H14V8.4c0-.95.3-1.6 1.65-1.6h1.7V3.85c-.3-.04-1.3-.13-2.48-.13-2.45 0-4.12 1.5-4.12 4.24v2.54H8v3.3h2.75V22H14Z" />,
  linkedin: (
    <>
      <path d="M16.5 8.5c3.1 0 5.5 2 5.5 6.1V21h-4.1v-6c0-1.7-.7-2.8-2.2-2.8-1.6 0-2.4 1.1-2.4 2.8v6H9.2V9h3.9v1.6c.6-1 1.8-2.1 3.4-2.1Z" />
      <rect width="4" height="12" x="2.2" y="9" rx="0.6" />
      <circle cx="4.2" cy="4.6" r="2.3" />
    </>
  ),
}

const LINKS = [
  { key: 'instagram', label: 'Instagram', href: SITE.instagram },
  { key: 'facebook', label: 'Facebook', href: SITE.facebook },
  { key: 'linkedin', label: 'LinkedIn', href: SITE.linkedin },
] as const

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn('flex gap-2', className)} aria-label="Forcefield Design on social media">
      {LINKS.map((l) => (
        <li key={l.key}>
          <a
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Forcefield Design on ${l.label} (opens in a new tab)`}
            className="inline-flex size-10 items-center justify-center rounded-full border border-line-strong text-muted transition-colors outline-none hover:border-fg hover:text-fg focus-visible:ring-2 focus-visible:ring-electric/60"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]" aria-hidden="true">
              {ICONS[l.key]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  )
}
