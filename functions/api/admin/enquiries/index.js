// GET /api/admin/enquiries?status=new&email=failed&form=general&q=tan&offset=0
// Lists enquiries for the Admin page (newest first). Admin session required.
import { ensureEnquirySchema, json, requireAdmin } from '../../_lib.js'

const STATUSES = ['new', 'contacted', 'in_progress', 'closed']
const EMAIL = ['pending', 'sent', 'failed']
const PAGE = 50

export async function onRequestGet({ request, env }) {
  const denied = await requireAdmin(request, env)
  if (denied) return denied
  if (!env.DB) return json({ error: 'The database (D1 binding "DB") is not connected.' }, 503)
  await ensureEnquirySchema(env.DB)

  const p = new URL(request.url).searchParams
  const where = []
  const args = []
  if (STATUSES.includes(p.get('status'))) where.push('status = ?') && args.push(p.get('status'))
  if (EMAIL.includes(p.get('email'))) where.push('email_status = ?') && args.push(p.get('email'))
  if (['get-started', 'general'].includes(p.get('form'))) where.push('form = ?') && args.push(p.get('form'))
  const q = (p.get('q') || '').trim().slice(0, 80)
  if (q) {
    where.push('(name LIKE ? OR email LIKE ? OR company LIKE ? OR reference LIKE ?)')
    args.push(...Array(4).fill(`%${q.replace(/[%_]/g, '')}%`))
  }
  const offset = Math.max(parseInt(p.get('offset') || '0', 10) || 0, 0)
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const [list, total, counts] = await env.DB.batch([
    env.DB.prepare(
      `SELECT id, reference, form, enquiry_type, service, name, email, company, status, email_status, created_at
       FROM enquiries ${clause} ORDER BY id DESC LIMIT ${PAGE} OFFSET ?`,
    ).bind(...args, offset),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM enquiries ${clause}`).bind(...args),
    env.DB.prepare(
      `SELECT SUM(status = 'new') AS new, SUM(status = 'contacted') AS contacted, SUM(status = 'in_progress') AS in_progress,
              SUM(status = 'closed') AS closed, SUM(email_status = 'failed') AS failed, SUM(email_status = 'pending') AS pending, COUNT(*) AS total
       FROM enquiries`,
    ),
  ])
  return json({ items: list.results, total: total.results[0]?.n ?? 0, pageSize: PAGE, offset, counts: counts.results[0] ?? {} })
}
