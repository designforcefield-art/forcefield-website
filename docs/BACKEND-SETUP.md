# Forcefield Design: backend setup (Cloudflare Pages Functions, D1 and Resend)

Build 80. This guide covers the enquiry forms, email notifications, enquiry storage and the Admin page.

## How it works

```
Visitor submits a form (Get Started or General Enquiry)
  -> React form posts to POST /api/contact (same site, no keys in the browser)
  -> functions/api/contact.js: validates, checks spam, rate-limits, removes duplicates
  -> saves the enquiry in Cloudflare D1 (table "enquiries"), email_status = pending
  -> sends the notification through Resend to support@forcefield.design
     (Reply-To = the customer, so replying in Outlook answers them directly)
  -> email_status = sent, or failed (the enquiry stays saved, and the Admin page shows it)
```

- **Saved first, emailed second.** If the email fails, the enquiry is not lost. The Admin page flags it and has a **Send notification again** button.
- **If the database is unavailable,** the function still tries to email the enquiry. The visitor is told it went through only if that email actually sent. If both fail, the visitor sees an error, everything they typed stays in the form, and the WhatsApp and email fallback is shown.
- **No duplicates.** Each submission carries a one-time key from the browser, and retries reuse it. The same person sending the same content within 10 minutes is also treated as a duplicate.

## A. Change summary

**Added**
| File | Purpose |
|---|---|
| `functions/api/contact.js` | `POST /api/contact`: validation, spam checks, rate limit, duplicates, D1 save, Resend email |
| `functions/api/_lib.js` | Shared helpers: email template, Resend call, admin sessions, hashing, schema fallback |
| `functions/api/admin/login.js` | `POST /api/admin/login`: checks `ADMIN_PASSWORD` on the server and returns a signed 12-hour session (5 failed tries per 15 min, then locked) |
| `functions/api/admin/enquiries/index.js` | `GET` list with filters (status, email status, form, search) |
| `functions/api/admin/enquiries/[id].js` | `GET` one enquiry, `PATCH` its status |
| `functions/api/admin/enquiries/[id]/resend.js` | `POST` send a failed notification again |
| `migrations/0001_analytics_events.sql` | The existing analytics table (`events`), written as a migration. Safe on an existing database |
| `migrations/0002_enquiries.sql` | New `enquiries` and `admin_login_attempts` tables (additive) |
| `src/lib/contactApi.ts` | Front-end call to `/api/contact` and its messages |
| `docs/BACKEND-SETUP.md`, `wrangler.toml.example`, `.dev.vars.example` | Setup guide and configuration examples |

**Modified**
| File | Change |
|---|---|
| `src/lib/signup.ts`, `src/lib/quote.ts` | Submit to `/api/contact` instead of FormSubmit |
| `src/pages/GetStarted.tsx` | One-time submission key per form; the error box no longer shows FormSubmit details |
| `src/components/SpamCheck.tsx` | Sends the sum and answer so the server can check them too |
| `src/pages/Admin.tsx` | Server-checked login (session token, not the password), new **Enquiries** tab (list, detail, status, email retry). The **All solution stats** tab is unchanged |
| `functions/api/stats.js` | Now requires the admin session token (same data as before) |
| `src/config/forms.ts`, `README.md`, `.gitignore` | Comments, docs, ignore `.dev.vars` and `.env` |

**Removed:** `src/lib/formsubmit.ts`. FormSubmit is no longer used.

**Breaking changes**
- `/api/stats` no longer accepts the raw admin password as a Bearer token. It needs the session from `/api/admin/login`. Only the Admin page used it, and it has been updated.
- The forms need the Cloudflare setup below. Until `RESEND_API_KEY` and the `DB` binding exist, submissions fail with a clear message and the WhatsApp and email fallback. Set everything up before or together with this deployment.
- `VITE_SIGNUP_ENDPOINT` and `VITE_ENQUIRY_ENDPOINT` are no longer read.

No public page addresses changed. The design and the My Pick and recommendation logic are untouched.

## B. Variables, secrets and bindings

| Name | Kind | Where | Required | Purpose |
|---|---|---|---|---|
| `DB` | D1 binding | Pages → Settings → Bindings | Yes | Enquiries, analytics events, login attempts |
| `RESEND_API_KEY` | Secret | Pages → Settings → Variables and Secrets | Yes | Sends notification emails |
| `ADMIN_PASSWORD` | Secret | same | Yes | Admin login (checked on the server only) |
| `EMAIL_TO` | Variable (plain) | same | No | Default `support@forcefield.design`. Comma-separate for several |
| `EMAIL_FROM` | Variable (plain) | same | No | Default `Forcefield Design <notifications@forcefield.design>` |
| `IP_HASH_SALT` | Secret | same | Recommended | Random text used to hash visitor IPs for rate limiting |
| `SESSION_SECRET` | Secret | same | Recommended | Extra key for admin sessions. Changing it signs everyone out |
| `RESEND_API_URL` | Variable | local testing only | No | Points emails at a mock server in tests. Don't set it in production |
| `TURNSTILE_SECRET_KEY` | Secret | (future) | No | Not used yet. See "Turnstile" below |

- **Public front-end variables (`VITE_…`):** none are needed. Never put keys in `VITE_` variables, because they end up in the browser.
- **Environments:** add each variable and binding to the **Production** environment, and to **Preview** too if you test on preview URLs. Bindings and secrets take effect on the **next deployment**.

## C. Cloudflare setup, step by step

1. **Create the database.** Go to Cloudflare dashboard → **Storage & Databases → D1 → Create** and name it, for example, `forcefield-db`.
   - If you already created one for the All Solutions stats (Build 77), reuse it. Its `events` table is kept as it is.
2. **Apply the migrations.** Use either option:
   - **Dashboard:** open the database → **Console**. Paste the contents of `migrations/0001_analytics_events.sql` and run it, then do the same with `migrations/0002_enquiries.sql`.
   - **Command line:**
     1. Copy `wrangler.toml.example` to a scratch folder, fill in `database_id`, and log in with `npx wrangler login`.
     2. Run `npx wrangler d1 migrations apply forcefield-db --remote`.

   Creating the migration files doesn't create anything by itself. As a safety net, the functions create any missing tables with `CREATE TABLE IF NOT EXISTS`. Still run the migrations so the setup is explicit.
3. **Connect the database.** Go to Workers & Pages → your Pages project → **Settings → Bindings → Add → D1 database**. Set the variable name to `DB` (exactly) and choose `forcefield-db`.
4. **Add the secrets.** Go to **Settings → Variables and Secrets → Add**. Add `RESEND_API_KEY`, `ADMIN_PASSWORD`, `IP_HASH_SALT` and `SESSION_SECRET`, each with the type set to **Secret**.
5. **Set up Resend.** See section D. You need the domain verified before emails will send from `notifications@forcefield.design`.
6. **Deploy.**
   1. Replace the repository files with this ZIP's contents, keeping your `.git` folder.
   2. Commit, then push to `main`.
   3. Cloudflare builds with `npm run build` into `dist`, and deploys `functions/` automatically.

   Build settings stay the same: framework **Vite**, build command `npm run build`, output directory `dist`. Do **not** add a `wrangler.toml` to the repo. If one is present, Cloudflare reads bindings from it and locks the dashboard settings.
7. **Verify.**
   1. Check **Deployments → latest → Functions**. It should list `/api/contact`, `/api/admin/...`, `/api/stats` and `/api/track`.
   2. Send a test from each form, and check the inbox at support@forcefield.design.
   3. Open `/admin`, log in, and see both enquiries.
   4. In **D1 → Console**, run `SELECT reference, email_status FROM enquiries ORDER BY id DESC LIMIT 5;`.

## D. DNS: verifying forcefield.design with Resend, without touching Microsoft 365

Resend sends from a subdomain return path (`send.forcefield.design`) and signs with its own DKIM key. Its records don't replace anything Microsoft 365 uses.

1. In Resend, go to **Domains → Add domain** and enter `forcefield.design`. Choose the region closest to you, for example Tokyo (`ap-northeast-1`), or the default.
2. Resend shows three or four records. Add them in Cloudflare → your domain → **DNS → Records**, exactly as shown:

   | Type | Name (as Resend shows it) | Content | Notes |
   |---|---|---|---|
   | TXT | `resend._domainkey` | `p=MIGf...` (long key) | DKIM for Resend. Separate from Microsoft's `selector1`/`selector2` DKIM, so no conflict |
   | MX | `send` | `feedback-smtp.<region>.amazonses.com`, priority 10 | **On the `send` subdomain only.** Your root MX record (Microsoft 365) is untouched |
   | TXT | `send` | `v=spf1 include:amazonses.com ~all` | SPF for the **`send` subdomain**. It is a separate record from your root SPF |
   | TXT | `_dmarc` | `v=DMARC1; p=none;` | Only if you don't already have a `_dmarc` record. If you do, keep yours |

   - Set every record to **DNS only** (grey cloud). Email records can't be proxied.
   - Some DNS hosts want the full name (`resend._domainkey.forcefield.design`). Cloudflare accepts the short name and adds the domain itself.
3. Click **Verify** in Resend. It usually takes minutes, and up to a few hours.
4. Create an API key in Resend with **Sending access**, limited to `forcefield.design`. Paste it into Cloudflare as `RESEND_API_KEY`.

**Leave these as they are:**
- the root MX record pointing to Outlook (`*.mail.protection.outlook.com`)
- the root TXT SPF. With Microsoft 365 bought through GoDaddy this is often `v=spf1 include:secureserver.net -all`; otherwise `v=spf1 include:spf.protection.outlook.com -all`
- `selector1._domainkey` / `selector2._domainkey` (Microsoft DKIM CNAMEs)
- the `MS=ms…` verification TXT
- the `autodiscover` CNAME and any GoDaddy or Microsoft `_sip`/`lyncdiscover` records

**SPF, in short:**
- A domain must have **one** SPF record per name.
- You don't need to change the root SPF, because Resend's SPF lives on `send.forcefield.design`. Never add a second `v=spf1` TXT on the root.
- If someone later asks you to add Resend to the root SPF, merge it into the existing record instead, for example `v=spf1 include:secureserver.net include:amazonses.com -all`. Resend's standard setup doesn't need that.

**DMARC:** Resend signs with DKIM for `forcefield.design`, so its emails pass DMARC alignment even if you later tighten DMARC to `quarantine` or `reject`.

**If your DNS is managed at GoDaddy, not Cloudflare:** add the same records in GoDaddy DNS instead. Cloudflare Pages on the root domain normally means the DNS is on Cloudflare.

## Spam protection

Several checks run on the server:
- **Honeypot:** bots get a fake "OK" and nothing is stored or sent.
- **Minimum time** on the form (2.5 s).
- **The sum is checked again** on the server.
- **Field checks:** formats and length limits for every field.
- **Size limits:** 64 KB for messages, and 10 MB in total for files (PDF, Word, JPG, PNG; up to 5 files).
- **Rate limit:** 5 enquiries per connection per 10 minutes, and 20 per day.
- **Duplicate prevention.**

Visitors' IPs are never stored, only a salted hash.

**Turnstile (optional, recommended if spam appears):**
1. Create a Turnstile widget in Cloudflare and use the **Invisible** or **Managed** mode, which shows nothing to most visitors.
2. Put the site key in a `VITE_TURNSTILE_SITE_KEY` variable (public by design), and the secret in `TURNSTILE_SECRET_KEY` (Secret).
3. The form would render the widget next to the spam check and send its token. `contact.js` would verify it with `https://challenges.cloudflare.com/turnstile/v0/siteverify` before saving.

This isn't switched on yet, so the current look is unchanged. Ask when you want it.

## Attachments

- Files go to support@forcefield.design **inside the notification email**. Resend allows up to 40 MB per email; the form caps them at 10 MB.
- They aren't stored in D1. Only names and sizes are, so a re-sent notification lists the files but can't re-attach them.
- If you want files kept even when an email fails, the next step is Cloudflare R2 storage.

## E. Testing checklist

**Already checked locally** (Build 80): Wrangler's local Pages runtime with a local D1 database, and a **mock Resend server**. No real email or production database was used.
- [x] `npm run build` succeeds, and the site pages load
- [x] General Enquiry and Get Started (with My Pick and a PDF attachment) submit to `/api/contact`, and both are saved
- [x] The Resend request is correct:
  - from `notifications@forcefield.design`, to `support@forcefield.design`, reply-to the customer
  - subject `[Forcefield Enquiry] …`, with the reference in the body
  - an attachment for sign-ups
  - customer text escaped as HTML
- [x] An email failure leaves the enquiry saved with `email_status = failed`. **Send notification again** in Admin then marks it sent
- [x] Retrying with the same key, or sending the same content again, returns the same reference with no second email
- [x] These are rejected: missing consent, a bad email, a wrong sum, a too-fast submission, and oversized requests. The honeypot is silently dropped
- [x] The rate limit triggers on the 6th enquiry within 10 minutes
- [x] Admin endpoints reject no token, a forged token, and the raw password. Login locks after 5 wrong tries
- [x] Admin lists enquiries, opens details and changes status. The All solution stats tab still works, and `/api/track` still records

**To check after deploying** (needs your real Cloudflare and Resend accounts):
- [ ] Resend shows the domain as **Verified**. A test enquiry arrives at support@forcefield.design and isn't in junk
- [ ] Replying to the notification in Outlook goes to the customer's address
- [ ] Microsoft 365 still sends and receives normally. Send yourself an email from outside, and reply
- [ ] A Get Started submission with an attachment arrives with the file
- [ ] `/admin`: log in, see both test enquiries, change a status, and refresh to confirm it was saved
- [ ] D1 Console: `SELECT COUNT(*) FROM enquiries;` matches what you sent
- [ ] All solution stats: add a solution on `/solutions`, then check it appears
- [ ] A wrong admin password 5 times gives "Too many attempts" (wait 15 minutes afterwards)
- [ ] With a deliberately wrong `RESEND_API_KEY` in a Preview deployment, an enquiry saves and shows **Email failed** in Admin
