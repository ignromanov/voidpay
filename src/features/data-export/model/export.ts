import { useCreatorStore } from '@/entities/creator/model/useCreatorStore'
import { usePayerStore } from '@/entities/user/model/payer-store'

export interface ExportDataV1 {
  version: 1
  exportedAt: string
  creator: ReturnType<typeof useCreatorStore.getState>
  payer: ReturnType<typeof usePayerStore.getState>
}

/**
 * Exports all user data (creator and payer stores) to a JSON object.
 */
export const exportUserData = (): ExportDataV1 => {
  const creatorState = useCreatorStore.getState()
  const payerState = usePayerStore.getState()

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    creator: creatorState,
    payer: payerState,
  }
}

/**
 * Downloads the exported data as a JSON file.
 */
export const downloadUserData = () => {
  const data = exportUserData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `voidpay-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
