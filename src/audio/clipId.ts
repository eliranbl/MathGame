/** Stable file name for a recorded sentence (FNV-1a), shared by the game and the generator script. */
export function clipId(text: string): string {
  let h = 0x811c9dc5;
  for (const ch of text.normalize('NFC')) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}
