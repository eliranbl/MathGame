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
