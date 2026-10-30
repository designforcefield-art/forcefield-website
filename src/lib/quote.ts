/**
 * GENERAL ENQUIRY SUBMISSION
 * ------------------------------------------------------------------
 * The General Enquiry tab calls `submitContactEnquiry()`, which posts to
 * /api/contact (saved in D1, emailed to support@forcefield.design via Resend).
 * Sign-ups (Get Started tab) use lib/signup.ts.
 */

import { postContact } from './contactApi'

export const CONSENT_TEXT =
  'I agree that Forcefield Design may use these details to respond to my quotation request. My information will not be shared with third parties for marketing.'

export type SubmitResult = { ok: true } | { ok: false; error: string; showFallback: boolean }

export interface ContactEnquiry {
  name: string
  email: string
  phone: string
  type: string
  message: string
  consent: boolean
  /** Bot signals for the server (honeypot value and time on form). */
  spamCheck?: { honeypot: string; elapsedMs: number; a: number; b: number; answer: number }
}

export const ENQUIRY_CONSENT_TEXT = 'I agree that Forcefield Design may use these details to reply to my enquiry.'

export async function submitContactEnquiry(e: ContactEnquiry, idempotencyKey: string): Promise<SubmitResult> {
  const r = await postContact({
    form: 'general',
    idempotencyKey,
    name: e.name.trim(),
    email: e.email.trim(),
    phone: e.phone.trim(),
    enquiryType: e.type,
    message: e.message.trim(),
    consent: e.consent,
    consentText: ENQUIRY_CONSENT_TEXT,
    page: typeof location !== 'undefined' ? location.pathname : '',
    spamCheck: e.spamCheck,
  })
  return r.ok ? { ok: true } : { ok: false, error: r.error, showFallback: r.showFallback }
}
