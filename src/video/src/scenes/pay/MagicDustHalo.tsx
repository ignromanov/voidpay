/** Magic Dust violet halo + text-shadow style injection.
 *
 *  Positioning is passed as props because landscape uses absolute pixel coords
 *  anchored to the paper position, while portrait uses percentage-based offsets.
 *
 *  Renders nothing when opacity is effectively zero (saves DOM nodes during non-peak frames). */
export type MagicDustHaloPosition =
  | { kind: "absolute"; left: number; top: number }
  | { kind: "percentage"; bottom: string; right: string };

export const MagicDustHalo: React.FC<{
  opacity: number;
  position: MagicDustHaloPosition;
}> = ({ opacity, position }) => {
  if (opacity <= 0.01) return null;

  const positionStyle =
    position.kind === "absolute"
      ? { left: position.left, top: position.top }
      : { bottom: position.bottom, right: position.right };

  return (
    <>
      <div
        style={{
          position: "absolute",
          ...positionStyle,
          width: 300,
          height: 160,
          background: "radial-gradient(ellipse, rgba(167,139,250,0.85) 0%, rgba(167,139,250,0.25) 35%, transparent 70%)",
          filter: "blur(14px)",
          opacity,
          pointerEvents: "none",
        }}
      />
      <style>{`
        .remotion-dust-glow [data-magic-dust] .font-mono,
        .remotion-dust-glow .magic-dust-amount {
          text-shadow: 0 0 12px rgba(167,139,250,0.9) !important;
        }
      `}</style>
    </>
  );
};
