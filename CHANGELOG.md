# Changelog

Each build matches the version number in the published prototype's history.

| Build | Date | Summary |
|---|---|---|
| 80 | 2026-10-30 | Backend: FormSubmit replaced by a Cloudflare Pages Function (POST /api/contact) that validates, rate-limits, prevents duplicates, saves enquiries in D1 and emails support@forcefield.design via Resend (reply-to the customer, attachments included). Admin: server-checked login with signed 12-hour sessions and lockout after 5 failed tries; new Enquiries tab (filters, search, details, status updates, resend failed notifications). /api/stats now needs the admin session. D1 migrations, setup and DNS guide in docs/BACKEND-SETUP.md. |
| 79 | 2026-10-30 | Sentence case: homepage heading "Digital solutions for every stage of business." (share image updated to match); Admin heading "All solution stats". |
| 78 | 2026-10-30 | Admin sign-in screen: centred card with "Welcome Admin", short line, Password field (focused on load) and full-width Login button. |
| 77 | 2026-10-30 | All Solutions tracking: anonymous events for industry, goal, category, search and Add/Remove My Pick (cards and drawer) sent to a Cloudflare Pages Function with D1 storage. New /admin page (password-protected, noindex) with totals, daily chart, top solutions (CSV export), industries, goals, categories and searches, filterable by period and industry. Footer "Admin" link. Toast wording "Essential Solution". |
| 76 | 2026-10-30 | Discovery: dash removed from the numbered labels ("01 Business understanding"). Brand name written as "Forcefield Design" everywhere in copy and page titles (About eyebrow and story, footer link, Discovery step, browser titles). |
| 75 | 2026-10-30 | Footer: new description under the logo. |
| 74 | 2026-10-30 | Home: "Your business, our expertise. Zero hassle." + Get Started removed from How it works. About: dash removed from the story sentence and journey labels ("02 Essential"). Solutions menu adds Discovery Consultation. "Package" wording replaced with Essential Solution / Dynamic Solution across the site, My Pick, brief and emails (enquiry type now "Solution Enquiry"). Get Started: new intro line; Business Brief and Share a Link guidance moved from placeholders to helper text under the fields. |
| 73 | 2026-10-30 | Page titles: "SMEs" replaced with "Singapore Businesses" (Home, Discovery); Solutions title reworded so it differs from Home. |
| 72 | 2026-10-30 | SEO: clean URLs (/about instead of /#/about; old links redirect); per-page titles and descriptions targeting Singapore SMEs, startups, home-based businesses and industries; canonical URLs, Open Graph/Twitter tags and share image; JSON-LD (organisation, website, services, industry list, breadcrumbs); static HTML per page, sitemap.xml, robots.txt and Cloudflare _redirects generated at build. Not-found pages are noindex. |
| 71 | 2026-10-30 | Floating WhatsApp button: dark grey base with a solid white WhatsApp icon (lightens on hover). |
| 70 | 2026-10-30 | Homepage heading "Digital Solutions for Every Stage of Business." Transitions slower again: content fades over 1.1–1.25 s, 130 ms between blocks; buttons follow 420 ms later; hero cards slide in over 1.35 s; WhatsApp button appears at 1.4 s with a slower 4.2 s pulse. WhatsApp icon is now solid black on white. |
| 69 | 2026-10-30 | Forms: when a send fails, the error now shows a small "Details:" line with the actual reason (blocked request, FormSubmit message, or unexpected reply) and logs it to the browser console, to diagnose live-site failures. |
| 68 | 2026-10-30 | Added GitLab Pages deployment (.gitlab-ci.yml) and README instructions. No visible site changes. |
| 67 | 2026-10-30 | Floating WhatsApp button: white base with the green WhatsApp icon. |
| 66 | 2026-10-30 | Load transitions 20% slower: content reveal 0.84–0.96 s with 108 ms between blocks; buttons follow 336 ms later over 0.72–0.84 s; hero notification cards slide in over 1.08 s. Homepage heading now "Solution for every business." Floating WhatsApp button (bottom-right, every page) opens a chat with +65 8083 6840 in a new tab, with a pre-filled message; "Chat with us" label on hover. |
| 65 | 2026-10-30 | Buttons: on load they arrive a beat (about 0.3 s) after the content around them, with a small rise and scale; primary and secondary buttons lift slightly on hover and arrow icons nudge forward. Reveal now hides content before first paint (no flash). |
| 64 | 2026-10-30 | Site-wide load transition: on every page, each section's content fades and rises in, block by block (90 ms apart), as it comes into view. Off for reduced-motion visitors; content always shows within 4 s. |
| 63 | 2026-10-30 | General Enquiry form: enquiry types are now General Enquiry, Package Enquiry, Careers & Opportunities, Other Enquiries. |
| 62 | 2026-10-30 | Homepage hero visual: subtle motion — notification cards slide in then hover on separate rhythms, the bell rings now and then, the selected time slot glows, a soft shimmer crosses Confirm booking, and the window drifts gently. All motion stops for visitors who prefer reduced motion. |
| 61 | 2026-10-30 | Homepage hero: "Get Expert Advice" button removed. Our Solutions: "Looking for a ready-made setup?" link row removed. |
| 60 | 2026-10-30 | About: story now opens "Forcefield design began as a creative design studio…". |
| 59 | 2026-10-30 | Typography pass: shared text styles (statement, card title, item title, long body, card body, small) replace one-off sizes; homepage title matches other page titles; both Get Started section headings use one style. Get Started: arriving from My Pick always selects the recommended package, and the brief's package line now follows the selected service (with a note when it differs from the recommendation). |
| 58 | 2026-10-30 | By Industry demo buttons link to the hosted demos on askforcefield.com (F&B and Beauty: Essential website, Dynamic website, Dynamic admin panel), opening in a new tab. Bundled demo copies removed from the site. |
| 57 | 2026-10-30 | Headings in sentence case site-wide (section titles, card headings, section labels, goals, form headings, My Pick). Names of solutions, industries and packages unchanged. |
| 56 | 2026-10-30 | Forms email support@forcefield.design via FormSubmit (as on the leads pages), with WhatsApp / email fallback on failure. Uploads: 10 MB total (FormSubmit limit), large photos shrunk in the browser. |
| 55 | 2026-10-30 | Solutions menu: new descriptions for All Solutions and By Industry. |
| 54 | 2026-10-30 | Discovery: removed the final "Let's Understand Your Business First." section; the investment panel now ends the page. |
| 53 | 2026-10-30 | Footer: "Essential Solution", "Dynamic Solution". Discovery: final CTA without the card frame; separate-service note reworded. |
| 52 | 2026-10-30 | Discovery page rebuilt: Discovery Workshop hero, What We Explore, Your Discovery Outcome, Our Process, Discovery Investment, final CTA; all CTAs open Get Started with Discovery preselected. Unused closing-banner component removed. |
| 51 | 2026-10-30 | Footer: Services links read "Essential" and "Dynamic" (removed "Website Package"). |
| 50 | 2026-10-30 | Footer: industry links show the industry name only (removed "Websites"). |
| 49 | 2026-10-30 | Get Started and General Enquiry forms: "Business Email" renamed "Email"; Clear All button with Undo. |
| 48 | 2026-10-30 | About page: intro, story and commitment columns aligned on one two-column grid; story text starts level with its heading; matching line spacing. |
| 47 | 2026-10-30 | One section-label style site-wide: About page uses the shared pill label; timeline panel label in sentence case. |
| 46 | 2026-10-30 | About page "What We Do": interactive timeline (Discovery, Essential, Dynamic) with content panel on desktop/tablet and an accordion on mobile; Essential selected by default. |
| 45 | 2026-10-30 | About page layout refined: stacked hero with key statement, readable story column with sticky heading, aligned service cards with links, 2×2 principles, two-column commitment panel. |
| 44 | 2026-10-30 | About page rewritten (About Forcefield, Our Story, What We Do, How We Work, Our Commitment). Footer: removed the prototype / build line (build number kept as a hidden attribute). |
| 43 | 2026-10-30 | My Pick as a solutions planner: new empty state, selected solutions list, rule-based Essential / Dynamic recommendation from confirmed package features (or "pending review"), Get Started hand-off with preselected package and pre-filled brief; structured solutions, recommendation and service source in the submission. Old quote payload code removed. |
| 42 | 2026-10-30 | Homepage: Get Started opens the form; Explore Essential / Dynamic go to By Industry. Footer: Solutions (8 categories), Industries (7), Services and Company columns with descriptive link text; solutions page accepts ?category=. |
| 41 | 2026-10-30 | Homepage closing section: "Ready to Launch Your Website?" with Get Started (replaces the Discovery teaser). |
| 40 | 2026-10-30 | Spam check from the leads pages (quick sum, hidden honeypot, minimum time) on both forms, replacing the CAPTCHA placeholder. Footer: leads-page description, links matching the site (Solutions, Services, Company), "All rights reserved." |
| 39 | 2026-10-30 | Get Started page: removed the two link cards; Instagram, Facebook and LinkedIn icon links (also in the footer). |
| 38 | 2026-10-30 | New combined Sign Up & Enquiry page (/get-started, /contact): Get Started tab with service cards, brief / link / file upload, CAPTCHA; General Enquiry tab. My Pick and Discovery sign-up go here. |
| 37 | 2026-10-30 | Reverted to Build 36 (expandable industry cards). Demo linking parked until the main site is complete. Added build numbering. |
| 36 | 2026-10-30 | By Industry: expandable cards, four solutions when closed, package toggle, descriptions and demo links when open. |
| 35 | 2026-10-30 | By Industry: new heading, Essential / Dynamic notes. |
| 34 | 2026-10-30 | By Industry simplified: package toggle with demo buttons; industry pages removed. |
| 33 | 2026-10-30 | By Industry: solution tags, demo previews, Healthcare & Wellness renamed Beauty & Wellness. |
| 32 | 2026-10-30 | Solution Finder removed; industry → goal → solutions flow; Essential / Dynamic recommendation in My Pick; "Sign up to get started". |
| 31 | 2026-10-30 | Our Solutions: banner removed, headings left-aligned. |
| 30 | 2026-10-30 | Graphic solution cards with Add to My Pick; 86-solution catalogue. |
