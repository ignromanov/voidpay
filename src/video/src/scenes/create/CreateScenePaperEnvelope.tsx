import { interpolate } from "remotion";
import { PaperBackdrop } from "../../components/PaperBackdrop";
import { CREATE_PAPER_PROPS, PAPER_APPEAR, PAPER_VISIBLE_AT } from "./constants";

type Props = {
  frame: number;
  dimOpacity?: number;
  blurPx?: number;
  columnWidth?: number;
};

/**
 * Frame-driven entrance wrapper for the shared PaperBackdrop.
 * Preserves CreateScene's original entrance animation:
 *   - enter ramp: PAPER_APPEAR → PAPER_VISIBLE_AT (0→1)
 *   - scale ramp: 0.92 → 1.00 (applied via outer div transform)
 *   - opacity baseline: enter * 0.65 (overridable via dimOpacity)
 *   - null short-circuit when enter ≤ 0
 *
 * transformOrigin "top left" matches the shared PaperBackdrop's own
 * transformOrigin and the original local PaperBackdrop inner scale anchor.
 */
export const CreateScenePaperEnvelope: React.FC<Props> = ({
  frame,
  dimOpacity,
  blurPx,
  columnWidth,
}) => {
  const enter = interpolate(
    frame,
    [PAPER_APPEAR, PAPER_VISIBLE_AT],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  if (enter <= 0) return null;

  const opacity = dimOpacity !== undefined ? dimOpacity : enter * 0.65;
  const scaleRamp = 0.92 + enter * 0.08;  // 92% → 100% entrance scale ramp

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${scaleRamp})`,
        transformOrigin: "top left",
        zIndex: 1,
      }}
    >
      <PaperBackdrop
        paperProps={CREATE_PAPER_PROPS}
        opacity={opacity}
        {...(blurPx !== undefined && { blurPx })}
        {...(columnWidth !== undefined && { containerWidth: columnWidth })}
      />
    </div>
  );
};
