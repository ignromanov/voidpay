import { CheckIcon, CopyIcon, LockIcon, MailIcon, SendIcon, TwitterIcon } from "@/shared/ui/icons";
import { FONT_SANS, FONT_MONO } from "../fonts";

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

  // F3 fix: all internal text/spacing scaled ×3 per Mocks v2.
  // permalink 7.5px→22.5px, copy btn 10.5px→31.5px, socials 8.5px→25.5px, privacy 7.5px→22.5px
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 21, fontFamily: `${FONT_SANS}, sans-serif` }}>

      {/* Permalink — color-coded matching production LinkTab */}
      <div>
        <div style={{
          fontSize: 22.5,
          fontWeight: 600,
          fontFamily: `${FONT_MONO}, monospace`,
          color: "rgba(113, 113, 122, 1)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}>
          Permalink
        </div>
        <div style={{
          fontSize: 22.5,
          fontFamily: `${FONT_MONO}, monospace`,
          letterSpacing: -0.3,
          wordBreak: "break-all",
          lineHeight: 1.4,
          background: "rgba(9, 9, 11, 1)",
          border: "1px solid rgba(63, 63, 70, 0.8)",
          borderRadius: 18,
          padding: "18px 24px",
          maxHeight: 168,
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

      {/* Copy Link — primary void CTA; F3 fix: font 10.5px→31.5px, padding 9px→27px */}
      <div style={{
        width: "100%",
        position: "relative",
        overflow: "hidden",
        background: copied
          ? "linear-gradient(180deg, rgba(6,95,70,0.55), rgba(5,150,105,0.45))"
          : "linear-gradient(180deg, rgba(76,29,149,0.6), rgba(91,33,182,0.5))",
        border: `1px solid ${copied ? "rgba(52,211,153,0.5)" : "rgba(139,92,246,0.5)"}`,
        color: "white",
        borderRadius: 21,
        padding: 27,
        fontWeight: 600,
        fontSize: 31.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        boxShadow: "0 4px 18px rgba(139,92,246,0.3)",
      }}>
        {copied ? (
          <>
            <CheckIcon size={31} style={{ color: "rgba(52, 211, 153, 1)" }} />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <CopyIcon size={31} style={{ color: "#fff" }} />
            <span>Copy Link</span>
          </>
        )}
      </div>

      {/* 3-col social share row — F3 fix: font 8.5px→25.5px */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15 }}>
        {/* Telegram */}
        <div style={{
          height: 75,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
          borderRadius: 15,
          border: "1px solid rgba(0, 136, 204, 0.2)",
          background: "rgba(0, 136, 204, 0.1)",
          fontSize: 25.5,
          fontWeight: 700,
          color: "rgba(0, 136, 204, 1)",
        }}>
          <SendIcon size={24} style={{ color: "rgba(0, 136, 204, 1)" }} />
          Telegram
        </div>
        {/* Twitter */}
        <div style={{
          height: 75,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
          borderRadius: 15,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          background: "rgba(255, 255, 255, 0.05)",
          fontSize: 25.5,
          fontWeight: 700,
          color: "rgba(255, 255, 255, 1)",
        }}>
          <TwitterIcon size={24} style={{ color: "#fff" }} />
          Twitter
        </div>
        {/* Email */}
        <div style={{
          height: 75,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
          borderRadius: 15,
          border: "1px solid rgba(244, 63, 94, 0.2)",
          background: "rgba(244, 63, 94, 0.1)",
          fontSize: 25.5,
          fontWeight: 700,
          color: "rgba(251, 113, 133, 1)",
        }}>
          <MailIcon size={24} style={{ color: "rgba(251, 113, 133, 1)" }} />
          Email
        </div>
      </div>

      {/* OG toggle — amber; F3 fix: label 8.5px→25.5px, desc 7.5px→22.5px */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "6px 6px" }}>
        <div style={{
          width: 33,
          height: 33,
          borderRadius: 6,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: ogEnabled ? "rgba(245, 158, 11, 1)" : "transparent",
          border: ogEnabled ? "1px solid rgba(245, 158, 11, 1)" : "1px solid rgba(82, 82, 91, 1)",
        }}>
          {ogEnabled && <CheckIcon size={20} style={{ color: "#fff" }} />}
        </div>
        <div>
          <div style={{
            fontSize: 25.5,
            fontWeight: 600,
            color: ogEnabled ? "rgba(251, 191, 36, 1)" : "rgba(113, 113, 122, 1)",
          }}>
            Link preview card
          </div>
          <div style={{ fontSize: 22.5, color: "rgba(82, 82, 91, 1)", marginTop: 3 }}>
            Shows amount &amp; network in social previews
          </div>
        </div>
      </div>

      {/* Privacy by design note — F3 fix: 7.5px→22.5px */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 15, padding: "0 6px" }}>
        <LockIcon size={22} style={{ color: "rgba(82, 82, 91, 1)", marginTop: 3, flexShrink: 0 }} />
        <div style={{ fontSize: 22.5, color: "rgba(113, 113, 122, 1)", lineHeight: 1.4 }}>
          <strong style={{ color: "rgba(161, 161, 170, 1)" }}>Privacy by design.</strong>
          {" "}Invoice data is encoded in the link. No servers. No tracking.
        </div>
      </div>
    </div>
  );
};
