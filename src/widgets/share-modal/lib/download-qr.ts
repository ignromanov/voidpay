/**
 * Download QR code as PNG image
 *
 * Finds the SVG element with [data-qr-code] attribute,
 * converts it to PNG with white background padding,
 * and triggers a download.
 *
 * @param filename - Name of the downloaded file (default: 'voidpay-invoice-qr.png')
 */
export function downloadQRCode(filename = 'voidpay-invoice-qr.png'): void {
  const svg = document.querySelector('[data-qr-code] svg') as SVGSVGElement | null
  if (!svg) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const svgData = new XMLSerializer().serializeToString(svg)
  const img = new Image()

  img.onload = () => {
    // Add padding for white background
    const padding = 32
    canvas.width = img.width + padding * 2
    canvas.height = img.height + padding * 2

    // Fill white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw QR in center
    ctx.drawImage(img, padding, padding)

    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
}
