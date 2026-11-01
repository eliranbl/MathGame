import { clipId } from './clipId';
import { audioContext } from './context';

export { phrases } from './lines';

/** A sentence to say: one pre-recorded clip, or clips played back to back. `{ say }` is read by the browser's own voice, for names. */
export type Clip = string | { say: string };
export type Speech = Clip | Clip[];

let muted = false;
let playing: AudioBufferSourceNode | null = null;
/** Bumped on every new sentence, so a slow download from an older one never plays. */
let generation = 0;
const buffers = new Map<string, Promise<AudioBuffer>>();

export function setMuted(value: boolean) {
  muted = value;
  if (muted) stopSpeaking();
}

export const toClips = (speech: Speech): Clip[] => (Array.isArray(speech) ? speech : [speech]);

const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
let voice: SpeechSynthesisVoice | null = null;

function pickVoice() {
  if (!synth) return;
  const voices = synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith('he'));
  // Prefer natural/online voices when the browser offers them.
  voice = voices.find((v) => /natural|online|google/i.test(v.name)) ?? voices[0] ?? null;
}

if (synth) {
  pickVoice();
  synth.addEventListener?.('voiceschanged', pickVoice);
}

/** Says text with the browser's voice; resolves when done (or right away if there is no Hebrew voice). */
function sayWithBrowser(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!synth || !voice) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = 0.9;
    u.pitch = 1.15;
    u.onend = u.onerror = () => resolve();
    synth.speak(u);
  });
}

function playBuffer(ctx: AudioContext, buffer: AudioBuffer): Promise<void> {
  return new Promise((resolve) => {
    const node = ctx.createBufferSource();
    node.buffer = buffer;
    node.connect(ctx.destination);
    node.onended = () => resolve();
    node.start();
    playing = node;
  });
}

/** Cuts the silence the voice leaves around each clip, so joined clips sound like one sentence. */
function trim(ctx: AudioContext, buffer: AudioBuffer): AudioBuffer {
  const data = buffer.getChannelData(0);
  const threshold = 0.015;
  let start = 0;
  let end = data.length - 1;
  while (start < end && Math.abs(data[start]) < threshold) start++;
  while (end > start && Math.abs(data[end]) < threshold) end--;
  start = Math.max(0, start - Math.round(buffer.sampleRate * 0.03));
  end = Math.min(data.length, end + Math.round(buffer.sampleRate * 0.08));
  if (end - start <= 0) return buffer;
  const out = ctx.createBuffer(buffer.numberOfChannels, end - start, buffer.sampleRate);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) out.copyToChannel(buffer.getChannelData(ch).subarray(start, end), ch);
  return out;
}

function load(ctx: AudioContext, clip: string): Promise<AudioBuffer> {
  const src = `audio/${clipId(clip)}.mp3`;
  let p = buffers.get(src);
  if (!p) {
    p = fetch(src)
      .then((r) => {
        if (!r.ok) throw new Error(`missing clip ${src}`);
        return r.arrayBuffer();
      })
      .then((data) => ctx.decodeAudioData(data))
      .then((buffer) => trim(ctx, buffer));
    p.catch(() => buffers.delete(src));
    buffers.set(src, p);
  }
  return p;
}

/** Downloads clips ahead of time so the first sentence doesn't wait. */
export function preload(speech: Speech) {
  const ctx = audioContext();
  if (ctx) toClips(speech).forEach((c) => typeof c === 'string' && void load(ctx, c).catch(() => {}));
}

export function speak(speech: Speech) {
  stopSpeaking();
  if (muted) return;
  const ctx = audioContext();
  if (!ctx) return;
  const mine = generation;
  const clips = toClips(speech);
  // Start every download now; play them in order as they arrive.
  const loading = clips.map((c) => (typeof c === 'string' ? load(ctx, c).catch(() => null) : null));
  void (async () => {
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      if (typeof clip !== 'string') await sayWithBrowser(clip.say);
      else {
        const buffer = await loading[i];
        if (mine !== generation) return;
        if (buffer) await playBuffer(ctx, buffer);
      }
      if (mine !== generation) return;
    }
  })();
}

export function stopSpeaking() {
  generation++;
  synth?.cancel();
  try {
    playing?.stop();
  } catch {
    // Already finished.
  }
  playing = null;
}
