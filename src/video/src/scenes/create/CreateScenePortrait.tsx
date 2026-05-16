import { interpolate } from "remotion";
import { InvoiceFormView, GenerateButtonView } from "@/widgets/invoice-form";
import { Card } from "@/shared/ui";
import { NetworkBackground } from "@/widgets/network-background";
import { NetworkBackgroundLayer } from "../../components/NetworkBackgroundLayer";
import { Caption } from "../../components/Caption";
import { COLORS } from "../../constants/colors";
import { CREATE_CAPTIONS_VERTICAL } from "../captions/create-captions";
import { CreateScenePaperEnvelope } from "./CreateScenePaperEnvelope";
import { PortraitCascade } from "./PortraitCascade";
import {
  SCROLL_FRAMES,
  SCROLL_OFFSETS,
  FILL_COMPLETE,
  BUTTON_VISIBLE,
  PRESS_START,
  PRESS_END,
} from "./constants";

type Props = {
  frame: number;
  viewValue: Record<string, unknown>;
  focusedField?: "from" | "client" | "lineItem" | "token" | "network";
  isPortrait: boolean;
  formWidth: number;
  formHeight: number;
  formLeft: number;
  formTop: number;
  glowSpread: number;
  glowIntensity: number;
  buttonGlowOpacity: number;
  formOpacity: number;
};

const noop = () => {
  /* Remotion renders static frames — click handlers never fire */
};

export const CreateScenePortrait: React.FC<Props> = ({
  frame,
  viewValue,
  focusedField,
  isPortrait,
  formWidth,
  formHeight,
  formLeft,
  formTop,
  glowSpread,
  glowIntensity,
  buttonGlowOpacity,
  formOpacity,
}) => {
  const captions = CREATE_CAPTIONS_VERTICAL;

  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: COLORS.bg }}>
      <NetworkBackgroundLayer variant="soft" />
      <NetworkBackground />

      {/* Void glow overlay behind the form card */}
      <div
        style={{
          position: "absolute",
          left: formLeft - 24,
          top: formTop - 24,
          width: formWidth + 48,
          height: formHeight + 48,
          borderRadius: 32,
          boxShadow: `0 0 60px rgba(124,58,237,${buttonGlowOpacity * 0.6}), 0 0 120px rgba(124,58,237,${buttonGlowOpacity * 0.3})`,
          pointerEvents: "none",
        }}
      />

      {/* β2: InvoicePaper as persistent backdrop, grows from PAPER_APPEAR BEHIND form (z=1).
           C5: F5 (Generate pressed) — paper dims to 0.4 opacity + 0.5px blur. */}
      <CreateScenePaperEnvelope
        frame={frame}
        {...(frame >= PRESS_START && {
          dimOpacity: interpolate(frame, [PRESS_START, PRESS_START + 8], [0.65, 0.4], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          blurPx: interpolate(frame, [PRESS_START, PRESS_START + 8], [0, 0.5], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        })}
      />

      {/* β1+β3+β4: Form Card — Mocks v2 form spec: rgba(14,14,19,0.95) bg, zinc border */}
      <Card
        style={{
          position: "absolute",
          left: formLeft,
          top: formTop,
          width: formWidth,
          height: formHeight,
          padding: "36px",  // Mocks v2 surgical: 12px → 36px in 1080 viewport (×3)
          overflow: "hidden",
          opacity: formOpacity,
          zIndex: 2,
          backgroundColor: "rgba(14,14,19,0.95)",
          border: "1px solid rgba(63,63,70,0.5)",
          boxShadow: `0 16px 50px rgba(0,0,0,0.5), 0 0 ${glowSpread}px rgba(124,58,237,${glowIntensity * 0.5})`,
          borderRadius: 12,
        }}
      >
        <div
          style={{
            transform: `translateY(${interpolate(
              frame,
              SCROLL_FRAMES,
              SCROLL_OFFSETS,
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            )}px)`,
          }}
        >
          {/* ε1: font-size CSS replaces transform-scale (γ2 conceptual error: pre-divide + scale = layout-neutral).
               ζ1: overflowX:visible preserves right-column; overflowY:hidden clips button at Card bottom.
               ζ2: sub-label overrides — <style> block forces min 16px on absolute-px Tailwind classes
                    (text-xs 12px / text-[11px]) used by INVOICE NO., DATES, YOUR NAME sub-labels. */}
          {isPortrait ? (
            <div
              className="remotion-create-portrait"
              style={{
                position: "relative",
                width: "100%",
                // D5: removed height:"100%" — it capped the scrollable content at card-height,
                // preventing translateY from revealing below-the-fold sections. The Card's own
                // overflow:hidden clips at the card boundary; button is naturally clipped there.
                fontSize: "inherit",
                overflowX: "visible",              // ε1: prevents right-column clipping at Card edge
                paddingRight: 8,                   // ε1: small extra right pad so values don't touch border
              }}
            >
              <PortraitCascade />

              {/* D2: Header matches production CreateWorkspace — violet "Invoice" + white " Details" */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
                paddingBottom: 14,
                borderBottom: "1px solid rgba(63, 63, 70, 0.5)",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "29px",
                  fontWeight: 700,
                  color: "rgba(244, 244, 245, 1)",
                  letterSpacing: "-0.005em",
                  lineHeight: 1.2,
                }}>
                  <span style={{ color: "#8b5cf6" }}>Invoice</span>
                  {" Details"}
                </div>
              </div>

              <InvoiceFormView
                value={viewValue as Parameters<typeof InvoiceFormView>[0]["value"]}
                {...(focusedField && { focusedField })}
                showGenerateButton={false}
              />

              {/* Round 9a-patch2 (C1): button always mounted at bottom of scroll content. */}
              {/* D23: --remotion-spin injects frame-driven rotation for the Loader2 spinner
                  (animate-spin CSS keyframe is disabled in the portrait cascade above). */}
              <div
                style={{
                  marginTop: 16,
                  transform: `scale(${interpolate(frame, [PRESS_START, PRESS_START + 2, PRESS_END - 2, PRESS_END], [1, 0.96, 0.96, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                  transformOrigin: "center",
                  ...(frame >= PRESS_END && { "--remotion-spin": `${frame * 8}deg` } as React.CSSProperties),
                }}
              >
                <GenerateButtonView
                  onGenerate={noop}
                  canGenerate={frame >= FILL_COMPLETE}
                  isGenerating={frame >= PRESS_END}
                  onSubmitAttempt={noop}
                  hoverState={frame >= BUTTON_VISIBLE && frame < PRESS_START}
                  pressState={frame >= PRESS_START && frame < PRESS_END}
                />
              </div>
            </div>
          ) : (
            <>
              <InvoiceFormView
                value={viewValue as Parameters<typeof InvoiceFormView>[0]["value"]}
                {...(focusedField && { focusedField })}
                showGenerateButton={false}
              />

              {/* Round 9a-patch2 (C1): button always mounted at bottom of scroll content. */}
              <div
                style={{
                  marginTop: 16,
                  transform: `scale(${interpolate(frame, [PRESS_START, PRESS_START + 2, PRESS_END - 2, PRESS_END], [1, 0.96, 0.96, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                  transformOrigin: "center",
                }}
              >
                <GenerateButtonView
                  onGenerate={noop}
                  canGenerate={frame >= FILL_COMPLETE}
                  isGenerating={frame >= PRESS_END}
                  onSubmitAttempt={noop}
                  hoverState={frame >= BUTTON_VISIBLE && frame < PRESS_START}
                  pressState={frame >= PRESS_START && frame < PRESS_END}
                />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* S1 captions — round-9q spec §3 (9:16 portrait) */}
      {captions.map((c, i) => (
        <Caption
          key={i}
          text={c.text}
          startAt={c.startAt}
          endAt={c.endAt}
          weight={c.weight}
          emphasizedWord={c.emphasizedWord}
          position={c.position}
          fontSize={c.fontSize}
          variant={c.variant ?? "violet"}
          springConfig={c.springConfig ?? "smooth"}
        />
      ))}
    </div>
  );
};
