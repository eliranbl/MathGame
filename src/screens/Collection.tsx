import { useState } from 'react';
import { LINES } from '../audio/lines';
import { speak } from '../audio/speech';
import { getLevel } from '../engine/levels';
import { WORLDS } from '../engine/worlds';
import type { Profile } from '../state/storage';
import { IconButton } from '../components/Common';
import { Dino } from '../components/Dino';
import { DINOS, type DinoDef } from '../components/dinos';

interface Props {
  profile: Profile;
  onBack: () => void;
}

export function Collection({ profile, onBack }: Props) {
  const [dancing, setDancing] = useState<number | null>(null);

  const renderCard = (d: DinoDef) => {
    const owned = profile.collected.includes(d.levelId);
    const crowned = profile.levels[d.levelId]?.bestStars === 3;
    return (
      <button
        key={d.levelId}
        className={`dino-card ${owned ? '' : 'dino-card--locked'}`}
        onClick={() => {
          if (!owned) {
            speak([LINES.finishLevel, getLevel(d.levelId).name, LINES.toMeetMe]);
            return;
          }
          speak(d.name);
          setDancing(d.levelId);
          setTimeout(() => setDancing(null), 1200);
        }}
      >
        {crowned && owned && <span className="dino-crown">👑</span>}
        <Dino dino={d} size={130} silhouette={!owned} mood={dancing === d.levelId ? 'cheer' : 'happy'} />
        <span className="dino-name">{owned ? d.name : '?'}</span>
      </button>
    );
  };

  return (
    <div className="screen collection">
      <header className="topbar">
        <IconButton label="חזרה" onClick={onBack}>
          🗺️
        </IconButton>
        <h2 className="screen-title">
          האוסף שלי <span dir="ltr">{profile.collected.length} / {DINOS.length}</span>
        </h2>
        <span className="topbar-spacer" />
      </header>
      <div className="dino-sections">
        {WORLDS.map((w) => ({ ...w, dinos: DINOS.filter((d) => getLevel(d.levelId).world === w.id) })).map((section) => (
          <section key={section.id}>
            <h3 className="dino-section-title">{section.name}</h3>
            <div className="dino-grid">{section.dinos.map(renderCard)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
