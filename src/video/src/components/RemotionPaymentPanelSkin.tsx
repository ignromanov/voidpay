import { useCurrentFrame } from "remotion";
import { FONT_SANS, FONT_MONO } from "../fonts";
import { DEMO_INVOICE, DEMO_TOTAL_DISPLAY } from "../constants/demo-invoice";

/**
 * Remotion-only mock of the PaymentPanel — full Mocks v2 pixel fidelity.
 * Sizes: Mocks v2 design viewport 360px → ×3 for 1080 Remotion viewport.
 *
 * DO NOT import production PaymentPanel or its sub-components here.
 *
 * Covers all states from PayScene:
 *   idle:disconnected → connecting → switching → sending → confirming → paid
 *
 * Fix 4: all sizes from Mocks v2 ×3.
 * Fix 5: frame-driven spinner rotation at 8°/frame (~1.5s/rev at 30fps).
 */

// ×3 sizing reference (Mocks v2 .panel block)
const S = {
  bodyPadV:     36,    // 12px → 36px (top/bottom)
  bodyPadH:     36,    // 12px → 36px (left/right)
  bodyPadB:     30,    // 10px → 30px (bottom)
  amtLblFont:   21,    // 7px → 21px (mono uppercase)
  amtValFont:   54,    // 18px → 54px (mono bold)
  currencyFont: 27,    // 9px → 27px
  netRowFont:   21,    // 7px → 21px
  netChipFont:  21,    // 7px → 21px (mono)
  payBtnH:      108,   // 36px → 108px
  payBtnPriFont:33,    // 11px → 33px
  payBtnSecFont:24,    // 8px → 24px
  spinnerSize:  33,    // 11px → 33px
  spinnerBorder:4.5,   // 1.5px → 4.5px
  secondaryFont:24,    // 8px → 24px
  footerFont:   24,    // 8px → 24px
  paidIconSize: 78,    // 26px → 78px
  paidPriFont:  36,    // 12px → 36px
  paidSecFont:  24,    // 8px → 24px
  confLblFont:  21,    // 7px → 21px
  confBarH:     9,     // 3px → 9px
  creatorFont:  24,    // 8px → 24px
};

type PanelStep = 'idle' | 'connecting' | 'switching' | 'sending' | 'confirming' | 'paid';

interface Props {
  step: PanelStep;
  /** Progress 0-1 for the confirming bar */
  confirmingProgress?: number;
  /** Violet pulse opacity for magic dust halo (passed through from PayScene) */
  magicDustPulseOpacity?: number;
}

/** Gradient bar color per state */
function gradBarStyle(step: PanelStep): string {
  if (step === 'paid') return "linear-gradient(90deg, #34d399, #10b981, #34d399)";
  if (step === 'confirming') return "linear-gradient(90deg, #8b5cf6, #d946ef, #8b5cf6)";
  return "linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)";
}

/** Pay button label/colors per step */
function btnConfig(step: PanelStep): {
  bg: string;
  border: string;
  priLabel: string;
  secLabel?: string;
  spinner: boolean;
} {
  switch (step) {
    case 'idle':
      return {
        bg: "linear-gradient(180deg, rgba(76,29,149,0.6), rgba(91,33,182,0.5))",
        border: "rgba(139,92,246,0.5)",
        priLabel: "Connect Wallet",
        spinner: false,
      };
    case 'connecting':
      return {
        bg: "linear-gradient(180deg, rgba(91,33,182,0.7), rgba(76,29,149,0.55))",
        border: "rgba(167,139,250,0.6)",
        priLabel: "Connecting…",
        secLabel: "MetaMask",
        spinner: true,
      };
    case 'switching':
      return {
        bg: "linear-gradient(180deg, rgba(91,33,182,0.7), rgba(76,29,149,0.55))",
        border: "rgba(167,139,250,0.6)",
        priLabel: "Switching…",
        secLabel: "to Arbitrum",
        spinner: true,
      };
    case 'sending':
      return {
        bg: "linear-gradient(180deg, rgba(91,33,182,0.7), rgba(76,29,149,0.55))",
        border: "rgba(167,139,250,0.6)",
        priLabel: "Sending…",
        secLabel: "250.000042 USDC",
        spinner: true,
      };
    default:
      return {
        bg: "linear-gradient(180deg, rgba(76,29,149,0.6), rgba(91,33,182,0.5))",
        border: "rgba(139,92,246,0.5)",
        priLabel: "Pay Now",
        spinner: false,
      };
  }
}

export const RemotionPaymentPanelSkin: React.FC<Props> = ({
  step,
  confirmingProgress = 0,
  magicDustPulseOpacity = 0,
}) => {
  const frame = useCurrentFrame();

  // Fix 5: frame-driven spinner — 8°/frame = ~1.5s per revolution at 30fps
  const spinnerRotation = (frame * 8) % 360;

  const btn = btnConfig(step);
  const showCta = step !== 'confirming' && step !== 'paid';
  const isPaid = step === 'paid';
  const isConfirming = step === 'confirming';

  return (
    <div style={{
      background: "rgba(9,9,11,0.95)",
      borderRadius: 30,
      overflow: "hidden",
      boxShadow: "0 -10px 50px -15px rgba(0,0,0,0.8)",
      position: "relative",
    }}>
      {/* Gradient top bar */}
      <div style={{
        height: 9,
        background: gradBarStyle(step),
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
      }} />

      {/* Body */}
      <div style={{
        padding: `${S.bodyPadV + 9}px ${S.bodyPadH}px ${S.bodyPadB}px`,
        fontFamily: `${FONT_SANS}, sans-serif`,
      }}>
        {/* Creator tag */}
        <div style={{
          textAlign: "center",
          fontSize: S.creatorFont,
          color: "#a78bfa",
          marginBottom: 18,
        }}>
          from {DEMO_INVOICE.from?.name ?? "Alex"}
        </div>

        {isPaid ? (
          /* Paid state — success icon + confirmation pill */
          <div style={{ textAlign: "center", padding: "12px 0 18px" }}>
            {/* Checkmark circle (SVG inline) */}
            <svg
              width={S.paidIconSize}
              height={S.paidIconSize}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#34d399"
              strokeWidth="1.5"
              style={{ margin: "0 auto 9px", display: "block" }}
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <div style={{ fontWeight: 700, fontSize: S.paidPriFont, color: "#f4f4f5" }}>
              Payment Successful
            </div>
            <div style={{ fontSize: S.paidSecFont, color: "#a1a1aa", marginTop: 3 }}>
              {DEMO_TOTAL_DISPLAY} USDC · Arbitrum
            </div>
            {/* Confirmation pill */}
            <div style={{
              display: "inline-flex",
              gap: 9,
              alignItems: "center",
              fontSize: S.confLblFont,
              fontFamily: `${FONT_MONO}, monospace`,
              color: "#34d399",
              marginTop: 12,
              background: "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.3)",
              padding: "6px 15px",
              borderRadius: 99,
            }}>
              12 / 12 confirmations
            </div>
          </div>
        ) : (
          /* All non-paid states — amount display */
          <div style={{ textAlign: "center", padding: "12px 0 24px", position: "relative" }}>
            <div style={{
              fontFamily: `${FONT_MONO}, monospace`,
              fontWeight: 600,
              fontSize: S.amtLblFont,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#71717a",
              marginBottom: 6,
            }}>
              Amount Due
            </div>
            <div style={{
              fontFamily: `${FONT_MONO}, monospace`,
              fontWeight: 800,
              fontSize: S.amtValFont,
              letterSpacing: "-0.01em",
              color: "#f4f4f5",
              position: "relative",
            }}>
              250.000
              <span style={{ color: "#a78bfa" }}>042</span>
            </div>
            <div style={{
              fontSize: S.currencyFont,
              color: "#a1a1aa",
              marginTop: 6,
            }}>
              USDC
            </div>
            {/* Net row */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: 15,
              alignItems: "center",
              marginTop: 9,
              fontSize: S.netRowFont,
              color: "#71717a",
            }}>
              on
              <span style={{
                background: "#5b21b6",
                color: "#ffffff",
                fontWeight: 800,
                padding: "6px 18px",
                borderRadius: 9,
                fontFamily: `${FONT_MONO}, monospace`,
                fontSize: S.netChipFont,
                boxShadow: "0 2px 6px rgba(91,33,182,0.45)",
                border: "1px solid #7c3aed",
              }}>
                Arbitrum
              </span>
            </div>

            {/* Magic dust violet halo — passed through from PayScene */}
            {magicDustPulseOpacity > 0.01 && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(ellipse at center, rgba(167,139,250,0.6) 0%, rgba(167,139,250,0.15) 40%, transparent 70%)`,
                opacity: magicDustPulseOpacity,
                pointerEvents: "none",
              }} />
            )}
          </div>
        )}

        {/* CTA button — idle/connecting/switching/sending states */}
        {showCta && (
          <div style={{
            width: "100%",
            height: S.payBtnH,
            position: "relative",
            overflow: "hidden",
            borderRadius: 21,
            background: btn.bg,
            border: `1px solid ${btn.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            color: "white",
          }}>
            {btn.spinner && (
              <div style={{
                width: S.spinnerSize,
                height: S.spinnerSize,
                border: `${S.spinnerBorder}px solid currentColor`,
                borderTopColor: "transparent",
                borderRadius: "50%",
                transform: `rotate(${spinnerRotation}deg)`,
                flexShrink: 0,
              }} />
            )}
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              lineHeight: 1,
            }}>
              <span style={{ fontSize: S.payBtnPriFont, fontWeight: 600 }}>
                {btn.priLabel}
              </span>
              {btn.secLabel && (
                <span style={{ fontSize: S.payBtnSecFont, opacity: 0.6, marginTop: 6 }}>
                  {btn.secLabel}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Confirming state — progress bar */}
        {isConfirming && (
          <div style={{ marginTop: 12 }}>
            <div style={{
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.25)",
              borderRadius: 12,
              padding: "12px 18px",
              textAlign: "left",
            }}>
              <div style={{
                fontSize: S.confLblFont,
                color: "#a78bfa",
                fontFamily: `${FONT_MONO}, monospace`,
                fontWeight: 600,
                marginBottom: 9,
              }}>
                {Math.round(confirmingProgress)} / 12 confirmations
              </div>
              <div style={{
                height: S.confBarH,
                background: "rgba(63,63,70,0.5)",
                borderRadius: 99,
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${(confirmingProgress / 12) * 100}%`,
                  background: "linear-gradient(90deg, #8b5cf6, #d946ef)",
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Secondary footer */}
        {!isPaid && (
          <div style={{
            display: "flex",
            gap: 18,
            marginTop: 24,
            fontSize: S.secondaryFont,
            color: "#71717a",
          }}>
            <span>Secured by voidpay.xyz</span>
            <span style={{ color: "#a1a1aa" }}>View on explorer</span>
          </div>
        )}
      </div>

      {/* Panel footer */}
      <div style={{
        borderTop: "1px solid rgba(63,63,70,0.4)",
        padding: "18px 36px",
        display: "flex",
        gap: 15,
        justifyContent: "center",
        fontSize: S.footerFont,
        color: "#52525b",
      }}>
        <span style={{ padding: "9px 18px", borderRadius: 12, color: "#a1a1aa" }}>
          Report
        </span>
        <span style={{ padding: "9px 18px", borderRadius: 12, color: "#a1a1aa" }}>
          Help
        </span>
      </div>
    </div>
  );
};
