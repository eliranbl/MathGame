/** Fixed sentences said by the screens. Each one is a pre-recorded clip. */
export const LINES = {
  praise: ['כל הכבוד!', 'יופי!', 'מעולה!', 'אלוף!', 'נכון מאוד!', 'וואו, איזה יופי!', 'מצוין!'],
  tryAgain: ['כמעט! ננסה שוב', 'אופס, ננסה עוד פעם', 'לא נורא, נסה שוב'],
  hello: 'שלום',
  whatToPlay: 'מָה נְשַׂחֵק הַיּוֹם?',
  levelLocked: 'השלב הזה עוד נעול',
  finishLevel: 'סיים את השלב',
  toMeetMe: 'כדי לפגוש אותי',
  passedWithEgg: 'כל הכבוד! תראה, ביצה! לחץ עליה',
  passed: 'כל הכבוד! סיימת את השלב',
  almost: 'כמעט! עוד קצת אימון וזה יצליח',
  hatched: 'בקע לך',
  worlds: ['חשבון', 'קריאה', 'אנגלית'],
  challenge: 'אתגר',
  challengeOpened: 'וואו! נפתח אתגר בלי סוף',
  trophy: 'וואו! קיבלת גביע',
  speedStart: 'מוכנים? מתחילים!',
  timeUp: 'נגמר הזמן! כל הכבוד',
  newRecord: 'וואו! שברת שיא!',
  notHeard: ['לא שמעתי טוב, ננסה שוב?', 'אפשר להגיד שוב, בקול?'],
};

const randomOf = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export const phrases = {
  praise: () => randomOf(LINES.praise),
  tryAgain: () => randomOf(LINES.tryAgain),
  notHeard: () => randomOf(LINES.notHeard),
};
