import type { MutableRefObject, Dispatch } from 'react'
import { matchTransfer } from '../../lib/match-transfer'
import type { TransferResult } from '../../lib/match-transfer'
import { MAX_CONSECUTIVE_429 } from './constants'
import type { Action } from './reducer'

// ---------------------------------------------------------------------------
// Fetch one batch of transfers
// ---------------------------------------------------------------------------

export interface DoFetchParams {
  toAddress: string
  chainId: number
  category: 'external' | 'erc20'
  fromBlock: string
  contractAddress?: string
  exactTotal: bigint
}

export interface DoFetchRefs {
  abortRef: MutableRefObject<AbortController | null>
  consec429Ref: MutableRefObject<number>
}

/**
 * Creates a doFetch callback that fetches transfers from `/api/transfers`
 * and matches against the expected total.
 */
export function createDoFetch(
  params: DoFetchParams,
  refs: DoFetchRefs,
  dispatch: Dispatch<Action>,
  flushStop: (isError?: boolean, errorMsg?: string) => void,
): () => Promise<TransferResult | null> {
  const { toAddress, chainId, category, fromBlock, contractAddress, exactTotal } = params
  const { abortRef, consec429Ref } = refs

  return async (): Promise<TransferResult | null> => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toAddress,
          chainId,
          category,
          fromBlock,
          ...(contractAddress ? { contractAddress } : {}),
        }),
        signal: controller.signal,
      })

      if (res.status === 429) {
        consec429Ref.current += 1
        dispatch({ type: 'SET_LOADING', payload: false })
        if (consec429Ref.current >= MAX_CONSECUTIVE_429) {
          flushStop(true, '429 Too Many Requests — polling stopped')
        }
        return null
      }

      consec429Ref.current = 0

      if (!res.ok) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return null
      }

      const data = (await res.json()) as { transfers: TransferResult[] }
      const matched = matchTransfer(data.transfers, exactTotal, contractAddress)
      dispatch({ type: 'SET_LOADING', payload: false })
      return matched
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return null
      dispatch({ type: 'SET_LOADING', payload: false })
      return null
    }
  }
}
