/**
 * SOLUTIONS CATALOGUE — the single source of truth for individual digital
 * solutions (WhatsApp Chat, Online Booking, …).
 * ------------------------------------------------------------------
 * Used by:
 *   - Homepage "Digital Tools That Work for Your Business" (featured only)
 *   - Our Solutions page (full catalogue, search, categories, goals)
 *   - My Pick + quote request (picks store the solution id)
 *
 * Cards are self-explanatory: there are no per-solution detail pages.
 *
 * Listing a solution here does NOT mean it is included in a package or
 * immediately available. Availability and cost are confirmed in the quote.
 *
 * To change the homepage: set `featured` (1–6 = display order) on exactly
 * six solutions. Nothing else needs editing.
 *
 * Illustrations: `illustration` is a key into SOLUTION_ART in
 * src/components/SolutionArt.tsx (defaults to the solution id).
 *
 * The packaged solutions used by the Solution Finder (Business Website,
 * Booking System, …) live separately in ./catalogue.ts and are unchanged.
 */

import type { IndustryId } from './types'
import { FEATURES } from './catalogue'

export type ToolCategoryId =
  | 'enquiries'
  | 'showcase'
  | 'bookings'
  | 'sales'
  | 'marketing'
  | 'seo'
  | 'courses'
  | 'tools'

export type BusinessGoalId =
  | 'more-enquiries'
  | 'showcase'
  | 'bookings'
  | 'sell-online'
  | 'get-found'
  | 'promote'
  | 'courses-events'
  | 'save-time'

/**
 * How a solution fits the packages, derived from the confirmed feature
 * availability in catalogue.ts (FEATURES[].availability):
 *  essential — included in Essential
 *  dynamic   — included in (or an add-on to) Dynamic, not included in Essential
 *  unknown   — no confirmed package feature covers it yet; needs review
 */
export type PackageFit = 'essential' | 'dynamic' | 'unknown'

/** Delivery readiness, for internal planning (not shown to visitors). */
export type ImplementationStatus = 'available' | 'on-request' | 'planned' | 'to-confirm'

export interface ToolCategory {
  id: ToolCategoryId
  name: string
}

export interface BusinessGoal {
  id: BusinessGoalId
  name: string
  description: string
  /** Illustration key (SOLUTION_ART) for the goal tile. */
  illustration: string
  /** Structured mapping: solution ids that help with this goal. */
  solutions: string[]
}

export interface DigitalSolution {
  id: string
  name: string
  category: ToolCategoryId
  /** 10–20 words, plain English, explains the practical benefit. */
  short: string
  /** Extra search terms (not displayed). */
  keywords: string[]
  /** Derived from BUSINESS_GOALS at load time (single source of mapping). */
  goals: BusinessGoalId[]
  /** Key into SOLUTION_ART. */
  illustration: string
  /** 1–6 = featured on the homepage, in this order. */
  featured?: number
  /** Industries this suits. 'all' = every business type. */
  industries: IndustryId[] | 'all'
  /** Lowest package that covers it (drives the My Pick recommendation). */
  packageFit: PackageFit
  /** May rely on an outside service, subscription or integration (internal). */
  thirdParty: boolean
  status: ImplementationStatus
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export const TOOL_CATEGORIES: ToolCategory[] = [
  { id: 'enquiries', name: 'Customer Enquiries' },
  { id: 'showcase', name: 'Showcase' },
  { id: 'bookings', name: 'Bookings' },
  { id: 'sales', name: 'Online Sales' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'seo', name: 'SEO' },
  { id: 'courses', name: 'Courses & Events' },
  { id: 'tools', name: 'Business Tools' },
]

/* ------------------------------------------------------------------ */
/* Entries                                                             */
/* ------------------------------------------------------------------ */

type Opts = { featured?: number; third?: boolean }
type Raw = { c: ToolCategoryId; n: string; s: string; k: string[] } & Opts
const t = (c: ToolCategoryId, n: string, s: string, k: string[], o: Opts = {}): Raw => ({ c, n, s, k, ...o })

const RAW: Raw[] = [
  /* ---------- A. Customer Enquiries ---------- */
  t('enquiries', 'WhatsApp Chat', 'Let customers reach you instantly through WhatsApp, making enquiries quick and convenient.', ['whatsapp', 'message', 'chat', 'mobile'], { featured: 1 }),
  t('enquiries', 'Enquiry Form', 'A simple form that sends customer questions straight to your inbox, even outside business hours.', ['form', 'enquiry', 'inquiry', 'contact'], { featured: 4 }),
  t('enquiries', 'Request a Quote', 'Customers tell you what they need upfront, so you can send accurate quotes faster.', ['quote', 'quotation', 'estimate', 'pricing']),
  t('enquiries', 'Contact Form', 'Give customers an easy way to get in touch without hunting for your email address.', ['contact', 'email', 'message', 'form']),
  t('enquiries', 'Click-to-Call', 'Mobile visitors can call your business with a single tap, with no number to copy.', ['phone', 'call', 'mobile', 'telephone']),
  t('enquiries', 'Google Maps', 'Show your location on a map so customers can get directions to you easily.', ['map', 'location', 'directions', 'address', 'google']),
  t('enquiries', 'Social Media Links', 'Point visitors to your social media pages so they can follow and stay connected.', ['social', 'facebook', 'instagram', 'tiktok', 'linkedin']),
  t('enquiries', 'Live Chat', 'Chat with visitors in real time and answer their questions while they are still browsing.', ['chat', 'live', 'support', 'messaging'], { third: true }),
  t('enquiries', 'FAQ Section', 'Answer common questions on your website, so customers get answers and you get fewer repeat enquiries.', ['faq', 'questions', 'answers', 'help']),
  t('enquiries', 'Newsletter Sign-Up', 'Collect email addresses from interested visitors so you can share news and offers later.', ['newsletter', 'email', 'subscribe', 'mailing list'], { third: true }),

  /* ---------- B. Showcase ---------- */
  t('showcase', 'Photo Gallery', 'Show off your products, services and completed projects in a clean, easy-to-browse gallery.', ['photos', 'gallery', 'images', 'pictures'], { featured: 3 }),
  t('showcase', 'Video Gallery', 'Share videos that explain your business quickly and keep visitors on your website longer.', ['video', 'youtube', 'clips']),
  t('showcase', 'Instagram Feed', 'Display your latest Instagram posts on your website, updating automatically whenever you post.', ['instagram', 'social', 'feed', 'posts'], { third: true }),
  t('showcase', 'Customer Reviews', 'Display positive reviews and star ratings that help new customers trust your business.', ['reviews', 'ratings', 'stars', 'feedback']),
  t('showcase', 'Portfolio Showcase', 'Present your best completed projects with photos and short notes that prove your experience.', ['portfolio', 'projects', 'past work', 'case studies']),
  t('showcase', 'Services Listing', 'List the services you offer clearly, so customers know exactly what you can do for them.', ['services', 'list', 'menu', 'prices']),
  t('showcase', 'Team Profiles', 'Introduce the people behind your business and build trust before customers even meet you.', ['team', 'staff', 'about', 'people']),
  t('showcase', 'Before & After Gallery', 'Side-by-side photos that show customers the real difference your work makes.', ['before', 'after', 'results', 'transformation']),
  t('showcase', 'Downloadable Brochures', 'Let visitors download your brochure, menu or price list to read and share later.', ['brochure', 'pdf', 'download', 'catalogue', 'menu']),
  t('showcase', 'Business Locations', 'List every outlet with its address, hours and map, so customers find the nearest one.', ['locations', 'branches', 'outlets', 'stores']),

  /* ---------- C. Bookings ---------- */
  t('bookings', 'Online Booking', 'Let customers book appointments online any time, with fewer calls and back-and-forth messages.', ['booking', 'appointment', 'schedule', 'reserve'], { featured: 2 }),
  t('bookings', 'Table Reservations', 'Diners reserve a table online in seconds, helping you plan seating and staff ahead.', ['table', 'reservation', 'restaurant', 'dining', 'cafe']),
  t('bookings', 'Class Booking', 'Customers book their place in classes or workshops online, and classes never get overbooked.', ['class', 'workshop', 'session']),
  t('bookings', 'Event Registration', 'Visitors sign up for your events online, and every attendee’s details are kept in one place.', ['event', 'registration', 'sign up', 'rsvp']),
  t('bookings', 'Booking Calendar', 'Show your available dates and times, so customers only pick slots that suit you.', ['calendar', 'availability', 'slots', 'dates']),
  t('bookings', 'Booking Confirmation', 'Customers receive an instant email confirming their booking, so they know it went through.', ['confirmation', 'email', 'receipt']),
  t('bookings', 'Booking Reminders', 'Automatic reminders before each appointment help reduce no-shows and last-minute cancellations.', ['reminder', 'sms', 'email', 'no-show'], { third: true }),
  t('bookings', 'Booking Management', 'See, change or cancel all your bookings from one simple screen.', ['manage', 'bookings', 'admin', 'schedule']),
  t('bookings', 'Group Booking', 'Let one person book for a whole family or team in a single, easy step.', ['group', 'multiple', 'people', 'party']),
  t('bookings', 'Booking Deposits', 'Collect a deposit when customers book, securing their slot and reducing no-shows.', ['deposit', 'prepayment', 'payment'], { third: true }),

  /* ---------- D. Online Sales ---------- */
  t('sales', 'Product Listings', 'Display your products with photos, descriptions and prices that customers can browse any time.', ['products', 'listing', 'catalogue', 'shop']),
  t('sales', 'Shopping Cart', 'Customers add several items to a cart and check out in one go.', ['cart', 'checkout', 'basket']),
  t('sales', 'Online Payments', 'Accept customer payments through your website, so you get paid faster and handle less cash.', ['payments', 'card', 'paynow', 'checkout', 'pay'], { featured: 5, third: true }),
  t('sales', 'Product Categories', 'Group your products into clear sections so customers find what they want quickly.', ['categories', 'sections', 'organise']),
  t('sales', 'Product Search', 'A search box that takes customers straight to the product they are looking for.', ['search', 'find', 'products']),
  t('sales', 'Product Variations', 'Offer sizes, colours or other options on one product page, reducing ordering mistakes.', ['variations', 'size', 'colour', 'color', 'options']),
  t('sales', 'Discount Codes', 'Create promo codes customers enter at checkout, perfect for rewards and seasonal campaigns.', ['discount', 'promo code', 'coupon', 'voucher']),
  t('sales', 'Order Management', 'Track every order from purchase to delivery, so nothing slips through the cracks.', ['orders', 'manage', 'fulfilment']),
  t('sales', 'Delivery Options', 'Let customers choose delivery or self-collection, with clear fees shown before they pay.', ['delivery', 'shipping', 'collection', 'pickup']),
  t('sales', 'Stock Management', 'Keep track of stock levels and show when items sell out, avoiding disappointed customers.', ['stock', 'inventory', 'quantity']),
  t('sales', 'Digital Downloads', 'Sell guides, templates or other files that customers download instantly after paying.', ['digital', 'download', 'ebook', 'files']),
  t('sales', 'Gift Vouchers', 'Sell gift vouchers online, bringing in new customers and earning income in advance.', ['gift', 'voucher', 'gift card', 'present']),
  t('sales', 'Subscription Payments', 'Collect regular payments automatically for memberships or subscriptions, with no monthly chasing.', ['subscription', 'recurring', 'monthly', 'membership'], { third: true }),
  t('sales', 'Invoice Payments', 'Customers pay your invoices online through a secure link, so you get paid sooner.', ['invoice', 'payment', 'billing'], { third: true }),

  /* ---------- E. Marketing ---------- */
  t('marketing', 'Promotions Listing', 'Show all your current offers and deals in one place that is easy for customers to find.', ['promotions', 'offers', 'deals', 'sale']),
  t('marketing', 'Promotional Banners', 'Eye-catching banners that draw attention to your latest campaign or announcement.', ['banner', 'campaign', 'announcement']),
  t('marketing', 'Pop-Up Announcements', 'A short message that greets visitors with important news or a limited-time offer.', ['popup', 'pop-up', 'announcement', 'notice']),
  t('marketing', 'Events Listing', 'Show upcoming events and activities, giving customers a reason to visit again.', ['events', 'listing', 'upcoming', 'activities']),
  t('marketing', 'Articles & News', 'Publish tips, news and stories that show your expertise and keep your website fresh.', ['blog', 'articles', 'news', 'updates']),
  t('marketing', 'Email Newsletter', 'Send regular emails with news and offers to bring past customers back.', ['email', 'newsletter', 'campaign', 'mailing'], { third: true }),
  t('marketing', 'Customer Testimonials', 'Share short quotes from happy customers that build trust with new visitors.', ['testimonials', 'quotes', 'reviews', 'feedback']),
  t('marketing', 'Featured Products', 'Put your best sellers or new arrivals front and centre on your homepage.', ['featured', 'highlight', 'best sellers']),
  t('marketing', 'Countdown Timer', 'Show how long is left on a promotion, encouraging customers to act sooner.', ['countdown', 'timer', 'urgency', 'deadline']),
  t('marketing', 'Social Sharing', 'Buttons that let visitors share your pages on social media and messaging apps.', ['share', 'social', 'whatsapp', 'facebook']),

  /* ---------- F. SEO (never guarantees rankings) ---------- */
  t('seo', 'Search Engine Setup', 'Set your website up so Google and other search engines can find and list your pages.', ['google', 'search console', 'indexing', 'setup', 'search engine']),
  t('seo', 'SEO Optimisation', 'Help customers discover your business online with clearer page titles, descriptions and content.', ['seo', 'search', 'google', 'ranking', 'visibility', 'optimization'], { featured: 6 }),
  t('seo', 'AI SEO Assistant', 'Get AI-powered keyword and content suggestions to review, helping you improve your pages faster.', ['ai', 'seo', 'assistant', 'content', 'suggestions'], { third: true }),
  t('seo', 'Google Business Profile Support', 'Keep your Google Business Profile accurate, so customers see your hours and location on Google.', ['google', 'business profile', 'maps', 'listing', 'local']),
  t('seo', 'SEO-Friendly Articles', 'Articles written around what your customers search for, attracting new visitors over time.', ['articles', 'blog', 'content', 'writing', 'seo']),
  t('seo', 'Website Analytics', 'See how many people visit your website, where they come from and what they view.', ['analytics', 'visitors', 'statistics', 'traffic'], { third: true }),
  t('seo', 'Search Performance Reports', 'Regular, easy-to-read reports on how people find your website through search.', ['report', 'search', 'performance', 'seo']),
  t('seo', 'Image Optimisation', 'Resize and compress your images so pages load quickly without losing quality.', ['images', 'compress', 'speed', 'optimization']),
  t('seo', 'Page Speed Optimisation', 'Make your website load faster, especially on mobile, so visitors do not give up and leave.', ['speed', 'performance', 'fast', 'loading']),
  t('seo', 'Local SEO', 'Improve how your business shows up when nearby customers search, such as "café near me".', ['local', 'near me', 'location', 'seo']),

  /* ---------- G. Courses & Events ---------- */
  t('courses', 'Course Listings', 'Showcase your courses with dates, fees and details, helping learners choose the right one.', ['courses', 'classes', 'programmes', 'programs']),
  t('courses', 'Course Registration', 'Students sign up for courses online, and you receive their details automatically.', ['registration', 'enrol', 'enroll', 'sign up', 'course']),
  t('courses', 'Course Payments', 'Collect course fees online when students register, so there are no payments to chase later.', ['fees', 'payment', 'course', 'tuition'], { third: true }),
  t('courses', 'Class Schedules', 'Publish a clear timetable students can check any time, reducing schedule questions.', ['schedule', 'timetable', 'classes']),
  t('courses', 'Event Ticketing', 'Sell or issue event tickets online and know exactly who is coming.', ['tickets', 'event', 'ticketing'], { third: true }),
  t('courses', 'Member Login', 'Registered members sign in to their own private area of your website.', ['login', 'account', 'member', 'portal']),
  t('courses', 'Members-Only Content', 'Share exclusive videos, guides or notes that only signed-in members can see.', ['members', 'exclusive', 'private', 'content']),
  t('courses', 'Learning Materials', 'Give students notes, worksheets and resources to download, all kept in one place.', ['materials', 'resources', 'downloads', 'notes']),
  t('courses', 'Student Dashboard', 'Students see their courses, schedules and materials together on one personal page.', ['student', 'dashboard', 'portal']),
  t('courses', 'Membership Plans', 'Offer membership levels with their own benefits, creating steady income from loyal customers.', ['membership', 'plans', 'tiers']),

  /* ---------- H. Business Tools ---------- */
  t('tools', 'Customer Enquiry Tracker', 'Keep every enquiry in one list, so your team knows what needs a reply.', ['enquiries', 'tracker', 'leads', 'inbox']),
  t('tools', 'Automatic Email Replies', 'Send an instant, friendly reply to every enquiry, so customers know you received it.', ['auto reply', 'email', 'autoresponder', 'automatic']),
  t('tools', 'Appointment Reminders', 'Remind customers about appointments automatically, saving your team time and reducing no-shows.', ['reminders', 'appointments', 'sms'], { third: true }),
  t('tools', 'Customer Database', 'Keep customer names, contact details and history organised in one place.', ['customers', 'database', 'crm', 'records']),
  t('tools', 'Lead Management', 'Track potential customers and follow-ups, so more enquiries turn into sales.', ['leads', 'sales', 'pipeline', 'follow up', 'crm']),
  t('tools', 'Online Forms', 'Replace paper forms with online ones for registrations, feedback or applications.', ['forms', 'custom', 'survey', 'application']),
  t('tools', 'Document Uploads', 'Customers send documents or photos securely through your website, with no email attachments needed.', ['upload', 'documents', 'files']),
  t('tools', 'Staff Accounts', 'Give each team member their own login, with access to only the tools they need.', ['staff', 'accounts', 'team', 'access', 'users']),
  t('tools', 'Dashboard & Reports', 'See key numbers like enquiries, bookings and sales at a glance on one simple dashboard.', ['dashboard', 'reports', 'numbers', 'analytics']),
  t('tools', 'Workflow Automation', 'Let routine tasks like follow-up emails happen automatically, saving time and avoiding mistakes.', ['automation', 'workflow', 'automatic', 'tasks']),
  t('tools', 'Third-Party Integrations', 'Connect your website to tools you already use, such as accounting or email software.', ['integrations', 'connect', 'api', 'apps', 'xero', 'hubspot'], { third: true }),
  t('tools', 'AI Chat Assistant', 'An AI assistant answers common questions any time, and passes complex ones to your team.', ['ai', 'chatbot', 'assistant', 'chat'], { third: true }),
]

/* ------------------------------------------------------------------ */
/* Package fit: each solution → the existing package feature that covers it */
/* ------------------------------------------------------------------ */

/**
 * Solution id → feature id in catalogue.ts (FEATURES). Package availability is
 * read from that feature; nothing here invents package capabilities.
 * Solutions not listed have no confirmed feature yet → 'unknown' (review).
 * 'dynamic-ai-seo' = the AI-powered SEO tools named in the Dynamic package.
 * TO CONFIRM with Forcefield: each mapping below.
 */
const SOLUTION_FEATURE: Record<string, string> = {
  // Simple content on a website page ("Website Pages", included in both)
  'click-to-call': 'pages', 'google-maps': 'pages', 'social-media-links': 'pages', 'faq-section': 'pages',
  'video-gallery': 'pages', 'customer-reviews': 'pages', 'services-listing': 'pages', 'team-profiles': 'pages',
  'downloadable-brochures': 'pages', 'business-locations': 'pages', 'promotional-banners': 'pages',
  'pop-up-announcements': 'pages', 'events-listing': 'pages', 'customer-testimonials': 'pages',
  'countdown-timer': 'pages', 'social-sharing': 'pages', 'course-listings': 'pages', 'class-schedules': 'pages',
  'learning-materials': 'pages',
  // Enquiries
  'whatsapp-chat': 'chat-button', 'enquiry-form': 'enquiry-forms', 'request-a-quote': 'enquiry-forms',
  'contact-form': 'enquiry-forms', 'online-forms': 'enquiry-forms', 'newsletter-sign-up': 'newsletter',
  'email-newsletter': 'newsletter', 'automatic-email-replies': 'auto-replies',
  // Showcase
  'photo-gallery': 'portfolio', 'portfolio-showcase': 'portfolio', 'before-and-after-gallery': 'portfolio',
  // Bookings
  'online-booking': 'online-booking', 'table-reservations': 'online-booking', 'class-booking': 'online-booking',
  'event-registration': 'online-booking', 'booking-calendar': 'online-booking', 'booking-confirmation': 'online-booking',
  'booking-management': 'online-booking', 'course-registration': 'online-booking',
  'booking-reminders': 'reminders', 'appointment-reminders': 'reminders',
  // Sales
  'product-listings': 'catalogue', 'product-categories': 'catalogue', 'product-search': 'catalogue',
  'product-variations': 'catalogue', 'featured-products': 'catalogue', 'shopping-cart': 'catalogue',
  'online-payments': 'payments', 'course-payments': 'payments', 'discount-codes': 'promotions',
  'stock-management': 'inventory-sync',
  // Marketing & SEO
  'promotions-listing': 'landing-pages', 'articles-and-news': 'blog', 'seo-friendly-articles': 'blog',
  'search-engine-setup': 'seo', 'seo-optimisation': 'seo', 'image-optimisation': 'seo',
  'page-speed-optimisation': 'seo', 'local-seo': 'seo', 'website-analytics': 'insights',
  'search-performance-reports': 'insights', 'ai-seo-assistant': 'dynamic-ai-seo',
  // Accounts & business tools
  'member-login': 'customer-portal', 'members-only-content': 'customer-portal', 'student-dashboard': 'customer-portal',
  'customer-enquiry-tracker': 'lead-pipeline', 'lead-management': 'lead-pipeline', 'customer-database': 'customer-records',
  'staff-accounts': 'multi-staff', 'dashboard-and-reports': 'dashboard', 'workflow-automation': 'workflows',
  'third-party-integrations': 'custom-connector',
}

type Avail = 'included' | 'addon' | 'unavailable'
interface FitDetail {
  fit: PackageFit
  /** Availability in the recommended package (addon = extra scope). */
  essential?: Avail
  dynamic?: Avail
  /** The feature notes that it may cost extra (e.g. payment provider fees). */
  fee?: boolean
}

function fitOf(id: string): FitDetail {
  const fid = SOLUTION_FEATURE[id]
  if (!fid) return { fit: 'unknown' }
  if (fid === 'dynamic-ai-seo') return { fit: 'dynamic', essential: 'unavailable', dynamic: 'included' }
  const f = FEATURES.find((x) => x.id === fid)
  if (!f) return { fit: 'unknown' }
  const { essential, dynamic } = f.availability
  if (essential === 'included') return { fit: 'essential', essential, dynamic, fee: f.additionalFee }
  if (dynamic === 'included' || dynamic === 'addon') return { fit: 'dynamic', essential, dynamic, fee: f.additionalFee }
  return { fit: 'unknown' }
}

/* ------------------------------------------------------------------ */
/* Industry fit (default: all business types)                          */
/* ------------------------------------------------------------------ */

const INDUSTRY_FIT: Record<string, IndustryId[]> = {
  'request-a-quote': ['interior', 'professional', 'property', 'retail'],
  'portfolio-showcase': ['interior', 'professional', 'property'],
  'before-and-after-gallery': ['interior', 'beauty'],
  'business-locations': ['fnb', 'retail', 'education', 'beauty'],
  'table-reservations': ['fnb'],
  'class-booking': ['education', 'beauty'],
  'group-booking': ['fnb', 'education', 'beauty'],
  'booking-deposits': ['fnb', 'education', 'professional', 'beauty'],
  'shopping-cart': ['retail', 'fnb'],
  'product-categories': ['retail', 'fnb'],
  'product-search': ['retail', 'fnb'],
  'product-variations': ['retail', 'fnb'],
  'order-management': ['retail', 'fnb'],
  'delivery-options': ['retail', 'fnb'],
  'stock-management': ['retail', 'fnb'],
  'digital-downloads': ['retail', 'education', 'professional'],
  'gift-vouchers': ['fnb', 'retail', 'beauty'],
  'subscription-payments': ['retail', 'education', 'professional', 'beauty'],
  'invoice-payments': ['professional', 'interior', 'property'],
  'featured-products': ['retail', 'fnb'],
  'course-listings': ['education', 'beauty'],
  'course-registration': ['education', 'beauty'],
  'course-payments': ['education', 'beauty'],
  'class-schedules': ['education', 'beauty'],
  'event-ticketing': ['education', 'fnb', 'retail', 'professional'],
  'member-login': ['education', 'professional', 'retail', 'beauty'],
  'members-only-content': ['education', 'professional'],
  'learning-materials': ['education'],
  'student-dashboard': ['education'],
  'membership-plans': ['education', 'retail', 'fnb', 'beauty'],
  'appointment-reminders': ['professional', 'education', 'interior', 'beauty'],
  'document-uploads': ['professional', 'property', 'interior', 'education'],
}

/** True when a solution suits the chosen industry ('other' = every solution). */
export const suitsIndustry = (s: DigitalSolution, industry: IndustryId | null) =>
  !industry || industry === 'other' || s.industries === 'all' || s.industries.includes(industry)

/* ------------------------------------------------------------------ */
/* Business goals — structured mapping (one goal can share solutions)  */
/* ------------------------------------------------------------------ */

export const BUSINESS_GOALS: BusinessGoal[] = [
  {
    id: 'more-enquiries', name: 'Get more enquiries', illustration: 'whatsapp-chat',
    description: 'Make it easier for customers to contact you.',
    solutions: ['whatsapp-chat', 'enquiry-form', 'request-a-quote', 'live-chat', 'contact-form', 'click-to-call'],
  },
  {
    id: 'showcase', name: 'Showcase my business', illustration: 'photo-gallery',
    description: 'Highlight your services, products, and past work.',
    solutions: ['photo-gallery', 'portfolio-showcase', 'services-listing', 'customer-reviews', 'video-gallery', 'before-and-after-gallery'],
  },
  {
    id: 'bookings', name: 'Accept bookings', illustration: 'online-booking',
    description: 'Let customers book appointments and sessions online.',
    solutions: ['online-booking', 'booking-calendar', 'booking-reminders', 'booking-deposits', 'table-reservations', 'booking-confirmation'],
  },
  {
    id: 'sell-online', name: 'Sell online', illustration: 'shopping-cart',
    description: 'Showcase products and accept payments.',
    solutions: ['product-listings', 'shopping-cart', 'online-payments', 'order-management', 'product-variations', 'delivery-options'],
  },
  {
    id: 'get-found', name: 'Get found online', illustration: 'seo-optimisation',
    description: 'Help more customers discover your business.',
    solutions: ['seo-optimisation', 'local-seo', 'search-engine-setup', 'seo-friendly-articles', 'google-business-profile-support', 'google-maps'],
  },
  {
    id: 'promote', name: 'Promote my business', illustration: 'promotional-banners',
    description: 'Share promotions, news, and updates.',
    solutions: ['promotions-listing', 'instagram-feed', 'email-newsletter', 'promotional-banners', 'articles-and-news', 'social-sharing'],
  },
  {
    id: 'courses-events', name: 'Manage courses & events', illustration: 'course-listings',
    description: 'Handle registrations, schedules, and bookings.',
    solutions: ['course-listings', 'course-registration', 'class-schedules', 'event-ticketing', 'event-registration', 'class-booking'],
  },
  {
    id: 'save-time', name: 'Save time on admin', illustration: 'workflow-automation',
    description: 'Reduce repetitive tasks with smarter tools.',
    solutions: ['customer-enquiry-tracker', 'automatic-email-replies', 'workflow-automation', 'customer-database', 'appointment-reminders', 'booking-management'],
  },
]

/* ------------------------------------------------------------------ */
/* Normalise                                                           */
/* ------------------------------------------------------------------ */

export const toSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const DIGITAL_SOLUTIONS: DigitalSolution[] = RAW.map((r) => {
  const id = toSlug(r.n)
  return {
    id,
    name: r.n,
    category: r.c,
    short: r.s,
    keywords: r.k,
    goals: BUSINESS_GOALS.filter((g) => g.solutions.includes(id)).map((g) => g.id),
    illustration: id,
    industries: INDUSTRY_FIT[id] ?? 'all',
    packageFit: fitOf(id).fit,
    featured: r.featured,
    thirdParty: !!r.third,
    status: 'to-confirm',
  }
})

/* ------------------------------------------------------------------ */
/* Lookups                                                             */
/* ------------------------------------------------------------------ */

const BY_ID = new Map(DIGITAL_SOLUTIONS.map((s) => [s.id, s]))

export const digitalSolutionById = (id: string) => BY_ID.get(id)
export const toolCategoryName = (id: ToolCategoryId) => TOOL_CATEGORIES.find((c) => c.id === id)?.name ?? id
export const businessGoalById = (id: BusinessGoalId) => BUSINESS_GOALS.find((g) => g.id === id)

/** Exactly six featured solutions, in configured order. */
export const FEATURED_COUNT = 6
export function getFeaturedSolutions(): DigitalSolution[] {
  return DIGITAL_SOLUTIONS.filter((s) => s.featured != null)
    .sort((a, b) => a.featured! - b.featured!)
    .slice(0, FEATURED_COUNT)
}

/** Lower-cased text used for search: name, description, category, keywords. */
const searchText = (s: DigitalSolution) =>
  [s.name, s.short, toolCategoryName(s.category), ...s.keywords].join(' ').toLowerCase()

export function filterSolutions({
  query,
  category,
  goal,
  industry = null,
}: {
  query: string
  category: ToolCategoryId | 'all'
  goal: BusinessGoalId | null
  industry?: IndustryId | null
}): DigitalSolution[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const goalSet = goal ? new Set(businessGoalById(goal)?.solutions) : null
  return DIGITAL_SOLUTIONS.filter(
    (s) =>
      suitsIndustry(s, industry) &&
      (category === 'all' || s.category === category) &&
      (!goalSet || goalSet.has(s.id)) &&
      terms.every((term) => searchText(s).includes(term)),
  )
}

/** Data-integrity check, returns a list of problems (empty = OK). */
export function validateCatalogue(artKeys: string[] = []): string[] {
  const problems: string[] = []
  const seen = new Set<string>()
  for (const s of DIGITAL_SOLUTIONS) {
    if (seen.has(s.id)) problems.push(`Duplicate id: ${s.id}`)
    seen.add(s.id)
    const words = s.short.split(/\s+/).length
    if (words < 10 || words > 20) problems.push(`${s.name}: description is ${words} words`)
    if (artKeys.length && !artKeys.includes(s.illustration)) problems.push(`${s.name}: no illustration`)
  }
  for (const g of BUSINESS_GOALS) {
    for (const id of g.solutions) if (!BY_ID.has(id)) problems.push(`Goal ${g.id} references unknown solution ${id}`)
    if (artKeys.length && !artKeys.includes(g.illustration)) problems.push(`Goal ${g.id}: no illustration`)
  }
  const featured = DIGITAL_SOLUTIONS.filter((s) => s.featured != null).length
  if (featured !== FEATURED_COUNT) problems.push(`Expected ${FEATURED_COUNT} featured solutions, found ${featured}`)
  return problems
}

/* ------------------------------------------------------------------ */
/* Package recommendation for My Pick                                  */
/* ------------------------------------------------------------------ */

export interface PackageRecommendation {
  /** 'pending' when a selection has no confirmed package fit yet. */
  status: 'recommended' | 'pending'
  tier: 'essential' | 'dynamic' | null
  /** Solutions that need Dynamic (not included in Essential). */
  needsDynamic: string[]
  /** Solutions that may involve additional scope: add-ons, extra fees or outside services. */
  additionalScope: string[]
  /** Solutions with no confirmed package fit (cause 'pending'). */
  needsReview: string[]
}

export const listNames = (xs: string[]) =>
  xs.length <= 2 ? xs.join(' and ') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`

/**
 * Deterministic, rule-based recommendation (no AI, never based on how many
 * solutions were picked), from the confirmed feature availability:
 *  1. Any selection without a confirmed package fit  → pending review
 *  2. Any selection not included in Essential         → Dynamic
 *  3. Everything included in Essential                → Essential
 * Additional scope is flagged for: add-ons in the recommended package, features
 * that may cost extra, and solutions that rely on an outside service.
 */
export function recommendPackage(ids: string[]): PackageRecommendation | null {
  const picked = [...new Set(ids)].map(digitalSolutionById).filter((s): s is DigitalSolution => !!s)
  if (!picked.length) return null
  const fits = picked.map((s) => ({ s, d: fitOf(s.id) }))
  const needsReview = fits.filter((x) => x.d.fit === 'unknown').map((x) => x.s.name)
  const needsDynamic = fits.filter((x) => x.d.fit === 'dynamic').map((x) => x.s.name)
  const tier: 'essential' | 'dynamic' | null = needsReview.length ? null : needsDynamic.length ? 'dynamic' : 'essential'
  const additionalScope = fits
    .filter(({ s, d }) => s.thirdParty || d.fee || (tier && d[tier] === 'addon'))
    .map((x) => x.s.name)
  return { status: tier ? 'recommended' : 'pending', tier, needsDynamic, additionalScope, needsReview }
}

/* ------------------------------------------------------------------ */
/* By Industry: mapped solutions (shown as tags) and demo previews     */
/* ------------------------------------------------------------------ */

/** Key solutions per industry, in display order (first four show on the collapsed card). */
export const INDUSTRY_SOLUTIONS: Record<Exclude<IndustryId, 'other'>, string[]> = {
  fnb: ['table-reservations', 'whatsapp-chat', 'promotions-listing', 'google-maps', 'events-listing', 'online-payments', 'customer-reviews', 'local-seo'],
  beauty: ['online-booking', 'services-listing', 'before-and-after-gallery', 'customer-reviews', 'booking-reminders', 'gift-vouchers', 'whatsapp-chat', 'local-seo'],
  retail: ['product-listings', 'shopping-cart', 'online-payments', 'discount-codes', 'delivery-options', 'stock-management', 'instagram-feed'],
  interior: ['portfolio-showcase', 'before-and-after-gallery', 'request-a-quote', 'customer-testimonials', 'whatsapp-chat', 'lead-management'],
  professional: ['services-listing', 'enquiry-form', 'online-booking', 'team-profiles', 'invoice-payments', 'articles-and-news', 'customer-database'],
  property: ['photo-gallery', 'video-gallery', 'enquiry-form', 'whatsapp-chat', 'google-maps', 'lead-management', 'document-uploads'],
  education: ['course-listings', 'course-registration', 'course-payments', 'class-schedules', 'learning-materials', 'member-login'],
}

export interface IndustryDemos {
  essential?: string
  dynamic?: string
  admin?: string
}

/**
 * Demo websites per industry, hosted on askforcefield.com. They open in a new tab.
 * Industries not listed show "Demo Coming Soon".
 */
export const demoUrl = (url: string): string | null => url || null

export const INDUSTRY_DEMOS: Partial<Record<Exclude<IndustryId, 'other'>, IndustryDemos>> = {
  fnb: {
    essential: 'https://askforcefield.com/fnb/essential/demo/index.html',
    dynamic: 'https://askforcefield.com/fnb/dynamic/demo/index.html',
    admin: 'https://askforcefield.com/fnb/dynamic/demo/admin/index.html',
  },
  beauty: {
    essential: 'https://askforcefield.com/beauty/essential/demo/index.html',
    dynamic: 'https://askforcefield.com/beauty/dynamic/demo/index.html',
    admin: 'https://askforcefield.com/beauty/dynamic/demo/admin/index.html',
  },
}
