// POST /api/track: stores one anonymous event from the All Solutions page.
import { ensureSchema, json } from './_db.js'

const EVENTS = new Set(['industry', 'goal', 'category', 'search', 'add', 'remove'])
const ID = /^[a-z0-9-]{1,60}$/
const clean = (v) => (typeof v === 'string' && ID.test(v) ? v : null)

export async function onRequestPost({ request, env }) {
  if (!env.DB) return new Response(null, { status: 204 }) // database not connected yet: ignore quietly
  const text = await request.text()
  if (text.length > 2000) return new Response(null, { status: 413 })
  let b
  try {
    b = JSON.parse(text)
  } catch {
    return new Response(null, { status: 400 })
  }
  if (!EVENTS.has(b.e)) return new Response(null, { status: 400 })
  // Search terms: lowercase, letters/numbers/spaces only, 40 chars max. Other values must be ids.
  const value =
    b.e === 'search'
      ? String(b.v ?? '').toLowerCase().replace(/[^a-z0-9 &-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40)
      : clean(b.v)
  if (!value || (b.e === 'search' && value.length < 2)) return new Response(null, { status: 400 })

  const now = Date.now()
  try {
    await ensureSchema(env.DB)
    await env.DB.prepare(
      'INSERT INTO events (ts, day, sid, event, value, page, industry, goal, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(
        now,
        new Date(now + 8 * 3600_000).toISOString().slice(0, 10), // Singapore date
        typeof b.sid === 'string' ? b.sid.slice(0, 16) : null,
        b.e,
        value,
        typeof b.p === 'string' ? b.p.slice(0, 40) : null,
        clean(b.industry),
        clean(b.goal),
        clean(b.category),
      )
      .run()
  } catch {
    return new Response(null, { status: 500 })
  }
  return new Response(null, { status: 204 })
}

export const onRequestGet = () => json({ error: 'Use POST' }, 405)
