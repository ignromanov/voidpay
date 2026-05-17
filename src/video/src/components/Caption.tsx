import { useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionSpringConfig, CaptionWeight } from "./Caption.helpers";
import { LegacyPillCaption } from "./Caption.LegacyPill";
import { KineticCaption } from "./Caption.Kinetic";

export type CaptionVariant = "violet" | "emerald";
export type CaptionPosition = "top" | "bottom" | "center" | number;

export type CaptionProps = {
  text: string;
  /** Frame (local to parent Sequence) when caption starts fading in */
  startAt?: number;
  /** Fade-in duration in frames (legacy pill path only) */
  fadeDuration?: number;
  /** Frame when caption starts fading out (undefined = stays visible) */
  endAt?: number;
  /** Fade-out duration in frames (legacy pill path only) */
  fadeOutDuration?: number;
  fontSize?: number;
  /**
   * "bottom" | "top" — legacy pill positions (backward compat).
   * "center" — 50% of viewport height (kinetic path).
   * number — explicit 0-100% of viewport height (kinetic path).
   */
  position?: CaptionPosition;
  /**
   * "violet" (default): violet border/text/shadow.
   * "emerald": emerald border/text/shadow — success state.
   */
  variant?: CaptionVariant;
  /** Font weight: 700 = statement (spring entry), 500 = supporting (bezier entry). Default 500. */
  weight?: CaptionWeight;
  /** Single word from `text` to highlight with word-pop animation. Case-sensitive. */
  emphasizedWord?: string;
  /** Entry spring config: "smooth" (default) or "overshoot" (Magic Dust hero). */
  springConfig?: CaptionSpringConfig;
};

/** Returns true when any new-API prop is active, routing to kinetic text mode. */
function isKineticMode(props: CaptionProps): boolean {
  return (
    props.weight !== undefined ||
    props.emphasizedWord !== undefined ||
    props.springConfig !== undefined ||
    props.position === "center" ||
    typeof props.position === "number"
  );
}

/**
 * Caption — dual-mode caption component.
 *
 * Legacy mode (backward compat): pill chip with dark bg, border glow, dot.
 * Kinetic mode (new API): white text at yPercent position with word-pop support.
 * Kinetic activates when weight / emphasizedWord / springConfig is set,
 * or position is "center" or a number (0-100% of viewport height).
 */
export const Caption: React.FC<CaptionProps> = (props) => {
  const {
    text,
    startAt = 0,
    fadeDuration = 12,
    endAt,
    fadeOutDuration = 8,
    fontSize = 39,
    position = "bottom",
    variant = "violet",
    weight = 500,
    emphasizedWord,
    springConfig = "smooth",
  } = props;

  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  if (isKineticMode(props)) {
    return (
      <KineticCaption
        text={text}
        startAt={startAt}
        endAt={endAt ?? startAt + 60}
        fontSize={fontSize}
        position={position as "top" | "bottom" | "center" | number}
        variant={variant}
        weight={weight}
        emphasizedWord={emphasizedWord}
        springConfig={springConfig}
        frame={frame}
        fps={fps}
        width={width}
        height={height}
      />
    );
  }

  return (
    <LegacyPillCaption
      text={text}
      startAt={startAt}
      fadeDuration={fadeDuration}
      endAt={endAt}
      fadeOutDuration={fadeOutDuration}
      fontSize={fontSize}
      position={position as "top" | "bottom"}
      variant={variant}
      frame={frame}
      fps={fps}
      width={width}
    />
  );
};
