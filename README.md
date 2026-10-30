# Forcefield Website — V1 Prototype

Functional prototype of the repositioned Forcefield Design website: a digital solutions catalogue with a Solution Finder, a rule-based recommendation engine, a persistent **My Pick** shortlist and a quotation-request flow.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 (CSS-first `@theme`) · React Router · Lucide icons. Motion is pure CSS (keyframes + transitions), which is lighter than an animation library and respects `prefers-reduced-motion` globally.

```bash
npm install
npm run dev              # local dev server
npm run build            # static site in dist/ (deploy anywhere)
npm run build:artifact   # single self-contained HTML in dist-artifact/ (for previews)
npm run typecheck
```

No backend, accounts or paid APIs are required. Picks are stored in `localStorage`; Finder answers in `sessionStorage`.

---

## 1. Application structure

```
src/
  styles.css              Design tokens (@theme) + utilities
  main.tsx                Router choice (BrowserRouter / HashRouter / MemoryRouter)
  App.tsx                 Routes
  data/
    types.ts              Catalogue types (CMS-shaped, ID references only)
    catalogue.ts          ← ALL editable content: solutions, features, industries,
                            finder options, discovery services, packages, site config
  lib/
    recommend.ts          Recommendation engine (pure functions, no UI)
    picks.ts              My Pick data model + duplicate signature
    quote.ts              Submission adapter (mock now, real API later)
    storage.ts            Safe local/session storage
  state/
    PickContext.tsx       My Pick list, drawer + quote modal state
    FinderContext.tsx     Finder answers, current step, edit-a-pick mode
  components/
    ui/                   Primitives: Button, Badge, Card, Field/Input/Select/Textarea,
                          Modal, Drawer, Stepper, ChoiceCard, Toast, Icon
    AbstractIcon.tsx      Monoline geometric icons for solutions & packages (SolutionGlyph, PackageGlyph)
    SolutionIllustration.tsx  Solution artwork tile (monoline icon on a plain panel) + SolutionThumb
    catalogue.tsx         SolutionCard, FeatureCard, GroupedFeatures, ThemePreview,
                          PriceBlock, StatusBadge, AvailabilityRow
    PackageComparison.tsx Essential vs Dynamic comparison (+ feature availability table)
    ConfigEditor.tsx      Package toggle + optional-feature editor + compatibility notes
    MyPickDrawer.tsx      Shortlist drawer (edit, remove with undo, revisit answers)
    QuoteRequestForm.tsx  Quote modal: summary, validation, consent, mock submit
    site/                 Header (Solutions dropdown, My Pick control), Footer, Layout, HeroVisual
  pages/                  Home, About, Solutions, SolutionDetail, Industries (+ detail),
                          Finder, Discovery, Contact, NotFound
```

## 2. Component architecture

- **Primitives** (`components/ui`) know nothing about Forcefield's catalogue. They take tokens only.
- **Domain components** (`catalogue.tsx`, `PackageComparison`, `ConfigEditor`, drawer, quote form) read catalogue data and call the engine.
- **Pages** compose domain components. The same `ConfigEditor` powers the Solution Detail configurator and editing inside My Pick; the same `evaluateConfiguration()` powers the Finder results, configurator and drawer warnings, so rules never drift.
- **Accessibility:** selectable cards are real radio/checkbox inputs; dialogs trap focus, close on Escape and restore focus; form errors are linked with `aria-describedby` and announced; the stepper announces the current step; completed steps are buttons for editing.

## 3. Design tokens

Visual direction: plain charcoal page (#1C1C1E) with no gradients or glows; cards and buttons are embossed (hairline edge, soft top highlight, tight contact shadow: `shadow-emboss`, `shadow-emboss-hover`, `shadow-rim`, `shadow-btn`, `shadow-btn-accent`, `shadow-pressed`); one purple accent (#3B2BEE for fills, lavender #9A91FF for purple text, since #3B2BEE is too dark to read on charcoal). Headings use SF Pro (Apple system font) Regular 400, with Inter Tight as the fallback on other devices, body text Inter. Frosted glass only on the navigation bar (`glass-bar`). Copy is written for non-technical business owners.


All defined in `src/styles.css` inside `@theme` (no `tailwind.config.js`). Default Tailwind colours are cleared (`--color-*: initial`) so components can only use brand tokens.

| Group | Tokens |
|---|---|
| Surfaces | `canvas` `surface` `elevated` `raised` `line` `line-strong` |
| Brand | `electric` `electric-bright` `cyan` `glow` `ion` |
| Text | `fg` `muted` `subtle` |
| Semantic | `success` `warning` `danger` |
| Type | `font-sans` (Inter, display optical size) `font-mono` (aliased to Inter); `text-display` `text-h1` `text-h2` `text-h3` `text-lead` `text-eyebrow` (fluid, with line-height/tracking) |
| Spacing | `section` (fluid section rhythm), `header` |
| Radius | `chip` `control` `card` `panel` |
| Shadow | `float` `glow` `glow-soft` |
| Motion | `ease-out-expo`; `animate-float` `float-slow` `aurora` `rise` `pop` `dash` |
| Breakpoint | `xs` (30rem) plus Tailwind defaults |

Gradients are CSS variables (`--gradient-hero`, `--gradient-electric`, `--gradient-text`, `--gradient-panel`, `--gradient-border`) exposed as utilities: `bg-hero`, `bg-electric-gradient`, `bg-panel-gradient`, `text-gradient`, `ring-gradient`. Also `glass`, `gutter`, `grid-lines`. Gradients are reserved for the hero, recommendation moments and featured highlights.

The only literal colours outside `styles.css` are preset-theme swatches in the catalogue (they are content: each theme's own palette).

## 4. Recommendation rules (`lib/recommend.ts`)

1. **Unclear needs → Discovery.** Challenges = "not sure" **and** goals = "not sure", with fewer than 3 features picked → Discovery Consultation is the primary match. With ≥3 features, a **preliminary** solution is shown alongside a Discovery suggestion. (`PRELIMINARY_FEATURE_THRESHOLD`)
2. **Solution scoring:** +3 per matched challenge, +3 per matched goal, +2 exact industry match (+1 for "all industries"), +3 per chosen feature that is core to the solution, +1 per compatible feature, −4 per incompatible feature. Highest score wins; catalogue order breaks ties. Weights are in the `W` constant.
3. **Package:** Essential unless a chosen compatible feature is unavailable in Essential but available in Dynamic. Never upgrades for any other reason. Reasons name the exact features that force Dynamic.
4. **Nothing is silently changed:** required dependencies are added and labelled ("needed by…"); incompatible features stay visible, flagged with which solutions *do* support them; conflicting features (e.g. built-in Customer Records + CRM Integration) are flagged for review; Essential-only gaps are listed if the customer overrides to Essential.
5. **Discovery as a second opinion** when one side was "not sure", when ≥9 features are picked, or when ≥2 picks are incompatible.
6. **Feature suggestions** (Step 4 "Recommend for me"): features compatible with the best-fit solution, scored by challenge (+3), goal (+2), industry (+2) and core (+1); top 5, each with a reason that rotates through the matched signals.

Quick engine check without the UI: `npx tsx` any script importing `recommend()` with sample answers.

## 5. Catalogue data structure (`data/catalogue.ts`, types in `data/types.ts`)

- **`SOLUTIONS`**: `id`, `name`, `tagline`, `description`, `category`, `icon` (Lucide name), `industries` (IDs or `'all'`), `problems` (challenge IDs), `goals` (goal IDs), `coreFeatures` (feature IDs), `packages.essential|dynamic` (`summary`, `capabilities`), `pricing.essential|dynamic` (`setup`, `recurring` — `null` shows "Request quote"), `themes`, `discoveryWhen`.
- **`FEATURES`**: `id`, `name`, `description`, `category`, `compatibleWith` (solution IDs), `availability.essential|dynamic` (`included` / `addon` / `unavailable`), `additionalFee`, `requires`, `conflictsWith`, `addresses` (challenges), `supports` (goals), `industries`.
- **`INDUSTRIES`**: copy plus `recommendedSolutions` and `popularFeatures` **by ID** — industry pages never duplicate solution records.
- Finder options (`INDUSTRY_OPTIONS`, `CHALLENGE_OPTIONS`, `GOAL_OPTIONS`), `DISCOVERY_SERVICES`, `PARTNERSHIPS`, `PACKAGE_INFO`, `SITE` (verified company details; `email`/`phone` are `null` until confirmed and hidden while null).

## 6. Updating packages and features

- **Add a feature:** append to `FEATURES` with a unique `id`, list the solutions in `compatibleWith`, set availability per package. It appears automatically in the Finder, configurators and comparison tables. If you use a new Lucide icon anywhere in data, register it in `components/ui/Icon.tsx`.
- **Move a feature between packages:** change its `availability`. The engine's package logic follows.
- **Add a solution:** add its ID to `SolutionId` in `types.ts`, then a record in `SOLUTIONS`. Reference it from industries and features as needed.
- **Set prices:** fill `pricing.essential.setup` etc. with display strings (e.g. `"From S$X"`). Leave `null` to keep "Request quote".
- **Moving to a CMS:** the shapes in `types.ts` are the content model. Replace the exported arrays with fetched data of the same shape (load before render, or wrap lookups in a context).

## 7. Connecting a real quotation backend

The UI only calls `submitQuoteRequest(payload)` and `submitContactEnquiry(data)` in `src/lib/quote.ts`.

1. Create an endpoint that accepts `POST` JSON (`QuoteRequestPayload` is typed in `quote.ts`: contact details, consent text, business profile, challenges, notes, goals, each pick with package and features, and the Discovery flag). Typical options: a serverless function that emails the team and/or writes to a CRM (HubSpot, Zoho) or a sheet.
2. Set `VITE_QUOTE_ENDPOINT` (and `VITE_ENQUIRY_ENDPOINT` for the Contact form) at build time. When set, the adapter posts for real and the confirmation screen switches from "Prototype mode" to a received message, showing a `reference` if your API returns one.
3. Server side: validate again, rate-limit, add spam protection (e.g. Turnstile), store the consent text with the record, and send the customer an acknowledgement email.

Until an endpoint is configured, nothing is sent anywhere and the UI says so.

## 8. Notes for the next iteration

- Confirm contact email/phone, real price bands and theme previews (current previews are drawn wireframes).
- Past work names and three testimonials on About are taken from the current forcefield.design site. Confirm clients are happy for them to carry over.
- Clean URLs (`/about`) via BrowserRouter. Cloudflare Pages serves them as-is; set `VITE_ROUTER=hash` for hosts without rewrites.
- No reference image was attached to the brief; visuals follow the written direction (black/electric blue, glow, floating glass cards).

## Deploying to GitLab Pages

`.gitlab-ci.yml` is included. Push this folder to a GitLab project; each push to
the default branch runs `npm run build` and publishes `dist/` with GitLab Pages.
Find the address under **Deploy → Pages** (custom domains can be added there).
The site uses relative paths and hash URLs (`/#/about`), so it works at
`https://<group>.gitlab.io/<project>/` without extra configuration.

## SEO

- Page titles, descriptions and keywords live in `src/seo/pages.json`; structured data in `src/seo/structuredData.mjs`.
- `npm run build` runs `scripts/seo-pages.mjs`, which writes a static HTML file per page with its own
  title, description, canonical URL, social tags and JSON-LD, plus `sitemap.xml`, `robots.txt` and
  Cloudflare `_redirects`.
- The canonical domain is `siteUrl` in `pages.json` (https://www.forcefield.design). Override for a
  staging build with `SITE_URL=https://… npm run build`.
- After launch: add the domain in Google Search Console and submit `/sitemap.xml`.

## All Solutions tracking and Admin stats (Cloudflare)

The All Solutions page sends anonymous events (industry, goal, category, search term,
solution added to / removed from My Pick) to `/api/track`. The footer **Admin** link
opens `/admin`, which shows the totals after you enter the admin password.
The code is in `functions/api/` (Cloudflare Pages Functions) and stores data in Cloudflare D1.

One-time setup in the Cloudflare dashboard:
1. **Storage & Databases → D1 → Create database**, e.g. `forcefield-analytics`. The table is created automatically.
2. Your Pages project → **Settings → Bindings → Add → D1 database**: variable name `DB`, choose that database.
3. Same project → **Settings → Variables and Secrets → Add**: `ADMIN_PASSWORD`, type *Secret*, your chosen password.
4. Redeploy (push a commit or **Deployments → Retry deployment**). Bindings apply to new deployments only.

Until this is done, the site works normally and tracking is silently skipped.
No names, emails, IP addresses or cookies are stored; visits are counted with a random id per browser tab.
