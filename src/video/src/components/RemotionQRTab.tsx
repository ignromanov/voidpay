import { QRCodeSVG } from "qrcode.react";
import { DownloadIcon } from "@/shared/ui/icons";
import { FONT_SANS } from "../fonts";

/**
 * Static QR code tab for Remotion video rig.
 * Production-parity fork of features/payment-qr/ui/QRTab.tsx.
 *
 * No browser hooks, no click handlers, no animate-* classes.
 * Mirrors production layout: white QR card + scan hint + Download QR button.
 * ι2 scaling: internal sizes ~1.5× production to match ShareScene card width (660px).
 */

interface RemotionQRTabProps {
  url: string;
}

export const RemotionQRTab: React.FC<RemotionQRTabProps> = ({ url }) => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
      paddingTop: 8,
      paddingBottom: 8,
      fontFamily: `${FONT_SANS}, sans-serif`,
    }}>
      {/* White QR code card — matches production data-qr-code container */}
      <div style={{
        width: 300,
        height: 300,
        borderRadius: 16,
        background: "#ffffff",
        padding: 16,
        boxShadow: "0 20px 60px -12px rgba(0,0,0,0.7), 0 8px 24px -8px rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <QRCodeSVG
          value={url}
          size={268}
          level="M"
          style={{ width: "100%", height: "auto" }}
        />
      </div>

      {/* Scan hint — matches production Text variant="tiny" */}
      <div style={{
        fontSize: 18,
        color: "rgba(161, 161, 170, 0.8)",
        textAlign: "center",
        maxWidth: 320,
        lineHeight: 1.4,
      }}>
        Scan to open invoice in browser
      </div>

      {/* Download QR button — static, no click handler */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 52,
        paddingLeft: 24,
        paddingRight: 24,
        borderRadius: 10,
        border: "1px solid rgba(63, 63, 70, 0.8)",
        background: "rgba(39, 39, 42, 0.6)",
        fontSize: 18,
        fontWeight: 500,
        color: "rgba(244, 244, 245, 0.9)",
      }}>
        <DownloadIcon size={18} style={{ color: "rgba(244, 244, 245, 0.9)" }} />
        Download QR
      </div>
    </div>
  );
};
