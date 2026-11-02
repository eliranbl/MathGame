import { DINOS } from '../components/dinos';
import { generateQuestion } from '../engine/generator';
import { numberWord } from '../engine/hebrew';
import { ALL_LEVELS } from '../engine/levels';
import { generateReadingQuestion } from '../engine/reading/generator';
import { ENGLISH_LETTERS, ENGLISH_WORDS, englishLetterName } from '../engine/reading/english';
import { LETTER_NAMES, SYLLABLE_CONSONANTS, WORDS, syllable } from '../engine/reading/words';
import { LINES } from './lines';
import { toClips, type Speech } from './speech';

/** Seeded random, so the catalog is the same on every run. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

/** Every sentence the game can say, for the script that records the clips. */
export function allClips(): string[] {
  const clips = new Set<string>();
  const add = (speech: Speech) => toClips(speech).forEach((c) => typeof c === 'string' && clips.add(c));

  Object.values(LINES).forEach((v) => add(v));
  ALL_LEVELS.forEach((l) => add(l.name));
  DINOS.forEach((d) => add(d.name));

  // Every number, letter, word and syllable, so rare exercises are covered too.
  for (let n = 0; n <= 100; n++) add([numberWord(n), `${numberWord(n)} ועוד`, `${numberWord(n)} פחות`, `${numberWord(n)} כפול`]);
  add(Object.values(LETTER_NAMES));
  add(WORDS.map((w) => w.text));
  add(ENGLISH_LETTERS.map(englishLetterName));
  add(ENGLISH_WORDS.flatMap((w) => [w.text, w.meaning!]));
  for (const c of SYLLABLE_CONSONANTS) for (const v of ['a', 'i', 'e', 'o', 'u'] as const) add(syllable(c, v).spoken);

  // The fixed wording around them comes from the generators themselves.
  const rng = seeded(1);
  for (const level of ALL_LEVELS) {
    for (const d of [0, 0.5, 1]) {
      for (let i = 0; i < 200; i++) {
        const q = level.world === 'math' ? generateQuestion(level, d, [], rng) : generateReadingQuestion(level, d, [], rng);
        add(q.speak);
        add(q.revealSpeak);
        if (q.world === 'reading') add(q.hintSpeak);
      }
    }
  }
  return [...clips].sort();
}
