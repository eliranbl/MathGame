import type { Speech } from '../audio/speech';
import type { ItemType } from './generator';
import { numberClips, numberWord as w } from './hebrew';

/** What an explanation step draws. */
export type ExplainVisual =
  /** `total` items shared into `groups` groups, `dealt` in each so far; the rest wait in a pile. */
  | { type: 'share'; total: number; groups: number; dealt: number; item: ItemType }
  /** Long division so far: the quotient digits written, and the last subtraction. */
  | { type: 'longDiv'; a: number; b: number; quotient: string; work?: { from: number; take: number; left: number } };

/** Keeps an exercise left-to-right inside a Hebrew sentence, so "7 × 4 = 28" isn't shown as "28 = 4 × 7". */
export const ltr = (expression: string) => `⁦${expression}⁩`;

export interface ExplainStep {
  /** Shown on screen; may hold line breaks. */
  text: string;
  speak: Speech;
  visual?: ExplainVisual;
}

/**
 * Sharing out, one round at a time, then checking with multiplication.
 * `missing` explains "? ÷ b = q" backwards: b groups of q make the number.
 */
export function explainDivision(a: number, b: number, item: ItemType, missing = false): ExplainStep[] {
  const q = Math.floor(a / b);
  const r = a % b;
  const share = (dealt: number): ExplainVisual => ({ type: 'share', total: a, groups: b, dealt, item });

  if (missing) {
    return [
      {
        text: `${b} קבוצות, ובכל קבוצה ${q}. כמה יש בסך הכול?`,
        speak: [w(b), 'קבוצות, ובכל קבוצה', w(q), 'כמה יש בסך הכול?'],
        visual: share(q),
      },
      {
        text: `חילוק הפוך הוא כפל:\n${ltr(`${b} × ${q} = ${a}`)}`,
        speak: ['חילוק הפוך הוא כפל.', `${w(b)} כפול`, w(q), 'זה', ...numberClips(a)],
        visual: share(q),
      },
      {
        text: `${ltr(`${a} ÷ ${b} = ${q}`)}\nהמספר החסר הוא ${a}`,
        speak: ['המספר החסר הוא', ...numberClips(a)],
      },
    ];
  }

  return [
    {
      text: `יש ${a}, ומחלקים אותם שווה בשווה ל־${b} קבוצות.`,
      speak: ['יש לנו', ...numberClips(a), 'ואנחנו מחלקים אותם שווה בשווה. מספר הקבוצות:', w(b)],
      visual: share(0),
    },
    {
      text: 'שמים אחד בכל קבוצה, וחוזרים שוב ושוב.',
      speak: 'שמים אחד בכל קבוצה, וחוזרים שוב ושוב.',
      visual: share(1),
    },
    {
      text: r ? `ממשיכים עד שאין מספיק לכל הקבוצות. נשארו ${r}.` : 'ממשיכים עד שלא נשאר כלום.',
      speak: r ? ['ממשיכים עד שאין מספיק לכל הקבוצות. נשארו', w(r)] : 'ממשיכים עד שלא נשאר כלום.',
      visual: share(q),
    },
    {
      text: r ? `בכל קבוצה יש ${q}, והשארית היא ${r}.` : `בכל קבוצה יש ${q}.`,
      speak: r ? ['בכל קבוצה יש', w(q), 'והשארית היא', w(r)] : ['בכל קבוצה יש', w(q)],
      visual: share(q),
    },
    {
      text: `בדיקה: ${ltr(`${b} × ${q}${r ? ` + ${r}` : ''} = ${a}`)} ✓`,
      speak: ['בדיקה:', `${w(b)} כפול`, w(q), ...(r ? ['ועוד', w(r)] : []), 'שווה', ...numberClips(a)],
    },
  ];
}

/** Long division digit by digit: how many times it goes in, multiply, subtract, bring down the next digit. */
export function explainLongDivision(a: number, b: number): ExplainStep[] {
  const digits = [...String(a)].map(Number);
  const steps: ExplainStep[] = [
    {
      text: `${ltr(`${a} ÷ ${b}`)}\nמחלקים ספרה אחרי ספרה, משמאל לימין.`,
      speak: 'חילוק ארוך: מחלקים ספרה אחרי ספרה, משמאל לימין.',
      visual: { type: 'longDiv', a, b, quotient: '' },
    },
  ];
  let quotient = '';
  let current = 0;
  for (let i = 0; i < digits.length; i++) {
    current = current * 10 + digits[i];
    const last = i === digits.length - 1;
    if (!quotient && current < b && !last) {
      const next = current * 10 + digits[i + 1];
      steps.push({
        text: `${current} קטן מ־${b}, אז לוקחים גם את הספרה הבאה: ${next}`,
        speak: ['המספר קטן מדי, אז לוקחים גם את הספרה הבאה:', ...numberClips(next)],
        visual: { type: 'longDiv', a, b, quotient },
      });
      continue;
    }
    const times = Math.floor(current / b);
    const take = times * b;
    const left = current - take;
    quotient += times;
    const lines = [`כמה פעמים ${b} נכנס ב־${current}? ${times} פעמים.`, `${ltr(`${times} × ${b} = ${take}`)}, נשאר ${left}.`];
    const speak: Speech = ['כמה פעמים', w(b), 'נכנס ב', ...numberClips(current), w(times), 'פעמים.', `${w(times)} כפול`, w(b), 'זה', ...numberClips(take), 'נשאר', w(left)];
    if (!last) {
      const next = left * 10 + digits[i + 1];
      lines.push(`מורידים את הספרה הבאה: ${next}`);
      speak.push('מורידים את הספרה הבאה, ועכשיו יש', ...numberClips(next));
    }
    steps.push({ text: lines.join('\n'), speak, visual: { type: 'longDiv', a, b, quotient, work: { from: current, take, left } } });
    current = left;
  }
  const answer = Math.floor(a / b);
  steps.push({
    text: ltr(`${a} ÷ ${b} = ${answer}`),
    speak: ['התשובה היא', ...numberClips(answer)],
    visual: { type: 'longDiv', a, b, quotient: String(answer) },
  });
  return steps;
}
