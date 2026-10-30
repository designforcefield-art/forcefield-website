// GET   /api/admin/enquiries/:id          -> full enquiry
// PATCH /api/admin/enquiries/:id {status} -> update status
// Admin session required.
import { ensureEnquirySchema, json, requireAdmin } from '../../_lib.js'

const STATUSES = ['new', 'contacted', 'in_progress', 'closed']

async function guard(request, env) {
  const denied = await requireAdmin(request, env)
  if (denied) return denied
  if (!env.DB) return json({ error: 'The database (D1 binding "DB") is not connected.' }, 503)
  await ensureEnquirySchema(env.DB)
  return null
}

const idOf = (params) => (/^\d{1,12}$/.test(String(params.id)) ? Number(params.id) : null)

export async function onRequestGet({ request, env, params }) {
  const g = await guard(request, env)
  if (g) return g
  const id = idOf(params)
  if (!id) return json({ error: 'Not found.' }, 404)
  const row = await env.DB.prepare(
    `SELECT id, reference, form, enquiry_type, service, name, email, phone, company, message, shared_link, details_json,
            attachments_json, consent_text, source_page, status, email_status, email_attempts, email_error, created_at, updated_at
     FROM enquiries WHERE id = ?`,
  ).bind(id).first()
  if (!row) return json({ error: 'Not found.' }, 404)
  return json({
    ...row,
    details: row.details_json ? JSON.parse(row.details_json) : null,
    attachments: row.attachments_json ? JSON.parse(row.attachments_json) : [],
    details_json: undefined,
    attachments_json: undefined,
  })
}

export async function onRequestPatch({ request, env, params }) {
  const g = await guard(request, env)
  if (g) return g
  const id = idOf(params)
  if (!id) return json({ error: 'Not found.' }, 404)
  let status
  try {
    status = JSON.parse(await request.text()).status
  } catch {
    return json({ error: 'Invalid request.' }, 400)
  }
  if (!STATUSES.includes(status)) return json({ error: 'Invalid status.' }, 400)
  const r = await env.DB.prepare('UPDATE enquiries SET status = ?, updated_at = ? WHERE id = ?').bind(status, new Date().toISOString(), id).run()
  if (!r.meta.changes) return json({ error: 'Not found.' }, 404)
  return json({ ok: true, status })
}
