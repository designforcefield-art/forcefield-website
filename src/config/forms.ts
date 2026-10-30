/**
 * FORM SETTINGS
 * ------------------------------------------------------------------
 * Both forms on the Get Started page post to /api/contact (a Cloudflare Pages
 * Function in functions/api/contact.js). It saves each enquiry in Cloudflare D1
 * and emails support@forcefield.design through Resend. Server settings
 * (RESEND_API_KEY, EMAIL_TO, ...) live in Cloudflare, never here: see
 * docs/BACKEND-SETUP.md.
 *
 * If sending fails, visitors see the WhatsApp / email fallback below.
 */
export const FORMS = {
  formEmail: 'support@forcefield.design',
  /** Fallback shown if a form can't send. Digits only, with country code. */
  whatsappNumber: '6580836840',
  contactEmail: 'support@forcefield.design',
}

/**
 * Attachments travel in the notification email. Resend accepts up to 40 MB per
 * email after encoding; /api/contact allows 10 MB in total. Keep these in step.
 */
export const UPLOAD_LIMITS = {
  maxFiles: 5,
  maxTotalBytes: 10 * 1024 * 1024,
  /** Photos larger than this are resized/re-compressed in the browser before sending. */
  compressAboveBytes: 1024 * 1024,
  /** Longest edge for resized photos, in pixels. */
  maxImageEdge: 2400,
}
