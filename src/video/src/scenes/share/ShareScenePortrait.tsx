import { AbsoluteFill } from "remotion";
import { Card } from "@/shared/ui";
import { CheckCircleIcon } from "@/shared/ui/icons";
import { NetworkBackground } from "@/widgets/network-background";
import { PaperBackdrop } from "../../components/PaperBackdrop";
import { NetworkBackgroundLayer } from "../../components/NetworkBackgroundLayer";
import { RemotionLinkTab } from "../../components/RemotionLinkTab";
import { RemotionQRTab } from "../../components/RemotionQRTab";
import { Caption } from "../../components/Caption";
import { COLORS } from "../../constants/colors";
import { FONT_SANS } from "../../fonts";
import { SHARE_URL, SHARE_PAPER_PROPS, TAB_SWAP_FRAME } from "./constants";
import { SummaryCascadePortrait } from "./SummaryCascade";
import type { CaptionEntry } from "../captions/create-captions";

type Props = {
  frame: number;
  width: number;
  modalTranslateY: number;
  modalOpacity: number;
  showQR: boolean;
  copied: boolean;
  linkTabOpacity: number;
  qrTabOpacity: number;
  dimOpacity: number;
  blurPx: number;
  captions: CaptionEntry[];
};

export const ShareScenePortrait: React.FC<Props> = ({
  frame,
  width,
  modalTranslateY,
  modalOpacity,
  showQR,
  copied,
  linkTabOpacity,
  qrTabOpacity,
  dimOpacity,
  blurPx,
  captions,
}) => {
  // Mocks v2 surgical: modal width = 84% of stage width (portrait only)
  const modalWidth = Math.round(width * 0.84);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackgroundLayer variant="soft" />
      <NetworkBackground />

      {/* Round 9c L2: InvoicePaper as scene backdrop.
           C5: F6 entrance 0.35/1.5px → F7/F8 0.3/2px — modal is always foregrounded in S2. */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PaperBackdrop
          paperProps={SHARE_PAPER_PROPS}
          opacity={dimOpacity}
          blurPx={blurPx}
        />
      </AbsoluteFill>

      {/* Dimmed backdrop — β3: reduced to 0.30 so paper reads clearly through */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.30)",
        opacity: modalOpacity,
      }} />

      {/* Share modal shell — A8: vertically centered via top:50% + translateY(-50%) so modal
           stays in the middle regardless of viewport height.
           A9: backgroundColor 0.96 → 0.85 so invoice paper reads through behind the modal.
           Mocks v2 surgical: width = 84% of stage, side padding = 36px (12px × 3) */}
      <Card
        // β3: semi-transparent background — invoice paper visible behind
        className="border border-zinc-800/80"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: modalWidth,
          height: "auto",
          minHeight: 560,
          padding: 0,
          transform: `translateX(-50%) translateY(calc(-50% + ${modalTranslateY}px))`,
          opacity: modalOpacity,
          overflow: "hidden",
          backgroundColor: "rgba(24, 24, 27, 0.85)",
          border: "1px solid rgba(139,92,246,0.25)",
          boxShadow: "0 25px 80px -20px rgba(0,0,0,0.8), 0 8px 32px -8px rgba(0,0,0,0.5)",
          borderRadius: 30,
        }}
      >
        {/* Violet top gradient bar — matches real ShareModal */}
        <div style={{
          height: 8,
          background: "linear-gradient(90deg, #8b5cf6, #d946ef, #8b5cf6)",
        }} />

        {/* Header — "Invoice Ready" pattern from ShareModal.tsx; ι2: padding + sizes ×1.5 */}
        {/* F8 surgical: header fontSize 30→39, subtitle 21→27, padding 24px→30px/36px */}
        <div style={{ padding: "30px 36px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: 39,
            fontWeight: 700,
            color: COLORS.textPrimary,
            letterSpacing: "-0.02em",
            marginBottom: 6,
          }}>
            <CheckCircleIcon size={39} style={{ color: COLORS.violet }} />
            Invoice Ready
          </div>
          <div style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: 27,
            color: "rgba(113, 113, 122, 1)",
            marginBottom: 24,
          }}>
            Share this link to get paid
          </div>

          {/* InvoiceSummary block — real widget component, presentational only.
               D6: cascade overrides for amount sum (text-base/lg→36px) + network chip (text-xs→22px).
               F4.2: sub-line text min 24px for 9:16 legibility. */}
          <SummaryCascadePortrait />
        </div>

        {/* θ5: Tab switcher — Link/QR tabs, matching production ShareModal density.
             Reverts ε2 simplification. Shows Link tab first, then demonstrates QR tab switch.
             Tab switch fires at COPY_CLICK_FRAME (f110) so viewer sees both tabs. */}
        {/* F8 surgical: tab section side padding = 36px; tab height 44→54px; fontSize 20→28.5px */}
        <div style={{ padding: "0 36px 18px 36px" }}>
          {/* Tab bar — production-parity: full-width, Link + QR Code.
               Production: TabsList = bg-muted (zinc-800 pill) p-1 rounded-lg h-9 w-full.
               TabsTrigger active = bg-background (zinc-900 card) shadow rounded-md.
               TabsTrigger inactive = text-muted-foreground (zinc-400), no background. */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: "rgba(39, 39, 42, 1)",
            borderRadius: 8,
            padding: 4,
            marginBottom: 18,
          }}>
            {(["Link", "QR Code"] as const).map((label) => {
              // κ-5: tab indicator and body both switch at COPY_CLICK_FRAME via showQR
              const isActive = showQR
                ? label === "QR Code"
                : label === "Link";
              return (
                <div
                  key={label}
                  style={{
                    height: 54,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    borderRadius: 6,
                    fontSize: 28.5,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? "rgba(244, 244, 245, 1)" : "rgba(113, 113, 122, 1)",
                    // Active: bg-background card + shadow (production data-[state=active]:bg-background data-[state=active]:shadow)
                    background: isActive ? "rgba(24, 24, 27, 1)" : "transparent",
                    boxShadow: isActive ? "0 1px 3px 0 rgba(0,0,0,0.4), 0 1px 2px -1px rgba(0,0,0,0.4)" : "none",
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

        {/* κ-5 RC-6 + F4.4: body cross-fades between Link and QR over 1fr (TAB_CROSSFADE_DURATION).
             D33: both tabs always rendered; wrapper uses position:relative for the visible tab and
             position:absolute for the fading tab — container height never collapses because QR is
             pre-mounted one frame before swap (COPY_CLICK_FRAME-1) so no empty-box frame exists.
             D44: fixed minHeight on wrapper = LinkTab natural height so QRTab (shorter) does not
             shrink the container when Link goes position:absolute at swap frame. */}
        {/* F8 surgical: body side padding = 36px */}
        <div style={{ padding: "0 36px 36px 36px", position: "relative" }}>
          {/* D44: fixed-height inner wrapper — prevents container reflow on tab swap.
               LinkTab height: Permalink(~132) + CopyBtn(78) + SocialRow(60) + PrivacyNote(~50)
               + gaps(30×3=90) ≈ 410px. QRTab ≈ 441px. minHeight=490 keeps constant through swap. */}
          <div style={{ position: "relative", minHeight: 490 }}>
            {/* Link tab — fades out at COPY_CLICK_FRAME; absolute while fading so QR holds height */}
            <div style={{
              opacity: linkTabOpacity,
              position: showQR ? "absolute" : "relative",
              top: showQR ? 0 : undefined,
              left: showQR ? 0 : undefined,
              right: showQR ? 0 : undefined,
              pointerEvents: linkTabOpacity > 0 ? "auto" : "none",
            }}>
              <RemotionLinkTab url={SHARE_URL} copied={copied} />
            </div>
            {/* QR tab — pre-mounted 1 frame before swap so no empty-box frame at TAB_SWAP_FRAME */}
            {frame >= TAB_SWAP_FRAME - 1 && (
              <div style={{ opacity: qrTabOpacity }}>
                <RemotionQRTab url={SHARE_URL} />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* S2 captions — round-9l kinetic typography */}
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
