export type DinoBody = 'biped' | 'quad' | 'longneck' | 'flyer';
export type DinoExtra = 'none' | 'plates' | 'frill' | 'club' | 'sail' | 'crest' | 'dome' | 'spikes' | 'spots' | 'crown';

export interface DinoDef {
  /** The level that hatches this dinosaur. */
  levelId: number;
  name: string;
  body: DinoBody;
  extra: DinoExtra;
  color: string;
  belly: string;
  accent: string;
}

export const DINOS: DinoDef[] = [
  { levelId: 1, name: 'טי-רקס', body: 'biped', extra: 'none', color: '#6cc24a', belly: '#d7f5a8', accent: '#3f8f2a' },
  { levelId: 2, name: 'טריצרטופס', body: 'quad', extra: 'frill', color: '#ff9f43', belly: '#ffe0b8', accent: '#e8590c' },
  { levelId: 3, name: 'סטגוזאורוס', body: 'quad', extra: 'plates', color: '#2ec4b6', belly: '#c7f7ef', accent: '#f15bb5' },
  { levelId: 4, name: 'ברכיוזאורוס', body: 'longneck', extra: 'spots', color: '#9b72e8', belly: '#e6dafc', accent: '#6741c4' },
  { levelId: 5, name: 'פטרודקטיל', body: 'flyer', extra: 'crest', color: '#ff6b81', belly: '#ffd6dd', accent: '#ffb84d' },
  { levelId: 6, name: 'אנקילוזאורוס', body: 'quad', extra: 'club', color: '#c08552', belly: '#f3dcc0', accent: '#7a4a24' },
  { levelId: 7, name: 'ספינוזאורוס', body: 'biped', extra: 'sail', color: '#4d96ff', belly: '#d2e4ff', accent: '#ff7b54' },
  { levelId: 8, name: 'דיפלודוקוס', body: 'longneck', extra: 'none', color: '#ff8fab', belly: '#ffe3ec', accent: '#c9184a' },
  { levelId: 9, name: 'פרזאורולופוס', body: 'biped', extra: 'crest', color: '#ffd23f', belly: '#fff5c2', accent: '#ee6c4d' },
  { levelId: 10, name: 'פכיצפלוזאורוס', body: 'biped', extra: 'dome', color: '#8ac926', belly: '#e4f7c0', accent: '#6a4c93' },
  { levelId: 11, name: 'ולוצירפטור', body: 'biped', extra: 'spikes', color: '#5e60ce', belly: '#d9daf7', accent: '#48bfe3' },
  { levelId: 12, name: 'מלך הדינוזאורים', body: 'biped', extra: 'crown', color: '#f4a261', belly: '#fde4c8', accent: '#ffd700' },
  // Reading world
  { levelId: 101, name: 'איגואנודון', body: 'biped', extra: 'none', color: '#26a69a', belly: '#c8f2ec', accent: '#00796b' },
  { levelId: 102, name: 'קרנוטאורוס', body: 'biped', extra: 'spikes', color: '#e76f51', belly: '#fbd9cf', accent: '#9d0208' },
  { levelId: 103, name: 'ארכאופטריקס', body: 'flyer', extra: 'crest', color: '#3a86ff', belly: '#d6e6ff', accent: '#ffbe0b' },
  { levelId: 104, name: 'קנטרוזאורוס', body: 'quad', extra: 'plates', color: '#8338ec', belly: '#e6d6fb', accent: '#ffbe0b' },
  { levelId: 105, name: 'סטירקוזאורוס', body: 'quad', extra: 'frill', color: '#06d6a0', belly: '#ccf7ea', accent: '#ef476f' },
  { levelId: 106, name: 'אפטוזאורוס', body: 'longneck', extra: 'spots', color: '#ffbe0b', belly: '#fff2c4', accent: '#fb5607' },
  { levelId: 107, name: 'קצלקואטלוס', body: 'flyer', extra: 'crest', color: '#fb5607', belly: '#ffe0cc', accent: '#3a86ff' },
  { levelId: 108, name: 'בריוניקס', body: 'biped', extra: 'sail', color: '#118ab2', belly: '#cfeaf4', accent: '#06d6a0' },
  { levelId: 109, name: 'למבאוזאורוס', body: 'biped', extra: 'crest', color: '#ef476f', belly: '#fcd5de', accent: '#ffd166' },
  { levelId: 110, name: 'מלכת האותיות', body: 'biped', extra: 'crown', color: '#b5179e', belly: '#f6d1ee', accent: '#ffd700' },
];

export const PROFILE_COLORS = ['#6cc24a', '#4d96ff', '#ff6b81', '#ffd23f', '#9b72e8', '#ff9f43'];

export function dinoForLevel(levelId: number): DinoDef {
  return DINOS.find((d) => d.levelId === levelId) ?? DINOS[0];
}

/** The profile's companion: a T-rex in the profile's color. */
export function avatarDino(color: string): DinoDef {
  return { ...DINOS[0], color, belly: '#fff6dc', accent: color };
}
