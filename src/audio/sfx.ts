import { audioContext } from './context';

let muted = false;

export function setSfxMuted(value: boolean) {
  muted = value;
}

function audio(): AudioContext | null {
  return muted ? null : audioContext();
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume = 0.18) {
  const c = audio();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = c.currentTime + start;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export const sfx = {
  tap: () => tone(660, 0, 0.08, 'triangle', 0.1),
  correct: () => {
    tone(523, 0, 0.15, 'triangle');
    tone(784, 0.12, 0.25, 'triangle');
  },
  wrong: () => {
    tone(330, 0, 0.18, 'sine', 0.12);
    tone(262, 0.15, 0.25, 'sine', 0.12);
  },
  levelUp: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle')),
  crack: () => {
    tone(180, 0, 0.06, 'square', 0.08);
    tone(140, 0.08, 0.06, 'square', 0.08);
  },
};
