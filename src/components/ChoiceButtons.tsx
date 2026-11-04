interface Props {
  choices: number[];
  wrongPicks: number[];
  /** Highlight this value as the right answer. */
  correct: number | null;
  disabled: boolean;
  onPick: (value: number) => void;
}

// Each deep enough for the white numbers and letters on them (WCAG AA, large text).
const COLORS = ['#db7310', '#3d86ee', '#9b72e8', '#f2557a'];

export function ChoiceButtons({ choices, wrongPicks, correct, disabled, onPick }: Props) {
  return (
    <div className="choices" dir="ltr">
      {choices.map((n, i) => {
        const wrong = wrongPicks.includes(n);
        const isCorrect = correct === n;
        return (
          <button
            key={n}
            className={`choice ${wrong ? 'choice--wrong' : ''} ${isCorrect ? 'choice--correct' : ''}`}
            style={{ ['--choice-color' as string]: COLORS[i % COLORS.length] }}
            disabled={disabled || wrong}
            onClick={() => onPick(n)}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
