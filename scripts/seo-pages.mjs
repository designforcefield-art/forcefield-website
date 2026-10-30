/**
 * Post-build SEO step (runs after `vite build`):
 *  - writes a static HTML file per page (dist/about/index.html, …) with that
 *    page's title, description, canonical URL, social tags and JSON-LD
 *  - writes sitemap.xml, robots.txt and Cloudflare Pages _redirects
 * Set SITE_URL to override the domain in pages.json (e.g. a staging domain).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import seo from '../src/seo/pages.json' with { type: 'json' }
import { structuredDataFor } from '../src/seo/structuredData.mjs'

const DIST = 'dist'
const SITE = (process.env.SITE_URL || seo.siteUrl).replace(/\/$/, '')
const hashMode = process.env.VITE_ROUTER === 'hash'
const abs = (p) => SITE + p
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const today = new Date().toISOString().slice(0, 10)

const template = readFileSync(join(DIST, 'index.html'), 'utf8')
if (!template.includes('<!--seo:start-->')) throw new Error('index.html is missing the <!--seo:start--> marker')

function head(page) {
  const ld = structuredDataFor(page.path, page.label)
    .map((b) => `<script type="application/ld+json" data-seo-ld>${JSON.stringify(b).replace(/</g, '\\u003c')}</script>`)
    .join('\n    ')
  return `<!--seo:start-->
    <title>${esc(page.title)}</title>
    <meta name="description" content="${esc(page.description)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${abs(page.path)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(seo.siteName)}" />
    <meta property="og:locale" content="en_SG" />
    <meta property="og:url" content="${abs(page.path)}" />
    <meta property="og:title" content="${esc(page.title)}" />
    <meta property="og:description" content="${esc(page.description)}" />
    <meta property="og:image" content="${abs(seo.ogImage)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(page.title)}" />
    <meta name="twitter:description" content="${esc(page.description)}" />
    <meta name="twitter:image" content="${abs(seo.ogImage)}" />
    ${ld}
    <!--seo:end-->`
}

const render = (page) => template.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, head(page))

for (const page of seo.pages) {
  if (page.path !== '/' && hashMode) continue // hash URLs: only the home page file exists
  const file = page.path === '/' ? join(DIST, 'index.html') : join(DIST, page.path.slice(1), 'index.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, render(page))
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${seo.pages
  .map((p) => `  <url>\n    <loc>${abs(p.path)}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${p.priority}</priority>\n  </url>`)
  .join('\n')}
</urlset>
`
if (!hashMode) writeFileSync(join(DIST, 'sitemap.xml'), sitemap)
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n${hashMode ? '' : `\nSitemap: ${abs('/sitemap.xml')}\n`}`)

// Cloudflare Pages: permanent redirects for retired addresses, then the app for anything else.
writeFileSync(
  join(DIST, '_redirects'),
  ['/contact /get-started 301', '/finder /solutions 301', '/industries/* /industries 301'].join('\n') + '\n',
)
console.log(`SEO: ${hashMode ? 1 : seo.pages.length} page file(s), sitemap, robots.txt, _redirects for ${SITE}`)
