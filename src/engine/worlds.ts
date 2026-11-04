import type { World } from './levels';

export interface WorldInfo {
  id: World;
  name: string;
  /** Shown on the world card and the map badge. */
  sign: string;
  font: '' | 'heb' | 'eng';
  dir: 'rtl' | 'ltr';
  lang?: 'en';
  /** Level whose dinosaur stands on the world card. */
  dino: number;
  /** Who the world is for, shown on its card. */
  age: string;
}

/** Every world, in the order they appear. Screens read names and looks from here. */
export const WORLDS: WorldInfo[] = [
  { id: 'math', name: 'חשבון', sign: '1 2 3', font: '', dir: 'ltr', dino: 1, age: 'גן – כיתה ד׳' },
  { id: 'reading', name: 'קריאה', sign: 'א ב ג', font: 'heb', dir: 'rtl', dino: 101, age: 'גן – כיתה א׳' },
  { id: 'english', name: 'אנגלית', sign: 'A B C', font: 'eng', dir: 'ltr', lang: 'en', dino: 201, age: 'גן – כיתה ג׳' },
];

export const worldInfo = (id: World) => WORLDS.find((w) => w.id === id)!;
