import type { TDocumentDefinitions } from 'pdfmake/interfaces'
import { toast } from '@/shared/lib/toast'
import type { PartialInvoice } from '@/shared/lib/invoice-types'
import type { PdfExportOptions } from '../model/types'

type PdfMakeApi = { createPdf: (doc: TDocumentDefinitions) => { download: (filename: string) => void } }

/** Cached pdfmake load promise — deduplicates concurrent calls, clears on failure */
let pdfMakePromise: Promise<PdfMakeApi> | null = null

function loadPdfMake(): Promise<PdfMakeApi> {
  if (!pdfMakePromise) {
    pdfMakePromise = (async () => {
      const [pdfMakeModule, vfsModule] = await Promise.all([
        import('pdfmake/build/pdfmake'),
        import('pdfmake/build/vfs_fonts'),
      ])
      // pdfmake 0.3.x: register fonts via addVirtualFileSystem
      const vfs = ('default' in vfsModule ? vfsModule.default : vfsModule) as import('pdfmake/interfaces').TVirtualFileSystem
      pdfMakeModule.addVirtualFileSystem(vfs)
      return pdfMakeModule as PdfMakeApi
    })().catch((err) => {
      pdfMakePromise = null
      throw err
    })
  }
  return pdfMakePromise
}

/**
 * Generate and download a PDF invoice.
 * Lazily loads pdfmake + build-document on first call, cached after that.
 */
export async function exportInvoicePdf(
  data: PartialInvoice,
  options: PdfExportOptions
): Promise<boolean> {
  try {
    const [pdfMake, { buildDocument, buildFilename }] = await Promise.all([
      loadPdfMake(),
      import('./build-document'),
    ])
    const docDefinition = buildDocument(data, options)
    const filename = buildFilename(data)
    pdfMake.createPdf(docDefinition).download(filename)
    return true
  } catch (error) {
    console.error('[pdf-export] Failed to generate PDF:', error instanceof Error ? error.message : 'Unknown error')
    toast.error('Failed to generate PDF')
    return false
  }
}
