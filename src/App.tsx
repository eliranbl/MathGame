import { useEffect, useState } from 'react';
import { setMuted } from './audio/speech';
import { setSfxMuted } from './audio/sfx';
import { challengeDifficulty, challengeOpen, pickChallengeLevel } from './engine/challenge';
import { getLevel, levelsOf, nextLevelId, type World } from './engine/levels';
import { useGameData, type RoundOutcome, type RoundResult } from './state/useGameData';
import { Scenery } from './components/Common';
import { avatarDino, dinoForLevel } from './components/dinos';
import { Collection } from './screens/Collection';
import { LevelMap } from './screens/LevelMap';
import { ParentsArea } from './screens/ParentsArea';
import { PlayScreen } from './screens/PlayScreen';
import { ProfileSelect } from './screens/ProfileSelect';
import { RewardScreen } from './screens/RewardScreen';
import { SpeedScreen } from './screens/SpeedScreen';
import { WorldSelect } from './screens/WorldSelect';

type Screen =
  | { name: 'profiles' }
  | { name: 'worlds' }
  | { name: 'map'; world: World }
  | { name: 'play'; levelId: number; round: number }
  | { name: 'reward'; levelId: number; result: RoundResult; outcome: RoundOutcome }
  | { name: 'challenge'; world: World; round: number }
  | { name: 'challengeReward'; world: World; result: RoundResult; outcome: RoundOutcome }
  | { name: 'speed'; round: number }
  | { name: 'collection'; world: World }
  | { name: 'parents'; from: World | 'worlds' | null };

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
  const playChallenge = (world: World) => setScreen({ name: 'challenge', world, round: Date.now() });
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
            micEnabled={data.settings.micEnabled}
            onParents={() => setScreen({ name: 'parents', from: 'worlds' })}
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
            onChallenge={() => playChallenge(screen.world)}
            onSpeed={() => setScreen({ name: 'speed', round: Date.now() })}
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
            micEnabled={data.settings.micEnabled}
            onToggleMute={toggleMute}
            onExit={() => toMap(screen.levelId)}
            onFinish={(result) => {
              const outcome = game.recordRound(result);
              setScreen({ name: 'reward', levelId: screen.levelId, result, outcome });
            }}
          />
        );
      break;
    case 'reward': {
      const next = nextLevelId(screen.levelId);
      const world = getLevel(screen.levelId).world;
      // After the world's last level, "next" leads into its endless challenge.
      const toChallenge = !next && !!profile && challengeOpen(world, (id) => !!profile.levels[id]?.completed);
      content = (
        <RewardScreen
          dino={dinoForLevel(screen.levelId)}
          result={screen.result}
          outcome={screen.outcome}
          hasNext={next !== null || toChallenge}
          onReplay={() => play(screen.levelId)}
          onNext={() => (next ? play(next) : playChallenge(world))}
          onMap={() => toMap(screen.levelId)}
        />
      );
      break;
    }
    case 'challenge':
      if (profile) {
        const { world } = screen;
        const stage = (profile.challenge[world]?.passed ?? 0) + 1;
        content = (
          <PlayScreen
            key={screen.round}
            level={levelsOf(world)[levelsOf(world).length - 1]}
            pickLevel={() => pickChallengeLevel(world, stage)}
            startDifficulty={challengeDifficulty(stage)}
            roundLength={data.settings.roundLength}
            profileColor={profile.color}
            totalScore={profile.totalScore}
            muted={data.settings.muted}
            micEnabled={data.settings.micEnabled}
            onToggleMute={toggleMute}
            onExit={() => setScreen({ name: 'map', world })}
            onFinish={(result) => {
              const outcome = game.recordChallenge(world, result);
              setScreen({ name: 'challengeReward', world, result, outcome });
            }}
          />
        );
      }
      break;
    case 'challengeReward':
      if (profile)
        content = (
          <RewardScreen
            dino={avatarDino(profile.color)}
            result={screen.result}
            outcome={screen.outcome}
            hasNext
            onReplay={() => playChallenge(screen.world)}
            onNext={() => playChallenge(screen.world)}
            onMap={() => setScreen({ name: 'map', world: screen.world })}
          />
        );
      break;
    case 'speed':
      if (profile)
        content = (
          <SpeedScreen
            key={screen.round}
            profileColor={profile.color}
            best={profile.speedBest ?? 0}
            onExit={() => setScreen({ name: 'map', world: 'math' })}
            onFinish={game.recordSpeed}
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
          onBack={() =>
            setScreen(
              !profile || !screen.from
                ? { name: 'profiles' }
                : screen.from === 'worlds'
                  ? { name: 'worlds' }
                  : { name: 'map', world: screen.from },
            )
          }
          onUpdateSettings={game.updateSettings}
          onUnlockUpTo={game.unlockUpTo}
          onReset={game.resetProfile}
          onDelete={game.deleteProfile}
        />
      );
      break;
  }

  return (
    <div className={`app ${screen.name === 'map' && screen.world !== 'math' ? `app--${screen.world}` : ''}`}>
      <Scenery />
      <main>{content}</main>
    </div>
  );
}
