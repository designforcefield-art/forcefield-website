/**
 * GENERAL ENQUIRY SUBMISSION ADAPTER
 * ------------------------------------------------------------------
 * The General Enquiry tab calls `submitContactEnquiry()`. It emails
 * support@forcefield.design via FormSubmit (src/config/forms.ts).
 * Sign-ups (Get Started tab) use lib/signup.ts.
 */

import { sendErrorMessage, sendViaFormSubmit } from './formsubmit'

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
  spamCheck?: { honeypot: string; elapsedMs: number }
}

const ENQUIRY_ENDPOINT = import.meta.env.VITE_ENQUIRY_ENDPOINT as string | undefined

/** Emailed to support@forcefield.design via FormSubmit (like the leads pages), unless VITE_ENQUIRY_ENDPOINT is set. */
export async function submitContactEnquiry(e: ContactEnquiry): Promise<SubmitResult> {
  if (ENQUIRY_ENDPOINT) {
    try {
      const res = await fetch(ENQUIRY_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...e, submittedAt: new Date().toISOString() }) })
      return res.ok ? { ok: true } : { ok: false, error: `The server responded with ${res.status}. Please try again.`, showFallback: true }
    } catch {
      return { ok: false, error: "We couldn't reach the server. Check your connection and try again.", showFallback: true }
    }
  }
  const r = await sendViaFormSubmit({
    Form: 'General enquiry',
    Name: e.name.trim(),
    Email: e.email.trim(),
    'Contact number': e.phone.trim() || '-',
    'Enquiry type': e.type,
    Message: e.message.trim(),
    Consent: 'Agreed: Forcefield Design may use these details to reply to this enquiry.',
    'Sent from': typeof location !== 'undefined' ? location.href : '-',
    'Submitted at': new Date().toISOString(),
    _subject: `New enquiry: ${e.type} (${e.name.trim()})`,
    _replyto: e.email.trim(),
    _honey: e.spamCheck?.honeypot ?? '',
  })
  return r.ok ? { ok: true } : { ok: false, error: sendErrorMessage(r), showFallback: true }
}
