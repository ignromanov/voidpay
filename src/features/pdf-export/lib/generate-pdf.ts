import type { TDocumentDefinitions } from 'pdfmake/interfaces'
import { toast } from '@/shared/lib/toast'
import { buildDocument, buildFilename } from './build-document'
import type { PartialInvoice } from '@/shared/lib/invoice-types'
import type { PdfExportOptions } from '../model/types'

type PdfMakeApi = { createPdf: (doc: TDocumentDefinitions) => { download: (filename: string) => void } }

/** Cached pdfmake instance — loaded once on first use */
let pdfMakeCache: PdfMakeApi | null = null

async function loadPdfMake(): Promise<PdfMakeApi> {
  if (pdfMakeCache) return pdfMakeCache

  const [pdfMakeModule, vfsModule] = await Promise.all([
    import('pdfmake/build/pdfmake'),
    import('pdfmake/build/vfs_fonts'),
  ])

  // pdfmake 0.3.x: register fonts via addVirtualFileSystem
  // vfs_fonts exports a plain Record<string, string> (font file contents)
  const vfs = ('default' in vfsModule ? vfsModule.default : vfsModule) as import('pdfmake/interfaces').TVirtualFileSystem
  pdfMakeModule.addVirtualFileSystem(vfs)
  pdfMakeCache = pdfMakeModule
  return pdfMakeModule
}

/**
 * Generate and download a PDF invoice.
 * Lazily loads pdfmake on first call (~200KB), cached after that.
 */
export async function exportInvoicePdf(
  data: PartialInvoice,
  options: PdfExportOptions
): Promise<void> {
  try {
    const pdfMake = await loadPdfMake()
    const docDefinition = buildDocument(data, options)
    const filename = buildFilename(data)
    pdfMake.createPdf(docDefinition).download(filename)
  } catch (error) {
    console.error('[pdf-export] Failed to generate PDF:', error)
    toast.error('Failed to generate PDF')
  }
}
