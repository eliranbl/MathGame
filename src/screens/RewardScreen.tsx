import { useEffect, useState } from 'react';
import { LINES } from '../audio/lines';
import { speak } from '../audio/speech';
import { sfx } from '../audio/sfx';
import type { LevelDef } from '../engine/levels';
import type { RoundOutcome, RoundResult } from '../state/useGameData';
import { Confetti, Stars } from '../components/Common';
import { Dino } from '../components/Dino';
import { dinoForLevel } from '../components/dinos';

interface Props {
  level: LevelDef;
  result: RoundResult;
  outcome: RoundOutcome;
  hasNext: boolean;
  onReplay: () => void;
  onNext: () => void;
  onMap: () => void;
}

function BigEgg({ cracked, color }: { cracked: boolean; color: string }) {
  return (
    <svg viewBox="0 0 120 150" width={150} height={185} className={`big-egg ${cracked ? 'big-egg--cracked' : ''}`}>
      <g stroke="#3b2a1e" strokeWidth={3} strokeLinejoin="round">
        <path className="big-egg-top" d="M18 80 Q20 8 60 6 Q100 8 102 80 L88 70 L76 84 L62 70 L48 84 L34 70 Z" fill="#fff3d6" />
        <path className="big-egg-bottom" d="M18 80 L34 70 L48 84 L62 70 L76 84 L88 70 L102 80 Q104 144 60 144 Q16 144 18 80 Z" fill="#fff3d6" />
        <g fill={color} stroke="none">
          <circle cx={44} cy={40} r={8} />
          <circle cx={80} cy={52} r={6} />
          <circle cx={50} cy={110} r={7} />
          <circle cx={84} cy={116} r={9} />
        </g>
      </g>
    </svg>
  );
}

export function RewardScreen({ level, result, outcome, hasNext, onReplay, onNext, onMap }: Props) {
  const dino = dinoForLevel(level.id);
  const [egg, setEgg] = useState<'whole' | 'cracking' | 'hatched'>('whole');
  const hatched = egg === 'hatched';

  useEffect(() => {
    if (outcome.passed) {
      sfx.levelUp();
      speak(outcome.newDino ? LINES.passedWithEgg : LINES.passed);
    } else {
      speak(LINES.almost);
    }
  }, [outcome]);

  const hatch = () => {
    if (egg !== 'whole') return;
    sfx.crack();
    setEgg('cracking');
    setTimeout(() => {
      setEgg('hatched');
      sfx.levelUp();
      speak([LINES.hatched, dino.name]);
    }, 500);
  };

  return (
    <div className="screen reward">
      {outcome.passed && <Confetti />}
      <div className="reward-card">
        <Stars count={result.stars} size={56} />
        <div className="reward-score" dir="ltr">
          +{result.score} <span aria-hidden="true">🦴</span>
        </div>
        <div className="reward-count" dir="ltr">
          {result.correctFirstTry} / {result.total}
        </div>

        {outcome.newDino ? (
          <button className="hatch" onClick={hatch} aria-label="לפתוח את הביצה">
            {hatched ? (
              <div className="hatch-dino">
                <Dino dino={dino} mood="cheer" size={200} />
                <div className="hatch-name">{dino.name}</div>
              </div>
            ) : (
              <BigEgg cracked={egg === 'cracking'} color={dino.color} />
            )}
          </button>
        ) : (
          <Dino dino={dino} mood={outcome.passed ? 'cheer' : 'think'} size={170} />
        )}

        {outcome.unlockedLevel && (!outcome.newDino || hatched) && <div className="reward-unlock">🔓 שלב חדש נפתח!</div>}

        <div className="reward-actions">
          <button className="big-btn big-btn--secondary" onClick={onMap} aria-label="למפה">
            🗺️
          </button>
          <button className={`big-btn ${outcome.passed ? 'big-btn--secondary' : ''}`} onClick={onReplay} aria-label="לשחק שוב">
            🔁
          </button>
          {outcome.passed && hasNext && (
            <button className="big-btn" onClick={onNext} aria-label="לשלב הבא">
              ▶
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
