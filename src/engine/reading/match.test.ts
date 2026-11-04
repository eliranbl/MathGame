import { describe, expect, it } from 'vitest';
import { matchesSpoken } from './match';

describe('matchesSpoken', () => {
  it('ignores niqqud and final letter forms', () => {
    expect(matchesSpoken('כֶּלֶב', ['כלב'])).toBe(true);
    expect(matchesSpoken('יָם', ['ים'])).toBe(true);
    expect(matchesSpoken('עֵץ', ['עץ.'])).toBe(true);
  });

  it('ignores English case and punctuation', () => {
    expect(matchesSpoken('dog', ['Dog!'])).toBe(true);
  });

  it('finds the word inside a longer phrase or any alternative', () => {
    expect(matchesSpoken('כֶּלֶב', ['זה כלב'])).toBe(true);
    expect(matchesSpoken('כֶּלֶב', ['קלב', 'הכלב'])).toBe(true);
    expect(matchesSpoken('cat', ['a cat'])).toBe(true);
  });

  it('accepts Hebrew letters that sound the same', () => {
    expect(matchesSpoken('קוֹף', ['כוף'])).toBe(true);
    expect(matchesSpoken('תּוּת', ['טוט'])).toBe(true);
    expect(matchesSpoken('עֵץ', ['אץ'])).toBe(true);
    expect(matchesSpoken('סוּס', ['שוש'])).toBe(true);
    expect(matchesSpoken('חָלָב', ['כלב'])).toBe(true);
  });

  it('accepts full or missing vowel letters', () => {
    expect(matchesSpoken('בַּיִת', ['בת'])).toBe(true);
    expect(matchesSpoken('גֶּזֶר', ['גיזר'])).toBe(true);
    expect(matchesSpoken('פָּרָה', ['פר'])).toBe(true);
  });

  it('forgives one wrong letter in longer words only', () => {
    expect(matchesSpoken('שֶׁמֶשׁ', ['שמש', 'שמר'])).toBe(true);
    expect(matchesSpoken('גָּמָל', ['גמר'])).toBe(true);
    expect(matchesSpoken('דָּג', ['דב'])).toBe(false);
    expect(matchesSpoken('יָד', ['ים'])).toBe(false);
  });

  it('joins a word the recognizer split', () => {
    expect(matchesSpoken('כֶּלֶב', ['כ לב'])).toBe(true);
  });

  it('rejects other words', () => {
    expect(matchesSpoken('פֶּה', ['אף'])).toBe(false);
    expect(matchesSpoken('לֵב', ['כלב'])).toBe(false);
    expect(matchesSpoken('כֶּלֶב', ['כלבים', 'לב'])).toBe(false);
    expect(matchesSpoken('cat', ['cut', 'category'])).toBe(false);
    expect(matchesSpoken('dog', [])).toBe(false);
  });
});
