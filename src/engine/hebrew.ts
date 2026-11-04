const NUMBERS = [
  'אפס', 'אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע', 'עשר',
  'אחת עשרה', 'שתים עשרה', 'שלוש עשרה', 'ארבע עשרה', 'חמש עשרה',
  'שש עשרה', 'שבע עשרה', 'שמונה עשרה', 'תשע עשרה',
];

const TENS = ['', '', 'עשרים', 'שלושים', 'ארבעים', 'חמישים', 'שישים', 'שבעים', 'שמונים', 'תשעים', 'מאה'];

/** Hebrew word for a number, used for speech so the TTS doesn't read digits oddly. */
export function numberWord(n: number): string {
  if (n < 20) return NUMBERS[n] ?? String(n);
  if (n > 100 || !Number.isInteger(n)) return String(n);
  const ones = n % 10;
  return ones === 0 ? TENS[n / 10] : `${TENS[Math.floor(n / 10)]} ו${NUMBERS[ones]}`;
}

const HUNDREDS = ['', 'מאה', 'מאתיים', 'שלוש מאות', 'ארבע מאות', 'חמש מאות', 'שש מאות', 'שבע מאות', 'שמונה מאות', 'תשע מאות'];

/** The "and" form said after hundreds: "מאה ושלוש", "מאה ועשרים" — but "מאה עשרים ושלוש". */
const withAnd = (n: number) => (n < 20 || n % 10 === 0 ? `ו${numberWord(n)}` : numberWord(n));

/**
 * Clips that say any number up to 999. Above 100 it is said in two parts ("שלוש מאות" + "עשרים ושבע"),
 * so only the hundreds and the "and" forms need recordings of their own.
 */
export function numberClips(n: number): string[] {
  if (n <= 100) return [numberWord(n)];
  const rest = n % 100;
  const hundreds = HUNDREDS[Math.floor(n / 100)];
  return rest ? [hundreds, withAnd(rest)] : [hundreds];
}

/** Every clip `numberClips` can return, for the recording script. */
export function allNumberClips(): string[] {
  const clips = new Set<string>();
  for (let n = 0; n <= 999; n++) numberClips(n).forEach((c) => clips.add(c));
  return [...clips];
}
