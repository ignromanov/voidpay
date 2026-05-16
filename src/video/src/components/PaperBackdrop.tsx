import type { ComponentProps } from "react";
import { useVideoConfig } from "remotion";
import {
  InvoicePaper,
  INVOICE_BASE_WIDTH,
  INVOICE_BASE_HEIGHT,
} from "@/widgets/invoice-paper";

const PAPER_VPAD = 48;

export type PaperBackdropProps = {
  /** Props forwarded verbatim to <InvoicePaper> — controls content/status/variant/magicDustEmphasis. */
  paperProps: ComponentProps<typeof InvoicePaper>;
  /** Container width override (default: full viewport width). Used for landscape column layouts. */
  containerWidth?: number;
  /** Container height override (default: full viewport height). Used when sharing vertical space with chrome bars. */
  containerHeight?: number;
  /** Opacity 0..1 — default 1. Scene controls entrance/dim via this. */
  opacity?: number;
  /** Blur in px — default 0. Scene controls focus state via this. */
  blurPx?: number;
};

/**
 * Unified paper backdrop with D39 canonical sizing (Kai-locked):
 *   PAD = 48
 *   scaleByH = (containerH - PAD*2) / INVOICE_BASE_HEIGHT
 *   scaleByW = (containerW * 0.85) / INVOICE_BASE_WIDTH
 *   scale = min(scaleByW, scaleByH)
 *   top = PAD + (availH - scaledH) / 2
 *
 * Pure positioning/sizing — no internal animation. Scenes wrap this in their
 * own frame-driven envelopes for entrance, scale ramps, etc.
 */
export const PaperBackdrop: React.FC<PaperBackdropProps> = ({
  paperProps,
  containerWidth,
  containerHeight,
  opacity = 1,
  blurPx = 0,
}) => {
  const { width, height } = useVideoConfig();
  const cw = containerWidth ?? width;
  const ch = containerHeight ?? height;

  const availH = ch - PAPER_VPAD * 2;
  const scaleByH = availH / INVOICE_BASE_HEIGHT;
  const scaleByW = (cw * 0.85) / INVOICE_BASE_WIDTH;
  const scale = Math.min(scaleByW, scaleByH);
  const scaledH = INVOICE_BASE_HEIGHT * scale;
  const top = PAPER_VPAD + (availH - scaledH) / 2;
  const left = (cw - INVOICE_BASE_WIDTH * scale) / 2;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: INVOICE_BASE_WIDTH,
        height: INVOICE_BASE_HEIGHT,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        opacity,
        filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
      }}
    >
      <InvoicePaper {...paperProps} />
    </div>
  );
};
