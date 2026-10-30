import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Page-load reveal: each section's content fades and rises in, one block after
 * another, as the section comes into view. Runs on every page change.
 * Skipped entirely for visitors who prefer reduced motion.
 */
const STEP_MS = 108
const MAX_STEPS = 6

/** Walks down single-child wrappers (section → container → …) to the blocks worth staggering. */
function blocksOf(section: Element): Element[] {
  let el = section
  while (el.children.length === 1 && el.firstElementChild) el = el.firstElementChild
  const kids = [...el.children].filter((c) => !(c instanceof HTMLElement && c.hidden))
  return kids.length ? kids : [section]
}

export function RevealManager() {
  const { key } = useLocation()
  // Layout effect: hide before the first paint, so content never flashes visible then hidden.
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const main = document.getElementById('main')
    if (!main || !('IntersectionObserver' in window)) return

    const sections = [...main.children]
    const items: HTMLElement[] = []
    const cleanup = (el: HTMLElement) => {
      el.classList.remove('reveal-item', 'is-in')
      el.style.removeProperty('--reveal-delay')
    }
    sections.forEach((s) =>
      blocksOf(s).forEach((b, i) => {
        if (!(b instanceof HTMLElement)) return
        b.style.setProperty('--reveal-delay', `${Math.min(i, MAX_STEPS) * STEP_MS}ms`)
        b.classList.add('reveal-item')
        items.push(b)
      }),
    )

    const pending = new Set(sections)
    // Remove the reveal classes once everything in the block (buttons last) has settled.
    const timers: number[] = []
    const show = (s: Element) =>
      blocksOf(s).forEach((b, i) => {
        b.classList.add('is-in')
        if (b instanceof HTMLElement) timers.push(window.setTimeout(() => cleanup(b), Math.min(i, MAX_STEPS) * STEP_MS + 1600))
      })
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          show(e.target)
          pending.delete(e.target)
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
    )
    sections.forEach((s) => io.observe(s))
    // Fast scrolls can jump right past a section; reveal anything already above the fold line.
    const onScroll = () => {
      const line = window.innerHeight * 0.92
      pending.forEach((s) => {
        if (s.getBoundingClientRect().top < line) {
          show(s)
          pending.delete(s)
          io.unobserve(s)
        }
      })
      if (!pending.size) window.removeEventListener('scroll', onScroll)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    // Safety net: never leave content hidden.
    const fallback = window.setTimeout(() => sections.forEach((s) => pending.has(s) && show(s)), 4000)
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(fallback)
      timers.forEach((id) => window.clearTimeout(id))
      items.forEach(cleanup)
    }
  }, [key])
  return null
}
