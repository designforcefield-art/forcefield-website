import { Bell, CalendarCheck, Check, MessageCircle, Star } from 'lucide-react'

/**
 * Hero "product shot": a sample business website taking a booking, with the
 * kind of notifications a business owner would actually see. Illustrative only.
 */
export function HeroVisual() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[64rem] select-none">

      {/* Browser window: drifts very gently */}
      <div className="animate-drift">
      <div className="relative overflow-hidden rounded-[1.25rem] border border-line-strong bg-surface shadow-float sm:rounded-[1.75rem]">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="size-2.5 rounded-full bg-raised" />
          <span className="size-2.5 rounded-full bg-raised" />
          <span className="size-2.5 rounded-full bg-raised" />
          <span className="mx-auto hidden rounded-full bg-elevated px-6 py-1 text-[0.7rem] text-subtle sm:block">yourbusiness.com</span>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-[1.3fr_1fr] sm:p-10">
          {/* Sample website */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-[0.7rem] text-muted sm:text-xs">
              <span className="font-semibold text-fg">Harbour Physio</span>
              <span className="hidden gap-4 sm:flex"><span>Services</span><span>About</span><span>Contact</span></span>
            </div>
            <p className="mt-4 text-2xl leading-[1.05] font-semibold tracking-[-0.04em] sm:text-4xl">
              Feel better,<br />move freely.
            </p>
            <p className="max-w-xs text-xs text-muted sm:text-sm">Sports and back pain physiotherapy in the heart of the city.</p>
            <div className="flex gap-2">
              <span className="rounded-full bg-white px-4 py-2 text-xs font-medium text-black">Book a visit</span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-medium">WhatsApp us</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted">
              {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="size-3.5 fill-warning text-warning" />)}
              <span className="ml-1">Found on Google</span>
            </div>
          </div>

          {/* Booking widget */}
          <div className="rounded-2xl border border-line-strong bg-elevated p-4 sm:p-5">
            <p className="flex items-center gap-2 text-sm font-semibold"><CalendarCheck className="size-4 text-cyan" /> Book an appointment</p>
            <p className="mt-3 text-xs text-muted">Thursday, 14 November</p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              {['9:00', '10:30', '12:00', '14:00', '15:30', '17:00'].map((t, i) => (
                <span key={t} className={i === 4 ? 'animate-slot-glow rounded-lg bg-electric py-2 text-center font-medium text-white' : 'rounded-lg bg-raised py-2 text-center text-muted'}>{t}</span>
              ))}
            </div>
            <span className="relative mt-4 flex items-center justify-center gap-1.5 overflow-hidden rounded-full bg-white py-2.5 text-xs font-medium text-black">
              <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-electric/15 to-transparent" />
              <Check className="size-3.5" strokeWidth={3} /> Confirm booking
            </span>
          </div>
        </div>
      </div>
      </div>

      {/* Notifications the owner sees */}
      {/* Each card: slides in once, then hovers on its own rhythm */}
      <div className="absolute top-[22%] -left-2 hidden w-60 animate-hover-a md:block lg:-left-10">
        <div className="flex animate-notify-in items-start gap-3 rounded-2xl border border-line-strong bg-elevated p-3.5 shadow-float [animation-delay:0.75s]">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-electric text-white"><Bell className="size-4 origin-top animate-ring" /></span>
          <span className="text-xs">
            <span className="block font-semibold">New booking</span>
            <span className="text-muted">Sarah · Thu 3:30pm</span>
          </span>
        </div>
      </div>
      <div className="absolute -right-2 bottom-[14%] hidden w-64 animate-hover-b [animation-delay:-3s] md:block lg:-right-10">
        <div className="flex animate-notify-in items-start gap-3 rounded-2xl border border-line-strong bg-elevated p-3.5 shadow-float [animation-delay:1.6s]">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-success text-black"><MessageCircle className="size-4" /></span>
          <span className="text-xs">
            <span className="block font-semibold">New enquiry on WhatsApp</span>
            <span className="text-muted">Replied instantly</span>
          </span>
        </div>
      </div>
    </div>
  )
}
