import { stripNikud } from './words';

const FINALS: Record<string, string> = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };

/** Letters a speaker can't tell apart by ear, folded into one: the recognizer may pick either spelling. */
const SOUNDS: Record<string, string> = { 'ק': 'כ', 'ח': 'כ', 'ט': 'ת', 'ע': 'א', 'ס': 'ש' };

/** Bare words of a phrase: no niqqud, punctuation, case or final letter forms. */
export function normalizeWords(text: string): string[] {
  return stripNikud(text)
    .toLowerCase()
    .replace(/[ךםןףץ]/g, (c) => FINALS[c])
    .replace(/[^a-zא-ת\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * How a Hebrew word sounds, roughly: sound-alike letters folded, and the vowel letters
 * the recognizer may or may not write (תות/תת, פרה/פר) dropped. The first letter always stays.
 */
export function soundOf(word: string): string {
  if (!/[א-ת]/.test(word)) return word;
  const folded = [...word].map((c) => SOUNDS[c] ?? c);
  const rest = folded.slice(1).filter((c) => c !== 'ו' && c !== 'י');
  if (rest.length > 1 && (rest[rest.length - 1] === 'ה' || rest[rest.length - 1] === 'א')) rest.pop();
  return folded[0] + rest.join('');
}

/**
 * Same word by ear. Longer words may also have one letter swapped, since kids' speech is often misheard by a letter;
 * an added or missing letter is not forgiven, so "כלבים" is still not "כלב".
 */
function soundsLike(target: string, heard: string): boolean {
  const t = soundOf(target);
  const h = soundOf(heard);
  if (t === h) return true;
  return t.length >= 3 && t.length === h.length && [...t].filter((c, i) => c !== h[i]).length <= 1;
}

/**
 * Whether the child said the word: any of the recognizer's guesses holds it as a whole word.
 * Kids often say "the dog" or "הַכֶּלֶב", so a leading "ה" is forgiven too, and a word the
 * recognizer split in two ("כ לב") is joined back.
 */
export function matchesSpoken(target: string, heard: readonly string[]): boolean {
  const [word] = normalizeWords(target);
  if (!word) return false;
  const hebrew = /[א-ת]/.test(word);
  return heard.some((phrase) => {
    const words = normalizeWords(phrase);
    const candidates = [...words, words.join('')];
    return candidates.some((w) => {
      if (w === word || w === `ה${word}`) return true;
      if (!hebrew) return false;
      return soundsLike(word, w) || (w.length > 2 && w[0] === 'ה' && soundsLike(word, w.slice(1)));
    });
  });
}
