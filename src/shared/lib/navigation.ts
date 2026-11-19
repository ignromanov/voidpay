/**
 * Navigate to a URL carrying an invoice hash fragment via a full document load.
 *
 * Do NOT use `router.push/replace` for these URLs: the Next.js App Router
 * appends the hash to a previously visited (client-cached) route instead of
 * replacing it (`/pay#A` -> `/pay#A#A`), corrupting the invoice fragment.
 */
export function navigateToHashUrl(url: string | URL, { replace = false }: { replace?: boolean } = {}): void {
  const target = typeof url === 'string' ? url : `${url.pathname}${url.search}${url.hash}`
  if (replace) {
    window.location.replace(target)
  } else {
    window.location.assign(target)
  }
}
