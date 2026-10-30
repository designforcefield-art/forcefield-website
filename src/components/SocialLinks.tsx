import type { ReactNode } from 'react'
import { SITE } from '../data/catalogue'
import { cn } from './ui/primitives'

/** Outline social icons, matching the Forcefield leads pages. */
const ICONS: Record<'instagram' | 'facebook' | 'linkedin', ReactNode> = {
  instagram: (
    <>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </>
  ),
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  linkedin: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-[18px]"
              aria-hidden="true"
            >
              {ICONS[l.key]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  )
}
