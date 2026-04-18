import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../constants/colors";
import { SPRING_CONFIGS } from "../constants/timing";
import { FONT_MONO, FONT_SANS } from "../fonts";
import { NetworkShapes } from "../components/NetworkShapes";
import { Caption } from "../components/Caption";

// Creative brief §2: Alex · UI Design · $250.000042 USDC · Arbitrum
// Address callback: same 0x7a250d56... from Scene 1 chaos
const INVOICE_FROM = "Alex";
const INVOICE_ITEM = "UI Design";
const RECIPIENT_ADDRESS = "0x7a250d56…"; // truncated — narrative callback to Scene 1
const INVOICE_NETWORK = "Arbitrum";
const INVOICE_TOKEN = "USDC";

export const PayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Phase timing (local frames since each scene starts at 0)
  const WALLET_CONNECT = 30;
  const METAMASK_POPUP = 60;
  const NETWORK_BADGE = 120;
  const MAGIC_DUST_HIGHLIGHT = 220;
  const PROCESSING = 310;
  const SUCCESS = 380;

  // Card entrance
  const cardScale = spring({ frame, fps, config: SPRING_CONFIGS.smooth });

  // MetaMask popup
  const metaMaskScale = frame >= METAMASK_POPUP
    ? spring({ frame: frame - METAMASK_POPUP, fps, config: SPRING_CONFIGS.snappy })
    : 0;
  const metaMaskOpacity = frame >= METAMASK_POPUP
    ? interpolate(frame, [METAMASK_POPUP, METAMASK_POPUP + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const metaMaskDismiss = frame >= NETWORK_BADGE
    ? interpolate(frame, [NETWORK_BADGE, NETWORK_BADGE + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  // Magic Dust color interpolation — violet highlight per creative-brief §2
  const dustColorProgress = frame >= MAGIC_DUST_HIGHLIGHT
    ? interpolate(frame, [MAGIC_DUST_HIGHLIGHT, MAGIC_DUST_HIGHLIGHT + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  // Processing pulse
  const processingOpacity = frame >= PROCESSING && frame < SUCCESS
    ? interpolate(Math.sin((frame - PROCESSING) * 0.15), [-1, 1], [0.3, 1])
    : 0;

  // Success checkmark
  const successScale = frame >= SUCCESS
    ? spring({ frame: frame - SUCCESS, fps, config: SPRING_CONFIGS.bouncy })
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkShapes />

      {/* Invoice card (center) */}
      <div style={{
        position: "absolute",
        left: width / 2 - 280,
        top: height * 0.08,
        width: 560,
        background: COLORS.paper,
        borderRadius: 12,
        padding: 40,
        transform: `scale(${cardScale})`,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ fontFamily: `${FONT_SANS}, sans-serif`, color: "#09090b" }}>
          {/* Invoice header */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "#71717a", textTransform: "uppercase" }}>Invoice from</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{INVOICE_FROM}</div>
              <div style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>{INVOICE_ITEM}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#71717a", textTransform: "uppercase" }}>Network</div>
              {frame >= NETWORK_BADGE && (
                <div style={{
                  display: "inline-block",
                  background: `${COLORS.arbitrum}15`,
                  color: COLORS.arbitrum,
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                }}>
                  {INVOICE_NETWORK}
                </div>
              )}
            </div>
          </div>

          {/* Recipient address — narrative callback to Scene 1 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#71717a", textTransform: "uppercase", marginBottom: 4 }}>Recipient</div>
            <div style={{
              fontFamily: `${FONT_MONO}, monospace`,
              fontSize: 14,
              color: "#27272a",
              background: "#f4f4f5",
              padding: "6px 10px",
              borderRadius: 6,
            }}>
              {RECIPIENT_ADDRESS}
            </div>
          </div>

          {/* Amount with Magic Dust */}
          <div style={{
            borderTop: "2px solid #e4e4e7",
            paddingTop: 20,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 14, color: "#71717a", marginBottom: 8 }}>Amount Due</div>
            <div style={{ fontFamily: `${FONT_MONO}, monospace`, fontSize: 36, fontWeight: 900 }}>
              <span>250.</span>
              {/* Creative brief §5b: Magic Dust digit highlighted in violet */}
              <span style={{
                color: dustColorProgress > 0
                  ? `rgb(${Math.round(124 * dustColorProgress + 9 * (1 - dustColorProgress))}, ${Math.round(58 * dustColorProgress + 9 * (1 - dustColorProgress))}, ${Math.round(237 * dustColorProgress + 11 * (1 - dustColorProgress))})`
                  : "#09090b",
              }}>
                000042
              </span>
              <span style={{ fontSize: 20, fontWeight: 400, marginLeft: 8 }}>{INVOICE_TOKEN}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet connect button */}
      <Sequence from={WALLET_CONNECT} premountFor={30}>
        <div style={{
          position: "absolute",
          left: width / 2 - 120,
          top: height * 0.72,
        }}>
          <div style={{
            background: "#09090b",
            border: `2px solid ${COLORS.violet}`,
            borderRadius: 16,
            padding: "16px 32px",
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: 18,
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            boxShadow: `0 0 20px ${COLORS.violetGlow}`,
          }}>
            {frame < PROCESSING ? "Smart Pay" : frame < SUCCESS ? "Sending..." : "Payment Complete ✓"}
          </div>
        </div>
      </Sequence>

      {/* MetaMask popup mockup */}
      {metaMaskOpacity * metaMaskDismiss > 0.01 && (
        <div style={{
          position: "absolute",
          right: width * 0.1,
          top: height * 0.15,
          width: 260,
          background: "#1a1a2e",
          borderRadius: 12,
          padding: 20,
          transform: `scale(${metaMaskScale})`,
          opacity: metaMaskOpacity * metaMaskDismiss,
          border: "1px solid #333",
        }}>
          <div style={{ fontFamily: `${FONT_SANS}, sans-serif`, fontSize: 14, color: "#ffa500", fontWeight: 700, marginBottom: 8 }}>
            MetaMask
          </div>
          <div style={{ fontFamily: `${FONT_SANS}, sans-serif`, fontSize: 13, color: "#ccc" }}>
            Connect to voidpay.xyz?
          </div>
          <div style={{
            marginTop: 12,
            background: "#3b82f6",
            borderRadius: 8,
            padding: "8px 16px",
            textAlign: "center",
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: 14,
            fontWeight: 600,
            color: "white",
          }}>
            Connect
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {processingOpacity > 0.01 && (
        <div style={{
          position: "absolute",
          left: width / 2 - 100,
          top: height * 0.62,
          fontFamily: `${FONT_SANS}, sans-serif`,
          fontSize: 16,
          color: COLORS.confirming,
          opacity: processingOpacity,
          textAlign: "center",
          width: 200,
        }}>
          Confirming on-chain...
        </div>
      )}

      {/* Success checkmark */}
      {successScale > 0.01 && (
        <div style={{
          position: "absolute",
          left: width / 2 - 40,
          top: height * 0.55,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: COLORS.success,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${successScale})`,
          fontSize: 40,
          color: "white",
        }}>
          ✓
        </div>
      )}

      {/* LOCKED captions from creative-brief.md §1, Scene 5a and 5b.
          Caption 5a fades out before 5b fades in (MAGIC_DUST_HIGHLIGHT=220). */}
      <Caption text="Connect. Confirm. Paid." startAt={30} endAt={200} />
      <Sequence from={MAGIC_DUST_HIGHLIGHT} premountFor={30}>
        <Caption text="Random micro-amount. Unique fingerprint. No database." startAt={0} fontSize={26} />
      </Sequence>
    </AbsoluteFill>
  );
};
