/**
 * Schema.org structured data (JSON-LD). Plain JS so both the running site and
 * the build-time page generator (scripts/seo-pages.mjs) can import it. Only facts already stated on the site are used:
 * no prices, ratings or street address.
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
  telephone: '+65 8083 6840',
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
    service('Discovery Consultation', 'Workshops that uncover your business challenges and identify the right digital solutions.', '/discovery'),
    service('Essential Solution', 'A professional 3-page website, fully managed by our team, with preset pages and features for your industry.', '/industries', monthly(150)),
    service('Dynamic Solution', 'A scalable website with full control, AI SEO tools, customisable features and dedicated support.', '/industries', monthly(300)),
  ].map((item, i) => ({ '@type': 'ListItem', position: i + 1, item })),
}

export const INDUSTRIES = [
  'Food & Beverage',
  'Beauty & Wellness',
  'Retail & E-commerce',
  'Interior Design & Renovation',
  'Professional Services',
  'Property & Real Estate',
  'Education & Training',
]

export const INDUSTRY_LIST = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Website solutions by industry in Singapore',
  itemListElement: INDUSTRIES.map((name, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: service(`${name} website`, `Website solution for ${name.toLowerCase()} businesses in Singapore.`, '/industries'),
  })),
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
  if (path === '/industries') blocks.push(INDUSTRY_LIST, SERVICES)
  if (path === '/discovery') blocks.push({ '@context': 'https://schema.org', ...SERVICES.itemListElement[0].item })
  return blocks
}
