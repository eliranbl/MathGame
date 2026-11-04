import { useEffect, useRef, useState } from 'react';
import { LINES } from '../audio/lines';
import { speak, stopSpeaking } from '../audio/speech';
import { sfx } from '../audio/sfx';
import { SPEED_SECONDS, speedFact } from '../engine/speed';
import { Confetti, IconButton } from '../components/Common';
import { Dino } from '../components/Dino';
import { avatarDino } from '../components/dinos';
import { NumberPad } from '../components/NumberPad';

interface Props {
  profileColor: string;
  best: number;
  onExit: () => void;
  /** Reports the score once time is up; returns whether it is a new record. */
  onFinish: (score: number) => boolean;
}

/** Times-table sprint: as many facts as possible in a minute. An answer is checked as soon as it has as many digits as the right one. */
export function SpeedScreen({ profileColor, best, onExit, onFinish }: Props) {
  const [phase, setPhase] = useState<'ready' | 'play' | 'done'>('ready');
  const [fact, setFact] = useState(() => speedFact());
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(SPEED_SECONDS);
  const [record, setRecord] = useState(false);
  const [shake, setShake] = useState(0);
  const scoreRef = useRef(0);

  useEffect(() => () => stopSpeaking(), []);

  useEffect(() => {
    if (phase !== 'play') return;
    const started = Date.now();
    const id = window.setInterval(() => {
      const remaining = SPEED_SECONDS - Math.floor((Date.now() - started) / 1000);
      setLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        clearInterval(id);
        const isRecord = onFinish(scoreRef.current);
        setRecord(isRecord);
        setPhase('done');
        sfx.levelUp();
        speak(isRecord ? LINES.newRecord : LINES.timeUp);
      }
    }, 250);
    return () => clearInterval(id);
  }, [phase]);

  const start = () => {
    scoreRef.current = 0;
    setScore(0);
    setTyped('');
    setLeft(SPEED_SECONDS);
    setFact(speedFact());
    setPhase('play');
    speak(LINES.speedStart);
  };

  const type = (value: string) => {
    if (phase !== 'play') return;
    setTyped(value);
    if (value.length < String(fact.answer).length) return;
    setTyped('');
    if (Number(value) !== fact.answer) {
      // A wrong answer shakes the fact and it stays, so the child fixes it.
      sfx.wrong();
      setShake((n) => n + 1);
      return;
    }
    sfx.correct();
    scoreRef.current++;
    setScore(scoreRef.current);
    setShake(0);
    setFact(speedFact(Math.random, fact));
  };

  return (
    <div className="screen play speed">
      <header className="topbar">
        <IconButton label="חזרה למפה" onClick={onExit}>
          🏠
        </IconButton>
        <div className="speed-timer" aria-label={`${left} שניות`}>
          <div className="speed-timer-bar" style={{ width: `${(left / SPEED_SECONDS) * 100}%` }} />
          <span>⏱️ {left}</span>
        </div>
        <span className="speed-score" aria-label={`${score} נכונות`}>
          ⚡ {score}
        </span>
      </header>

      <section className="play-card">
        {phase === 'ready' && (
          <div className="speed-intro">
            <Dino dino={avatarDino(profileColor)} mood="happy" size={140} />
            <p>כמה תרגילי כפל וחילוק תפתרו בדקה אחת?</p>
            <p className="muted">השיא שלך: {best}</p>
            <button className="big-btn" onClick={start}>
              ⚡ מתחילים
            </button>
          </div>
        )}
        {phase === 'play' && (
          <div className={`expression speed-fact ${shake ? 'speed-fact--shake' : ''}`} key={`${fact.a}${fact.op}${fact.b}-${shake}`} dir="ltr">
            <span className="expr-num">{fact.a}</span>
            <span className="expr-op">{fact.op}</span>
            <span className="expr-num">{fact.b}</span>
            <span className="expr-op">=</span>
            <span className={`expr-slot ${typed ? 'expr-slot--typed' : ''}`}>{typed || '?'}</span>
          </div>
        )}
        {phase === 'done' && (
          <div className="speed-intro">
            {record && <Confetti />}
            <Dino dino={avatarDino(profileColor)} mood="cheer" size={140} />
            <div className="reward-score">⚡ {score}</div>
            {record ? <div className="reward-trophy">🏆 שיא חדש!</div> : <p className="muted">השיא שלך: {best}</p>}
            <div className="reward-actions">
              <button className="big-btn big-btn--secondary" onClick={onExit} aria-label="למפה">
                🗺️
              </button>
              <button className="big-btn" onClick={start} aria-label="לשחק שוב">
                🔁
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="answer-area">
        {phase === 'play' && <NumberPad value={typed} maxDigits={3} disabled={false} onChange={type} onSubmit={() => {}} />}
      </section>
    </div>
  );
}
