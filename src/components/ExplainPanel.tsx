import { useEffect, useState } from 'react';
import { speak, stopSpeaking } from '../audio/speech';
import type { ExplainStep, ExplainVisual } from '../engine/explain';
import { ShareView } from './ShareView';

interface Props {
  steps: ExplainStep[];
  onClose: () => void;
}

/** Long division drawn the school way: the quotient above, the dividend and divisor, and the last subtraction. */
function LongDivBoard({ a, b, quotient, work }: Extract<ExplainVisual, { type: 'longDiv' }>) {
  return (
    <div className="longdiv" dir="ltr">
      <div className="longdiv-quotient">{quotient || ' '}</div>
      <div className="longdiv-line">
        <span className="longdiv-dividend">{a}</span>
        <span className="longdiv-divisor">÷ {b}</span>
      </div>
      {work && (
        <div className="longdiv-work">
          {work.from} − {work.take} = <b>{work.left}</b>
        </div>
      )}
    </div>
  );
}

function Visual({ visual }: { visual: ExplainVisual }) {
  switch (visual.type) {
    case 'share':
      return <ShareView total={visual.total} groups={visual.groups} dealt={visual.dealt} item={visual.item} />;
    case 'longDiv':
      return <LongDivBoard {...visual} />;
  }
}

/** "How do you solve it?": one step at a time, each one read aloud. */
export function ExplainPanel({ steps, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const last = index === steps.length - 1;

  useEffect(() => {
    speak(step.speak);
  }, [step]);

  useEffect(() => () => stopSpeaking(), []);

  return (
    <div className="explain" role="dialog" aria-modal="true" aria-label="הסבר">
      <div className="explain-card">
        <div className="explain-head">
          <span className="explain-title">💡 איך פותרים?</span>
          <span className="explain-count" dir="ltr">
            {index + 1} / {steps.length}
          </span>
        </div>
        {step.visual && (
          <div className="explain-visual" key={index}>
            <Visual visual={step.visual} />
          </div>
        )}
        <p className="explain-text">{step.text}</p>
        <div className="explain-actions">
          <button className="big-btn big-btn--secondary" onClick={() => setIndex(index - 1)} disabled={index === 0} aria-label="הקודם">
            ▶
          </button>
          <button className="big-btn big-btn--secondary" onClick={() => speak(step.speak)} aria-label="להקשיב שוב">
            🔊
          </button>
          {last ? (
            <button className="big-btn" onClick={onClose} aria-label="הבנתי">
              👍
            </button>
          ) : (
            <button className="big-btn" onClick={() => setIndex(index + 1)} aria-label="הבא">
              ◀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
