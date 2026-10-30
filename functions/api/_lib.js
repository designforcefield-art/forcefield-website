// Shared helpers for the enquiry and admin functions (Cloudflare Pages Functions).
// Files starting with "_" are not routes.
import { json } from './_db.js'

export { json }

/* ------------------------------------------------------------------ */
/* Schema fallback                                                     */
/* ------------------------------------------------------------------ */
// The real setup step is migrations/0002_enquiries.sql. These statements
// mirror it (CREATE ... IF NOT EXISTS) so a missed migration doesn't lose
// enquiries. Keep the two in sync.
const ENQUIRY_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT NOT NULL UNIQUE,
    idempotency_key TEXT NOT NULL UNIQUE,
    form TEXT NOT NULL,
    enquiry_type TEXT NOT NULL,
    service TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    message TEXT,
    shared_link TEXT,
    details_json TEXT,
    attachments_json TEXT,
    consent_text TEXT NOT NULL,
    source_page TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'closed')),
    email_status TEXT NOT NULL DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed')),
    email_attempts INTEGER NOT NULL DEFAULT 0,
    email_error TEXT,
    email_id TEXT,
    ip_hash TEXT,
    content_hash TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  'CREATE INDEX IF NOT EXISTS enquiries_created ON enquiries(created_at)',
  'CREATE INDEX IF NOT EXISTS enquiries_status ON enquiries(status)',
  'CREATE INDEX IF NOT EXISTS enquiries_email_status ON enquiries(email_status)',
  'CREATE INDEX IF NOT EXISTS enquiries_ip ON enquiries(ip_hash, created_at)',
  'CREATE INDEX IF NOT EXISTS enquiries_dupe ON enquiries(email, content_hash, created_at)',
  `CREATE TABLE IF NOT EXISTS admin_login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_hash TEXT NOT NULL,
    ok INTEGER NOT NULL,
    ts INTEGER NOT NULL
  )`,
  'CREATE INDEX IF NOT EXISTS admin_login_ip ON admin_login_attempts(ip_hash, ts)',
]
let schemaReady = false
export async function ensureEnquirySchema(db) {
  if (schemaReady) return
  await db.batch(ENQUIRY_SCHEMA.map((s) => db.prepare(s)))
  schemaReady = true
}

/* ------------------------------------------------------------------ */
/* Crypto helpers                                                      */
/* ------------------------------------------------------------------ */
const enc = new TextEncoder()
const b64url = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

export async function sha256(text) {
  const d = await crypto.subtle.digest('SHA-256', enc.encode(text))
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(message)))
}

export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Salted hash of the visitor's IP: enough for rate limiting, without storing the IP. */
export async function ipHash(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown'
  return (await sha256(`${env.IP_HASH_SALT || 'forcefield-design'}:${ip}`)).slice(0, 32)
}

/* ------------------------------------------------------------------ */
/* Admin sessions                                                      */
/* ------------------------------------------------------------------ */
// Signed, expiring token issued by /api/admin/login. Signed with a key derived
// from ADMIN_PASSWORD (and SESSION_SECRET if set), so changing the password
// signs everyone out.
const SESSION_HOURS = 12
const sessionKey = (env) => `${env.SESSION_SECRET || ''}|${env.ADMIN_PASSWORD}`

export async function createSession(env) {
  const exp = Date.now() + SESSION_HOURS * 3600_000
  const payload = `admin.${exp}`
  return { token: `${payload}.${await hmac(sessionKey(env), payload)}`, expiresAt: exp }
}

/** Returns null when the request is signed in, or the error Response to send. */
export async function requireAdmin(request, env) {
  if (!env.ADMIN_PASSWORD) return json({ error: 'Admin access is not set up (ADMIN_PASSWORD is missing in Cloudflare).' }, 503)
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== 'admin') return json({ error: 'Please log in again.' }, 401)
  const exp = Number(parts[1])
  if (!Number.isFinite(exp) || exp < Date.now()) return json({ error: 'Your session has expired. Please log in again.' }, 401)
  const expected = await hmac(sessionKey(env), `admin.${parts[1]}`)
  if (!safeEqual(parts[2], expected)) return json({ error: 'Please log in again.' }, 401)
  return null
}

/* ------------------------------------------------------------------ */
/* Email (Resend)                                                      */
/* ------------------------------------------------------------------ */
export const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/**
 * Sends one email through Resend. `idempotencyKey` makes retries safe:
 * Resend won't send the same key twice within 24 hours.
 */
export async function sendEmail(env, { subject, html, text, replyTo, attachments, idempotencyKey }) {
  if (!env.RESEND_API_KEY) return { ok: false, error: 'RESEND_API_KEY is not set' }
  const body = {
    from: env.EMAIL_FROM || 'Forcefield Design <notifications@forcefield.design>',
    to: (env.EMAIL_TO || 'support@forcefield.design').split(',').map((s) => s.trim()),
    subject,
    html,
    text,
  }
  if (replyTo) body.reply_to = replyTo
  if (attachments?.length) body.attachments = attachments
  try {
    const res = await fetch(env.RESEND_API_URL || 'https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.id) return { ok: true, id: data.id }
    // Keep only a short, safe reason (Resend error names/messages contain no secrets).
    return { ok: false, error: `Resend ${res.status}: ${String(data.message || data.name || 'error').slice(0, 160)}` }
  } catch (e) {
    return { ok: false, error: `Resend unreachable: ${String(e?.message || e).slice(0, 120)}` }
  }
}

const SERVICE_NAMES = { discovery: 'Discovery Consultation', essential: 'Essential Solution', dynamic: 'Dynamic Solution' }
export const serviceName = (id) => SERVICE_NAMES[id] || id || ''

/** Builds the notification email for one stored enquiry row. */
export function enquiryEmail(row) {
  const details = row.details_json ? JSON.parse(row.details_json) : {}
  const files = row.attachments_json ? JSON.parse(row.attachments_json) : []
  const sgTime = new Date(row.created_at).toLocaleString('en-SG', { timeZone: 'Asia/Singapore', dateStyle: 'medium', timeStyle: 'short' })
  const isSignUp = row.form === 'get-started'
  const rows = [
    ['Reference', row.reference],
    ['Form', isSignUp ? 'Get Started (sign-up)' : 'General Enquiry'],
    ['Enquiry type', row.enquiry_type],
    isSignUp && ['Service chosen', serviceName(row.service)],
    isSignUp && details.serviceSource && ['How it was chosen', details.serviceSource],
    isSignUp && ['Recommended solution (My Pick)', details.recommendation || '-'],
    isSignUp && ['Selected solutions', (details.selectedSolutions || []).map((s) => s.name).join(', ') || '-'],
    isSignUp && details.otherPicks?.length && ['Other My Pick items', details.otherPicks.join('; ')],
    ['Name', row.name],
    row.company && ['Company', row.company],
    ['Email', row.email],
    ['Contact number', row.phone || '-'],
    [isSignUp ? 'Business brief' : 'Message', row.message || '-'],
    isSignUp && ['Shared link (not opened by the site)', row.shared_link || '-'],
    isSignUp && ['Files', files.length ? files.map((f) => `${f.name} (${Math.round(f.size / 1024)} KB)`).join(', ') : '-'],
    ['Consent', row.consent_text],
    ['Submitted', `${sgTime} (Singapore time)`],
    ['Page', row.source_page || '-'],
  ].filter(Boolean)

  const subject = `[Forcefield Enquiry] ${isSignUp ? `New Sign-up (${serviceName(row.service)})` : `New Contact Request (${row.enquiry_type})`} — ${row.name}`.slice(0, 200)
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#18181b">
<table role="presentation" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e4e4e7">
<tr><td style="padding:24px 28px 8px"><p style="margin:0;font-size:13px;color:#71717a">Forcefield Design · ${escapeHtml(row.reference)}</p>
<h1 style="margin:6px 0 0;font-size:20px;font-weight:600">${escapeHtml(isSignUp ? 'New sign-up' : 'New contact request')} from ${escapeHtml(row.name)}</h1></td></tr>
<tr><td style="padding:16px 28px 28px"><table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:8px 12px 8px 0;border-top:1px solid #f4f4f5;color:#71717a;vertical-align:top;width:34%">${escapeHtml(k)}</td><td style="padding:8px 0;border-top:1px solid #f4f4f5;white-space:pre-wrap;word-break:break-word">${escapeHtml(v)}</td></tr>`,
  )
  .join('\n')}
</table><p style="margin:20px 0 0;font-size:13px;color:#71717a">Reply to this email to answer ${escapeHtml(row.name)} directly.</p></td></tr></table></body></html>`
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n')
  return { subject, html, text }
}

/** Sends (or re-sends) the notification for a stored enquiry and records the result. */
export async function notify(env, row, attachments) {
  const { subject, html, text } = enquiryEmail(row)
  const r = await sendEmail(env, { subject, html, text, replyTo: row.email, attachments, idempotencyKey: `enquiry-${row.reference}-${row.email_attempts + 1}` })
  const now = new Date().toISOString()
  await env.DB.prepare(
    `UPDATE enquiries SET email_status = ?, email_attempts = email_attempts + 1, email_error = ?, email_id = COALESCE(?, email_id), updated_at = ? WHERE id = ?`,
  )
    .bind(r.ok ? 'sent' : 'failed', r.ok ? null : r.error, r.ok ? r.id : null, now, row.id)
    .run()
  return r
}
