import { ALL_LEVELS, levelsOf } from '../engine/levels';

export interface LevelProgress {
  unlocked: boolean;
  completed: boolean;
  bestStars: number;
  difficulty: number;
  rounds: number;
  answered: number;
  correctFirstTry: number;
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
  createdAt: number;
}

export interface Settings {
  muted: boolean;
  roundLength: number;
}

export interface GameData {
  version: 1;
  activeId: string | null;
  profiles: Profile[];
  settings: Settings;
}

const STORAGE_KEY = 'dino-math:v1';

export const DEFAULT_SETTINGS: Settings = { muted: false, roundLength: 10 };

export function freshLevels(): Record<number, LevelProgress> {
  const levels: Record<number, LevelProgress> = {};
  const firsts = [levelsOf('math')[0].id, levelsOf('reading')[0].id];
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
    for (const p of parsed.profiles) p.levels = { ...freshLevels(), ...p.levels };
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
