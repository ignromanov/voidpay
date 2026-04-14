import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { toast as sonnerToast } from 'sonner'
import { downloadQRCode } from '../download-qr'

// sonner is aliased to src/shared/lib/test-utils/mocks/sonner.tsx — toast.error is already a vi.fn().
// download-qr → @/shared/lib/toast → sonner, so we assert on sonnerToast.error.

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSvgElement(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '200')
  svg.setAttribute('height', '200')
  return svg
}

function mountQRContainer(svg: SVGSVGElement): HTMLDivElement {
  const container = document.createElement('div')
  container.setAttribute('data-qr-code', '')
  container.appendChild(svg)
  document.body.appendChild(container)
  return container
}

function makeCanvasMock() {
  const ctx = {
    fillStyle: '' as string,
    fillRect: vi.fn(),
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D

  const canvas = {
    getContext: vi.fn(() => ctx),
    toDataURL: vi.fn(() => 'data:image/png;base64,abc'),
    width: 0,
    height: 0,
  } as unknown as HTMLCanvasElement

  return { canvas, ctx }
}

/**
 * Patch document.createElement so 'canvas' returns our mock, while delegating
 * all other tags to the REAL underlying implementation (captured before patching).
 */
function patchCreateElement(
  canvasFactory: () => HTMLCanvasElement,
  extraPatch?: (tag: string, el: HTMLElement) => void,
): () => void {
  const realCreateElement = document.createElement.bind(document)
  const spy = vi
    .spyOn(document, 'createElement')
    .mockImplementation((tag: string, options?: ElementCreationOptions) => {
      if (tag === 'canvas') return canvasFactory() as unknown as HTMLElement
      const el = realCreateElement(tag, options)
      extraPatch?.(tag, el)
      return el
    })
  return () => spy.mockRestore()
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('downloadQRCode', () => {
  let restoreCreateElement: (() => void) | null = null

  beforeEach(() => {
    const { canvas } = makeCanvasMock()
    restoreCreateElement = patchCreateElement(() => canvas)
  })

  afterEach(() => {
    document.querySelectorAll('[data-qr-code]').forEach((el) => el.remove())
    restoreCreateElement?.()
    restoreCreateElement = null
    vi.restoreAllMocks()
  })

  // ── No SVG found ─────────────────────────────────────────────────────────

  it('calls toast.error when no [data-qr-code] SVG is found', () => {
    downloadQRCode()
    expect(sonnerToast.error).toHaveBeenCalledWith('QR code not found', expect.anything())
  })

  it('does not create a canvas when SVG is absent', () => {
    // Restore the default spy and install one that just tracks calls
    restoreCreateElement?.()
    const realCreateElement = document.createElement.bind(document)
    const trackSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tag: string, options?: ElementCreationOptions) =>
        realCreateElement(tag, options),
      )
    restoreCreateElement = () => trackSpy.mockRestore()

    downloadQRCode()
    expect(trackSpy).not.toHaveBeenCalledWith('canvas')
  })

  // ── Canvas context unavailable ────────────────────────────────────────────

  it('calls toast.error when canvas 2D context is null', () => {
    restoreCreateElement?.()
    const badCanvas = { getContext: vi.fn(() => null) } as unknown as HTMLCanvasElement
    restoreCreateElement = patchCreateElement(() => badCanvas)

    const svg = makeSvgElement()
    mountQRContainer(svg)

    downloadQRCode()
    expect(sonnerToast.error).toHaveBeenCalledWith(
      'Failed to create canvas for QR download',
      expect.anything(),
    )
  })

  // ── Happy path ────────────────────────────────────────────────────────────

  it('draws QR with white background padding on img load', () => {
    const { canvas, ctx } = makeCanvasMock()
    restoreCreateElement?.()

    const OrigImage = globalThis.Image
    globalThis.Image = class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      width = 200
      height = 200
      set src(_value: string) {
        if (typeof this.onload === 'function') this.onload()
      }
    } as unknown as typeof Image

    restoreCreateElement = patchCreateElement(() => canvas)

    const svg = makeSvgElement()
    mountQRContainer(svg)

    downloadQRCode()

    // Padding = 32; canvas dimensions = 200 + 32*2 = 264
    expect(canvas.width).toBe(264)
    expect(canvas.height).toBe(264)
    expect(ctx.fillStyle).toBe('#ffffff')
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 264, 264)
    expect(ctx.drawImage).toHaveBeenCalled()

    globalThis.Image = OrigImage
  })

  it('triggers download link click after rendering', () => {
    const { canvas } = makeCanvasMock()
    restoreCreateElement?.()

    const OrigImage = globalThis.Image
    globalThis.Image = class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      width = 100
      height = 100
      set src(_value: string) {
        if (typeof this.onload === 'function') this.onload()
      }
    } as unknown as typeof Image

    const clickSpy = vi.fn()
    restoreCreateElement = patchCreateElement(
      () => canvas,
      (tag, el) => {
        if (tag === 'a') el.click = clickSpy
      },
    )

    const svg = makeSvgElement()
    mountQRContainer(svg)

    downloadQRCode()
    expect(clickSpy).toHaveBeenCalled()

    globalThis.Image = OrigImage
  })

  it('uses provided filename for download attribute', () => {
    const { canvas } = makeCanvasMock()
    restoreCreateElement?.()

    const OrigImage = globalThis.Image
    globalThis.Image = class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      width = 100
      height = 100
      set src(_value: string) {
        if (typeof this.onload === 'function') this.onload()
      }
    } as unknown as typeof Image

    let capturedDownload = ''
    restoreCreateElement = patchCreateElement(
      () => canvas,
      (tag, el) => {
        if (tag === 'a') {
          el.click = () => {
            capturedDownload = (el as HTMLAnchorElement).download
          }
        }
      },
    )

    const svg = makeSvgElement()
    mountQRContainer(svg)

    downloadQRCode('my-qr.png')
    expect(capturedDownload).toBe('my-qr.png')

    globalThis.Image = OrigImage
  })

  // ── img.onerror ───────────────────────────────────────────────────────────

  it('calls toast.error when image fails to render', () => {
    const { canvas } = makeCanvasMock()
    restoreCreateElement?.()

    const OrigImage = globalThis.Image
    globalThis.Image = class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      width = 0
      height = 0
      set src(_value: string) {
        if (typeof this.onerror === 'function') this.onerror()
      }
    } as unknown as typeof Image

    restoreCreateElement = patchCreateElement(() => canvas)

    const svg = makeSvgElement()
    mountQRContainer(svg)

    downloadQRCode()
    expect(sonnerToast.error).toHaveBeenCalledWith(
      'Failed to render QR code image',
      expect.anything(),
    )

    globalThis.Image = OrigImage
  })

  // ── SVG serialization ─────────────────────────────────────────────────────

  it('sets img.src as a base64-encoded SVG data URL', () => {
    const { canvas } = makeCanvasMock()
    restoreCreateElement?.()

    let capturedSrc = ''
    const OrigImage = globalThis.Image
    globalThis.Image = class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(value: string) {
        capturedSrc = value
      }
    } as unknown as typeof Image

    restoreCreateElement = patchCreateElement(() => canvas)

    const svg = makeSvgElement()
    mountQRContainer(svg)

    downloadQRCode()
    expect(capturedSrc).toMatch(/^data:image\/svg\+xml;base64,/)

    globalThis.Image = OrigImage
  })
})
