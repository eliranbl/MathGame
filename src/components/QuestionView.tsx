import type { Question } from '../engine/generator';
import { ObjectGroup } from './ObjectGroup';

interface Props {
  question: Question;
  /** Digits typed on the number pad. */
  typed?: string;
  hint: boolean;
  revealed: boolean;
  /** Values already picked wrong (used by compare). */
  wrongPicks: number[];
  onPickGroup: (value: number) => void;
}

function Expression({ q, typed, revealed }: { q: Question; typed?: string; revealed: boolean }) {
  return (
    <div className="expression" dir="ltr">
      {q.tokens.map((t, i) => {
        if (t !== '?') return <span key={i} className={/\d/.test(t) ? 'expr-num' : 'expr-op'}>{t}</span>;
        const value = revealed ? String(q.answer) : typed || '?';
        return (
          <span key={i} className={`expr-slot ${revealed ? 'expr-slot--revealed' : ''} ${typed ? 'expr-slot--typed' : ''}`}>
            {value}
          </span>
        );
      })}
    </div>
  );
}

function Pictures({ q, hint }: { q: Question; hint: boolean }) {
  switch (q.kind) {
    case 'count':
      return <ObjectGroup count={q.a} item={q.item} hint={hint} />;
    case 'add':
      return (
        <div className={`pictures-row ${q.answer > 10 ? 'pictures-row--wide' : ''}`} dir="ltr">
          <div className="pictures-slot">
            <ObjectGroup count={q.a} item={q.item} hint={hint} />
          </div>
          <span className="pictures-op">+</span>
          <div className="pictures-slot">
            <ObjectGroup count={q.b} item={q.item} hint={hint} />
          </div>
        </div>
      );
    case 'sub':
      return <ObjectGroup count={q.a} item={q.item} crossed={q.b} hint={hint} />;
    case 'missing':
      return <ObjectGroup count={q.total} item={q.item} ghost={q.answer} hint={hint} />;
    default:
      return null;
  }
}

export function QuestionView({ question: q, typed, hint, revealed, wrongPicks, onPickGroup }: Props) {
  if (q.kind === 'compare') {
    return (
      <div className="compare">
        {[q.a, q.b].map((n, i) => {
          const wrong = wrongPicks.includes(n);
          const correct = revealed && n === q.answer;
          return (
            <button
              key={i}
              className={`compare-card ${wrong ? 'compare-card--wrong' : ''} ${correct ? 'compare-card--correct' : ''}`}
              onClick={() => onPickGroup(n)}
              disabled={wrong || revealed}
              aria-label={`קבוצה ${i + 1}`}
            >
              <ObjectGroup count={n} item={q.item} hint={hint} />
            </button>
          );
        })}
      </div>
    );
  }

  // Number-only levels show pictures as a hint after a mistake.
  const showPictures = q.pictures || hint;
  return (
    <div className="question">
      {showPictures && (
        <div className={`pictures ${q.pictures ? '' : 'pictures--hint'}`}>
          <Pictures q={q} hint={hint && q.pictures} />
        </div>
      )}
      {q.tokens.length > 0 && <Expression q={q} typed={typed} revealed={revealed} />}
    </div>
  );
}
