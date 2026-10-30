import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import seo from './pages.json'
import { structuredDataFor } from './structuredData.mjs'

/**
 * Keeps the page <head> in step with the current route: title, description,
 * canonical URL, social tags, robots and JSON-LD. The build step
 * (scripts/seo-pages.mjs) writes the same tags into each page's static HTML,
 * so search engines see them before any JavaScript runs.
 */
const abs = (p: string) => seo.siteUrl.replace(/\/$/, '') + p

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = value
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

export function Seo() {
  const { pathname } = useLocation()
  useEffect(() => {
    const path = pathname === '/contact' ? '/get-started' : pathname.replace(/\/$/, '') || '/'
    const page = seo.pages.find((p) => p.path === path)
    const title = page?.title ?? (path === '/admin' ? 'Admin | Forcefield Design' : seo.noindex.title)
    const description = page?.description ?? seo.noindex.description
    document.title = title
    setMeta('name', 'description', description)
    setMeta('name', 'robots', page ? 'index, follow' : 'noindex, follow')
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    if (page) {
      setLink('canonical', abs(page.path))
      setMeta('property', 'og:url', abs(page.path))
    } else {
      document.head.querySelector('link[rel="canonical"]')?.remove()
    }
    document.head.querySelectorAll('script[data-seo-ld]').forEach((s) => s.remove())
    if (page) {
      for (const block of structuredDataFor(page.path, page.label)) {
        const s = document.createElement('script')
        s.type = 'application/ld+json'
        s.dataset.seoLd = ''
        s.textContent = JSON.stringify(block)
        document.head.appendChild(s)
      }
    }
  }, [pathname])
  return null
}
