import type { ChoiceStyle } from '../engine/reading/generator';

interface Props {
  choices: string[];
  style: ChoiceStyle;
  lang: 'he' | 'en';
  wrongPicks: string[];
  /** Highlight this value as the right answer. */
  correct: string | null;
  disabled: boolean;
  onPick: (value: string) => void;
}

// Each deep enough for the white numbers and letters on them (WCAG AA, large text).
const COLORS = ['#db7310', '#3d86ee', '#9b72e8', '#f2557a'];

/** Answer buttons showing letters, syllables, words or pictures. */
export function TileChoices({ choices, style, lang, wrongPicks, correct, disabled, onPick }: Props) {
  return (
    <div className={`choices choices--${style}`}>
      {choices.map((c, i) => {
        const wrong = wrongPicks.includes(c);
        const isCorrect = correct === c;
        return (
          <button
            key={c}
            lang={lang === 'en' && style !== 'emoji' ? 'en' : undefined}
            className={`choice tile tile--${style} ${style === 'emoji' ? '' : lang === 'en' ? 'eng' : 'heb'} ${wrong ? 'choice--wrong' : ''} ${isCorrect ? 'choice--correct' : ''}`}
            style={{ ['--choice-color' as string]: COLORS[i % COLORS.length] }}
            disabled={disabled || wrong}
            onClick={() => onPick(c)}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
