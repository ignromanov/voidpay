import { FONT_MONO } from "../fonts";

type Props = {
  url: string;
  fontSize: number;
  maxLines?: number;
};

/**
 * Splits a URL at the `#` boundary and renders:
 *   - base (scheme + host + path + "#"): zinc-400, neutral weight
 *   - hash payload: violet-400, accent color
 *
 * Uses Geist Mono (weight 400, the only loaded face) for both spans.
 * Color contrast alone provides the visual hierarchy.
 *
 * maxLines: clamps hash payload to N lines via -webkit-line-clamp (default 6).
 */
export const UrlChunks: React.FC<Props> = ({ url, fontSize, maxLines = 6 }) => {
  const hashIndex = url.indexOf("#");
  const base = hashIndex >= 0 ? url.slice(0, hashIndex + 1) : url;
  const hash = hashIndex >= 0 ? url.slice(hashIndex + 1) : "";

  return (
    <span
      style={{
        fontFamily: `${FONT_MONO}, monospace`,
        fontSize,
        lineHeight: 1.3,
        wordBreak: "break-all",
        letterSpacing: "-0.01em",
        display: "-webkit-box",
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      <span style={{ color: "#a1a1aa", fontWeight: 400 }}>{base}</span>
      <span style={{ color: "#a78bfa", fontWeight: 400 }}>{hash}</span>
    </span>
  );
};
