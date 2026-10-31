/**
 * Post-build SEO checks (runs after scripts/seo-pages.mjs in `npm run build`).
 * Fails the build if the generated SEO output is inconsistent, so a broken
 * canonical, sitemap or price never reaches Cloudflare Pages.
 * No dependencies: plain Node.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import seo from '../src/seo/pages.json' with { type: 'json' }
import { PRICES } from '../src/seo/structuredData.mjs'

if (process.env.VITE_ROUTER === 'hash') process.exit(0) // hash builds have no per-page files

const DIST = 'dist'
const SITE = (process.env.SITE_URL || seo.siteUrl).replace(/\/$/, '')
const errors = []
const fail = (msg) => errors.push(msg)
const read = (f) => readFileSync(join(DIST, f), 'utf8')
const all = (html, re) => [...html.matchAll(re)].map((m) => m[1])
const fileFor = (path) => (path === '/' ? 'index.html' : `${path.slice(1)}.html`)

/* ---------- Domain ---------- */
if (!/^https:\/\/[^/]+$/.test(SITE)) fail(`siteUrl must be https with no trailing slash: ${SITE}`)
if (SITE.includes('://www.')) fail(`siteUrl must not use www: ${SITE}`)

/* ---------- Indexable pages ---------- */
const titles = new Set()
const descriptions = new Set()
for (const page of seo.pages) {
  const file = fileFor(page.path)
  if (!existsSync(join(DIST, file))) {
    fail(`${page.path}: missing ${file}`)
    continue
  }
  const html = read(file)
  const url = SITE + page.path
  const tag = `${page.path} (${file})`

  const t = all(html, /<title>([^<]*)<\/title>/g)
  const d = all(html, /<meta name="description" content="([^"]*)"/g)
  const c = all(html, /<link rel="canonical" href="([^"]*)"/g)
  const og = all(html, /<meta property="og:url" content="([^"]*)"/g)
  const robots = all(html, /<meta name="robots" content="([^"]*)"/g)
  const img = all(html, /<meta property="og:image" content="([^"]*)"/g)

  if (t.length !== 1) fail(`${tag}: expected 1 <title>, found ${t.length}`)
  if (d.length !== 1) fail(`${tag}: expected 1 meta description, found ${d.length}`)
  if (c.length !== 1 || c[0] !== url) fail(`${tag}: canonical should be exactly ${url}, found ${JSON.stringify(c)}`)
  if (og.length !== 1 || og[0] !== url) fail(`${tag}: og:url should be ${url}`)
  if (robots.length !== 1 || !robots[0].startsWith('index')) fail(`${tag}: robots should allow indexing`)
  if (img.length !== 1 || !img[0].startsWith(SITE + '/')) fail(`${tag}: og:image must be one absolute URL on ${SITE}`)
  else if (!existsSync(join(DIST, img[0].slice(SITE.length)))) fail(`${tag}: og:image file not found in dist`)
  if (html.includes('www.forcefield.design')) fail(`${tag}: contains www.forcefield.design`)

  const title = t[0] ?? ''
  const desc = (d[0] ?? '').replace(/&amp;/g, '&')
  if (titles.has(title)) fail(`${tag}: duplicate title`)
  if (descriptions.has(desc)) fail(`${tag}: duplicate description`)
  titles.add(title)
  descriptions.add(desc)
  if (title.replace(/&amp;/g, '&').length > 65) fail(`${tag}: title longer than 65 characters`)
  if (desc.length < 70 || desc.length > 160) fail(`${tag}: description should be 70–160 characters (is ${desc.length})`)

  for (const block of all(html, /<script type="application\/ld\+json" data-seo-ld>([\s\S]*?)<\/script>/g)) {
    try {
      const json = JSON.parse(block)
      for (const u of JSON.stringify(json).match(/https?:\/\/[^"]*forcefield\.design[^"]*/g) ?? [])
        if (!u.startsWith(SITE) && !u.includes('instagram.com')) fail(`${tag}: JSON-LD URL off-domain: ${u}`)
    } catch {
      fail(`${tag}: invalid JSON-LD`)
    }
  }
}

/* ---------- Non-indexable pages ---------- */
for (const f of ['admin.html', '404.html']) {
  if (!existsSync(join(DIST, f))) {
    fail(`missing ${f}`)
    continue
  }
  const html = read(f)
  if (!/<meta name="robots" content="noindex/.test(html)) fail(`${f}: must be noindex`)
  if (/rel="canonical"/.test(html)) fail(`${f}: must not have a canonical`)
  if (/application\/ld\+json/.test(html)) fail(`${f}: must not have structured data`)
}

/* ---------- Sitemap ---------- */
const sitemap = read('sitemap.xml')
if (!sitemap.startsWith('<?xml') || !/<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/.test(sitemap) || !sitemap.trim().endsWith('</urlset>'))
  fail('sitemap.xml: not a valid urlset document')
if ((sitemap.match(/<url>/g) ?? []).length !== (sitemap.match(/<\/url>/g) ?? []).length) fail('sitemap.xml: unbalanced <url> tags')
const locs = all(sitemap, /<loc>([^<]*)<\/loc>/g)
const expected = seo.pages.map((p) => SITE + p.path)
if (new Set(locs).size !== locs.length) fail('sitemap.xml: duplicate URLs')
if (JSON.stringify([...locs].sort()) !== JSON.stringify([...expected].sort())) fail(`sitemap.xml: URLs should be ${expected.join(', ')}`)
const today = new Date().toISOString().slice(0, 10)
for (const lm of all(sitemap, /<lastmod>([^<]*)<\/lastmod>/g))
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lm) || lm > today) fail(`sitemap.xml: bad lastmod ${lm}`)
if (/<priority>|<changefreq>/.test(sitemap)) fail('sitemap.xml: priority/changefreq are ignored by Google; leave them out')

/* ---------- robots.txt ---------- */
const robots = read('robots.txt')
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) fail('robots.txt: missing or wrong Sitemap line')
if (/^Disallow:\s*\/\s*$/m.test(robots)) fail('robots.txt: blocks the whole site')
for (const page of seo.pages)
  for (const rule of all(robots, /^Disallow:\s*(\S+)/gm))
    if (page.path !== '/' && page.path.startsWith(rule)) fail(`robots.txt: ${rule} blocks ${page.path}`)

/* ---------- _redirects ---------- */
for (const line of read('_redirects').split('\n').filter((l) => l.trim() && !l.startsWith('#'))) {
  const [from, to, code] = line.trim().split(/\s+/)
  if (from === to) fail(`_redirects: loop ${line}`)
  if (to === '/' && from.includes('*')) fail(`_redirects: wildcard to the homepage (${line})`)
  if (!['301', '302', '308', '200'].includes(code)) fail(`_redirects: missing status in ${line}`)
  if (seo.pages.some((p) => p.path === from)) fail(`_redirects: redirects an indexable page ${from}`)
}

/* ---------- Prices in structured data match the site ---------- */
const catalogue = readFileSync('src/data/catalogue.ts', 'utf8')
for (const tier of ['essential', 'dynamic']) {
  const block = catalogue.match(new RegExp(`id: '${tier}',[\\s\\S]*?price: \\{ amount: 'S\\$(\\d+)'`))
  if (!block) fail(`catalogue.ts: no price found for ${tier}`)
  else if (Number(block[1]) !== PRICES[tier]) fail(`Structured data price for ${tier} (S$${PRICES[tier]}) differs from the site (S$${block[1]})`)
}

if (errors.length) {
  console.error(`SEO check failed (${errors.length}):\n - ${errors.join('\n - ')}`)
  process.exit(1)
}
console.log(`SEO check passed: ${seo.pages.length} pages, sitemap, robots.txt, _redirects, prices`)
