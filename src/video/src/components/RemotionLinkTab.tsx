import { CheckIcon, CopyIcon, LockIcon, MailIcon, SendIcon, TwitterIcon } from "@/shared/ui/icons";
import { FONT_SANS } from "../fonts";
import { UrlChunks } from "./UrlChunks";

/**
 * θ5: Restored production density fork of LinkTab.
 * Reverts ε2 simplification (Copy Link only) back to full production density:
 *   - Color-coded permalink display
 *   - Copy Link primary CTA
 *   - 3-col social share row (Telegram / Twitter / Email)
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
  urlFontSize?: number;
}

export const RemotionLinkTab: React.FC<RemotionLinkTabProps> = ({ url, copied, urlFontSize = 28 }) => {
  // Strip ?og=... query params so displayed URL is clean: https://voidpay.xyz/pay#<hash>
  const displayUrl = url.replace(/\?og=[^#]+/, "");

  // ι2: all internal text/spacing scaled ×1.5 from θ5 values.
  // Modal width bumped 600→660px in ShareScene to absorb the scaling without overflow.
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30, fontFamily: `${FONT_SANS}, sans-serif` }}>

      {/* Permalink — color-coded matching production LinkTab */}
      <div>
        <div style={{
          fontSize: 17,
          fontWeight: 500,
          color: "rgba(161, 161, 170, 0.9)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: 9,
        }}>
          Permalink
        </div>
        <div style={{
          background: "rgba(9, 9, 11, 1)",
          border: "1px solid rgba(63, 63, 70, 0.8)",
          borderRadius: 10,
          padding: "15px 18px",
          overflow: "hidden",
        }}>
          <UrlChunks url={displayUrl} fontSize={urlFontSize} maxLines={6} />
        </div>
      </div>

      {/* Copy Link — production Button variant="void":
           bg-black border border-electric-violet/30 (rgba(124,58,237,0.3))
           shadow-[0_0_20px_-5px_rgba(124,58,237,0.3),0_0_60px_-15px_rgba(124,58,237,0.15)]
           with CopyOverlay = violet radial gradient inside. NOT a solid gradient fill. */}
      <div style={{
        height: 78,
        background: "#000000",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        boxShadow: "0 0 20px -5px rgba(124,58,237,0.3), 0 0 60px -15px rgba(124,58,237,0.15)",
        border: "1px solid rgba(124, 58, 237, 0.3)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* CopyOverlay: violet idle / emerald success — matches production CopyOverlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background: copied
            ? "radial-gradient(ellipse 100% 80% at 50% 50%, rgba(52,211,153,0.25) 0%, rgba(16,185,129,0.13) 50%, transparent 70%)"
            : "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.22) 0%, rgba(109,40,217,0.13) 40%, transparent 70%)",
          pointerEvents: "none",
        }} />
        {copied ? (
          <>
            <CheckIcon size={27} style={{ color: "rgba(52, 211, 153, 1)" }} />
            <span style={{ fontSize: 21, fontWeight: 600, color: "#fff", letterSpacing: -0.2 }}>
              Copied!
            </span>
          </>
        ) : (
          <>
            <CopyIcon size={27} style={{ color: "#fff" }} />
            <span style={{ fontSize: 21, fontWeight: 600, color: "#fff", letterSpacing: -0.2 }}>
              Copy Link
            </span>
          </>
        )}
      </div>

      {/* 3-col social share row — matching production color scheme */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9 }}>
        {/* Telegram */}
        <div style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          borderRadius: 10,
          border: "1px solid rgba(0, 136, 204, 0.2)",
          background: "rgba(0, 136, 204, 0.1)",
          fontSize: 18,
          fontWeight: 600,
          color: "rgba(0, 136, 204, 1)",
        }}>
          <SendIcon size={19} style={{ color: "rgba(0, 136, 204, 1)" }} />
          Telegram
        </div>
        {/* Twitter */}
        <div style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          borderRadius: 10,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          background: "rgba(255, 255, 255, 0.05)",
          fontSize: 18,
          fontWeight: 600,
          color: "rgba(255, 255, 255, 1)",
        }}>
          <TwitterIcon size={19} style={{ color: "#fff" }} />
          Twitter
        </div>
        {/* Email */}
        <div style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          borderRadius: 10,
          border: "1px solid rgba(239, 68, 68, 0.2)",
          background: "rgba(239, 68, 68, 0.1)",
          fontSize: 18,
          fontWeight: 600,
          color: "rgba(248, 113, 113, 1)",
        }}>
          <MailIcon size={19} style={{ color: "rgba(248, 113, 113, 1)" }} />
          Email
        </div>
      </div>

      {/* Privacy by design note */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "0 4px" }}>
        <LockIcon size={18} style={{ color: "rgba(82, 82, 91, 1)", marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 17, color: "rgba(113, 113, 122, 1)", lineHeight: 1.5 }}>
          <strong style={{ color: "rgba(161, 161, 170, 1)" }}>Privacy by design.</strong>
          {" "}Invoice data is encoded in the link. No servers. No tracking.
        </div>
      </div>
    </div>
  );
};
