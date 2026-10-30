// POST /api/admin/login  { password } -> { token, expiresAt }
// Checks ADMIN_PASSWORD on the server and issues a signed 12-hour session.
// Brute-force protection: 5 failed attempts per connection per 15 minutes.
import { createSession, ensureEnquirySchema, ipHash, json, safeEqual } from '../_lib.js'

const WINDOW_MS = 15 * 60_000
const MAX_FAILS = 5

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) return json({ error: 'Admin access is not set up (ADMIN_PASSWORD is missing in Cloudflare).' }, 503)
  let password = ''
  try {
    const raw = await request.text()
    if (raw.length > 1000) return json({ error: 'Invalid request.' }, 400)
    password = String(JSON.parse(raw).password ?? '')
  } catch {
    return json({ error: 'Invalid request.' }, 400)
  }

  const ip = await ipHash(request, env)
  const now = Date.now()
  if (env.DB) {
    await ensureEnquirySchema(env.DB)
    const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM admin_login_attempts WHERE ip_hash = ? AND ok = 0 AND ts >= ?').bind(ip, now - WINDOW_MS).first()
    if ((row?.n ?? 0) >= MAX_FAILS) return json({ error: 'Too many attempts. Please wait 15 minutes and try again.' }, 429)
  }

  const ok = safeEqual(password, env.ADMIN_PASSWORD)
  if (env.DB) {
    await env.DB.batch([
      env.DB.prepare('INSERT INTO admin_login_attempts (ip_hash, ok, ts) VALUES (?, ?, ?)').bind(ip, ok ? 1 : 0, now),
      env.DB.prepare('DELETE FROM admin_login_attempts WHERE ts < ?').bind(now - 7 * 86400_000),
    ])
  }
  if (!ok) {
    await new Promise((r) => setTimeout(r, 400)) // slow down guessing
    return json({ error: 'Wrong password.' }, 401)
  }
  return json(await createSession(env))
}

export const onRequestGet = () => json({ error: 'Use POST.' }, 405)
