/**
 * FormSubmit sender (formsubmit.co), as used on the leads landing pages.
 * - Without files: JSON to the AJAX endpoint (same as the leads pages).
 * - With files: multipart FormData to the same endpoint, one field per file.
 * Fields starting with "_" are FormSubmit options (_subject, _template, _honey…).
 */
import { FORMS } from '../config/forms'

export type SendResult = { ok: true } | { ok: false; activation: boolean; error: string }

export async function sendViaFormSubmit(fields: Record<string, string>, files: File[] = []): Promise<SendResult> {
  const url = `https://formsubmit.co/ajax/${FORMS.formEmail.trim()}`
  const base = { _template: 'table', _captcha: 'false', ...fields }
  try {
    let res: Response
    if (files.length) {
      const body = new FormData()
      Object.entries(base).forEach(([k, v]) => body.append(k, v))
      files.forEach((f, i) => body.append(`attachment${i + 1}`, f, f.name))
      res = await fetch(url, { method: 'POST', headers: { Accept: 'application/json' }, body })
    } else {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(base),
      })
    }
    const data = (await res.json().catch(() => ({ success: res.ok }))) as { success?: boolean | string; message?: string }
    if (data.success === true || data.success === 'true') return { ok: true }
    const message = data.message ?? `Not sent (${res.status})`
    return { ok: false, activation: /activat/i.test(message), error: message }
  } catch {
    return { ok: false, activation: false, error: 'network' }
  }
}

/** Visitor-facing message for a failed send (mirrors the leads pages). */
export const sendErrorMessage = (r: Extract<SendResult, { ok: false }>) =>
  r.activation
    ? 'Our enquiry inbox is being set up, so your details have not been sent yet.'
    : 'We couldn’t send your details just now. Everything you entered is still here, so please try again in a moment.'
