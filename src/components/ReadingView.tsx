import type { ReadingQuestion } from '../engine/reading/generator';

interface Props {
  question: ReadingQuestion;
  /** Spelling: how many letters are already in place. */
  placed: number;
  revealed: boolean;
  onReplay: () => void;
}

export function ReadingView({ question: q, placed, revealed, onReplay }: Props) {
  const font = q.lang === 'en' ? 'eng' : 'heb';
  const dir = q.lang === 'en' ? 'ltr' : 'rtl';
  return (
    <div className="reading">
      {q.prompt.listen && (
        <button className="listen-btn" onClick={onReplay} aria-label="להקשיב שוב">
          👂
        </button>
      )}
      {q.prompt.emoji && <div className="reading-emoji">{q.prompt.emoji}</div>}
      {q.prompt.letter && <div className={`reading-letter ${font}`}>{q.prompt.letter}</div>}
      {q.prompt.word && <div className={`reading-word ${font}`} dir={dir}>{q.prompt.word}</div>}
      {q.spell && (
        <div className="spell-slots" dir={dir}>
          {q.spell.letters.map((letter, i) => {
            const filled = i < placed || revealed;
            return (
              <span key={i} className={`spell-slot ${font} ${filled ? 'spell-slot--filled' : ''} ${revealed && i >= placed ? 'spell-slot--revealed' : ''}`}>
                {filled ? letter : ''}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
