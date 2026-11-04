import { useCallback, useEffect, useState } from 'react';
import { isPassed } from '../engine/adaptive';
import { TROPHY_EVERY } from '../engine/challenge';
import { SPEED_SECONDS } from '../engine/speed';
import { getLevel, levelsOf, nextLevelId, type World } from '../engine/levels';
import { createProfile, freshLevels, loadData, saveData, type GameData, type Profile, type Settings } from './storage';

export interface RoundResult {
  levelId: number;
  total: number;
  correctFirstTry: number;
  score: number;
  stars: number;
  difficulty: number;
  mistakes: string[];
  seconds: number;
}

export interface RoundOutcome {
  passed: boolean;
  /** Level id of a dinosaur hatched for the first time in this round. */
  newDino: number | null;
  unlockedLevel: number | null;
  /** The world's last level was passed for the first time, opening its endless challenge. */
  challengeOpened?: boolean;
  /** Challenge: the stage just passed, when it earned a trophy. */
  trophy?: number;
}

export function useGameData() {
  const [data, setData] = useState<GameData>(loadData);

  useEffect(() => saveData(data), [data]);

  const profile = data.profiles.find((p) => p.id === data.activeId) ?? null;

  const updateProfile = useCallback((id: string, fn: (p: Profile) => Profile) => {
    setData((d) => ({ ...d, profiles: d.profiles.map((p) => (p.id === id ? fn(p) : p)) }));
  }, []);

  const addProfile = useCallback((name: string, color: string) => {
    const p = createProfile(name, color);
    setData((d) => ({ ...d, profiles: [...d.profiles, p], activeId: p.id }));
  }, []);

  const selectProfile = useCallback((id: string | null) => {
    setData((d) => ({ ...d, activeId: id }));
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      profiles: d.profiles.filter((p) => p.id !== id),
      activeId: d.activeId === id ? null : d.activeId,
    }));
  }, []);

  const resetProfile = useCallback(
    (id: string) =>
      updateProfile(id, (p) => ({ ...p, totalScore: 0, playSeconds: 0, levels: freshLevels(), mistakes: {}, collected: [], challenge: {}, speedBest: 0 })),
    [updateProfile],
  );

  /** Unlocks every level of the same world up to and including `levelId`. */
  const unlockUpTo = useCallback(
    (id: string, levelId: number) =>
      updateProfile(id, (p) => {
        const levels = { ...p.levels };
        for (const l of levelsOf(getLevel(levelId).world)) {
          levels[l.id] = { ...levels[l.id], unlocked: l.id <= levelId || levels[l.id].unlocked };
        }
        return { ...p, levels };
      }),
    [updateProfile],
  );

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, []);

  /** Records a finished round on the active profile and reports what changed. */
  const recordRound = useCallback(
    (r: RoundResult): RoundOutcome => {
      if (!profile) return { passed: false, newDino: null, unlockedLevel: null };
      const passed = isPassed(r.correctFirstTry, r.total);
      const newDino = passed && !profile.collected.includes(r.levelId) ? r.levelId : null;
      const next = nextLevelId(r.levelId);
      const unlockedLevel = passed && next && !profile.levels[next].unlocked ? next : null;

      updateProfile(profile.id, (p) => {
        const prev = p.levels[r.levelId];
        const levels = {
          ...p.levels,
          [r.levelId]: {
            ...prev,
            completed: prev.completed || passed,
            bestStars: Math.max(prev.bestStars, r.stars),
            difficulty: r.difficulty,
            rounds: prev.rounds + 1,
            answered: prev.answered + r.total,
            correctFirstTry: prev.correctFirstTry + r.correctFirstTry,
          },
        };
        if (passed && next) levels[next] = { ...levels[next], unlocked: true };
        const mistakes = { ...p.mistakes };
        for (const key of r.mistakes) mistakes[key] = (mistakes[key] ?? 0) + 1;
        return {
          ...p,
          levels,
          mistakes,
          totalScore: p.totalScore + r.score,
          playSeconds: p.playSeconds + r.seconds,
          collected: newDino ? [...p.collected, newDino] : p.collected,
        };
      });
      const challengeOpened = passed && !next && !profile.levels[r.levelId].completed;
      return { passed, newDino, unlockedLevel, challengeOpened };
    },
    [profile, updateProfile],
  );

  /** Records a finished challenge stage: a pass moves on to the next stage, every fifth one earns a trophy. */
  const recordChallenge = useCallback(
    (world: World, r: RoundResult): RoundOutcome => {
      if (!profile) return { passed: false, newDino: null, unlockedLevel: null };
      const passed = isPassed(r.correctFirstTry, r.total);
      const stage = (profile.challenge[world]?.passed ?? 0) + 1;
      const trophy = passed && stage % TROPHY_EVERY === 0 ? stage : undefined;

      updateProfile(profile.id, (p) => {
        const mistakes = { ...p.mistakes };
        for (const key of r.mistakes) mistakes[key] = (mistakes[key] ?? 0) + 1;
        return {
          ...p,
          challenge: { ...p.challenge, [world]: { passed: stage - (passed ? 0 : 1) } },
          mistakes,
          totalScore: p.totalScore + r.score,
          playSeconds: p.playSeconds + r.seconds,
        };
      });
      return { passed, newDino: null, unlockedLevel: null, trophy };
    },
    [profile, updateProfile],
  );

  /** Records a speed challenge: five points a fact, and whether it beat the record. */
  const recordSpeed = useCallback(
    (score: number): boolean => {
      if (!profile) return false;
      const isRecord = score > (profile.speedBest ?? 0);
      updateProfile(profile.id, (p) => ({
        ...p,
        speedBest: Math.max(p.speedBest ?? 0, score),
        totalScore: p.totalScore + score * 5,
        playSeconds: p.playSeconds + SPEED_SECONDS,
      }));
      return isRecord;
    },
    [profile, updateProfile],
  );

  return {
    data,
    profile,
    addProfile,
    selectProfile,
    deleteProfile,
    resetProfile,
    unlockUpTo,
    updateSettings,
    recordRound,
    recordChallenge,
    recordSpeed,
  };
}
