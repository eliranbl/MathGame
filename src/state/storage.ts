import { ALL_LEVELS, levelsOf, type World } from '../engine/levels';
import { WORLDS } from '../engine/worlds';

export interface LevelProgress {
  unlocked: boolean;
  completed: boolean;
  bestStars: number;
  difficulty: number;
  rounds: number;
  answered: number;
  correctFirstTry: number;
}

/** The endless challenge at the end of a world. */
export interface ChallengeProgress {
  /** Stages passed so far; the next one to play is `passed + 1`. */
  passed: number;
}

export interface Profile {
  id: string;
  name: string;
  color: string;
  totalScore: number;
  playSeconds: number;
  levels: Record<number, LevelProgress>;
  /** Exercise key → number of wrong answers. */
  mistakes: Record<string, number>;
  /** Level ids whose dinosaur hatched. */
  collected: number[];
  challenge: Partial<Record<World, ChallengeProgress>>;
  /** Most facts solved in one speed challenge. */
  speedBest?: number;
  createdAt: number;
}

export interface Settings {
  muted: boolean;
  roundLength: number;
  /** Read-aloud levels listen through the microphone. Off until a parent allows it, since the voice goes to the browser's recognition service. */
  micEnabled: boolean;
}

export interface GameData {
  version: 1;
  activeId: string | null;
  profiles: Profile[];
  settings: Settings;
}

const STORAGE_KEY = 'dino-math:v1';

export const DEFAULT_SETTINGS: Settings = { muted: false, roundLength: 10, micEnabled: false };

export function freshLevels(): Record<number, LevelProgress> {
  const levels: Record<number, LevelProgress> = {};
  const firsts = WORLDS.map((w) => levelsOf(w.id)[0].id);
  for (const l of ALL_LEVELS) {
    levels[l.id] = {
      unlocked: firsts.includes(l.id),
      completed: false,
      bestStars: 0,
      difficulty: 0,
      rounds: 0,
      answered: 0,
      correctFirstTry: 0,
    };
  }
  return levels;
}

export function createProfile(name: string, color: string): Profile {
  return {
    id: Math.random().toString(36).slice(2, 10),
    name,
    color,
    totalScore: 0,
    playSeconds: 0,
    levels: freshLevels(),
    mistakes: {},
    collected: [],
    challenge: {},
    createdAt: Date.now(),
  };
}

export function emptyData(): GameData {
  return { version: 1, activeId: null, profiles: [], settings: { ...DEFAULT_SETTINGS } };
}

export function loadData(): GameData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    const parsed = JSON.parse(raw) as GameData;
    if (parsed.version !== 1 || !Array.isArray(parsed.profiles)) return emptyData();
    // Fill in any levels added after the profile was created.
    for (const p of parsed.profiles) {
      p.levels = { ...freshLevels(), ...p.levels };
      p.challenge ??= {};
    }
    return { ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } };
  } catch {
    return emptyData();
  }
}

export function saveData(data: GameData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage may be unavailable (private mode); the game still works for this session.
  }
}
