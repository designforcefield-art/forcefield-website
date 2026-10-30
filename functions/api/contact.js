// POST /api/contact
// Receives both website forms (Get Started sign-up and General Enquiry),
// validates them, saves them in D1, then emails support@forcefield.design via Resend.
//
// Body: JSON, or multipart/form-data with a "payload" JSON field plus "files"
// (Get Started attachments). Responses are JSON:
//   200 { ok: true, reference, emailStatus, duplicate? }
//   400 { ok: false, error, fields? }   invalid input
//   413 / 415 / 429 / 503              size, type, rate limit, unavailable
import { ensureEnquirySchema, ipHash, json, notify, sendEmail, enquiryEmail, sha256 } from './_lib.js'

const MAX_JSON = 64 * 1024
const MAX_UPLOAD = 11 * 1024 * 1024 // 10 MB of files + form fields
const MAX_FILES = 5
const MAX_FILE_TOTAL = 10 * 1024 * 1024
const FILE_EXT = /\.(pdf|docx?|jpe?g|png)$/i
const MIN_FORM_MS = 2500
const RATE = { windowMin: 10, max: 5, dayMax: 20 }
const DUPLICATE_WINDOW_MIN = 10

const LIMITS = { name: 100, company: 150, email: 254, phone: 30, message: 5000, link: 500, type: 60 }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[+()\-\s\d]{6,30}$/
const SERVICES = ['discovery', 'essential', 'dynamic']
const ENQUIRY_TYPES = ['General Enquiry', 'Solution Enquiry', 'Careers & Opportunities', 'Other Enquiries']

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function onRequestPost({ request, env }) {
  /* ---------- Read the body (with size limits) ---------- */
  const type = request.headers.get('Content-Type') || ''
  const length = Number(request.headers.get('Content-Length') || 0)
  let body
  let files = []
  try {
    if (type.includes('multipart/form-data')) {
      if (length > MAX_UPLOAD) return json({ ok: false, error: 'Your files are too large. Please keep them under 10 MB in total.' }, 413)
      const form = await request.formData()
      body = JSON.parse(String(form.get('payload') || '{}'))
      files = form.getAll('files').filter((f) => typeof f === 'object' && f && 'arrayBuffer' in f)
    } else if (type.includes('application/json')) {
      const raw = await request.text()
      if (raw.length > MAX_JSON) return json({ ok: false, error: 'Your message is too long.' }, 413)
      body = JSON.parse(raw)
    } else {
      return json({ ok: false, error: 'Unsupported request.' }, 415)
    }
  } catch {
    return json({ ok: false, error: 'We couldn’t read your details. Please try again.' }, 400)
  }
  if (!body || typeof body !== 'object') return json({ ok: false, error: 'We couldn’t read your details.' }, 400)

  /* ---------- Spam checks ---------- */
  const spam = body.spamCheck || {}
  // Honeypot filled: pretend it worked so bots learn nothing, store nothing.
  if (typeof spam.honeypot === 'string' && spam.honeypot.trim() !== '') return json({ ok: true, reference: 'FF-RECEIVED', emailStatus: 'sent' })
  if (!(Number(spam.elapsedMs) >= MIN_FORM_MS)) return json({ ok: false, error: 'That was quick! Please check your details and submit again.' }, 400)
  if (!(Number.isInteger(spam.a) && Number.isInteger(spam.b) && Number(spam.answer) === spam.a + spam.b))
    return json({ ok: false, error: 'Please answer the spam check again.', fields: { captcha: 'Answer the quick sum so we know you’re not a robot.' } }, 400)

  /* ---------- Validate ---------- */
  const form = body.form === 'get-started' ? 'get-started' : body.form === 'general' ? 'general' : null
  const v = {
    name: str(body.name, LIMITS.name),
    company: str(body.company, LIMITS.company),
    email: str(body.email, LIMITS.email).toLowerCase(),
    phone: str(body.phone, LIMITS.phone),
    message: str(body.message, LIMITS.message),
    link: str(body.link, LIMITS.link),
    service: str(body.service, 20),
    enquiryType: str(body.enquiryType, LIMITS.type),
    page: str(body.page, 200),
    key: str(body.idempotencyKey, 64),
  }
  const fields = {}
  if (!form) fields.form = 'Unknown form.'
  if (!v.name) fields.name = 'Enter your name.'
  if (!EMAIL_RE.test(v.email)) fields.email = 'Enter a valid email address.'
  if (v.phone && !PHONE_RE.test(v.phone)) fields.phone = 'Enter a valid contact number.'
  if (body.consent !== true) fields.consent = 'Please confirm you agree to be contacted about your enquiry.'
  if (!/^[A-Za-z0-9-]{16,64}$/.test(v.key)) fields.form = 'Please refresh the page and try again.'
  if (form === 'get-started') {
    if (!v.company) fields.company = 'Enter your company or business name.'
    if (!v.phone) fields.phone = 'Enter your contact number.'
    if (!SERVICES.includes(v.service)) fields.service = 'Choose a service.'
    if (v.link && !/^https:\/\/[^\s]+$/i.test(v.link)) fields.link = 'Use a link that starts with https://'
  }
  if (form === 'general') {
    if (!ENQUIRY_TYPES.includes(v.enquiryType)) fields.type = 'Choose an enquiry type.'
    if (v.message.length < 2) fields.message = 'Enter your message.'
  }
  if (files.length > MAX_FILES) fields.files = `Attach up to ${MAX_FILES} files.`
  const fileTotal = files.reduce((n, f) => n + f.size, 0)
  if (fileTotal > MAX_FILE_TOTAL) fields.files = 'Files must be under 10 MB in total.'
  if (files.some((f) => !FILE_EXT.test(f.name || ''))) fields.files = 'Files must be PDF, Word, JPG or PNG.'
  if (Object.keys(fields).length) return json({ ok: false, error: Object.values(fields)[0], fields }, 400)

  // Structured extras for sign-ups (My Pick etc.), size-capped and reduced to plain values.
  const d = form === 'get-started' && body.details && typeof body.details === 'object' ? body.details : {}
  const details =
    form === 'get-started'
      ? JSON.stringify({
          serviceSource: str(d.serviceSource, 60),
          recommendation: str(d.recommendation, 60),
          selectedSolutions: (Array.isArray(d.selectedSolutions) ? d.selectedSolutions : []).slice(0, 100).map((s) => ({ id: str(s?.id, 60), name: str(s?.name, 80) })),
          otherPicks: (Array.isArray(d.otherPicks) ? d.otherPicks : []).slice(0, 20).map((s) => str(s, 200)),
        }).slice(0, 20000)
      : null
  const attachmentsMeta = files.length ? JSON.stringify(files.map((f) => ({ name: str(f.name, 120), size: f.size, type: str(f.type, 80) }))) : null
  const enquiryType = form === 'get-started' ? 'Sign up' : v.enquiryType
  const consentText = str(body.consentText, 400) || 'Agreed to be contacted about this enquiry.'

  /* ---------- Database unavailable: email only, never a false confirmation ---------- */
  const now = new Date()
  const iso = now.toISOString()
  const reference = `FF-${now.getTime().toString(36).toUpperCase().slice(-5)}${Math.random().toString(36).slice(2, 4).toUpperCase()}`
  const rowBase = {
    reference, form, enquiry_type: enquiryType, service: form === 'get-started' ? v.service : null,
    name: v.name, email: v.email, phone: v.phone || null, company: v.company || null, message: v.message || null,
    shared_link: v.link || null, details_json: details, attachments_json: attachmentsMeta, consent_text: consentText,
    source_page: v.page || null, created_at: iso, email_attempts: 0,
  }
  if (!env.DB) {
    // Not lost: if the email goes out, the team has it. If not, the visitor is told plainly.
    const { subject, html, text } = enquiryEmail(rowBase)
    const r = await sendEmail(env, { subject, html, text, replyTo: v.email, attachments: await toAttachments(files), idempotencyKey: `enquiry-${v.key}` })
    return r.ok
      ? json({ ok: true, reference, emailStatus: 'sent', stored: false })
      : json({ ok: false, error: 'We couldn’t send your details just now. Everything you entered is still here.' }, 503)
  }

  try {
    await ensureEnquirySchema(env.DB)
    const ip = await ipHash(request, env)
    const contentHash = (await sha256(`${form}|${v.email}|${v.name}|${v.message}|${v.service}|${v.enquiryType}`)).slice(0, 32)

    /* ---------- Duplicates: same browser key, or same content shortly after ---------- */
    const existing =
      (await env.DB.prepare('SELECT reference, email_status FROM enquiries WHERE idempotency_key = ?').bind(v.key).first()) ||
      (await env.DB.prepare('SELECT reference, email_status FROM enquiries WHERE email = ? AND content_hash = ? AND created_at >= ? ORDER BY id DESC LIMIT 1')
        .bind(v.email, contentHash, new Date(now.getTime() - DUPLICATE_WINDOW_MIN * 60_000).toISOString())
        .first())
    if (existing) return json({ ok: true, reference: existing.reference, emailStatus: existing.email_status, duplicate: true })

    /* ---------- Rate limit per visitor ---------- */
    const recent = await env.DB.prepare(
      'SELECT SUM(created_at >= ?) AS shortWindow, COUNT(*) AS day FROM enquiries WHERE ip_hash = ? AND created_at >= ?',
    )
      .bind(new Date(now.getTime() - RATE.windowMin * 60_000).toISOString(), ip, new Date(now.getTime() - 86400_000).toISOString())
      .first()
    if ((recent?.shortWindow ?? 0) >= RATE.max || (recent?.day ?? 0) >= RATE.dayMax)
      return json({ ok: false, error: 'Too many submissions from this connection. Please try again later, or reach us on WhatsApp.' }, 429)

    /* ---------- Save first ---------- */
    const res = await env.DB.prepare(
      `INSERT INTO enquiries (reference, idempotency_key, form, enquiry_type, service, name, email, phone, company, message,
        shared_link, details_json, attachments_json, consent_text, source_page, status, email_status, email_attempts,
        ip_hash, content_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 'pending', 0, ?, ?, ?, ?)`,
    )
      .bind(
        reference, v.key, form, enquiryType, rowBase.service, v.name, v.email, rowBase.phone, rowBase.company, rowBase.message,
        rowBase.shared_link, details, attachmentsMeta, consentText, rowBase.source_page, ip, contentHash, iso, iso,
      )
      .run()
    const row = { ...rowBase, id: res.meta.last_row_id }

    /* ---------- Then notify; a failed email never loses the saved enquiry ---------- */
    const mail = await notify(env, row, await toAttachments(files))
    return json({ ok: true, reference, emailStatus: mail.ok ? 'sent' : 'failed' })
  } catch (e) {
    // A race on the same idempotency key means the first request saved it.
    if (String(e?.message || '').includes('UNIQUE')) {
      const again = await env.DB.prepare('SELECT reference, email_status FROM enquiries WHERE idempotency_key = ?').bind(v.key).first().catch(() => null)
      if (again) return json({ ok: true, reference: again.reference, emailStatus: again.email_status, duplicate: true })
    }
    console.error('contact: save failed', e?.message)
    return json({ ok: false, error: 'We couldn’t save your details just now. Everything you entered is still here, so please try again shortly.' }, 503)
  }
}

export const onRequestGet = () => json({ ok: false, error: 'Use POST.' }, 405)

/** Files → Resend attachment objects (base64). */
async function toAttachments(files) {
  const out = []
  for (const f of files) {
    const bytes = new Uint8Array(await f.arrayBuffer())
    let bin = ''
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
    out.push({ filename: f.name, content: btoa(bin) })
  }
  return out
}
