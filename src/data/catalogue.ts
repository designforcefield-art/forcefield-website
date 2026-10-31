/**
 * MOCK CATALOGUE — V1
 * ------------------------------------------------------------------
 * Edit this file to change what the site sells. Everything (cards, industry
 * pages, Solution Finder, recommendation engine, My Pick) reads from here.
 * To move to a CMS later, replace these exports with fetched data of the
 * same shape (see ./types.ts).
 *
 * Pricing is intentionally null — the UI shows "Request quote" until
 * Forcefield defines real price bands.
 */
import type {
  DiscoveryService,
  Feature,
  FeatureCategory,
  Industry,
  Option,
  Partnership,
  ChallengeId,
  GoalId,
  IndustryId,
  Solution,
  SolutionCategoryId,
} from './types'

/* ------------------------------------------------------------------ */
/* Finder options                                                      */
/* ------------------------------------------------------------------ */

export const INDUSTRY_OPTIONS: Option<IndustryId>[] = [
  { id: 'fnb', label: 'Food & Beverage', short: 'food & beverage', icon: 'UtensilsCrossed' },
  { id: 'beauty', label: 'Beauty & Wellness', short: 'beauty & wellness', icon: 'Flower2' },
  { id: 'retail', label: 'Retail & E-commerce', short: 'retail', icon: 'ShoppingBag' },
  { id: 'interior', label: 'Interior Design & Renovation', short: 'interior & renovation', icon: 'Sofa' },
  { id: 'professional', label: 'Professional Services', short: 'professional services', icon: 'Briefcase' },
  { id: 'property', label: 'Property & Real Estate', short: 'property', icon: 'Building2' },
  { id: 'education', label: 'Education & Training', short: 'education & training', icon: 'GraduationCap' },
  { id: 'other', label: 'Something Else', short: 'your industry', icon: 'Sparkles' },
]

export const CHALLENGE_OPTIONS: Option<ChallengeId>[] = [
  { id: 'visibility', label: 'People have trouble finding my business online.', short: 'people struggle to find you online' },
  { id: 'enquiries', label: "I'm not getting enough enquiries.", short: "you're not getting enough enquiries" },
  { id: 'conversion', label: "I'm getting enquiries, but not enough customers.", short: "enquiries aren't turning into customers" },
  { id: 'repetitive', label: 'My team spends too much time on repetitive work.', short: 'your team loses time to repetitive work' },
  { id: 'tracking', label: "It's hard to keep track of customers and enquiries.", short: "customers and enquiries are hard to keep track of" },
  { id: 'performance', label: "I'm not sure how well my business is performing.", short: "you can't easily see how the business is performing" },
  { id: 'tools', label: "My current tools aren't working well together.", short: "your tools don't work well together" },
  { id: 'unsure', label: "I'm not quite sure yet.", short: 'not sure yet' },
]

export const GOAL_OPTIONS: Option<GoalId>[] = [
  { id: 'online', label: 'Get my business online.', short: 'get online' },
  { id: 'reach', label: 'Reach more potential customers.', short: 'reach more customers' },
  { id: 'more-enquiries', label: 'Get more enquiries.', short: 'get more enquiries' },
  { id: 'sales', label: 'Increase sales.', short: 'increase sales' },
  { id: 'save-time', label: 'Save time and reduce manual work.', short: 'save time' },
  { id: 'retention', label: 'Keep customers coming back.', short: 'keep customers coming back' },
  { id: 'insight', label: 'Understand my business better.', short: 'understand your business better' },
  { id: 'scale', label: 'Grow without adding more complexity.', short: 'grow without extra complexity' },
  { id: 'unsure', label: "I'm not quite sure yet.", short: 'not sure yet' },
]

export const MAX_CHALLENGES = 3
export const MAX_GOALS = 2

/* ------------------------------------------------------------------ */
/* Feature categories & modular features                              */
/* ------------------------------------------------------------------ */

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  { id: 'website', name: 'Your Website', icon: 'LayoutTemplate' },
  { id: 'lead', name: 'Getting Enquiries', icon: 'Magnet' },
  { id: 'booking', name: 'Bookings', icon: 'CalendarCheck' },
  { id: 'commerce', name: 'Selling Online', icon: 'ShoppingCart' },
  { id: 'customer', name: 'Your Customers', icon: 'Users' },
  { id: 'automation', name: 'Saving Time', icon: 'Workflow' },
  { id: 'analytics', name: 'Reports', icon: 'ChartNoAxesColumn' },
  { id: 'integrations', name: 'Linking Your Apps', icon: 'Plug' },
]

const ALL = ['business-website', 'lead-generation', 'ecommerce', 'booking', 'automation', 'customer-management'] as const
const WEB = ['business-website', 'lead-generation', 'ecommerce', 'booking'] as const

export const FEATURES: Feature[] = [
  // Website & Content
  {
    id: 'pages', name: 'Website Pages',
    description: 'Home, about, services and contact pages, in a ready-made design.',
    category: 'website', compatibleWith: [...WEB],
    availability: { essential: 'included', dynamic: 'included' }, additionalFee: false,
    addresses: ['visibility'], supports: ['online', 'reach'],
  },
  {
    id: 'cms', name: 'Edit It Yourself',
    description: 'Change words, photos and prices yourself. No tech skills needed.',
    category: 'website', compatibleWith: [...WEB],
    availability: { essential: 'included', dynamic: 'included' }, additionalFee: false,
    addresses: ['repetitive'], supports: ['save-time', 'scale'],
  },
  {
    id: 'seo', name: 'Get Found on Google',
    description: 'Set up so people searching on Google can find you, including your Google listing.',
    category: 'website', compatibleWith: [...WEB],
    availability: { essential: 'included', dynamic: 'included' }, additionalFee: false,
    addresses: ['visibility', 'enquiries'], supports: ['reach', 'online', 'more-enquiries'],
  },
  {
    id: 'multilingual', name: 'More Than One Language',
    description: 'Show your website in English, Chinese, Malay or other languages.',
    category: 'website', compatibleWith: [...WEB],
    availability: { essential: 'unavailable', dynamic: 'addon' }, additionalFee: true,
    addresses: ['visibility'], supports: ['reach'],
    industries: ['beauty', 'education', 'property'],
  },
  {
    id: 'blog', name: 'News & Updates',
    description: 'Share news, tips and stories about your work.',
    category: 'website', compatibleWith: [...WEB],
    availability: { essential: 'addon', dynamic: 'included' }, additionalFee: false,
    requires: ['cms'],
    addresses: ['visibility'], supports: ['reach'],
    industries: ['interior', 'professional', 'education'],
  },
  {
    id: 'portfolio', name: 'Photo Gallery of Your Work',
    description: 'Show past projects or listings in a neat gallery.',
    category: 'website', compatibleWith: ['business-website', 'lead-generation'],
    availability: { essential: 'included', dynamic: 'included' }, additionalFee: false,
    addresses: ['conversion'], supports: ['more-enquiries'],
    industries: ['interior', 'property', 'professional'],
  },

  // Lead Generation
  {
    id: 'enquiry-forms', name: 'Enquiry Form',
    description: 'A simple form for customer questions. Messages go straight to your email.',
    category: 'lead', compatibleWith: [...ALL],
    availability: { essential: 'included', dynamic: 'included' }, additionalFee: false,
    addresses: ['enquiries', 'conversion'], supports: ['more-enquiries'],
  },
  {
    id: 'chat-button', name: 'WhatsApp Button',
    description: 'Customers can message you on WhatsApp in one tap.',
    category: 'lead', compatibleWith: [...WEB],
    availability: { essential: 'included', dynamic: 'included' }, additionalFee: false,
    addresses: ['enquiries'], supports: ['more-enquiries', 'reach'],
    industries: ['fnb', 'interior', 'property', 'retail'],
  },
  {
    id: 'lead-pipeline', name: 'Enquiry Tracker',
    description: 'See every enquiry in one list, and who still needs a reply.',
    category: 'lead', compatibleWith: ['lead-generation', 'customer-management', 'automation'],
    availability: { essential: 'unavailable', dynamic: 'included' }, additionalFee: false,
    requires: ['enquiry-forms'],
    addresses: ['conversion', 'tracking'], supports: ['sales', 'more-enquiries'],
    industries: ['interior', 'property', 'professional'],
  },
  {
    id: 'landing-pages', name: 'Promotion Pages',
    description: 'Special pages for ads, events or offers.',
    category: 'lead', compatibleWith: ['lead-generation', 'business-website', 'ecommerce'],
    availability: { essential: 'addon', dynamic: 'included' }, additionalFee: true,
    addresses: ['enquiries', 'visibility'], supports: ['more-enquiries', 'reach'],
  },
  {
    id: 'newsletter', name: 'Email Sign-up',
    description: 'Collect customer emails so you can send news and offers.',
    category: 'lead', compatibleWith: [...WEB],
    availability: { essential: 'included', dynamic: 'included' }, additionalFee: false,
    addresses: ['enquiries'], supports: ['retention', 'reach'],
    industries: ['retail', 'fnb', 'education'],
  },

  // Booking & Scheduling
  {
    id: 'online-booking', name: 'Online Booking',
    description: 'Customers pick a time and book themselves, day or night.',
    category: 'booking', compatibleWith: ['booking', 'business-website', 'lead-generation'],
    availability: { essential: 'addon', dynamic: 'included' }, additionalFee: true,
    addresses: ['repetitive', 'conversion'], supports: ['save-time', 'sales'],
    industries: ['fnb', 'beauty', 'education', 'professional', 'interior'],
  },
  {
    id: 'reminders', name: 'Booking Reminders',
    description: 'Automatic email or SMS reminders, so fewer people forget.',
    category: 'booking', compatibleWith: ['booking', 'customer-management', 'automation'],
    availability: { essential: 'addon', dynamic: 'included' }, additionalFee: true,
    requires: ['online-booking'],
    addresses: ['repetitive'], supports: ['save-time', 'retention'],
    industries: ['beauty', 'education', 'fnb'],
  },
  {
    id: 'multi-staff', name: 'Bookings for Each Staff Member',
    description: 'A separate calendar for each person, room or branch.',
    category: 'booking', compatibleWith: ['booking'],
    availability: { essential: 'unavailable', dynamic: 'included' }, additionalFee: false,
    requires: ['online-booking'],
    addresses: ['repetitive', 'tracking'], supports: ['scale', 'save-time'],
    industries: ['beauty', 'education'],
  },

  // Sales & Commerce
  {
    id: 'catalogue', name: 'Product Pages',
    description: 'Show your products with photos, prices and options.',
    category: 'commerce', compatibleWith: ['ecommerce', 'business-website'],
    availability: { essential: 'included', dynamic: 'included' }, additionalFee: false,
    addresses: ['visibility'], supports: ['sales', 'online'],
    industries: ['retail', 'fnb'],
  },
  {
    id: 'payments', name: 'Online Payments',
    description: 'Accept card and PayNow payments safely.',
    category: 'commerce', compatibleWith: ['ecommerce', 'booking'],
    availability: { essential: 'included', dynamic: 'included' }, additionalFee: true,
    addresses: ['conversion'], supports: ['sales'],
    industries: ['retail', 'fnb', 'education'],
  },
  {
    id: 'promotions', name: 'Discount Codes',
    description: 'Run sales and give out discount codes.',
    category: 'commerce', compatibleWith: ['ecommerce'],
    availability: { essential: 'addon', dynamic: 'included' }, additionalFee: false,
    requires: ['payments'],
    addresses: ['conversion'], supports: ['sales', 'retention'],
    industries: ['retail', 'fnb'],
  },
  {
    id: 'inventory-sync', name: 'Stock Updates',
    description: 'Keep stock numbers the same in your shop and online.',
    category: 'commerce', compatibleWith: ['ecommerce'],
    availability: { essential: 'unavailable', dynamic: 'addon' }, additionalFee: true,
    requires: ['catalogue'],
    addresses: ['repetitive', 'tools'], supports: ['save-time', 'scale'],
    industries: ['retail'],
  },

  // Customer Management
  {
    id: 'customer-records', name: 'Customer List',
    description: "Every customer's details and history in one place.",
    category: 'customer', compatibleWith: ['customer-management', 'lead-generation', 'booking', 'ecommerce'],
    availability: { essential: 'included', dynamic: 'included' }, additionalFee: false,
    addresses: ['tracking'], supports: ['retention', 'insight'],
  },
  {
    id: 'customer-portal', name: 'Customer Login Area',
    description: 'Customers log in to check their bookings, orders or project progress.',
    category: 'customer', compatibleWith: ['customer-management', 'booking', 'ecommerce'],
    availability: { essential: 'unavailable', dynamic: 'addon' }, additionalFee: true,
    requires: ['customer-records'],
    addresses: ['repetitive', 'tracking'], supports: ['retention', 'scale'],
    industries: ['interior', 'professional', 'education'],
  },
  {
    id: 'loyalty', name: 'Rewards for Regulars',
    description: 'Simple rewards and reminder emails that bring customers back.',
    category: 'customer', compatibleWith: ['customer-management', 'ecommerce', 'booking'],
    availability: { essential: 'unavailable', dynamic: 'included' }, additionalFee: false,
    requires: ['customer-records'],
    addresses: ['conversion'], supports: ['retention', 'sales'],
    industries: ['fnb', 'retail', 'beauty'],
  },

  // Business Automation
  {
    id: 'auto-replies', name: 'Instant Replies',
    description: 'Every enquiry gets a friendly reply straight away.',
    category: 'automation', compatibleWith: [...ALL],
    availability: { essential: 'included', dynamic: 'included' }, additionalFee: false,
    addresses: ['repetitive', 'conversion'], supports: ['save-time', 'more-enquiries'],
  },
  {
    id: 'workflows', name: 'Automatic Follow-ups',
    description: 'Tasks and follow-ups happen on their own, so nothing is forgotten.',
    category: 'automation', compatibleWith: ['automation', 'customer-management', 'lead-generation'],
    availability: { essential: 'unavailable', dynamic: 'included' }, additionalFee: false,
    addresses: ['repetitive', 'tools'], supports: ['save-time', 'scale'],
  },
  {
    id: 'documents', name: 'Quotation Maker',
    description: 'Create quotations from templates in a few clicks.',
    category: 'automation', compatibleWith: ['automation', 'customer-management'],
    availability: { essential: 'unavailable', dynamic: 'addon' }, additionalFee: true,
    addresses: ['repetitive'], supports: ['save-time', 'sales'],
    industries: ['interior', 'professional', 'property'],
  },

  // Analytics & Reporting
  {
    id: 'insights', name: 'Simple Reports',
    description: 'See how many people visit and where your enquiries come from.',
    category: 'analytics', compatibleWith: [...ALL],
    availability: { essential: 'included', dynamic: 'included' }, additionalFee: false,
    addresses: ['performance'], supports: ['insight'],
  },
  {
    id: 'dashboard', name: 'Business Overview',
    description: 'One screen showing your enquiries, bookings and sales.',
    category: 'analytics', compatibleWith: ['customer-management', 'automation', 'ecommerce', 'booking'],
    availability: { essential: 'unavailable', dynamic: 'included' }, additionalFee: false,
    addresses: ['performance', 'tracking'], supports: ['insight', 'scale'],
  },

  // Integrations
  {
    id: 'crm-integration', name: 'Link to Customer Software',
    description: 'Connect to customer software you already use, like HubSpot or Zoho.',
    category: 'integrations', compatibleWith: ['lead-generation', 'customer-management', 'automation', 'ecommerce'],
    availability: { essential: 'unavailable', dynamic: 'addon' }, additionalFee: true,
    conflictsWith: ['customer-records'],
    addresses: ['tools', 'tracking'], supports: ['scale'],
  },
  {
    id: 'accounting', name: 'Link to Accounting',
    description: 'Send sales and invoices to Xero or QuickBooks automatically.',
    category: 'integrations', compatibleWith: ['ecommerce', 'automation', 'customer-management'],
    availability: { essential: 'unavailable', dynamic: 'addon' }, additionalFee: true,
    addresses: ['tools', 'repetitive'], supports: ['save-time'],
  },
  {
    id: 'calendar-sync', name: 'Calendar Link',
    description: 'Bookings appear in your Google or Outlook calendar.',
    category: 'integrations', compatibleWith: ['booking', 'customer-management', 'automation'],
    availability: { essential: 'included', dynamic: 'included' }, additionalFee: false,
    addresses: ['tools'], supports: ['save-time'],
  },
  {
    id: 'custom-connector', name: 'Link to Other Apps',
    description: "Connect another app you use. We'll check it with you when we quote.",
    category: 'integrations', compatibleWith: ['automation', 'customer-management', 'ecommerce'],
    availability: { essential: 'unavailable', dynamic: 'addon' }, additionalFee: true,
    addresses: ['tools'], supports: ['scale', 'save-time'],
  },
]

/* Note: crm-integration "conflicts" with the built-in customer list — you would
 * keep customer data in one system, not two. The engine flags this rather
 * than silently dropping either. */

/* ------------------------------------------------------------------ */
/* Solutions                                                           */
/* ------------------------------------------------------------------ */

export const SOLUTION_CATEGORIES: { id: SolutionCategoryId; name: string }[] = [
  { id: 'presence', name: 'Websites' },
  { id: 'growth', name: 'More Customers' },
  { id: 'commerce', name: 'Sales & Bookings' },
  { id: 'operations', name: 'Saving Time' },
]

const TBC = { setup: null, recurring: null }

export const SOLUTIONS: Solution[] = [
  {
    id: 'business-website',
    name: 'Business Website',
    tagline: 'A professional website for your business.',
    description: 'A good-looking website built from a ready-made design, so customers can find you, trust you and get in touch.',
    category: 'presence', icon: 'Globe',
    industries: 'all',
    problems: ['visibility'],
    goals: ['online', 'reach'],
    coreFeatures: ['pages', 'cms', 'seo', 'enquiry-forms', 'insights'],
    packages: {
      essential: {
        summary: 'A website of up to 6 pages with everything you need to look professional.',
        capabilities: ['Up to 6 pages', 'Edit it yourself', 'Get found on Google', 'Enquiry form', 'Simple reports'],
      },
      dynamic: {
        summary: 'More pages and more ways to share news and offers.',
        capabilities: ['Up to 15 pages', 'News & updates', 'Promotion pages', 'More than one language', 'Online booking can be added'],
      },
    },
    pricing: { essential: TBC, dynamic: TBC },
    themes: [
      { name: 'Meridian', mood: 'Clean and professional', swatches: ['#0f172a', '#1e293b', '#60a5fa'], layout: 'split' },
      { name: 'Hearth', mood: 'Warm and welcoming', swatches: ['#1c1917', '#292524', '#f59e0b'], layout: 'stacked' },
      { name: 'Studio', mood: 'Bold and visual', swatches: ['#111827', '#1f2937', '#a78bfa'], layout: 'grid' },
    ],
    discoveryWhen: "You're not sure what your website needs to do, or who it's for.",
  },
  {
    id: 'lead-generation',
    name: 'Enquiry Website',
    tagline: 'A website that turns visitors into enquiries.',
    description: 'A website designed to get people to contact you, with easy forms, a WhatsApp button and instant replies, so no enquiry is missed.',
    category: 'growth', icon: 'Magnet',
    industries: ['interior', 'property', 'professional', 'education', 'beauty'],
    problems: ['enquiries', 'conversion', 'visibility'],
    goals: ['more-enquiries', 'reach', 'sales'],
    coreFeatures: ['pages', 'seo', 'enquiry-forms', 'chat-button', 'auto-replies', 'insights'],
    packages: {
      essential: {
        summary: 'A website and forms that collect enquiries and reply straight away.',
        capabilities: ['Website made to get enquiries', 'Enquiry form', 'WhatsApp button', 'Instant replies', 'Simple reports'],
      },
      dynamic: {
        summary: 'Adds an enquiry tracker and automatic follow-ups.',
        capabilities: ['Everything in Essential', 'Enquiry tracker', 'Promotion pages', 'Automatic follow-ups', 'Link to customer software'],
      },
    },
    pricing: { essential: TBC, dynamic: TBC },
    themes: [
      { name: 'Signal', mood: 'Sharp and confident', swatches: ['#0b1120', '#172036', '#38bdf8'], layout: 'split' },
      { name: 'Atelier', mood: 'Refined and visual', swatches: ['#18181b', '#27272a', '#e4c590'], layout: 'grid' },
      { name: 'Keystone', mood: 'Calm and trustworthy', swatches: ['#0c1a17', '#132a25', '#34d399'], layout: 'stacked' },
    ],
    discoveryWhen: "Enquiries come in from many places and you're not sure where you're losing them.",
  },
  {
    id: 'ecommerce',
    name: 'Online Shop',
    tagline: 'Sell your products online.',
    description: 'A ready-to-go online shop with product pages and safe payments, plus simple ways to keep customers coming back.',
    category: 'commerce', icon: 'ShoppingBag',
    industries: ['retail', 'fnb'],
    problems: ['conversion', 'visibility'],
    goals: ['sales', 'online', 'retention'],
    coreFeatures: ['pages', 'catalogue', 'payments', 'customer-records', 'insights'],
    packages: {
      essential: {
        summary: 'An online shop for up to 100 products, with safe payments.',
        capabilities: ['Your own online shop', 'Up to 100 products', 'Online payments', 'Order emails', 'Sales reports'],
      },
      dynamic: {
        summary: 'More products, discount codes, rewards and stock that stays up to date.',
        capabilities: ['Unlimited products', 'Discount codes', 'Rewards for regulars', 'Business overview', 'Stock and accounting links'],
      },
    },
    pricing: { essential: TBC, dynamic: TBC },
    themes: [
      { name: 'Aisle', mood: 'Simple, products first', swatches: ['#0a0a0a', '#171717', '#f5f5f5'], layout: 'grid' },
      { name: 'Pantry', mood: 'Friendly and local', swatches: ['#1a1410', '#2a2018', '#fb923c'], layout: 'stacked' },
      { name: 'Vault', mood: 'Premium and dark', swatches: ['#0b0d12', '#151a24', '#93c5fd'], layout: 'split' },
    ],
    discoveryWhen: 'You sell in several places (shop, marketplaces, social media) and need to decide how it all fits together.',
  },
  {
    id: 'booking',
    name: 'Booking System',
    tagline: 'Let customers book you online.',
    description: 'Customers book themselves at any time. Reminders go out automatically, and bookings land in your calendar.',
    category: 'commerce', icon: 'CalendarCheck',
    industries: ['beauty', 'education', 'fnb', 'professional', 'interior'],
    problems: ['repetitive', 'conversion'],
    goals: ['save-time', 'sales', 'retention'],
    coreFeatures: ['pages', 'online-booking', 'calendar-sync', 'auto-replies', 'insights'],
    packages: {
      essential: {
        summary: 'Online booking for one calendar, with confirmations.',
        capabilities: ['Online booking', 'Booking confirmations', 'Calendar link', 'Reminders can be added', 'Booking reports'],
      },
      dynamic: {
        summary: 'Bookings for each staff member, reminders, deposits and a customer login.',
        capabilities: ['Bookings for each staff member', 'Booking reminders', 'Deposits and payments', 'Customer login area', 'Business overview'],
      },
    },
    pricing: { essential: TBC, dynamic: TBC },
    themes: [
      { name: 'Clinic', mood: 'Calm and clear', swatches: ['#0b1416', '#12222a', '#5eead4'], layout: 'split' },
      { name: 'Table', mood: 'Warm hospitality', swatches: ['#160f0d', '#241814', '#f97316'], layout: 'stacked' },
      { name: 'Class', mood: 'Bright and organised', swatches: ['#0d0f1a', '#181b2e', '#818cf8'], layout: 'grid' },
    ],
    discoveryWhen: 'Your bookings have lots of rules, rooms or locations.',
  },
  {
    id: 'automation',
    name: 'Admin Automation',
    tagline: 'Let the system handle repetitive admin.',
    description: 'Follow-ups, quotations and updates between your apps happen on their own, so your team spends time on real work.',
    category: 'operations', icon: 'Workflow',
    industries: 'all',
    problems: ['repetitive', 'tools'],
    goals: ['save-time', 'scale'],
    coreFeatures: ['enquiry-forms', 'auto-replies', 'workflows', 'insights'],
    packages: {
      essential: {
        summary: 'Tidy enquiry handling with instant replies. Full automation needs Dynamic.',
        capabilities: ['Enquiry form', 'Instant replies', 'Email alerts for your team', 'Calendar link', 'Simple reports'],
      },
      dynamic: {
        summary: 'Automatic follow-ups and tasks, linked to the apps you already use.',
        capabilities: ['Automatic follow-ups', 'Quotation maker', 'Links to accounting and customer software', 'Business overview', 'Links to other apps'],
      },
    },
    pricing: { essential: TBC, dynamic: TBC },
    themes: [
      { name: 'Console', mood: 'Focused workspace', swatches: ['#0b0d12', '#151a24', '#3b82f6'], layout: 'split' },
      { name: 'Ledger', mood: 'Orderly and calm', swatches: ['#101312', '#1a201e', '#86efac'], layout: 'grid' },
    ],
    discoveryWhen: "You haven't worked out yet which tasks could be automated.",
  },
  {
    id: 'customer-management',
    name: 'Customer Tracker',
    tagline: 'Keep track of every customer.',
    description: 'One place for customer details, enquiries and follow-ups, instead of spreadsheets and chat messages.',
    category: 'operations', icon: 'Users',
    industries: 'all',
    problems: ['tracking', 'conversion', 'performance'],
    goals: ['retention', 'insight', 'sales'],
    coreFeatures: ['customer-records', 'enquiry-forms', 'auto-replies', 'insights'],
    packages: {
      essential: {
        summary: 'A customer list with notes, tags and enquiry history.',
        capabilities: ['Customer list', 'Enquiry history', 'Tags and notes', 'Instant replies', 'Simple reports'],
      },
      dynamic: {
        summary: 'Adds an enquiry tracker, automatic follow-ups, rewards and a business overview.',
        capabilities: ['Enquiry tracker', 'Automatic follow-ups', 'Rewards for regulars', 'Business overview', 'Customer login area'],
      },
    },
    pricing: { essential: TBC, dynamic: TBC },
    themes: [
      { name: 'Relay', mood: 'Clear and simple', swatches: ['#0b0f18', '#141b2a', '#60a5fa'], layout: 'split' },
      { name: 'Circle', mood: 'Friendly', swatches: ['#120f18', '#1e1828', '#f0abfc'], layout: 'grid' },
    ],
    discoveryWhen: 'Customer details are spread across several apps and people.',
  },
]

/* ------------------------------------------------------------------ */
/* Industries — reference solutions & features by ID only              */
/* ------------------------------------------------------------------ */

export const INDUSTRIES: Industry[] = [
  {
    id: 'fnb', name: 'Food & Beverage', icon: 'UtensilsCrossed',
    intro: 'Help customers discover your menu, make reservations, and stay updated on promotions.',
    challenges: ['Diners choose the place they can find and book fastest', 'Reservations come by phone, message and walk-in', 'Menus and promotions change faster than the website', 'Regulars stop coming without a reason to return'],
    recommendedSolutions: ['business-website', 'booking', 'ecommerce'],
    popularFeatures: ['online-booking', 'chat-button', 'catalogue', 'loyalty', 'reminders'],
  },
  {
    id: 'beauty', name: 'Beauty & Wellness', icon: 'Flower2',
    intro: 'Showcase your services, simplify bookings, and keep customers coming back.',
    challenges: ['Bookings arrive by phone, DM and WhatsApp', 'No-shows leave empty chairs', 'Treatments and prices change but the website doesn’t', 'Regulars drift away without a reason to return'],
    recommendedSolutions: ['booking', 'business-website', 'customer-management'],
    popularFeatures: ['online-booking', 'reminders', 'chat-button', 'portfolio', 'loyalty'],
  },
  {
    id: 'retail', name: 'Retail & E-commerce', icon: 'ShoppingBag',
    intro: 'Showcase your products, accept orders, and make shopping easier.',
    challenges: ['Online stock and shop stock don’t match', 'Shoppers leave before paying', 'Sales and offers are hard to run everywhere at once', 'Hard to know who buys and why'],
    recommendedSolutions: ['ecommerce', 'customer-management', 'automation'],
    popularFeatures: ['catalogue', 'payments', 'promotions', 'inventory-sync', 'newsletter'],
  },
  {
    id: 'interior', name: 'Interior Design & Renovation', icon: 'Sofa',
    intro: 'Showcase your work, build credibility, and generate more enquiries.',
    challenges: ['Homeowners compare several firms at once', 'Enquiries come in without a budget or timeline', 'Quotations take hours to prepare', 'Project updates are lost in group chats'],
    recommendedSolutions: ['lead-generation', 'customer-management', 'automation'],
    popularFeatures: ['portfolio', 'enquiry-forms', 'lead-pipeline', 'documents', 'customer-portal'],
  },
  {
    id: 'professional', name: 'Professional Services', icon: 'Briefcase',
    intro: 'Build trust, showcase your expertise, and turn visitors into enquiries.',
    challenges: ['New clients judge you in seconds', 'Setting up a first call takes lots of back-and-forth', 'Follow-ups depend on someone remembering', 'Hard to know where your best clients come from'],
    recommendedSolutions: ['business-website', 'lead-generation', 'customer-management'],
    popularFeatures: ['blog', 'online-booking', 'lead-pipeline', 'crm-integration', 'insights'],
  },
  {
    id: 'property', name: 'Property & Real Estate', icon: 'Building2',
    intro: 'Showcase your listings, respond to enquiries faster, and win more viewings.',
    challenges: ['Enquiries come from many websites and ads', 'Slow replies lose interested buyers', 'Viewings are hard to arrange', 'Listings on your own website go out of date'],
    recommendedSolutions: ['lead-generation', 'customer-management', 'booking'],
    popularFeatures: ['portfolio', 'landing-pages', 'chat-button', 'lead-pipeline', 'multilingual'],
  },
  {
    id: 'education', name: 'Education & Training', icon: 'GraduationCap',
    intro: 'Promote your courses, manage registrations, and connect with students.',
    challenges: ['Class timetables change every term', 'Sign-ups and payments are done by hand', 'Parents and students ask the same questions', 'Hard to see which courses are popular'],
    recommendedSolutions: ['booking', 'lead-generation', 'automation'],
    popularFeatures: ['online-booking', 'payments', 'reminders', 'customer-portal', 'newsletter'],
  },
]

/* ------------------------------------------------------------------ */
/* Discovery Consultation & partnerships                               */
/* ------------------------------------------------------------------ */

export const DISCOVERY_SERVICES: DiscoveryService[] = [
  {
    id: 'business', name: 'Business Discovery', icon: 'Compass',
    description: "Understand what's slowing your business down, and where the opportunities are.",
    outcomes: ['Conversations with you and your team', 'A clear list of problems and opportunities', 'What to fix first'],
  },
  {
    id: 'process', name: 'Process Discovery', icon: 'GitBranch',
    description: 'Look at how work gets done today, and where time and effort are wasted.',
    outcomes: ['A simple map of how work flows today', 'Where things get stuck, and why', 'Quick wins and bigger fixes'],
  },
  {
    id: 'solution', name: 'Solution Discovery', icon: 'Route',
    description: 'Turn what you need into a clear plan: which tools to use and what to do first.',
    outcomes: ['A summary of what you need', 'Recommended solutions', 'A step-by-step plan'],
  },
]

export const PARTNERSHIPS: Partnership[] = [
  {
    id: 'care', name: 'Solution Care', icon: 'ShieldCheck',
    tagline: 'We look after it, so you don’t have to.',
    points: ['We keep your website online, updated and secure', 'Small changes to words and photos', 'Fast help if something stops working'],
  },
  {
    id: 'growth', name: 'Solution Growth', icon: 'TrendingUp',
    tagline: 'Keep improving as your business grows.',
    points: ['Regular check-ins on how things are going', 'New features when you need them', 'Ongoing improvements to bring in more customers'],
  },
]

/* ------------------------------------------------------------------ */
/* Package positioning                                                 */
/* ------------------------------------------------------------------ */

export const PACKAGE_INFO = {
  essential: {
    name: 'Essential',
    headline: 'Everything you need to get started.',
    forWho: 'For simple needs. Most small businesses start here.',
    points: ['A ready-made design, set up for you', 'The main features most businesses need', 'Faster to launch', 'Easy to upgrade later'],
  },
  dynamic: {
    name: 'Dynamic',
    headline: 'More capabilities. More possibilities.',
    forWho: 'For businesses that need more tools, or want their apps working together.',
    points: ['Everything in Essential', 'Extra tools, like an enquiry tracker and automatic follow-ups', 'Links to apps you already use', 'Room to grow with a bigger team'],
  },
} as const

/* ------------------------------------------------------------------ */
/* Homepage offerings: Discovery, Essential, Dynamic                    */
/* (Marketing summary only. Package logic in the Finder still uses      */
/*  PACKAGE_INFO and each solution's package capabilities.)             */
/* ------------------------------------------------------------------ */

export interface Offering {
  id: 'discovery' | 'essential' | 'dynamic'
  name: string
  headline: string
  description: string
  features: string[]
  /** Monthly price (confirmed by Forcefield, 31 Oct 2026). Omitted when quoted per project. */
  price?: { amount: string; period: string }
  cta: { label: string; to: string }
  recommended?: boolean
}

export const OFFERINGS: Offering[] = [
  {
    id: 'discovery',
    name: 'Discovery',
    headline: 'Find your direction.',
    description:
      'Through collaborative workshops, we uncover your business challenges, understand your processes, and recommend digital solutions that work for you.',
    features: [
      'Guided business discovery workshops',
      'Identify challenges and pain points',
      'Review workflows and opportunities',
      'Tailored digital solution recommendations',
    ],
    cta: { label: 'Explore Discovery', to: '/discovery' },
  },
  {
    id: 'essential',
    name: 'Essential',
    headline: 'We handle everything.',
    description: 'Get your business online without the hassle. We build, manage, and maintain your website so you can focus on what matters.',
    price: { amount: 'S$150', period: '/month' },
    features: ['Professional 3-page website', 'Industry-specific preset design', 'Done-for-you website management', 'Hosting, maintenance & support'],
    // Industry cards show the Essential and Dynamic demo websites.
    cta: { label: 'Explore Essential', to: '/industries' },
  },
  {
    id: 'dynamic',
    name: 'Dynamic',
    headline: 'Take control. Grow further.',
    description: 'A powerful website with smart tools and the flexibility to grow alongside your business.',
    price: { amount: 'S$300', period: '/month' },
    features: [
      'Flexible, scalable website',
      'Industry-specific preset design',
      'Easy-to-use admin panel',
      'AI-powered SEO tools',
      'Smart integrations & dedicated support',
    ],
    // No Dynamic details page exists yet: the solutions list lets visitors pick Dynamic per solution.
    cta: { label: 'Explore Dynamic', to: '/industries' },
    recommended: true,
  },
]

/* ------------------------------------------------------------------ */
/* Site configuration (verified details only)                          */
/* ------------------------------------------------------------------ */

export const SITE = {
  legalName: 'Forcefield Design Pte. Ltd.',
  uen: '202518329D',
  /** Leave null until confirmed — the UI hides unset contact details. */
  email: 'support@forcefield.design' as string | null,
  phone: null as string | null,
  instagram: 'https://www.instagram.com/forcefield.design/',
  facebook: 'https://www.facebook.com/profile.php?id=61577197974708',
  linkedin: 'https://www.linkedin.com/company/askforcefield/',
  legacySite: 'https://forcefield.design/',
}

/* ------------------------------------------------------------------ */
/* Lookup helpers                                                      */
/* ------------------------------------------------------------------ */

export const featureById = (id: string) => FEATURES.find((f) => f.id === id)
export const solutionById = (id: string) => SOLUTIONS.find((s) => s.id === id)
export const industryById = (id: string) => INDUSTRIES.find((i) => i.id === id)
export const industryLabel = (id: IndustryId | null, other?: string) =>
  id === 'other' ? other?.trim() || 'Something else' : INDUSTRY_OPTIONS.find((o) => o.id === id)?.label ?? '—'
export const challengeLabel = (id: ChallengeId) => CHALLENGE_OPTIONS.find((o) => o.id === id)?.label ?? id
export const goalLabel = (id: GoalId) => GOAL_OPTIONS.find((o) => o.id === id)?.label ?? id
export const categoryName = (id: string) => FEATURE_CATEGORIES.find((c) => c.id === id)?.name ?? id

/** Optional features = compatible with the solution but not core to it. */
export const optionalFeaturesFor = (solutionId: string) => {
  const s = solutionById(solutionId)
  if (!s) return []
  return FEATURES.filter((f) => f.compatibleWith.includes(s.id) && !s.coreFeatures.includes(f.id))
}
