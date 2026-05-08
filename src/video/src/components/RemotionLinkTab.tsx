import { CheckIcon, CopyIcon, LockIcon, MailIcon, SendIcon, TwitterIcon } from "@/shared/ui/icons";
import { FONT_SANS } from "../fonts";

/**
 * θ5: Restored production density fork of LinkTab.
 * Reverts ε2 simplification (Copy Link only) back to full production density:
 *   - Color-coded permalink display
 *   - Copy Link primary CTA
 *   - 3-col social share row (Telegram / Twitter / Email)
 *   - Link preview card toggle (OG, amber)
 *   - Privacy by design note
 *
 * No tabs (Link/QR) rendered here — ShareScene drives tab-switch animation
 * by swapping between RemotionLinkTab and RemotionQRTab at COPY_CLICK_FRAME.
 *
 * No `animate-*` Tailwind classes — Remotion render path.
 * No `motion-safe:` utilities.
 * No browser hooks (useCallback, useEffect, etc.).
 *
 * Production widget (LinkTab.tsx) is NOT modified.
 */

interface RemotionLinkTabProps {
  url: string;
  copied: boolean;
  /** Whether OG toggle is shown as active (amber) */
  ogEnabled?: boolean;
}

/**
 * Parse URL into color-coded segments matching production LinkTab display.
 */
function parseUrlParts(url: string): {
  protocol: string;
  domain: string;
  path: string;
  ogParams: string;
  hash: string;
} {
  try {
    const parsed = new URL(url);
    return {
      protocol: parsed.protocol + "//",
      domain: parsed.host,
      path: parsed.pathname,
      ogParams: parsed.search,
      hash: parsed.hash,
    };
  } catch {
    return { protocol: "", domain: "", path: url, ogParams: "", hash: "" };
  }
}

export const RemotionLinkTab: React.FC<RemotionLinkTabProps> = ({ url, copied, ogEnabled = false }) => {
  const { protocol, domain, path, ogParams, hash } = parseUrlParts(url);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, fontFamily: `${FONT_SANS}, sans-serif` }}>

      {/* Permalink — color-coded matching production LinkTab */}
      <div>
        <div style={{
          fontSize: 11,
          fontWeight: 500,
          color: "rgba(161, 161, 170, 0.9)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}>
          Permalink
        </div>
        <div style={{
          fontSize: 11,
          fontFamily: "monospace",
          letterSpacing: -0.3,
          wordBreak: "break-all",
          lineHeight: 1.6,
          background: "rgba(9, 9, 11, 1)",
          border: "1px solid rgba(63, 63, 70, 0.8)",
          borderRadius: 8,
          padding: "10px 12px",
          maxHeight: 88,
          overflow: "hidden",
        }}>
          <span style={{ color: "rgba(82, 82, 91, 1)" }}>{protocol}</span>
          <span style={{ color: "rgba(139, 92, 246, 1)", fontWeight: 600 }}>{domain}</span>
          <span style={{ color: "rgba(139, 92, 246, 0.7)" }}>{path}</span>
          {ogEnabled && ogParams && (
            <span style={{ color: "rgba(245, 158, 11, 1)" }}>{ogParams}</span>
          )}
          {hash && <span style={{ color: "rgba(161, 161, 170, 0.8)" }}>{hash}</span>}
        </div>
      </div>

      {/* Copy Link — primary void CTA matching production */}
      <div style={{
        height: 52,
        background: "linear-gradient(135deg, rgba(124, 58, 237, 1) 0%, rgba(109, 40, 217, 1) 100%)",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        boxShadow: "0 4px 24px rgba(124, 58, 237, 0.4)",
        border: "1px solid rgba(139, 92, 246, 0.3)",
      }}>
        {copied ? (
          <>
            <CheckIcon size={18} style={{ color: "rgba(52, 211, 153, 1)" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: -0.2 }}>
              Copied!
            </span>
          </>
        ) : (
          <>
            <CopyIcon size={18} style={{ color: "#fff" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: -0.2 }}>
              Copy Link
            </span>
          </>
        )}
      </div>

      {/* 3-col social share row — matching production color scheme */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        {/* Telegram */}
        <div style={{
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          borderRadius: 8,
          border: "1px solid rgba(0, 136, 204, 0.2)",
          background: "rgba(0, 136, 204, 0.1)",
          fontSize: 12,
          fontWeight: 600,
          color: "rgba(0, 136, 204, 1)",
        }}>
          <SendIcon size={13} style={{ color: "rgba(0, 136, 204, 1)" }} />
          Telegram
        </div>
        {/* Twitter */}
        <div style={{
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          borderRadius: 8,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          background: "rgba(255, 255, 255, 0.05)",
          fontSize: 12,
          fontWeight: 600,
          color: "rgba(255, 255, 255, 1)",
        }}>
          <TwitterIcon size={13} style={{ color: "#fff" }} />
          Twitter
        </div>
        {/* Email */}
        <div style={{
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          borderRadius: 8,
          border: "1px solid rgba(239, 68, 68, 0.2)",
          background: "rgba(239, 68, 68, 0.1)",
          fontSize: 12,
          fontWeight: 600,
          color: "rgba(248, 113, 113, 1)",
        }}>
          <MailIcon size={13} style={{ color: "rgba(248, 113, 113, 1)" }} />
          Email
        </div>
      </div>

      {/* OG toggle — amber, matching production */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 4px" }}>
        <div style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: ogEnabled ? "rgba(245, 158, 11, 1)" : "transparent",
          border: ogEnabled ? "1px solid rgba(245, 158, 11, 1)" : "1px solid rgba(82, 82, 91, 1)",
        }}>
          {ogEnabled && <CheckIcon size={11} style={{ color: "#fff" }} />}
        </div>
        <div>
          <div style={{
            fontSize: 12,
            fontWeight: 500,
            color: ogEnabled ? "rgba(251, 191, 36, 1)" : "rgba(113, 113, 122, 1)",
          }}>
            Link preview card
          </div>
          <div style={{ fontSize: 11, color: "rgba(82, 82, 91, 1)", marginTop: 1 }}>
            Shows amount &amp; network in social previews
          </div>
        </div>
      </div>

      {/* Privacy by design note */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "0 4px" }}>
        <LockIcon size={12} style={{ color: "rgba(82, 82, 91, 1)", marginTop: 1, flexShrink: 0 }} />
        <div style={{ fontSize: 11, color: "rgba(113, 113, 122, 1)", lineHeight: 1.5 }}>
          <strong style={{ color: "rgba(161, 161, 170, 1)" }}>Privacy by design.</strong>
          {" "}Invoice data is encoded in the link. No servers. No tracking.
        </div>
      </div>
    </div>
  );
};
