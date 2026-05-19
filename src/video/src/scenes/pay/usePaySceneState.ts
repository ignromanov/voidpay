import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { useMemo } from 'react'
import { SPRING_CONFIGS } from '../../constants/timing'
import {
  MAGIC_DUST_HIGHLIGHT,
  MAGIC_DUST_PEAK_END,
  PANEL_EXIT_START,
  PANEL_EXIT_END,
  FINALIZE,
  DEMO_TX_HASH,
  CONFIRMATIONS_REQUIRED,
  PACK_START_LOCAL,
} from './constants'
import { stepAt, ctaPressTrigger } from './phases'
import type { HookVariant } from '../captions/thesis-captions'

export type PaySceneState = {
  frame: number
  cardScale: number
  step: ReturnType<typeof stepAt>['step']
  idleSubState: ReturnType<typeof stepAt>['idleSubState']
  panelStatus: 'pending' | 'confirming' | 'paid'
  ctaPressTriggerFrame: number
  confirmations: { current: number; required: number }
  magicDustPulseOpacity: number
  panelTxHash: string | undefined
  paperPaid: boolean
  panelFinalized: boolean
  panelExit: number
  panelExitOpacity: number
  walletOpacity: number
  packProgress: number
  paperPackOpacity: number
}

export function usePaySceneState(_hookVariant: HookVariant): PaySceneState {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const cardScale = spring({ frame, fps, config: SPRING_CONFIGS.smooth })

  const { step, idleSubState } = stepAt(frame)

  // R23: no 'confirming' step in video — step maps directly to 'success' from frame 300.
  const panelStatus: 'pending' | 'confirming' | 'paid' =
    step === 'success' ? 'paid' : 'pending'

  const ctaPressTriggerFrame = ctaPressTrigger(frame)

  const confirmations = useMemo(
    () => ({ current: CONFIRMATIONS_REQUIRED, required: CONFIRMATIONS_REQUIRED }),
    []
  )

  const magicDustPulseOpacity = interpolate(
    frame,
    [
      MAGIC_DUST_HIGHLIGHT,
      MAGIC_DUST_HIGHLIGHT + 20,
      MAGIC_DUST_PEAK_END,
      MAGIC_DUST_PEAK_END + 20,
    ],
    [0, 0.55, 0.55, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  const panelTxHash = step === 'success' ? DEMO_TX_HASH : undefined

  // paperPaid flips at SUCCESS (300) — step === 'success' covers frame >= 300.
  const paperPaid = step === 'success'

  // panelFinalized: double-tick mode — true from FINALIZE (380) onward.
  const panelFinalized = frame >= FINALIZE

  const panelExit = interpolate(frame, [PANEL_EXIT_START, PANEL_EXIT_END], [0, 24], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const panelExitOpacity = interpolate(frame, [PANEL_EXIT_START, PANEL_EXIT_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const walletOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const packProgress =
    frame >= PACK_START_LOCAL
      ? spring({
          frame: frame - PACK_START_LOCAL,
          fps,
          config: { damping: 25, stiffness: 80 },
        })
      : 0

  const paperPackOpacity = 1 - packProgress

  return {
    frame,
    cardScale,
    step,
    idleSubState,
    panelStatus,
    ctaPressTriggerFrame,
    confirmations,
    magicDustPulseOpacity,
    panelTxHash,
    paperPaid,
    panelFinalized,
    panelExit,
    panelExitOpacity,
    walletOpacity,
    packProgress,
    paperPackOpacity,
  }
}
