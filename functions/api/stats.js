// GET /api/stats?days=30&industry=fnb : aggregated stats for the Admin page.
// Protected by the ADMIN_PASSWORD environment variable (sent as a Bearer token).
import { ensureSchema, json } from './_db.js'

function sameSecret(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function onRequestGet({ request, env }) {
  if (!env.ADMIN_PASSWORD) return json({ error: 'ADMIN_PASSWORD is not set in Cloudflare.' }, 503)
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
  if (!sameSecret(token, env.ADMIN_PASSWORD)) return json({ error: 'Wrong password.' }, 401)
  if (!env.DB) return json({ error: 'The analytics database (D1 binding "DB") is not connected.' }, 503)

  const url = new URL(request.url)
  const days = Math.min(Math.max(parseInt(url.searchParams.get('days') || '30', 10) || 30, 1), 3650)
  const industry = /^[a-z0-9-]{1,40}$/.test(url.searchParams.get('industry') || '') ? url.searchParams.get('industry') : null
  const since = Date.now() - days * 86400_000

  // Every query shares the same date (and optional industry) filter.
  const where = `ts >= ?${industry ? ' AND industry = ?' : ''}`
  const args = industry ? [since, industry] : [since]
  const q = (sql, ...extra) => env.DB.prepare(sql).bind(...args, ...extra)

  await ensureSchema(env.DB)
  const [totals, adds, industries, goals, categories, searches, daily] = await env.DB.batch([
    q(`SELECT
         SUM(event = 'add') AS adds,
         SUM(event = 'remove') AS removes,
         COUNT(DISTINCT sid) AS sessions,
         COUNT(DISTINCT CASE WHEN event = 'add' THEN sid END) AS sessionsWithAdds
       FROM events WHERE ${where}`),
    q(`SELECT value, SUM(event = 'add') AS adds, SUM(event = 'remove') AS removes
       FROM events WHERE ${where} AND event IN ('add','remove')
       GROUP BY value ORDER BY adds DESC, removes ASC LIMIT 100`),
    // Industry choices ignore the industry filter so the breakdown stays meaningful.
    env.DB.prepare(`SELECT value, COUNT(*) AS n FROM events WHERE ts >= ? AND event = 'industry' GROUP BY value ORDER BY n DESC`).bind(since),
    q(`SELECT value, COUNT(*) AS n FROM events WHERE ${where} AND event = 'goal' GROUP BY value ORDER BY n DESC`),
    q(`SELECT value, COUNT(*) AS n FROM events WHERE ${where} AND event = 'category' GROUP BY value ORDER BY n DESC`),
    q(`SELECT value, COUNT(*) AS n FROM events WHERE ${where} AND event = 'search' GROUP BY value ORDER BY n DESC LIMIT 30`),
    q(`SELECT day, SUM(event = 'add') AS adds, COUNT(DISTINCT sid) AS sessions
       FROM events WHERE ${where} GROUP BY day ORDER BY day`),
  ])
  return json({
    days,
    industry,
    totals: totals.results[0] ?? {},
    adds: adds.results,
    industries: industries.results,
    goals: goals.results,
    categories: categories.results,
    searches: searches.results,
    daily: daily.results,
  })
}
