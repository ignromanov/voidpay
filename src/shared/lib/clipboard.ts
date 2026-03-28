/**
 * Copy text to clipboard with legacy fallback for older browsers / Safari iOS.
 * Returns true on success, false on failure.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to legacy method
    }
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.cssText = 'position:fixed;left:-9999px;top:-9999px'
  document.body.appendChild(textArea)
  textArea.select()

  try {
    document.execCommand('copy')
    return true
  } catch {
    return false
  } finally {
    document.body.removeChild(textArea)
  }
}
