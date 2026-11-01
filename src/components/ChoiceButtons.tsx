interface Props {
  choices: number[];
  wrongPicks: number[];
  /** Highlight this value as the right answer. */
  correct: number | null;
  disabled: boolean;
  onPick: (value: number) => void;
}

const COLORS = ['#ff9f43', '#4d96ff', '#9b72e8', '#ff6b81'];

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
