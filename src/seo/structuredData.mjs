/**
 * Schema.org structured data (JSON-LD). Plain JS so both the running site and
 * the build-time page generator (scripts/seo-pages.mjs) can import it.
 * Only facts visible on the site are used: no ratings, reviews or street address.
 * Prices must match OFFERINGS in src/data/catalogue.ts (scripts/seo-check.mjs fails the build if not).
 */
import seo from './pages.json' with { type: 'json' }

const url = (p) => seo.siteUrl.replace(/\/$/, '') + p

export const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': url('/#organization'),
  name: 'Forcefield Design',
  legalName: 'Forcefield Design Pte. Ltd.',
  url: url('/'),
  logo: url('/logo.png'),
  image: url(seo.ogImage),
  description:
    'Forcefield Design provides websites and digital solutions for Singapore businesses of every size, from startups to established companies.',
  email: 'support@forcefield.design',
  // The number is published on the site as WhatsApp, so it's a contact point rather than a phone line.
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'support@forcefield.design',
    telephone: '+65 8083 6840',
    areaServed: 'SG',
    availableLanguage: ['English'],
  },
  address: { '@type': 'PostalAddress', addressCountry: 'SG' },
  areaServed: { '@type': 'Country', name: 'Singapore' },
  knowsAbout: ['Website design', 'E-commerce websites', 'Online booking systems', 'WhatsApp business chat', 'Local SEO', 'Digital transformation for businesses'],
  sameAs: [
    'https://www.instagram.com/forcefield.design/',
    'https://www.facebook.com/profile.php?id=61577197974708',
    'https://www.linkedin.com/company/askforcefield/',
  ],
}

export const WEBSITE = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': url('/#website'),
  name: 'Forcefield Design',
  url: url('/'),
  inLanguage: 'en-SG',
  publisher: { '@id': url('/#organization') },
}

/** Monthly prices in SGD, as shown on the homepage cards. */
export const PRICES = { essential: 150, dynamic: 300 }

const AUDIENCE = { '@type': 'BusinessAudience', audienceType: 'Singapore businesses of every size, from startups to established companies' }
const monthly = (amount) => ({
  '@type': 'Offer',
  price: String(amount),
  priceCurrency: 'SGD',
  priceSpecification: { '@type': 'UnitPriceSpecification', price: amount, priceCurrency: 'SGD', unitText: 'MONTH' },
})
const service = (name, description, path, offers) => ({
  '@type': 'Service',
  name,
  description,
  url: url(path),
  serviceType: name,
  provider: { '@id': url('/#organization') },
  areaServed: { '@type': 'Country', name: 'Singapore' },
  audience: AUDIENCE,
  ...(offers ? { offers } : {}),
})

export const SERVICES = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Forcefield Design services',
  itemListElement: [
    // Descriptions mirror the homepage cards.
    service('Discovery Consultation', 'Through collaborative workshops, we uncover your business challenges, understand your processes, and recommend digital solutions that work for you.', '/discovery'),
    service('Essential Solution', 'Get your business online without the hassle. We build, manage, and maintain your website so you can focus on what matters.', '/industries', monthly(PRICES.essential)),
    service('Dynamic Solution', 'A powerful website with smart tools and the flexibility to grow alongside your business.', '/industries', monthly(PRICES.dynamic)),
  ].map((item, i) => ({ '@type': 'ListItem', position: i + 1, item })),
}

export function breadcrumbs(path, label) {
  const items = [{ name: 'Home', path: '/' }]
  if (path !== '/') items.push({ name: label, path })
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: url(it.path) })),
  }
}

/** All JSON-LD blocks for a page. */
export function structuredDataFor(path, label) {
  const blocks = [ORGANIZATION, WEBSITE, breadcrumbs(path, label)]
  if (path === '/') blocks.push(SERVICES)
  if (path === '/industries') blocks.push(SERVICES)
  if (path === '/discovery') blocks.push({ '@context': 'https://schema.org', ...SERVICES.itemListElement[0].item })
  return blocks
}
