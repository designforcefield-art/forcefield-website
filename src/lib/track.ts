/**
 * Anonymous usage tracking for the All Solutions page.
 * Sends small events to /api/track (a Cloudflare Pages Function, see
 * functions/api/track.js). No names, emails or cookies: just which options
 * were chosen and which solutions were added to My Pick, plus a random id per
 * browser tab so visits can be counted. Fails silently if the endpoint is
 * missing (local dev, the Claude preview).
 */
export type TrackEvent = 'industry' | 'goal' | 'category' | 'search' | 'add' | 'remove'

const enabled = import.meta.env.VITE_ROUTER !== 'memory' && typeof window !== 'undefined'

function sessionId(): string {
  try {
    let id = sessionStorage.getItem('ff.sid')
    if (!id) {
      id = Math.random().toString(36).slice(2, 12)
      sessionStorage.setItem('ff.sid', id)
    }
    return id
  } catch {
    return 'nosession'
  }
}

/** Filters active on the All Solutions page, attached to every event for context. */
let context: { industry: string | null; goal: string | null; category: string | null } = {
  industry: null,
  goal: null,
  category: null,
}
export function setTrackContext(c: typeof context) {
  context = c
}

export function track(event: TrackEvent, value: string) {
  if (!enabled || !value) return
  const body = JSON.stringify({
    e: event,
    v: value.slice(0, 60),
    p: window.location.pathname,
    sid: sessionId(),
    ...context,
  })
  try {
    if (navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'application/json' }))) return
  } catch {
    /* fall through */
  }
  fetch('/api/track', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {})
}
