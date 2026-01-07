/**
 * Invoice Form Hook
 *
 * Uses react-hook-form for performant form handling with:
 * - Uncontrolled inputs (no re-render on each keystroke)
 * - Zod validation via resolver
 * - Debounced sync to Zustand store
 */

import { useEffect, useCallback, useRef } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreatorStore } from '@/entities/creator'
import { ETH_ADDRESS_REGEX } from '@/shared/lib/validation'

/** Debounce delay for syncing form → store */
const SYNC_DEBOUNCE_MS = 300

/**
 * Form schema - more lenient than Invoice schema for draft editing
 * All fields optional during editing, validation on generate
 */
export const invoiceFormSchema = z.object({
  invoiceId: z.string().optional(),
  issuedAt: z.number().optional(),
  dueAt: z.number().optional(),
  notes: z.string().max(280).optional(),
  networkId: z.number().optional(),
  currency: z.string().optional(),
  tokenAddress: z.string().optional(),
  decimals: z.number().optional(),
  tax: z.string().optional(),
  discount: z.string().optional(),
  from: z
    .object({
      name: z.string().optional(),
      walletAddress: z.string().optional(),
      email: z.string().optional(),
      physicalAddress: z.string().optional(),
      phone: z.string().optional(),
      taxId: z.string().optional(),
    })
    .optional(),
  client: z
    .object({
      name: z.string().optional(),
      walletAddress: z.string().optional(),
      email: z.string().optional(),
      physicalAddress: z.string().optional(),
      phone: z.string().optional(),
      taxId: z.string().optional(),
    })
    .optional(),
})

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>

/**
 * Field validation for required fields
 */
export function validateRequiredFields(values: InvoiceFormValues) {
  return {
    invoiceId: Boolean(values.invoiceId && values.invoiceId.length > 0),
    senderName: Boolean(values.from?.name && values.from.name.length > 0),
    senderWallet: Boolean(
      values.from?.walletAddress && ETH_ADDRESS_REGEX.test(values.from.walletAddress)
    ),
    clientName: Boolean(values.client?.name && values.client.name.length > 0),
  }
}

export interface UseInvoiceFormReturn {
  form: UseFormReturn<InvoiceFormValues>
  fieldValidation: ReturnType<typeof validateRequiredFields>
  canGenerate: boolean
}

/**
 * useInvoiceForm Hook
 *
 * Manages form state with react-hook-form and syncs to Zustand store.
 *
 * Architecture:
 * 1. Form has its own internal state (uncontrolled inputs = fast typing)
 * 2. On mount: populate form from store (activeDraft)
 * 3. On form change: debounced sync to store
 * 4. On store change (external): update form values
 */
export function useInvoiceForm(): UseInvoiceFormReturn {
  const activeDraft = useCreatorStore((s) => s.activeDraft)
  const updateDraft = useCreatorStore((s) => s.updateDraft)
  const setDraftSyncStatus = useCreatorStore((s) => s.setDraftSyncStatus)

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isExternalUpdate = useRef(false)

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    mode: 'onChange',
    defaultValues: activeDraft?.data
      ? {
          invoiceId: activeDraft.data.invoiceId,
          issuedAt: activeDraft.data.issuedAt,
          dueAt: activeDraft.data.dueAt,
          notes: activeDraft.data.notes,
          networkId: activeDraft.data.networkId,
          currency: activeDraft.data.currency,
          tokenAddress: activeDraft.data.tokenAddress,
          decimals: activeDraft.data.decimals,
          tax: activeDraft.data.tax,
          discount: activeDraft.data.discount,
          from: {
            name: activeDraft.data.from?.name ?? '',
            walletAddress: activeDraft.data.from?.walletAddress ?? '',
            email: activeDraft.data.from?.email ?? '',
            physicalAddress: activeDraft.data.from?.physicalAddress ?? '',
            phone: activeDraft.data.from?.phone ?? '',
            taxId: activeDraft.data.from?.taxId ?? '',
          },
          client: {
            name: activeDraft.data.client?.name ?? '',
            walletAddress: activeDraft.data.client?.walletAddress ?? '',
            email: activeDraft.data.client?.email ?? '',
            physicalAddress: activeDraft.data.client?.physicalAddress ?? '',
            phone: activeDraft.data.client?.phone ?? '',
            taxId: activeDraft.data.client?.taxId ?? '',
          },
        }
      : {},
  })

  const values = form.watch()

  // Validate required fields
  const fieldValidation = validateRequiredFields(values)
  const canGenerate = Object.values(fieldValidation).every(Boolean)

  // Debounced sync form → store
  const syncToStore = useCallback(
    (data: InvoiceFormValues) => {
      // Don't sync if this was triggered by external store update
      if (isExternalUpdate.current) {
        isExternalUpdate.current = false
        return
      }

      // Show syncing status
      setDraftSyncStatus('syncing')

      // Clear pending timeouts
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current)

      // Debounced store update
      // Only include defined values (exactOptionalPropertyTypes)
      syncTimeoutRef.current = setTimeout(() => {
        updateDraft({
          ...(data.invoiceId !== undefined && { invoiceId: data.invoiceId }),
          ...(data.issuedAt !== undefined && { issuedAt: data.issuedAt }),
          ...(data.dueAt !== undefined && { dueAt: data.dueAt }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.networkId !== undefined && { networkId: data.networkId }),
          ...(data.currency !== undefined && { currency: data.currency }),
          ...(data.tokenAddress !== undefined && {
            tokenAddress: data.tokenAddress as `0x${string}`,
          }),
          ...(data.decimals !== undefined && { decimals: data.decimals }),
          ...(data.tax !== undefined && { tax: data.tax }),
          ...(data.discount !== undefined && { discount: data.discount }),
          ...(data.from && {
            from: {
              name: data.from.name ?? '',
              walletAddress: (data.from.walletAddress ?? '') as `0x${string}`,
              ...(data.from.email && { email: data.from.email }),
              ...(data.from.physicalAddress && { physicalAddress: data.from.physicalAddress }),
              ...(data.from.phone && { phone: data.from.phone }),
              ...(data.from.taxId && { taxId: data.from.taxId }),
            },
          }),
          ...(data.client && {
            client: {
              name: data.client.name ?? '',
              ...(data.client.walletAddress && {
                walletAddress: data.client.walletAddress as `0x${string}`,
              }),
              ...(data.client.email && { email: data.client.email }),
              ...(data.client.physicalAddress && {
                physicalAddress: data.client.physicalAddress,
              }),
              ...(data.client.phone && { phone: data.client.phone }),
              ...(data.client.taxId && { taxId: data.client.taxId }),
            },
          }),
        })

        setDraftSyncStatus('synced')
        syncTimeoutRef.current = null

        // Return to idle after display
        idleTimeoutRef.current = setTimeout(() => {
          setDraftSyncStatus('idle')
          idleTimeoutRef.current = null
        }, 2000)
      }, SYNC_DEBOUNCE_MS)
    },
    [updateDraft, setDraftSyncStatus]
  )

  // Watch form changes and sync to store
  useEffect(() => {
    const subscription = form.watch((data) => {
      syncToStore(data as InvoiceFormValues)
    })
    return () => subscription.unsubscribe()
  }, [form, syncToStore])

  // Sync store → form when store changes externally (e.g., URL hash decode)
  useEffect(() => {
    if (!activeDraft?.data) return

    const storeData = activeDraft.data
    const formData = form.getValues()

    // Only update if data actually changed (avoid infinite loop)
    if (storeData.invoiceId !== formData.invoiceId) {
      isExternalUpdate.current = true
      form.reset({
        invoiceId: storeData.invoiceId,
        issuedAt: storeData.issuedAt,
        dueAt: storeData.dueAt,
        notes: storeData.notes,
        networkId: storeData.networkId,
        currency: storeData.currency,
        tokenAddress: storeData.tokenAddress,
        decimals: storeData.decimals,
        tax: storeData.tax,
        discount: storeData.discount,
        from: {
          name: storeData.from?.name ?? '',
          walletAddress: storeData.from?.walletAddress ?? '',
          email: storeData.from?.email ?? '',
          physicalAddress: storeData.from?.physicalAddress ?? '',
          phone: storeData.from?.phone ?? '',
          taxId: storeData.from?.taxId ?? '',
        },
        client: {
          name: storeData.client?.name ?? '',
          walletAddress: storeData.client?.walletAddress ?? '',
          email: storeData.client?.email ?? '',
          physicalAddress: storeData.client?.physicalAddress ?? '',
          phone: storeData.client?.phone ?? '',
          taxId: storeData.client?.taxId ?? '',
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentional: only sync on invoiceId change (new invoice), not every data change
  }, [activeDraft?.data?.invoiceId])

  // Cleanup
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current)
    }
  }, [])

  return { form, fieldValidation, canGenerate }
}
