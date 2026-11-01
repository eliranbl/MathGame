import { useEffect } from 'react';
import { LINES } from '../audio/lines';
import { speak } from '../audio/speech';
import type { World } from '../engine/levels';
import type { Profile } from '../state/storage';
import { ScoreBadge } from '../components/Common';
import { Dino } from '../components/Dino';
import { avatarDino, dinoForLevel } from '../components/dinos';

interface Props {
  profile: Profile;
  onPick: (world: World) => void;
  onSwitchProfile: () => void;
}

const WORLDS: { id: World; name: string; sign: string; dino: number }[] = [
  { id: 'math', name: 'חשבון', sign: '1 2 3', dino: 1 },
  { id: 'reading', name: 'קריאה', sign: 'א ב ג', dino: 101 },
];

export function WorldSelect({ profile, onPick, onSwitchProfile }: Props) {
  useEffect(() => {
    speak([{ say: profile.name }, LINES.whatToPlay]);
  }, [profile.name]);

  return (
    <div className="screen worlds">
      <header className="topbar">
        <button className="who" onClick={onSwitchProfile} aria-label="החלפת שחקן">
          <Dino dino={avatarDino(profile.color)} size={52} />
          <span>{profile.name}</span>
        </button>
        <ScoreBadge score={profile.totalScore} />
        <span className="topbar-spacer" />
      </header>
      <div className="world-grid">
        {WORLDS.map((w) => (
          <button
            key={w.id}
            className={`world-card world-card--${w.id}`}
            onClick={() => {
              speak(w.name);
              onPick(w.id);
            }}
          >
            <span className={`world-sign ${w.id === 'reading' ? 'heb' : ''}`} dir={w.id === 'math' ? 'ltr' : 'rtl'}>
              {w.sign}
            </span>
            <Dino dino={dinoForLevel(w.dino)} size={150} />
            <span className="world-name">{w.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
