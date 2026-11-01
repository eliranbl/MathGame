import { useEffect, useState } from 'react';
import { setMuted } from './audio/speech';
import { setSfxMuted } from './audio/sfx';
import { getLevel, nextLevelId, type World } from './engine/levels';
import { useGameData, type RoundOutcome, type RoundResult } from './state/useGameData';
import { Scenery } from './components/Common';
import { Collection } from './screens/Collection';
import { LevelMap } from './screens/LevelMap';
import { ParentsArea } from './screens/ParentsArea';
import { PlayScreen } from './screens/PlayScreen';
import { ProfileSelect } from './screens/ProfileSelect';
import { RewardScreen } from './screens/RewardScreen';
import { WorldSelect } from './screens/WorldSelect';

type Screen =
  | { name: 'profiles' }
  | { name: 'worlds' }
  | { name: 'map'; world: World }
  | { name: 'play'; levelId: number; round: number }
  | { name: 'reward'; levelId: number; result: RoundResult; outcome: RoundOutcome }
  | { name: 'collection'; world: World }
  | { name: 'parents'; from: World | null };

export default function App() {
  const game = useGameData();
  const { data, profile } = game;
  const [screen, setScreen] = useState<Screen>(() => (profile ? { name: 'worlds' } : { name: 'profiles' }));

  useEffect(() => {
    setMuted(data.settings.muted);
    setSfxMuted(data.settings.muted);
  }, [data.settings.muted]);

  // A deleted or missing active profile sends the player back to the profile picker.
  const needsProfile = !profile && screen.name !== 'profiles' && screen.name !== 'parents';
  useEffect(() => {
    if (needsProfile) setScreen({ name: 'profiles' });
  }, [needsProfile]);

  const toggleMute = () => game.updateSettings({ muted: !data.settings.muted });
  const play = (levelId: number) => setScreen({ name: 'play', levelId, round: Date.now() });
  const toMap = (levelId: number) => setScreen({ name: 'map', world: getLevel(levelId).world });

  let content: React.ReactNode = null;
  switch (screen.name) {
    case 'profiles':
      content = (
        <ProfileSelect
          profiles={data.profiles}
          onSelect={(id) => {
            game.selectProfile(id);
            setScreen({ name: 'worlds' });
          }}
          onAdd={(name, color) => {
            game.addProfile(name, color);
            setScreen({ name: 'worlds' });
          }}
        />
      );
      break;
    case 'worlds':
      if (profile)
        content = (
          <WorldSelect
            profile={profile}
            onPick={(world) => setScreen({ name: 'map', world })}
            onSwitchProfile={() => {
              game.selectProfile(null);
              setScreen({ name: 'profiles' });
            }}
          />
        );
      break;
    case 'map':
      if (profile)
        content = (
          <LevelMap
            key={screen.world}
            world={screen.world}
            profile={profile}
            muted={data.settings.muted}
            onToggleMute={toggleMute}
            onPlay={play}
            onCollection={() => setScreen({ name: 'collection', world: screen.world })}
            onParents={() => setScreen({ name: 'parents', from: screen.world })}
            onWorlds={() => setScreen({ name: 'worlds' })}
          />
        );
      break;
    case 'play':
      if (profile)
        content = (
          <PlayScreen
            key={screen.round}
            level={getLevel(screen.levelId)}
            startDifficulty={profile.levels[screen.levelId].difficulty}
            roundLength={data.settings.roundLength}
            profileColor={profile.color}
            totalScore={profile.totalScore}
            muted={data.settings.muted}
            onToggleMute={toggleMute}
            onExit={() => toMap(screen.levelId)}
            onFinish={(result) => {
              const outcome = game.recordRound(result);
              setScreen({ name: 'reward', levelId: screen.levelId, result, outcome });
            }}
          />
        );
      break;
    case 'reward':
      content = (
        <RewardScreen
          level={getLevel(screen.levelId)}
          result={screen.result}
          outcome={screen.outcome}
          hasNext={nextLevelId(screen.levelId) !== null}
          onReplay={() => play(screen.levelId)}
          onNext={() => play(nextLevelId(screen.levelId)!)}
          onMap={() => toMap(screen.levelId)}
        />
      );
      break;
    case 'collection':
      if (profile) content = <Collection profile={profile} onBack={() => setScreen({ name: 'map', world: screen.world })} />;
      break;
    case 'parents':
      content = (
        <ParentsArea
          profiles={data.profiles}
          activeId={data.activeId}
          settings={data.settings}
          onBack={() => setScreen(profile && screen.from ? { name: 'map', world: screen.from } : { name: 'profiles' })}
          onUpdateSettings={game.updateSettings}
          onUnlockUpTo={game.unlockUpTo}
          onReset={game.resetProfile}
          onDelete={game.deleteProfile}
        />
      );
      break;
  }

  return (
    <div className={`app ${screen.name === 'map' && screen.world === 'reading' ? 'app--reading' : ''}`}>
      <Scenery />
      {content}
    </div>
  );
}
