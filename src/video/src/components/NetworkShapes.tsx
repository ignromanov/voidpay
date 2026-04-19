import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants/colors";

/** Seeded positions for deterministic rendering (no Math.random) */
const SHAPES = [
  { x: 0.15, y: 0.2, size: 60, rotation: 15, speed: 0.3 },
  { x: 0.75, y: 0.15, size: 45, rotation: -20, speed: 0.4 },
  { x: 0.85, y: 0.6, size: 55, rotation: 30, speed: 0.25 },
  { x: 0.1, y: 0.7, size: 50, rotation: -10, speed: 0.35 },
  { x: 0.5, y: 0.85, size: 40, rotation: 45, speed: 0.2 },
  { x: 0.35, y: 0.1, size: 35, rotation: -35, speed: 0.45 },
] as const;

export const NetworkShapes: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {SHAPES.map((shape, i) => {
        const floatY = interpolate(
          Math.sin(frame * 0.02 * shape.speed + i),
          [-1, 1],
          [-15, 15],
        );
        const floatRotation = interpolate(
          Math.sin(frame * 0.015 * shape.speed + i * 2),
          [-1, 1],
          [-5, 5],
        );

        return (
          <svg
            key={i}
            width={shape.size}
            height={shape.size}
            viewBox="0 0 100 100"
            style={{
              position: "absolute",
              left: shape.x * width - shape.size / 2,
              top: shape.y * height - shape.size / 2 + floatY,
              transform: `rotate(${shape.rotation + floatRotation}deg)`,
              opacity: 0.12,
            }}
          >
            <polygon
              points="50,10 90,80 10,80"
              fill={COLORS.arbitrum}
              stroke={COLORS.arbitrum}
              strokeWidth="1"
            />
          </svg>
        );
      })}
    </div>
  );
};
