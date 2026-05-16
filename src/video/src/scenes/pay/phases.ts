import { interpolate } from "remotion";
import type { PaymentStep, IdleSubState } from "@/features/payment";
import {
  SUCCESS,
  PHASE_CONFIRMING,
  PHASE_SENDING,
  PHASE_SWITCHING,
  PHASE_CONNECTING,
  PRESS_CONNECT,
} from "./constants";

// round-9s: stepAt reflects simplified sequence — no wrong-network or ready substates.
// Sequence: disconnected → connecting → switching → sending → confirming → success.
export const stepAt = (frame: number): { step: PaymentStep; idleSubState: IdleSubState } => {
  if (frame >= SUCCESS)           return { step: 'success',    idleSubState: 'ready' };
  if (frame >= PHASE_CONFIRMING)  return { step: 'confirming', idleSubState: 'ready' };
  if (frame >= PHASE_SENDING)     return { step: 'sending',    idleSubState: 'ready' };
  if (frame >= PHASE_SWITCHING)   return { step: 'switching',  idleSubState: 'ready' };
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

/** round-9s: single press — Connect only (Switch and Pay absorbed into loaders). */
export const ctaPressTrigger = (frame: number): number =>
  frame >= PRESS_CONNECT ? PRESS_CONNECT : -1;
