import { FORMS } from '../../config/forms'

const MESSAGE = 'Hi Forcefield Design, I’d like to know more about your digital solutions.'

/** Floating WhatsApp chat button, bottom-right on every page. Opens WhatsApp in a new tab. */
export function WhatsAppFloat() {
  const href = `https://wa.me/${FORMS.whatsappNumber}?text=${encodeURIComponent(MESSAGE)}`
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp (opens in a new tab)"
      className="group/wa fixed right-[max(1rem,env(safe-area-inset-right,0px))] bottom-[max(1rem,env(safe-area-inset-bottom,0px))] z-[60] flex animate-wa-in items-center sm:right-6 sm:bottom-6"
    >
      <span className="pointer-events-none mr-3 hidden translate-x-2 rounded-full border border-line-strong bg-elevated px-4 py-2 text-sm font-medium text-fg opacity-0 shadow-float transition-all duration-300 ease-out-expo group-hover/wa:translate-x-0 group-hover/wa:opacity-100 group-focus-visible/wa:translate-x-0 group-focus-visible/wa:opacity-100 sm:block">
        Chat with us
      </span>
      <span className="relative grid size-14 place-items-center rounded-full border border-white/10 bg-[#2c2c2e] text-white shadow-[0_10px_30px_-8px_rgb(0_0_0/0.6)] group-hover/wa:bg-[#3a3a3c] transition-[transform,background-color] duration-300 ease-out-expo group-hover/wa:scale-105 group-focus-visible/wa:ring-2 group-focus-visible/wa:ring-electric/70 group-active/wa:scale-95">
        <span className="absolute inset-0 animate-wa-pulse rounded-full bg-white/25" aria-hidden="true" />
        <svg viewBox="0 0 32 32" className="relative size-7" aria-hidden="true">
          <path d="M16.04 3C8.86 3 3.04 8.82 3.04 16c0 2.29.6 4.53 1.74 6.5L3 29l6.68-1.75A12.95 12.95 0 0 0 16.04 29C23.22 29 29 23.18 29 16S23.22 3 16.04 3Z" fill="currentColor" />
          <path d="M21.87 18.68c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66 0 1.57 1.14 3.09 1.3 3.3.16.21 2.25 3.43 5.44 4.81.76.33 1.35.52 1.82.67.76.24 1.46.21 2.01.13.61-.09 1.89-.77 2.15-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" className="fill-[#2c2c2e] transition-colors duration-300 group-hover/wa:fill-[#3a3a3c]" />
        </svg>
      </span>
    </a>
  )
}
