let ctx: AudioContext | null = null;

/** One shared AudioContext for sound effects and speech. */
export function audioContext(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// Mobile browsers only allow audio after a touch, so wake the context on the first one.
if (typeof window !== 'undefined') {
  const unlock = () => {
    audioContext();
    window.removeEventListener('pointerdown', unlock);
  };
  window.addEventListener('pointerdown', unlock);
}
