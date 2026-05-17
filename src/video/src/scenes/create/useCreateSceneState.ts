import { interpolate } from 'remotion'
import {
  FILL_COMPLETE,
  BUTTON_VISIBLE,
  PRESS_START,
  PRESS_END,
} from './constants'
import type { HookVariant } from '../captions/thesis-captions'

export type CreateSceneState = {
  /** Scale transform value for the Generate button press animation */
  buttonPressScale: number
  /** CSS variable style for Loader2 spinner rotation (empty object outside press window) */
  buttonSpinStyle: React.CSSProperties
  /** GenerateButtonView: canGenerate prop */
  canGenerate: boolean
  /** GenerateButtonView: isGenerating prop */
  isGenerating: boolean
  /** GenerateButtonView: hoverState prop */
  hoverState: boolean
}

/**
 * Shared frame-derived state for both Create scene orientations.
 * Receives frame as a parameter because both scenes accept frame as a prop
 * from the CreateScene orchestrator.
 *
 * Values kept per-scene (orientation-specific):
 * - stageProgress / formTransform / invoiceTransform — use FORM_OFFSET_RIGHT / INVOICE_OFFSET_LEFT (landscape only)
 * - formOpacity / invoiceOpacity — different formulas per orientation (spring vs interpolate)
 * - scrollOffset — TOTAL_SCROLL_DISTANCE_LANDSCAPE vs _PORTRAIT differ
 */
export function useCreateSceneState(
  frame: number,
  _hookVariant?: HookVariant,
): CreateSceneState {
  const buttonPressScale = interpolate(
    frame,
    [PRESS_START, PRESS_START + 2, PRESS_END - 2, PRESS_END],
    [1, 0.96, 0.96, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )

  const buttonSpinStyle: React.CSSProperties =
    frame >= PRESS_START && frame < PRESS_END
      ? ({ '--remotion-spin': `${frame * 8}deg` } as React.CSSProperties)
      : {}

  const canGenerate = frame >= FILL_COMPLETE
  const isGenerating = frame >= PRESS_START && frame < PRESS_END
  const hoverState = frame >= BUTTON_VISIBLE && frame < PRESS_START

  return {
    buttonPressScale,
    buttonSpinStyle,
    canGenerate,
    isGenerating,
    hoverState,
  }
}
