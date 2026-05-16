import { TYPEWRITER_CHAR_FRAMES } from "../../constants/timing";

/** Typewriter: reveal `text` char by char starting at `startFrame` */
export const typewrite = (text: string, frame: number, startFrame: number): string => {
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.floor(elapsed / TYPEWRITER_CHAR_FRAMES);
  return text.slice(0, Math.min(chars, text.length));
};
