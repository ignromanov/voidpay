import { FONT_MONO } from "../fonts";

type Props = {
  url: string;
  fontSize: number;
  maxLines?: number;
};

/**
 * Splits a URL into 4 color-coded parts matching the live-app LinkTab.tsx color scheme:
 *   - protocol ("https://"): zinc-600 (#52525b)
 *   - domain ("voidpay.xyz"): violet-500 (#8b5cf6), semibold
 *   - path ("/pay#"): violet-400/70 (rgba(167,139,250,0.7))
 *   - hash payload ("N4Ig..."): zinc-400 (#a1a1aa)
 *
 * Uses Geist Mono (weight 400, the only loaded face). Domain uses fontWeight 600.
 * Color contrast provides visual hierarchy matching production LinkTab.tsx:91-97.
 *
 * maxLines: clamps the full span to N lines via -webkit-line-clamp (default 6).
 */
export const UrlChunks: React.FC<Props> = ({ url, fontSize, maxLines = 6 }) => {
  // Parse: protocol://domain/path#hash
  const protocolMatch = url.match(/^(https?:\/\/)/);
  const protocol = protocolMatch ? protocolMatch[1] : "";
  const afterProtocol = url.slice(protocol.length);

  const slashIndex = afterProtocol.indexOf("/");
  const hashIndex = afterProtocol.indexOf("#");

  let domain: string;
  let pathAndHash: string;

  if (slashIndex >= 0) {
    domain = afterProtocol.slice(0, slashIndex);
    pathAndHash = afterProtocol.slice(slashIndex);
  } else if (hashIndex >= 0) {
    domain = afterProtocol.slice(0, hashIndex);
    pathAndHash = afterProtocol.slice(hashIndex);
  } else {
    domain = afterProtocol;
    pathAndHash = "";
  }

  const hashStart = pathAndHash.indexOf("#");
  const path = hashStart >= 0 ? pathAndHash.slice(0, hashStart + 1) : pathAndHash; // includes "#"
  const hash = hashStart >= 0 ? pathAndHash.slice(hashStart + 1) : "";

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
      <span style={{ color: "#52525b", fontWeight: 400 }}>{protocol}</span>
      <span style={{ color: "#8b5cf6", fontWeight: 600 }}>{domain}</span>
      <span style={{ color: "rgba(167,139,250,0.7)", fontWeight: 400 }}>{path}</span>
      <span style={{ color: "#a1a1aa", fontWeight: 400 }}>{hash}</span>
    </span>
  );
};
