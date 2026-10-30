// POST /api/admin/enquiries/:id/resend -> sends the notification email again.
// For enquiries whose email failed. Original attachments are not stored, so a
// re-sent email lists the file names only. Admin session required.
import { ensureEnquirySchema, json, notify, requireAdmin } from '../../../_lib.js'

export async function onRequestPost({ request, env, params }) {
  const denied = await requireAdmin(request, env)
  if (denied) return denied
  if (!env.DB) return json({ error: 'The database (D1 binding "DB") is not connected.' }, 503)
  await ensureEnquirySchema(env.DB)
  if (!/^\d{1,12}$/.test(String(params.id))) return json({ error: 'Not found.' }, 404)
  const row = await env.DB.prepare('SELECT * FROM enquiries WHERE id = ?').bind(Number(params.id)).first()
  if (!row) return json({ error: 'Not found.' }, 404)
  if (row.email_status === 'sent') return json({ error: 'This notification was already sent.' }, 409)
  const r = await notify(env, row, [])
  return r.ok ? json({ ok: true, emailStatus: 'sent' }) : json({ ok: false, emailStatus: 'failed', error: r.error }, 502)
}
