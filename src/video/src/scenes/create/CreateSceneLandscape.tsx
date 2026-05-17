import { interpolate, spring, useVideoConfig } from "remotion";
import { InvoiceFormView, GenerateButtonView } from "@/widgets/invoice-form/video-internals";
import { Card } from "@/shared/ui";
import { NetworkBackground } from "@/widgets/network-background";
import { NetworkBackgroundLayer } from "../../components/NetworkBackgroundLayer";
import { Caption } from "../../components/Caption";
import { LandscapeCreateCascade } from "../../components/LandscapeCreateCascade";
import { COLORS } from "../../constants/colors";
import { CREATE_CAPTIONS_LANDSCAPE, CREATE_CAPTIONS_V2_LANDSCAPE } from "../captions/create-captions";
import type { HookVariant } from "../captions/thesis-captions";
import { CreateScenePaperEnvelope } from "./CreateScenePaperEnvelope";
import {
  FILL_COMPLETE,
  BUTTON_VISIBLE,
  PRESS_START,
  PRESS_END,
  SCROLL_START_FRAME,
  SCROLL_END_FRAME,
  SCROLL_DURATION_FRAMES,
  TOTAL_SCROLL_DISTANCE_LANDSCAPE,
  GENERATE_PRESS,
  FORM_OFFSET_RIGHT,
  INVOICE_OFFSET_LEFT,
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
  hookVariant?: HookVariant;
};

const noop = () => {
  /* Remotion renders static frames — click handlers never fire */
};

// Stage 2 spring drives form→right split and invoice fade-in/slide-left.
// Spring easing: same config used in form scroll for visual consistency.
const SPLIT_SPRING_CONFIG = { damping: 30, stiffness: 80 };

export const CreateSceneLandscape: React.FC<Props> = ({
  frame,
  viewValue,
  focusedField,
  formHeight,
  glowSpread,
  glowIntensity,
  buttonGlowOpacity,
  formOpacity,
  hookVariant = "v1",
}) => {
  const { fps } = useVideoConfig();

  const captions = hookVariant === "v2" ? CREATE_CAPTIONS_V2_LANDSCAPE : CREATE_CAPTIONS_LANDSCAPE;

  // Stage progress: 0 before GENERATE_PRESS, 0→1 during split (stage 2), 1 in stage 3.
  const stageProgress = spring({
    frame: frame - GENERATE_PRESS,
    fps,
    config: SPLIT_SPRING_CONFIG,
  });

  // Form: starts center, slides right, scales 1 → 0.7 (×1.7 cascade applied via CSS,
  // so relative scale here goes 1 → 0.7, giving final ×1.19 visible size in stage 3).
  const formTranslateX = FORM_OFFSET_RIGHT * stageProgress;
  const formScale = 1 - 0.3 * stageProgress;
  const formTransform = `translateX(${formTranslateX}px) scale(${formScale})`;

  // Invoice: fades in and slides left from center during stage 2, fully visible in stage 3.
  const invoiceOpacity = interpolate(stageProgress, [0, 0.3, 1], [0, 0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const invoiceTranslateX = -INVOICE_OFFSET_LEFT * stageProgress;
  const invoiceTransform = `translateX(${invoiceTranslateX}px)`;

  // Form scroll — same spring scroll as portrait. R12-1: clamp to SCROLL_END_FRAME=260.
  const scrollOffset = interpolate(
    spring({
      frame: Math.min(frame, SCROLL_END_FRAME) - SCROLL_START_FRAME,
      fps,
      durationInFrames: SCROLL_DURATION_FRAMES,
      config: { damping: 30, stiffness: 80 },
    }),
    [0, 1],
    [0, -TOTAL_SCROLL_DISTANCE_LANDSCAPE],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: COLORS.bg }}>
      <NetworkBackgroundLayer variant="soft" />
      <NetworkBackground />

      {/* Choreography layer — both elements positioned absolutely in center, then offset via transform */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Invoice — slides left as stage 2 begins */}
        <div
          style={{
            position: "absolute",
            width: 680,
            height: "80%",
            transform: invoiceTransform,
            opacity: invoiceOpacity,
            zIndex: 1,
          }}
        >
          <CreateScenePaperEnvelope
            frame={frame}
            columnWidth={680}
          />
        </div>

        {/* Form card — centered in stage 1, slides right in stage 2 */}
        <div
          style={{
            position: "absolute",
            width: 640,
            transform: formTransform,
            transformOrigin: "center center",
            zIndex: 2,
          }}
        >
          <Card
            style={{
              width: "100%",
              height: formHeight,
              padding: "24px",
              overflow: "hidden",
              opacity: formOpacity,
              backgroundColor: "rgba(14,14,19,0.95)",
              border: "1px solid rgba(63,63,70,0.5)",
              boxShadow: `0 16px 50px rgba(0,0,0,0.5), 0 0 ${glowSpread}px rgba(124,58,237,${glowIntensity * 0.5}), 0 0 60px rgba(124,58,237,${buttonGlowOpacity * 0.4}), 0 0 120px rgba(124,58,237,${buttonGlowOpacity * 0.2})`,
              borderRadius: 12,
            }}
          >
            <div style={{ transform: `translateY(${scrollOffset}px)` }}>
              <div
                className="remotion-create-landscape"
                style={{ position: "relative", width: "100%", fontSize: "inherit", overflowX: "visible", paddingRight: 8 }}
              >
                <LandscapeCreateCascade />

                {/* "Invoice Details" heading — above the form, inside cascade */}
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
