/**
 * Sends both website forms to POST /api/contact (Cloudflare Pages Function,
 * functions/api/contact.js). The function saves the enquiry in D1 and emails
 * support@forcefield.design through Resend. No keys or secrets live here.
 */
export type ContactResult =
  | { ok: true; reference: string; emailStatus: 'sent' | 'failed' | 'pending'; duplicate?: boolean }
  | { ok: false; error: string; showFallback: boolean; fields?: Record<string, string> }

/** One key per submission. Retries of the same submission reuse it, so the server never stores it twice. */
export function newIdempotencyKey() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
}

export async function postContact(payload: Record<string, unknown>, files: File[] = []): Promise<ContactResult> {
  let res: Response
  try {
    if (files.length) {
      const body = new FormData()
      body.append('payload', JSON.stringify(payload))
      files.forEach((f) => body.append('files', f, f.name))
      res = await fetch('/api/contact', { method: 'POST', body })
    } else {
      res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    }
  } catch {
    return {
      ok: false,
      error: 'We couldn’t reach our server. Please check your connection and try again. Everything you entered is still here.',
      showFallback: true,
    }
  }
  const data = (await res.json().catch(() => null)) as
    | { ok?: boolean; reference?: string; emailStatus?: 'sent' | 'failed' | 'pending'; duplicate?: boolean; error?: string; fields?: Record<string, string> }
    | null
  if (res.ok && data?.ok && data.reference) return { ok: true, reference: data.reference, emailStatus: data.emailStatus ?? 'pending', duplicate: data.duplicate }
  if (res.status === 404 || !data)
    return { ok: false, error: 'Our form service isn’t available right now. Everything you entered is still here.', showFallback: true }
  return {
    ok: false,
    error: data.error ?? 'We couldn’t send your details just now. Everything you entered is still here.',
    showFallback: res.status >= 500 || res.status === 429,
    fields: data.fields,
  }
}
