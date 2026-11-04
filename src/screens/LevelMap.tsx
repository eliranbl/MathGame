import { useEffect, useRef } from 'react';
import { LINES } from '../audio/lines';
import { speak } from '../audio/speech';
import { challengeOpen, trophiesFor } from '../engine/challenge';
import { numberWord } from '../engine/hebrew';
import { levelsOf, type World } from '../engine/levels';
import { worldInfo } from '../engine/worlds';
import type { Profile } from '../state/storage';
import { IconButton, ScoreBadge, Stars } from '../components/Common';
import { Dino } from '../components/Dino';
import { avatarDino, dinoForLevel } from '../components/dinos';

interface Props {
  world: World;
  profile: Profile;
  muted: boolean;
  onToggleMute: () => void;
  onPlay: (levelId: number) => void;
  onChallenge: () => void;
  onSpeed: () => void;
  onCollection: () => void;
  onParents: () => void;
  onWorlds: () => void;
}

export function LevelMap({ world, profile, muted, onToggleMute, onPlay, onChallenge, onSpeed, onCollection, onParents, onWorlds }: Props) {
  const levels = levelsOf(world);
  const info = worldInfo(world);
  const challenge = challengeOpen(world, (id) => !!profile.levels[id]?.completed);
  const passedStages = profile.challenge[world]?.passed ?? 0;
  const stage = passedStages + 1;
  const trophies = trophiesFor(passedStages);
  // Once the challenge is open the player stands there.
  const current = challenge ? null : Math.max(...levels.filter((l) => profile.levels[l.id]?.unlocked).map((l) => l.id));
  const currentRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, []);

  return (
    <div className="screen map">
      <header className="topbar">
        <IconButton label="בחירת עולם" onClick={onWorlds}>
          🌍
        </IconButton>
        <span className={`world-badge ${info.font}`} dir={info.dir} lang={info.lang}>
          {info.sign}
        </span>
        <ScoreBadge score={profile.totalScore} />
        <div className="topbar-group">
          <IconButton label="האוסף שלי" onClick={onCollection}>
            🥚
          </IconButton>
          <IconButton label={muted ? 'הפעלת קול' : 'השתקה'} onClick={onToggleMute}>
            {muted ? '🔇' : '🔊'}
          </IconButton>
          <IconButton label="הורים" onClick={onParents} className="icon-btn--small">
            🧔
          </IconButton>
        </div>
      </header>

      <div className="trail">
        {levels.map((level, i) => {
          const progress = profile.levels[level.id];
          const locked = !progress?.unlocked;
          const isCurrent = level.id === current;
          const side = ['center', 'right', 'center', 'left'][i % 4];
          return (
            <div key={level.id} className={`trail-stop trail-stop--${side}`}>
              <div className="trail-node">
                <button
                  ref={isCurrent ? currentRef : undefined}
                  className={`stone ${locked ? 'stone--locked' : ''} ${isCurrent ? 'stone--current' : ''} ${progress?.completed ? 'stone--done' : ''}`}
                  onClick={() => {
                    if (locked) {
                      speak(LINES.levelLocked);
                      return;
                    }
                    speak(level.name);
                    onPlay(level.id);
                  }}
                  aria-label={`${level.name}${locked ? ' (נעול)' : ''}`}
                >
                  {locked ? '🔒' : i + 1}
                </button>
                {!locked && <Stars count={progress.bestStars} size={20} />}
                {profile.collected.includes(level.id) && (
                  <span className="trail-dino">
                    <Dino dino={dinoForLevel(level.id)} size={64} />
                  </span>
                )}
                {isCurrent && (
                  <span className="trail-player">
                    <Dino dino={avatarDino(profile.color)} size={80} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div className={`trail-stop trail-stop--${['center', 'right', 'center', 'left'][levels.length % 4]}`}>
          <div className="trail-node">
            <button
              ref={challenge ? currentRef : undefined}
              className={`stone stone--challenge ${challenge ? 'stone--current' : 'stone--locked'}`}
              onClick={() => {
                if (!challenge) {
                  speak(LINES.levelLocked);
                  return;
                }
                speak(stage <= 100 ? [LINES.challenge, numberWord(stage)] : LINES.challenge);
                onChallenge();
              }}
              aria-label={challenge ? `${LINES.challenge} ${stage}` : `${LINES.challenge} (נעול)`}
            >
              {challenge ? stage : '🏆'}
            </button>
            {challenge && (
              <span className="trail-trophies" aria-label={`${trophies} גביעים`}>
                🏆 {trophies}
              </span>
            )}
            {challenge && (
              <span className="trail-player">
                <Dino dino={avatarDino(profile.color)} size={80} />
              </span>
            )}
          </div>
        </div>
      </div>
      {/* The speed challenge opens with the times table. */}
      {world === 'math' && profile.levels[20]?.completed && (
        <button className="speed-fab" onClick={onSpeed}>
          ⚡ אתגר מהירות
        </button>
      )}
    </div>
  );
}
