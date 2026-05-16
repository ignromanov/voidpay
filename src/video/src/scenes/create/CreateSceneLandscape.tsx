import { interpolate, useVideoConfig } from "remotion";
import { InvoiceFormView, GenerateButtonView } from "@/widgets/invoice-form";
import { Card } from "@/shared/ui";
import { NetworkBackground } from "@/widgets/network-background";
import { NetworkBackgroundLayer } from "../../components/NetworkBackgroundLayer";
import { Caption } from "../../components/Caption";
import { COLORS } from "../../constants/colors";
import { CREATE_CAPTIONS_LANDSCAPE } from "../captions/create-captions";
import { CreateScenePaperEnvelope } from "./CreateScenePaperEnvelope";
import {
  SCROLL_FRAMES_LANDSCAPE,
  SCROLL_OFFSETS_LANDSCAPE,
  FILL_COMPLETE,
  BUTTON_VISIBLE,
  PRESS_START,
  PRESS_END,
} from "./constants";

type Props = {
  frame: number;
  viewValue: Record<string, unknown>;
  focusedField?: "from" | "client" | "lineItem" | "token" | "network";
  formHeight: number;
  glowSpread: number;
  glowIntensity: number;
  buttonGlowOpacity: number;
  formOpacity: number;
};

const noop = () => {
  /* Remotion renders static frames — click handlers never fire */
};

// D12-D14: landscape two-column layout — paper LEFT, form RIGHT, max 640px.
const PANEL_MAX_WIDTH = 640;

export const CreateSceneLandscape: React.FC<Props> = ({
  frame,
  viewValue,
  focusedField,
  formHeight,
  glowSpread,
  glowIntensity,
  buttonGlowOpacity,
  formOpacity,
}) => {
  const { width } = useVideoConfig();
  const halfW = width / 2;

  const dimOpacity = frame >= PRESS_START
    ? interpolate(frame, [PRESS_START, PRESS_START + 8], [0.65, 0.4], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : undefined;
  const blurPx = frame >= PRESS_START
    ? interpolate(frame, [PRESS_START, PRESS_START + 8], [0, 0.5], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : undefined;

  const captions = CREATE_CAPTIONS_LANDSCAPE;

  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: COLORS.bg }}>
      <NetworkBackgroundLayer variant="soft" />
      <NetworkBackground />

      {/* LEFT column — InvoicePaper vertically centered */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: halfW,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          boxSizing: "border-box",
        }}
      >
        <CreateScenePaperEnvelope
          frame={frame}
          columnWidth={halfW}
          dimOpacity={dimOpacity}
          blurPx={blurPx}
        />
      </div>

      {/* RIGHT column — form + hints, maxWidth clamped */}
      <div
        style={{
          position: "absolute",
          left: halfW,
          top: 0,
          width: halfW,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "100%", maxWidth: PANEL_MAX_WIDTH, position: "relative" }}>
          {/* Form Card — glow lives here, centered on the card (D40: no column-level glow) */}
          <Card
            style={{
              width: "100%",
              height: formHeight,
              padding: "24px",
              overflow: "hidden",
              opacity: formOpacity,
              zIndex: 2,
              backgroundColor: "rgba(14,14,19,0.95)",
              border: "1px solid rgba(63,63,70,0.5)",
              boxShadow: `0 16px 50px rgba(0,0,0,0.5), 0 0 ${glowSpread}px rgba(124,58,237,${glowIntensity * 0.5}), 0 0 60px rgba(124,58,237,${buttonGlowOpacity * 0.4}), 0 0 120px rgba(124,58,237,${buttonGlowOpacity * 0.2})`,
              borderRadius: 12,
            }}
          >
            <div
              style={{
                transform: `translateY(${interpolate(
                  frame,
                  SCROLL_FRAMES_LANDSCAPE,
                  SCROLL_OFFSETS_LANDSCAPE,
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                )}px)`,
              }}
            >
              <div
                className="remotion-create-scene"
                style={{ position: "relative", width: "100%", fontSize: "inherit", overflowX: "visible", paddingRight: 8 }}
              >
                {/* Header */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                  paddingBottom: 10,
                  borderBottom: "1px solid rgba(63, 63, 70, 0.5)",
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: "18px",
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

                <div
                  style={{
                    marginTop: 12,
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
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* S1 captions — round-9l spec §4 (16:9 landscape) */}
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
