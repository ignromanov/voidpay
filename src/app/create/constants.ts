import type { DraftSyncStatus } from '@/entities/creator'

/** Live Preview badge configuration based on sync status */
export const SYNC_STATUS_CONFIG: Record<
  DraftSyncStatus,
  { label: string; dotColor: string; animate: boolean; icon?: 'check' | 'loader' }
> = {
  idle: {
    label: 'Live Preview',
    dotColor: 'bg-green-500',
    animate: true,
  },
  syncing: {
    label: 'Syncing...',
    dotColor: 'bg-amber-500',
    animate: true,
    icon: 'loader',
  },
  synced: {
    label: 'Synced',
    dotColor: 'bg-green-500',
    animate: false,
    icon: 'check',
  },
}
