import type { ChoiceStyle } from '../engine/reading/generator';

interface Props {
  choices: string[];
  style: ChoiceStyle;
  wrongPicks: string[];
  /** Highlight this value as the right answer. */
  correct: string | null;
  disabled: boolean;
  onPick: (value: string) => void;
}

const COLORS = ['#ff9f43', '#4d96ff', '#9b72e8', '#ff6b81'];

/** Answer buttons showing letters, syllables, words or pictures. */
export function TileChoices({ choices, style, wrongPicks, correct, disabled, onPick }: Props) {
  return (
    <div className={`choices choices--${style}`}>
      {choices.map((c, i) => {
        const wrong = wrongPicks.includes(c);
        const isCorrect = correct === c;
        return (
          <button
            key={c}
            className={`choice tile tile--${style} ${style === 'emoji' ? '' : 'heb'} ${wrong ? 'choice--wrong' : ''} ${isCorrect ? 'choice--correct' : ''}`}
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
