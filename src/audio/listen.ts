import { stopSpeaking } from './speech';

/** The bits of the Web Speech API we use; TypeScript's DOM types don't include it. */
interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onaudiostart: (() => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type RecognitionCtor = new () => Recognition;

const Ctor: RecognitionCtor | undefined =
  typeof window !== 'undefined'
    ? ((window as unknown as Record<string, RecognitionCtor | undefined>).SpeechRecognition ??
      (window as unknown as Record<string, RecognitionCtor | undefined>).webkitSpeechRecognition)
    : undefined;

let active: Recognition | null = null;

/** Whether this browser can hear the child (Chrome, Edge, Safari — not Firefox). */
export const canListen = () => !!Ctor;

interface ListenOptions {
  /** Stops as soon as the guesses so far are good enough, instead of waiting for the timeout. */
  accept?: (heard: string[]) => boolean;
  /** Called once the microphone is really recording, so the child knows to start talking. */
  onReady?: () => void;
  timeoutMs?: number;
}

/**
 * Listens for a short while and resolves with every guess the recognizer made, including its
 * in-between guesses: a child's "umm… dog" is often right halfway and changed at the end.
 * Resolves to what was heard so far on silence, error, a denied microphone or the timeout.
 */
export function listen(lang: 'he' | 'en', { accept, onReady, timeoutMs = 7000 }: ListenOptions = {}): Promise<string[]> {
  stopListening();
  // The game's own voice must not be heard as the answer.
  stopSpeaking();
  if (!Ctor) return Promise.resolve([]);
  return new Promise((resolve) => {
    const rec = new Ctor();
    rec.lang = lang === 'he' ? 'he-IL' : 'en-US';
    rec.interimResults = true;
    rec.maxAlternatives = 5;
    // Keeps listening through a pause, so a hesitant child isn't cut off after the first sound.
    rec.continuous = true;
    const heard = new Set<string>();
    const timer = window.setTimeout(() => rec.stop(), timeoutMs);
    rec.onaudiostart = () => onReady?.();
    rec.onresult = (e) => {
      for (let i = 0; i < e.results.length; i++) {
        const alts = e.results[i];
        for (let j = 0; j < alts.length; j++) if (alts[j].transcript.trim()) heard.add(alts[j].transcript);
      }
      if (accept?.([...heard])) rec.stop();
    };
    rec.onerror = () => {};
    rec.onend = () => {
      clearTimeout(timer);
      if (active === rec) active = null;
      resolve([...heard]);
    };
    active = rec;
    try {
      rec.start();
    } catch {
      clearTimeout(timer);
      active = null;
      resolve([]);
    }
  });
}

export function stopListening() {
  active?.abort();
  active = null;
}
