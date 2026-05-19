import { useVideoConfig } from "remotion";
import { useMemo } from "react";

/**
 * Layout constants derived from the composition's aspect ratio.
 * Consumed by Caption components and scene layouts for aspect-appropriate
 * positioning, font sizing, and safe-zone enforcement.
 *
 * See round-9l-spec.md §6 row A2 for placement rationale.
 */
export type AspectInfo = {
  /** true if portrait/vertical aspect (9:16) */
  isVertical: boolean;
  /** Caption Y position as fraction of height (0..1) — body captions default */
  captionY: number;
  /** Body caption font size as fraction of viewport height */
  fontPctBody: number;
  /** Statement (hero) caption font size as fraction of viewport height */
  fontPctStatement: number;
  /** Safe zone insets in pixels — caption text must stay within these */
  safeZone: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
};

const VERTICAL_INFO: AspectInfo = {
  isVertical: true,
  captionY: 0.45, // 45% from top — upper-center band
  fontPctBody: 0.038, // 3.8% of 1920 = ~73px
  fontPctStatement: 0.055, // 5.5% of 1920 = ~106px
  safeZone: {
    top: 200, // TikTok/Reels top reserved (username, track info)
    bottom: 440, // TikTok engagement bar + auto-captions
    left: 60,
    right: 164, // TikTok engagement icons
  },
};

const LANDSCAPE_INFO: AspectInfo = {
  isVertical: false,
  captionY: 0.8, // 80% from top — lower-third (broadcast convention)
  fontPctBody: 0.055, // 5.5% of 1080 = ~59px
  fontPctStatement: 0.075, // 7.5% of 1080 = ~81px
  safeZone: {
    top: 96, // title-safe (broadcast 90%)
    bottom: 96,
    left: 96,
    right: 96,
  },
};

/**
 * useAspect — returns layout constants based on composition aspect ratio.
 * Reads useVideoConfig() width/height; memoized so consumers can use in deps.
 *
 * Used by Caption components and scene layouts to pick aspect-appropriate
 * positioning, font sizing, and safe-zone enforcement.
 *
 * See round-9l-spec.md for caption density + placement rationale.
 */
export const useAspect = (): AspectInfo => {
  const { width, height } = useVideoConfig();
  return useMemo(
    () => (height > width ? VERTICAL_INFO : LANDSCAPE_INFO),
    [width, height],
  );
};
