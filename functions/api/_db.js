// Shared helpers for the analytics functions (Cloudflare Pages Functions + D1).
export const SCHEMA = `CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  day TEXT NOT NULL,
  sid TEXT,
  event TEXT NOT NULL,
  value TEXT NOT NULL,
  page TEXT,
  industry TEXT,
  goal TEXT,
  category TEXT
)`
export const INDEXES = [
  'CREATE INDEX IF NOT EXISTS events_day ON events(day)',
  'CREATE INDEX IF NOT EXISTS events_event ON events(event, value)',
]

export async function ensureSchema(db) {
  await db.batch([db.prepare(SCHEMA), ...INDEXES.map((s) => db.prepare(s))])
}

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  })
