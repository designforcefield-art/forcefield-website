/**
 * FORM SETTINGS — same setup as the Forcefield leads landing pages.
 * ------------------------------------------------------------------
 * Both forms on the Get Started page (sign-up and general enquiry) are emailed
 * to `formEmail` by FormSubmit (formsubmit.co), in the background.
 *
 * FIRST USE: the first submission triggers an activation email to `formEmail`.
 * Click the link in it once; every submission after that arrives normally.
 * Until then visitors see a message that their details weren't sent, with the
 * WhatsApp / email fallback below.
 *
 * To use your own backend instead, set VITE_SIGNUP_ENDPOINT / VITE_ENQUIRY_ENDPOINT
 * (they take priority over FormSubmit).
 */
export const FORMS = {
  formEmail: 'support@forcefield.design',
  /** Fallback shown if a form can't send. Digits only, with country code. */
  whatsappNumber: '6580836840',
  contactEmail: 'support@forcefield.design',
}

/**
 * FormSubmit accepts about 10 MB of attachments per submission in total
 * (5 MB until early 2026). Keep the form's limit at or below that.
 */
export const UPLOAD_LIMITS = {
  maxFiles: 5,
  maxTotalBytes: 10 * 1024 * 1024,
  /** Photos larger than this are resized/re-compressed in the browser before sending. */
  compressAboveBytes: 1024 * 1024,
  /** Longest edge for resized photos, in pixels. */
  maxImageEdge: 2400,
}
