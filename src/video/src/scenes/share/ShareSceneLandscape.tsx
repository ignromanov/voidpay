import { AbsoluteFill, useVideoConfig } from "remotion";
import { Card } from "@/shared/ui";
import { CheckCircleIcon } from "@/shared/ui/icons";
import { NetworkBackground } from "@/widgets/network-background";
import { PaperBackdrop } from "../../components/PaperBackdrop";
import { NetworkBackgroundLayer } from "../../components/NetworkBackgroundLayer";
import { RemotionLinkTab } from "../../components/RemotionLinkTab";
import { RemotionQRTab } from "../../components/RemotionQRTab";
import { Caption } from "../../components/Caption";
import { LandscapeShareCascade } from "../../components/LandscapeShareCascade";
import { COLORS } from "../../constants/colors";
import { FONT_SANS } from "../../fonts";
import { SHARE_URL, SHARE_PAPER_PROPS, TAB_SWAP_FRAME } from "./constants";
import { SummaryCascadeLandscape } from "./SummaryCascade";
import type { CaptionEntry } from "../captions/create-captions";

type Props = {
  frame: number;
  modalTranslateY: number;
  modalOpacity: number;
  showQR: boolean;
  copied: boolean;
  linkTabOpacity: number;
  qrTabOpacity: number;
  captions: CaptionEntry[];
};

export const ShareSceneLandscape: React.FC<Props> = ({
  frame,
  modalTranslateY,
  modalOpacity,
  showQR,
  copied,
  linkTabOpacity,
  qrTabOpacity,
  captions,
}) => {
  const { width, height } = useVideoConfig();
  const PANEL_MAX_WIDTH = 640;
  const colW = width / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackgroundLayer variant="soft" />
      <NetworkBackground />

      {/* LEFT — paper, vertically centered in left half */}
      {/* D37: landscape paper must never blur/dim — invoice stays fully readable as persistent context */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: colW,
          height: "100%",
        }}
      >
        <PaperBackdrop
          paperProps={SHARE_PAPER_PROPS}
          opacity={1}
          blurPx={0}
          containerWidth={colW}
          containerHeight={height}
        />
      </div>

      {/* RIGHT — modal, maxWidth capped */}
      <div
        style={{
          position: "absolute",
          left: colW,
          top: 0,
          width: colW,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "100%", maxWidth: PANEL_MAX_WIDTH, position: "relative" }}>

          {/* Share modal shell */}
          <Card
            className="border border-zinc-800/80"
            style={{
              position: "relative",
              width: "100%",
              padding: 0,
              transform: `translateY(${modalTranslateY}px)`,
              opacity: modalOpacity,
              overflow: "hidden",
              backgroundColor: "rgba(24, 24, 27, 0.96)",
              border: "1px solid rgba(139,92,246,0.25)",
              boxShadow: "0 25px 80px -20px rgba(0,0,0,0.8), 0 8px 32px -8px rgba(0,0,0,0.5)",
              borderRadius: 20,
            }}
          >
            <div className="remotion-share-landscape">
            <LandscapeShareCascade />
            {/* Violet top gradient bar */}
            <div style={{
              height: 8,
              background: "linear-gradient(90deg, #8b5cf6, #d946ef, #8b5cf6)",
            }} />

            {/* Header */}
            <div style={{ padding: "20px 24px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: `${FONT_SANS}, sans-serif`,
                fontSize: 26,
                fontWeight: 700,
                color: COLORS.textPrimary,
                letterSpacing: "-0.02em",
                marginBottom: 4,
              }}>
                <CheckCircleIcon size={26} style={{ color: COLORS.violet }} />
                Invoice Ready
              </div>
              <div style={{
                fontFamily: `${FONT_SANS}, sans-serif`,
                fontSize: 18,
                color: "rgba(113, 113, 122, 1)",
                marginBottom: 16,
              }}>
                Share this link to get paid
              </div>

              {/* InvoiceSummary */}
              <SummaryCascadeLandscape />
            </div>

            {/* Tab switcher */}
            <div style={{ padding: "0 24px 12px 24px" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                background: "rgba(39, 39, 42, 1)",
                borderRadius: 8,
                padding: 4,
                marginBottom: 12,
              }}>
                {(["Link", "QR Code"] as const).map((label) => {
                  const isActive = showQR ? label === "QR Code" : label === "Link";
                  return (
                    <div
                      key={label}
                      style={{
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 6,
                        fontSize: 18,
                        fontWeight: isActive ? 500 : 400,
                        color: isActive ? "rgba(244, 244, 245, 1)" : "rgba(113, 113, 122, 1)",
                        background: isActive ? "rgba(24, 24, 27, 1)" : "transparent",
                        boxShadow: isActive ? "0 1px 3px 0 rgba(0,0,0,0.4)" : "none",
                        fontFamily: `${FONT_SANS}, sans-serif`,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tab body — D33: same pre-mount + absolute-when-swapping fix as portrait.
                 D44: fixed minHeight wrapper prevents container reflow on tab swap.
                 Landscape LinkTab uses same components — minHeight matches portrait calculation. */}
            <div style={{ padding: "0 24px 24px 24px", position: "relative" }}>
              <div style={{ position: "relative", minHeight: 490 }}>
                <div style={{
                  opacity: linkTabOpacity,
                  position: showQR ? "absolute" : "relative",
                  top: showQR ? 0 : undefined,
                  left: showQR ? 0 : undefined,
                  right: showQR ? 0 : undefined,
                  pointerEvents: linkTabOpacity > 0 ? "auto" : "none",
                }}>
                  <RemotionLinkTab url={SHARE_URL} copied={copied} urlFontSize={32} />
                </div>
                {frame >= TAB_SWAP_FRAME - 1 && (
                  <div style={{ opacity: qrTabOpacity }}>
                    <RemotionQRTab url={SHARE_URL} />
                  </div>
                )}
              </div>
            </div>
            </div>{/* end remotion-share-landscape */}
          </Card>
        </div>
      </div>

      {/* S2 captions — AbsoluteFill level, spans full viewport */}
      {captions.map((c) => (
        <Caption
          key={c.startAt}
          text={c.text}
          startAt={c.startAt}
          endAt={c.endAt}
          weight={c.weight}
          emphasizedWord={c.emphasizedWord}
          position={c.position}
          fontSize={c.fontSize}
        />
      ))}
    </AbsoluteFill>
  );
};
