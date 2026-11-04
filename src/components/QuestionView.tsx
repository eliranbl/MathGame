import type { Question } from '../engine/generator';
import { ObjectGroup, TenCartons } from './ObjectGroup';
import { ShareView } from './ShareView';

interface Props {
  question: Question;
  /** Digits typed on the number pad; "4|1" fills two slots (quotient and remainder). */
  typed?: string;
  hint: boolean;
  revealed: boolean;
  /** Values already picked wrong (used by compare). */
  wrongPicks: number[];
  onPickGroup: (value: number) => void;
}

function Expression({ q, typed = '', revealed }: { q: Question; typed?: string; revealed: boolean }) {
  const parts = typed.split('|');
  const answers = [q.answer, q.answer2];
  let slot = -1;
  return (
    <div className={`expression ${q.tokens.length > 5 ? 'expression--long' : ''}`} dir="ltr">
      {q.tokens.map((t, i) => {
        if (t !== '?') return <span key={i} className={/\d/.test(t) ? 'expr-num' : t.length > 1 ? 'expr-word' : 'expr-op'}>{t}</span>;
        slot++;
        const mine = parts[slot] ?? '';
        const active = !revealed && slot === parts.length - 1;
        return (
          <span
            key={i}
            className={`expr-slot ${revealed ? 'expr-slot--revealed' : ''} ${mine ? 'expr-slot--typed' : ''} ${active && q.answer2 !== undefined ? 'expr-slot--active' : ''}`}
          >
            {revealed ? String(answers[slot]) : mine || '?'}
          </span>
        );
      })}
    </div>
  );
}

function Pictures({ q, hint }: { q: Question; hint: boolean }) {
  if (q.tens) {
    return q.kind === 'sub' ? (
      <TenCartons tens={q.a / 10} item={q.item} crossed={q.b / 10} hint={hint} />
    ) : (
      <div className="pictures-row pictures-row--wide" dir="ltr">
        <div className="pictures-slot">
          <TenCartons tens={q.a / 10} item={q.item} hint={hint} />
        </div>
        <span className="pictures-op">+</span>
        <div className="pictures-slot">
          <TenCartons tens={q.b / 10} item={q.item} hint={hint} />
        </div>
      </div>
    );
  }
  switch (q.kind) {
    case 'count':
      return <ObjectGroup count={q.a} item={q.item} hint={hint} />;
    case 'half':
      return <ObjectGroup count={q.total} item={q.item} ghost={q.answer} hint={hint} />;
    case 'mul':
      return (
        <div className="mul-groups" dir="ltr">
          {Array.from({ length: q.a }, (_, i) => (
            <div className="mul-group" key={i}>
              <ObjectGroup count={q.b} item={q.item} hint={hint} size={q.a * q.b > 12 ? 30 : 44} />
            </div>
          ))}
        </div>
      );
    case 'add':
    case 'double':
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
    case 'div':
    case 'divRem':
      return <ShareView total={q.a} groups={q.b} dealt={0} item={q.item} hint={hint} />;
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

  // Number-only levels show pictures as a hint after a mistake, while there are few enough to count.
  const showPictures = q.pictures || (hint && (q.tens || Math.max(q.total, q.answer) <= 20));
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
