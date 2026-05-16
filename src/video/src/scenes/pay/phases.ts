import { interpolate } from "remotion";
import type { PaymentStep, IdleSubState } from "@/features/payment";
import {
  SUCCESS,
  PHASE_CONFIRMING,
  PHASE_SENDING,
  PHASE_READY,
  PHASE_SWITCHING,
  PHASE_WRONG_NETWORK,
  PHASE_CONNECTING,
  PRESS_CONNECT,
  PRESS_SWITCH,
  PRESS_PAY,
} from "./constants";

// R9r: stepAt returns correct step+idleSubState across full connection flow.
// 'connecting' and 'switching' are top-level PaymentStep values (not idle sub-states).
export const stepAt = (frame: number): { step: PaymentStep; idleSubState: IdleSubState } => {
  if (frame >= SUCCESS)           return { step: 'success',    idleSubState: 'ready' };
  if (frame >= PHASE_CONFIRMING)  return { step: 'confirming', idleSubState: 'ready' };
  if (frame >= PHASE_SENDING)     return { step: 'sending',    idleSubState: 'ready' };
  if (frame >= PHASE_READY)       return { step: 'idle',       idleSubState: 'ready' };
  if (frame >= PHASE_SWITCHING)   return { step: 'switching',  idleSubState: 'ready' };
  if (frame >= PHASE_WRONG_NETWORK) return { step: 'idle',     idleSubState: 'wrong-network' };
  if (frame >= PHASE_CONNECTING)  return { step: 'connecting', idleSubState: 'disconnected' };
  return { step: 'idle', idleSubState: 'disconnected' };
};

/** press-scale on transition frames; 5fr ramp 0.96→1 right after the trigger frame. */
export const pressScale = (frame: number, triggerFrame: number): number =>
  interpolate(
    frame,
    [triggerFrame - 2, triggerFrame, triggerFrame + 5, triggerFrame + 7],
    [1, 0.96, 0.96, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

/** R9r: three presses — Connect, Switch, Pay. Returns the most-recent active trigger frame. */
export const ctaPressTrigger = (frame: number): number =>
  frame >= PRESS_PAY     ? PRESS_PAY     :
  frame >= PRESS_SWITCH  ? PRESS_SWITCH  :
  frame >= PRESS_CONNECT ? PRESS_CONNECT : -1;
