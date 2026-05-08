import { CheckIcon, CopyIcon } from "@/shared/ui/icons";
import { FONT_SANS } from "../fonts";

/**
 * ε2: Video-only fork of production LinkTab.
 * Shows only: permalink (muted code-block) + Copy Link (dominant CTA).
 * Omits: social share row (Telegram/Twitter/Email), QR tab, OG toggle, privacy hint.
 *
 * Production LinkTab is NOT modified — this is a new file.
 */

interface RemotionLinkTabProps {
  url: string;
  copied: boolean;
}

/**
 * Parse just the visible portion of the URL for display.
 * Shows "https://voidpay.xyz/pay" + truncated hash.
 */
function parseDisplayUrl(url: string): { prefix: string; hash: string } {
  try {
    const parsed = new URL(url);
    const prefix = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    const hash = parsed.hash;
    return { prefix, hash };
  } catch {
    return { prefix: url, hash: "" };
  }
}

export const RemotionLinkTab: React.FC<RemotionLinkTabProps> = ({ url, copied }) => {
  const { prefix, hash } = parseDisplayUrl(url);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Permalink — muted code-block style, reduced visual prominence */}
      <div>
        <div style={{
          fontSize: 11,
          fontWeight: 500,
          color: "rgba(113, 113, 122, 1)",
          fontFamily: `${FONT_SANS}, sans-serif`,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          marginBottom: 6,
        }}>
          Permalink
        </div>
        <div style={{
          fontSize: 11,
          color: "rgba(161, 161, 170, 0.7)",
          fontFamily: "monospace",
          letterSpacing: -0.5,
          wordBreak: "break-all",
          lineHeight: 1.5,
          background: "rgba(9, 9, 11, 0.8)",
          border: "1px solid rgba(63, 63, 70, 0.6)",
          borderRadius: 8,
          padding: "10px 12px",
        }}>
          <span style={{ color: "rgba(139, 92, 246, 0.6)" }}>{prefix}</span>
          {hash && (
            <span style={{ color: "rgba(161, 161, 170, 0.5)" }}>{hash}</span>
          )}
        </div>
      </div>

      {/* Copy Link — dominant primary CTA */}
      <div style={{
        height: 56,
        backgroundColor: "rgba(124, 58, 237, 1)",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        cursor: "pointer",
        boxShadow: "0 4px 24px rgba(124, 58, 237, 0.35)",
      }}>
        {copied ? (
          <>
            <CheckIcon size={20} style={{ color: "rgba(52, 211, 153, 1)" }} />
            <span style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#fff",
              fontFamily: `${FONT_SANS}, sans-serif`,
              letterSpacing: -0.2,
            }}>
              Copied!
            </span>
          </>
        ) : (
          <>
            <CopyIcon size={20} style={{ color: "#fff" }} />
            <span style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#fff",
              fontFamily: `${FONT_SANS}, sans-serif`,
              letterSpacing: -0.2,
            }}>
              Copy Link
            </span>
          </>
        )}
      </div>
    </div>
  );
};
