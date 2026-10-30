import type { ReactNode } from 'react'
import { LineIcon, SOLUTION_LINES } from './AbstractIcon'
import { cn } from './ui/primitives'

/**
 * Line-art illustrations for the individual digital solutions.
 * Same visual language as the original solution graphics (AbstractIcon):
 * 48×48 grid, thin even strokes, white lines, ONE element in purple.
 * Keys match ids in src/data/solutionsCatalogue.ts.
 */

const H = 'var(--color-cyan)'

/** Five-point star path. */
const star = (cx: number, cy: number, R: number, r = R * 0.45) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2
    const d = i % 2 ? r : R
    return `${i ? 'L' : 'M'}${(cx + Math.cos(a) * d).toFixed(2)} ${(cy + Math.sin(a) * d).toFixed(2)}`
  }).join('') + 'Z'

/** Four-point sparkle path. */
const sparkle = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`

/* Shared parts */
const calendar = (
  <>
    <rect x="9" y="12" width="30" height="27" rx="3" />
    <path d="M9 20h30M17 9v6M31 9v6" />
  </>
)
const envelope = (
  <>
    <rect x="8" y="13" width="32" height="22" rx="2.5" />
  </>
)
const doc = (
  <>
    <path d="M13 9h15l7 7v23H13Z" />
    <path d="M28 9v7h7" />
  </>
)
const frame = <rect x="8" y="12" width="32" height="24" rx="3" />
const pin = (cx: number, cy: number, s = 1) =>
  `M${cx} ${cy + 19 * s}s-${11 * s}-${10.5 * s}-${11 * s}-${19 * s}a${11 * s} ${11 * s} 0 0 1 ${22 * s} 0c0 ${8.5 * s}-${11 * s} ${19 * s}-${11 * s} ${19 * s}Z`

export const SOLUTION_ART: Record<string, ReactNode> = {
  /* ---------- Customer Enquiries ---------- */
  'whatsapp-chat': (
    <>
      <path d="M24 9a15 15 0 1 1-7.4 28.1L9 39l2-7.2A15 15 0 0 1 24 9Z" />
      <g stroke={H}>
        <circle cx="18" cy="24" r="1.4" />
        <circle cx="24" cy="24" r="1.4" />
        <circle cx="30" cy="24" r="1.4" />
      </g>
    </>
  ),
  'enquiry-form': (
    <>
      <rect x="12" y="8" width="24" height="32" rx="2.5" />
      <path d="M17 16h14M17 21h14M17 26h9" />
      <rect x="17" y="31" width="14" height="5" rx="2.5" stroke={H} />
    </>
  ),
  'request-a-quote': (
    <>
      {doc}
      <path d="M17 20h8M17 25h12M17 30h6" />
      <circle cx="33" cy="33" r="6" stroke={H} />
    </>
  ),
  'contact-form': (
    <>
      {envelope}
      <path d="M8 15.5 24 27l16-11.5" stroke={H} />
    </>
  ),
  'click-to-call': (
    <>
      <rect x="13" y="8" width="16" height="32" rx="4" />
      <path d="M19 35h4" />
      <path d="M33.5 19a7 7 0 0 1 0 10M37.5 15a12.5 12.5 0 0 1 0 18" stroke={H} />
    </>
  ),
  'google-maps': (
    <>
      <path d={pin(24, 20)} />
      <circle cx="24" cy="20" r="4" stroke={H} />
    </>
  ),
  'social-media-links': (
    <>
      <circle cx="14" cy="24" r="4.5" />
      <circle cx="34" cy="13" r="4.5" />
      <circle cx="34" cy="35" r="4.5" stroke={H} />
      <path d="M18 22 30 15M18 26l12 7" />
    </>
  ),
  'live-chat': (
    <>
      <path d="M12 9h16a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4H16l-6 4v-4a4 4 0 0 1-2-3.5V13a4 4 0 0 1 4-4Z" />
      <path d="M20 28h12a4 4 0 0 0 4-4v-3.5a4 4 0 0 1 2 3.5v7a4 4 0 0 1-2 3.5V39l-6-4H24a4 4 0 0 1-4-4Z" stroke={H} />
    </>
  ),
  'faq-section': (
    <>
      <circle cx="24" cy="24" r="15" />
      <g stroke={H}>
        <path d="M19.5 20a4.5 4.5 0 1 1 6.3 4.1c-1.1.5-1.8 1.6-1.8 2.8v.6" />
        <circle cx="24" cy="32" r="0.6" />
      </g>
    </>
  ),
  'newsletter-sign-up': (
    <>
      <rect x="8" y="15" width="26" height="20" rx="2.5" />
      <path d="M8 17.5 21 27l13-9.5" />
      <g stroke={H}>
        <circle cx="36" cy="14" r="5.5" />
        <path d="M36 11.5v5M33.5 14h5" />
      </g>
    </>
  ),

  /* ---------- Showcase ---------- */
  'photo-gallery': (
    <>
      {frame}
      <path d="m8 31 10-9 8 7 5-4 9 8" />
      <circle cx="31" cy="19" r="3" stroke={H} />
    </>
  ),
  'video-gallery': (
    <>
      {frame}
      <path d="M21 18.5v11l9.5-5.5Z" stroke={H} />
    </>
  ),
  'instagram-feed': (
    <>
      {[0, 1, 2].flatMap((r) =>
        [0, 1, 2].map((c) => (
          <rect key={`${r}${c}`} x={9 + c * 11} y={9 + r * 11} width="8" height="8" rx="1.5" stroke={r === 1 && c === 1 ? H : undefined} />
        )),
      )}
    </>
  ),
  'customer-reviews': (
    <>
      {frame}
      <path d={star(24, 24.5, 7.5)} stroke={H} />
    </>
  ),
  'portfolio-showcase': (
    <>
      <path d="M8 15a2 2 0 0 1 2-2h9l4 4h15a2 2 0 0 1 2 2v17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2Z" />
      <rect x="15" y="23" width="18" height="9" rx="1.5" stroke={H} />
    </>
  ),
  'services-listing': (
    <>
      <circle cx="13" cy="15" r="2" stroke={H} />
      <circle cx="13" cy="24" r="2" />
      <circle cx="13" cy="33" r="2" />
      <path d="M19 15h18M19 24h18M19 33h12" />
    </>
  ),
  'team-profiles': (
    <>
      <circle cx="17" cy="18" r="5" />
      <path d="M8 36a9 9 0 0 1 18 0" />
      <g stroke={H}>
        <circle cx="31" cy="18" r="5" />
        <path d="M22 36a9 9 0 0 1 18 0" />
      </g>
    </>
  ),
  'before-and-after-gallery': (
    <>
      {frame}
      <path d="m8 31 8-7 8 7" />
      <g stroke={H}>
        <path d="M24 9v30" />
        <circle cx="24" cy="24" r="3" />
      </g>
    </>
  ),
  'downloadable-brochures': (
    <>
      {doc}
      <path d="M24 19v12M19 26l5 5 5-5" stroke={H} />
    </>
  ),
  'business-locations': (
    <>
      <path d={pin(19, 17)} />
      <circle cx="19" cy="17" r="3.5" />
      <path d={pin(34, 25, 0.55)} stroke={H} />
    </>
  ),

  /* ---------- Bookings ---------- */
  'online-booking': (
    <>
      {calendar}
      <path d="m18 29 4 4 8-8" stroke={H} />
    </>
  ),
  'table-reservations': (
    <>
      <circle cx="24" cy="24" r="11" />
      <circle cx="24" cy="24" r="6" stroke={H} />
      <path d="M8 13v22M6 13v5a2 2 0 0 0 4 0v-5M40 13c-2 0-3 3-3 7s1 5 3 5v10" />
    </>
  ),
  'class-booking': (
    <>
      {calendar}
      <rect x="14" y="24" width="5" height="4" rx="1" />
      <rect x="21.5" y="24" width="5" height="4" rx="1" stroke={H} />
      <rect x="29" y="24" width="5" height="4" rx="1" />
      <rect x="14" y="31" width="5" height="4" rx="1" />
      <rect x="21.5" y="31" width="5" height="4" rx="1" />
    </>
  ),
  'event-registration': (
    <>
      <path d="M8 15h32v6a3 3 0 0 0 0 6v6H8v-6a3 3 0 0 0 0-6Z" />
      <path d="m19 24 3.5 3.5L29.5 20" stroke={H} />
    </>
  ),
  'booking-calendar': (
    <>
      {calendar}
      {[0, 1, 2].flatMap((r) =>
        [0, 1, 2, 3].map((c) => <circle key={`${r}${c}`} cx={15 + c * 6} cy={25 + r * 5} r="0.8" />),
      )}
      <circle cx="27" cy="30" r="3" stroke={H} />
    </>
  ),
  'booking-confirmation': (
    <>
      <rect x="8" y="13" width="26" height="20" rx="2.5" />
      <path d="M8 15.5 21 25l13-9.5" />
      <g stroke={H}>
        <circle cx="35" cy="33" r="6" />
        <path d="m32.5 33 1.8 1.8 3.4-3.6" />
      </g>
    </>
  ),
  'booking-reminders': (
    <>
      <path d="M14 33V22a10 10 0 0 1 20 0v11l3 3H11Z" />
      <path d="M21 39a3 3 0 0 0 6 0" />
      <circle cx="34" cy="12" r="3.5" stroke={H} />
    </>
  ),
  'booking-management': (
    <>
      {calendar}
      <path d="m19 34 1-4 9-9 3 3-9 9Z" stroke={H} />
    </>
  ),
  'group-booking': (
    <>
      <circle cx="13" cy="20" r="4" />
      <circle cx="35" cy="20" r="4" />
      <path d="M6 35a7 7 0 0 1 12-5M42 35a7 7 0 0 0-12-5" />
      <g stroke={H}>
        <circle cx="24" cy="17" r="5" />
        <path d="M15 37a9 9 0 0 1 18 0" />
      </g>
    </>
  ),
  'booking-deposits': (
    <>
      <path d="M9 17a3 3 0 0 1 3-3h24a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3Z" />
      <path d="M39 21h-8a4 4 0 0 0 0 8h8" />
      <circle cx="31" cy="25" r="1.5" stroke={H} />
    </>
  ),

  /* ---------- Online Sales ---------- */
  'product-listings': (
    <>
      <rect x="9" y="9" width="13" height="16" rx="2" />
      <rect x="26" y="9" width="13" height="16" rx="2" stroke={H} />
      <path d="M9 31h13M9 36h8M26 31h13M26 36h8" />
    </>
  ),
  'shopping-cart': (
    <>
      <path d="M7 11h5l4 19h19l3.5-13H14" />
      <g stroke={H}>
        <circle cx="19" cy="36" r="2.5" />
        <circle cx="32" cy="36" r="2.5" />
      </g>
    </>
  ),
  'online-payments': (
    <>
      <rect x="8" y="13" width="32" height="22" rx="3" />
      <path d="M8 20h32M28 29h6" />
      <rect x="13" y="25" width="7" height="5" rx="1" stroke={H} />
    </>
  ),
  'product-categories': (
    <>
      <rect x="18" y="8" width="12" height="9" rx="1.5" stroke={H} />
      <rect x="8" y="31" width="12" height="9" rx="1.5" />
      <rect x="28" y="31" width="12" height="9" rx="1.5" />
      <path d="M24 17v7M14 31v-7h20v7" />
    </>
  ),
  'product-search': (
    <>
      <circle cx="21" cy="21" r="11" />
      <rect x="16.5" y="16.5" width="9" height="9" rx="1.5" />
      <path d="m29 29 10 10" stroke={H} />
    </>
  ),
  'product-variations': (
    <>
      <circle cx="12" cy="24" r="5" />
      <circle cx="24" cy="24" r="5" stroke={H} />
      <circle cx="36" cy="24" r="5" />
      <path d="M8 35h32" />
    </>
  ),
  'discount-codes': (
    <>
      <path d="M8 15h32v6a3 3 0 0 0 0 6v6H8v-6a3 3 0 0 0 0-6Z" />
      <g stroke={H}>
        <path d="m19 29 10-10" />
        <circle cx="19.5" cy="19.5" r="1.5" />
        <circle cx="28.5" cy="28.5" r="1.5" />
      </g>
    </>
  ),
  'order-management': (
    <>
      <rect x="11" y="11" width="26" height="29" rx="2.5" />
      <rect x="18" y="8" width="12" height="6" rx="1.5" />
      <path d="M22 23h9M22 31h9" />
      <path d="m15 23 1.5 1.5 3-3M15 31l1.5 1.5 3-3" stroke={H} />
    </>
  ),
  'delivery-options': (
    <>
      <path d="M7 14h20v18H7ZM27 20h7l6 6v6H27" />
      <g stroke={H}>
        <circle cx="14" cy="35" r="3" />
        <circle cx="33" cy="35" r="3" />
      </g>
    </>
  ),
  'stock-management': (
    <>
      <rect x="9" y="27" width="13" height="12" rx="1.5" />
      <rect x="26" y="27" width="13" height="12" rx="1.5" />
      <rect x="17.5" y="11" width="13" height="12" rx="1.5" stroke={H} />
    </>
  ),
  'digital-downloads': (
    <>
      <path d="M9 30v6a2 2 0 0 0 2 2h26a2 2 0 0 0 2-2v-6" />
      <path d="M24 9v20M17 22l7 7 7-7" stroke={H} />
    </>
  ),
  'gift-vouchers': (
    <>
      <rect x="8" y="16" width="32" height="7" rx="1.5" />
      <path d="M11 23v15h26V23" />
      <g stroke={H}>
        <path d="M24 16v22" />
        <path d="M24 16c-2-5-8-7-8-3s6 3 8 3c2 0 8 1 8-3s-6-2-8 3" />
      </g>
    </>
  ),
  'subscription-payments': (
    <>
      <path d="M38 24a14 14 0 0 1-24.5 9.3M10 24a14 14 0 0 1 24.5-9.3" />
      <path d="M34.5 9v5.7h-5.7M13.5 39v-5.7h5.7" />
      <circle cx="24" cy="24" r="5" stroke={H} />
    </>
  ),
  'invoice-payments': (
    <>
      <path d="M12 8h24v32l-4-3-4 3-4-3-4 3-4-3-4 3Z" />
      <path d="M17 16h14M17 22h14" />
      <path d="M17 29h8" stroke={H} />
    </>
  ),

  /* ---------- Marketing ---------- */
  'promotions-listing': (
    <>
      <path d="M9 11v12l16 16 14-14L23 9H11a2 2 0 0 0-2 2Z" />
      <circle cx="17" cy="17" r="2.5" stroke={H} />
    </>
  ),
  'promotional-banners': (
    <>
      <path d="M7 12c11 4 23 4 34 0" />
      <path d="M11 13.3 14 25l4.5-10.6M29.5 14.4 34 25l3-11.7" />
      <path d="M19.8 14.6 24 27l4.2-12.4" stroke={H} />
    </>
  ),
  'pop-up-announcements': (
    <>
      <rect x="7" y="9" width="34" height="30" rx="3" />
      <path d="M7 16h34" />
      <rect x="14" y="21" width="20" height="12" rx="2" stroke={H} />
    </>
  ),
  'events-listing': (
    <>
      {calendar}
      <path d={star(24, 29.5, 6)} stroke={H} />
    </>
  ),
  'articles-and-news': (
    <>
      <rect x="8" y="9" width="32" height="30" rx="2.5" />
      <path d="M14 23h9M14 28h9M14 33h9M27 23h7M27 28h7M27 33h7" />
      <path d="M14 16h20" stroke={H} />
    </>
  ),
  'email-newsletter': (
    <>
      <path d="M7 23 41 9 31 39l-9-12Z" />
      <path d="M22 27 41 9" stroke={H} />
    </>
  ),
  'customer-testimonials': (
    <>
      <path d="M12 9h24a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H22l-8 7v-7h-2a4 4 0 0 1-4-4V13a4 4 0 0 1 4-4Z" />
      <path d="M18 24c0-4 1.5-6.5 4-7.5M26 24c0-4 1.5-6.5 4-7.5" stroke={H} />
    </>
  ),
  'featured-products': (
    <>
      <rect x="9" y="17" width="22" height="22" rx="2.5" />
      <path d={sparkle(34, 14, 7)} stroke={H} />
    </>
  ),
  'countdown-timer': (
    <>
      <circle cx="24" cy="27" r="13" />
      <path d="M20 9h8M24 9v5M35 15l2.5-2.5" />
      <path d="M24 27V20" stroke={H} />
    </>
  ),
  'social-sharing': (
    <>
      <path d="M17 19h-5v19h24V19h-5" />
      <path d="M24 8v20M18 14l6-6 6 6" stroke={H} />
    </>
  ),

  /* ---------- SEO ---------- */
  'search-engine-setup': (
    <>
      <circle cx="24" cy="24" r="15" />
      <path d="M9 24h30M11 16h26M11 32h26" />
      <ellipse cx="24" cy="24" rx="6.5" ry="15" stroke={H} />
    </>
  ),
  'seo-optimisation': (
    <>
      <circle cx="21" cy="21" r="12" />
      <path d="m30 30 9 9" />
      <path d="m15 25 4-4 3 3 5-5" stroke={H} />
    </>
  ),
  'ai-seo-assistant': (
    <>
      <path d="m9 39 20-20" />
      <path d="m26 16 6 6" />
      <path d={sparkle(34, 12, 6)} stroke={H} />
      <path d={sparkle(16, 14, 3)} />
    </>
  ),
  'google-business-profile-support': (
    <>
      <path d="M8 19 11 10h26l3 9c0 2.5-2 4-4 4s-4-1.5-4-4c0 2.5-2 4-4 4s-4-1.5-4-4c0 2.5-2 4-4 4s-4-1.5-4-4c0 2.5-2 4-4 4s-4-1.5-4-4Z" />
      <path d="M11 23v16h26V23" />
      <rect x="20" y="29" width="8" height="10" rx="1" stroke={H} />
    </>
  ),
  'seo-friendly-articles': (
    <>
      {doc}
      <path d="M17 20h8M17 25h12" />
      <path d="m22 36 1-4 10-10 3 3-10 10Z" stroke={H} />
    </>
  ),
  'website-analytics': (
    <>
      <path d="M8 39h32" />
      <rect x="11" y="25" width="6" height="11" rx="1" />
      <rect x="21" y="11" width="6" height="25" rx="1" stroke={H} />
      <rect x="31" y="19" width="6" height="17" rx="1" />
    </>
  ),
  'search-performance-reports': (
    <>
      <path d="M9 9v30h30" />
      <path d="m14 31 7-8 5 4 11-12" stroke={H} />
    </>
  ),
  'image-optimisation': (
    <>
      <rect x="7" y="9" width="28" height="22" rx="2.5" />
      <path d="m7 26 8-7 6 5 4-3 10 8" />
      <rect x="21" y="23" width="20" height="16" rx="2.5" stroke={H} />
    </>
  ),
  'page-speed-optimisation': (
    <>
      <path d="M9 33a15 15 0 1 1 30 0" />
      <path d="M12 26h2M34 26h2M24 15v2M16.5 18.5l1.4 1.4M31.5 18.5l-1.4 1.4" />
      <path d="m24 33 7-9" stroke={H} />
    </>
  ),
  'local-seo': (
    <>
      <path d={pin(24, 18, 0.85)} />
      <circle cx="24" cy="18" r="3.5" />
      <ellipse cx="24" cy="36" rx="14" ry="4" stroke={H} />
    </>
  ),

  /* ---------- Courses & Events ---------- */
  'course-listings': (
    <>
      <path d="M24 14c-4-3-10-4-15-3v24c5-1 11 0 15 3 4-3 10-4 15-3V11c-5-1-11 0-15 3Z" />
      <path d="M24 14v24" stroke={H} />
    </>
  ),
  'course-registration': (
    <>
      <rect x="10" y="8" width="22" height="32" rx="2.5" />
      <path d="M15 16h12M15 21h12M15 26h7" />
      <path d="m26 38 1-4 10-10 3 3-10 10Z" stroke={H} />
    </>
  ),
  'course-payments': (
    <>
      <rect x="7" y="14" width="34" height="20" rx="2.5" />
      <path d="M12 19v.01M36 29v.01" />
      <circle cx="24" cy="24" r="5" stroke={H} />
    </>
  ),
  'class-schedules': (
    <>
      <rect x="8" y="11" width="26" height="25" rx="3" />
      <path d="M8 18h26M15 8v6M27 8v6" />
      <g stroke={H}>
        <circle cx="34" cy="33" r="7" />
        <path d="M34 30v3l2 2" />
      </g>
    </>
  ),
  'event-ticketing': (
    <>
      <path d="M8 15h32v6a3 3 0 0 0 0 6v6H8v-6a3 3 0 0 0 0-6Z" />
      <path d="M30 15v18" stroke={H} strokeDasharray="2 3" />
    </>
  ),
  'member-login': (
    <>
      <path d="M27 9h9a3 3 0 0 1 3 3v24a3 3 0 0 1-3 3h-9" />
      <path d="M9 24h19M22 18l6 6-6 6" stroke={H} />
    </>
  ),
  'members-only-content': (
    <>
      <rect x="12" y="22" width="24" height="17" rx="3" />
      <path d="M24 29v3" />
      <path d="M17 22v-5a7 7 0 0 1 14 0v5" stroke={H} />
    </>
  ),
  'learning-materials': (
    <>
      <rect x="9" y="31" width="30" height="7" rx="1.5" />
      <rect x="12" y="23" width="26" height="7" rx="1.5" stroke={H} />
      <rect x="10" y="15" width="24" height="7" rx="1.5" />
    </>
  ),
  'student-dashboard': (
    <>
      <rect x="7" y="9" width="34" height="30" rx="3" />
      <rect x="12" y="14" width="10" height="20" rx="1.5" stroke={H} />
      <path d="M27 15h9M27 21h9M27 27h6" />
    </>
  ),
  'membership-plans': (
    <>
      <rect x="7" y="12" width="34" height="24" rx="3" />
      <circle cx="17" cy="22" r="3.5" />
      <path d="M11.5 31a5.5 5.5 0 0 1 11 0" />
      <path d="M27 20h9M27 26h6" stroke={H} />
    </>
  ),

  /* ---------- Business Tools ---------- */
  'customer-enquiry-tracker': (
    <>
      <path d="M8 26 13 11h22l5 15v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2Z" />
      <path d="M8 26h9l2 4h10l2-4h9" stroke={H} />
    </>
  ),
  'automatic-email-replies': (
    <>
      <rect x="8" y="9" width="28" height="19" rx="2.5" />
      <path d="M8 11.5 22 21l14-9.5" />
      <path d="M40 39H27a5 5 0 0 1 0-10h1M36 35l4 4-4 4" stroke={H} />
    </>
  ),
  'appointment-reminders': (
    <>
      <circle cx="24" cy="26" r="12" />
      <path d="M24 20v6l4 3M16 38l-2 3M32 38l2 3" />
      <path d="M8 15a6 6 0 0 1 8-6M40 15a6 6 0 0 0-8-6" stroke={H} />
    </>
  ),
  'customer-database': (
    <>
      <ellipse cx="24" cy="12" rx="13" ry="4.5" />
      <path d="M11 12v24c0 2.5 5.8 4.5 13 4.5s13-2 13-4.5V12" />
      <path d="M11 24c0 2.5 5.8 4.5 13 4.5s13-2 13-4.5" stroke={H} />
    </>
  ),
  // Reused from the original Customer Tracker graphic: people drawn towards the centre
  'lead-management': SOLUTION_LINES['lead-generation'],
  'online-forms': (
    <>
      <rect x="10" y="8" width="28" height="32" rx="2.5" />
      <rect x="15" y="14" width="5" height="5" rx="1" stroke={H} />
      <rect x="15" y="23" width="5" height="5" rx="1" />
      <rect x="15" y="32" width="5" height="3" rx="1" />
      <path d="M24 16.5h9M24 25.5h9" />
    </>
  ),
  'document-uploads': (
    <>
      {doc}
      <path d="M24 33V21M19 26l5-5 5 5" stroke={H} />
    </>
  ),
  'staff-accounts': (
    <>
      <circle cx="21" cy="17" r="7" />
      <path d="M8 39a13 13 0 0 1 21-10" />
      <rect x="29" y="29" width="12" height="10" rx="2" stroke={H} />
    </>
  ),
  'dashboard-and-reports': (
    <>
      <circle cx="24" cy="24" r="15" />
      <path d="M24 24V9a15 15 0 0 1 15 15Z" stroke={H} />
    </>
  ),
  // Reused from the original Admin Automation graphic: work moving forward on its own
  'workflow-automation': SOLUTION_LINES.automation,
  'third-party-integrations': (
    <>
      <rect x="7" y="18" width="18" height="12" rx="6" />
      <rect x="23" y="18" width="18" height="12" rx="6" stroke={H} />
    </>
  ),
  'ai-chat-assistant': (
    <>
      <rect x="10" y="16" width="28" height="20" rx="6" />
      <path d="M24 16v-5" />
      <circle cx="24" cy="9.5" r="1.5" />
      <path d="M19 31h10" />
      <g stroke={H}>
        <circle cx="18.5" cy="24" r="2" />
        <circle cx="29.5" cy="24" r="2" />
      </g>
    </>
  ),
}

export const SOLUTION_ART_KEYS = Object.keys(SOLUTION_ART)

/**
 * Large graphic panel used at the top of solution cards: plain dark tile,
 * centred line art, generous whitespace (same treatment as the original
 * SolutionIllustration).
 */
export function SolutionArtPanel({ id, className }: { id: string; className?: string }) {
  return (
    <div aria-hidden="true" className={cn('grid w-full place-items-center bg-elevated text-fg', className)}>
      <LineIcon className="size-[6.6rem]" strokeWidth={1.25}>
        {SOLUTION_ART[id]}
      </LineIcon>
    </div>
  )
}

/** Small square tile (drawer, quote summary, goal tiles). */
export function SolutionArtTile({ id, className, iconClassName }: { id: string; className?: string; iconClassName?: string }) {
  return (
    <span aria-hidden="true" className={cn('grid size-10 shrink-0 place-items-center rounded-xl bg-elevated text-fg', className)}>
      <LineIcon className={cn('size-[1.65rem]', iconClassName)}>{SOLUTION_ART[id]}</LineIcon>
    </span>
  )
}
