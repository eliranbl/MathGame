import { useEffect } from 'react';
import { LINES } from '../audio/lines';
import { speak } from '../audio/speech';
import type { World } from '../engine/levels';
import { WORLDS } from '../engine/worlds';
import type { Profile } from '../state/storage';
import { ScoreBadge } from '../components/Common';
import { Dino } from '../components/Dino';
import { ConsentBanner } from '../components/ConsentBanner';
import { InstallBanner } from '../components/InstallBanner';
import { MicNotice } from '../components/MicNotice';
import { avatarDino, dinoForLevel } from '../components/dinos';

interface Props {
  profile: Profile;
  micEnabled: boolean;
  onParents: () => void;
  onPick: (world: World) => void;
  onSwitchProfile: () => void;
}

export function WorldSelect({ profile, micEnabled, onParents, onPick, onSwitchProfile }: Props) {
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
            <span className={`world-sign ${w.font}`} dir={w.dir} lang={w.lang}>
              {w.sign}
            </span>
            <Dino dino={dinoForLevel(w.dino)} size={150} />
            <span className="world-name">{w.name}</span>
            <span className="world-age">{w.age}</span>
          </button>
        ))}
      </div>
      <ConsentBanner />
      <InstallBanner />
      <MicNotice micEnabled={micEnabled} onParents={onParents} />
    </div>
  );
}
