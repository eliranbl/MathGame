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
  { levelId: 13, name: 'אלוזאורוס', body: 'biped', extra: 'none', color: '#f28482', belly: '#fde2e1', accent: '#84a59d' },
  { levelId: 14, name: 'פרוטוצרטופס', body: 'quad', extra: 'frill', color: '#90be6d', belly: '#e3f2d7', accent: '#f9c74f' },
  { levelId: 15, name: 'מאיאזאורה', body: 'biped', extra: 'crest', color: '#43aa8b', belly: '#d2eee5', accent: '#f3722c' },
  { levelId: 16, name: 'אורניתומימוס', body: 'biped', extra: 'spots', color: '#f9844a', belly: '#feddc9', accent: '#577590' },
  { levelId: 17, name: 'ארגנטינוזאורוס', body: 'longneck', extra: 'plates', color: '#577590', belly: '#d5dee8', accent: '#f9c74f' },
  { levelId: 18, name: 'טרודון', body: 'biped', extra: 'spikes', color: '#9d4edd', belly: '#ead7f8', accent: '#ff9e00' },
  { levelId: 19, name: 'פטרנודון', body: 'flyer', extra: 'crest', color: '#00b4d8', belly: '#ccf1f8', accent: '#ff006e' },
  { levelId: 20, name: 'קיסר המספרים', body: 'biped', extra: 'crown', color: '#e63946', belly: '#fbd5d8', accent: '#ffd700' },
  { levelId: 21, name: 'גיגנוטוזאורוס', body: 'biped', extra: 'spikes', color: '#bc4749', belly: '#f2d4d5', accent: '#6a994e' },
  { levelId: 22, name: 'פסיטקוזאורוס', body: 'quad', extra: 'frill', color: '#6a994e', belly: '#dbebd0', accent: '#f2e8cf' },
  { levelId: 23, name: 'ברוכיוזאורוס', body: 'longneck', extra: 'spots', color: '#386641', belly: '#d0e0d4', accent: '#f4a259' },
  { levelId: 24, name: 'טרודון החכם', body: 'biped', extra: 'crest', color: '#f4a259', belly: '#fde5d0', accent: '#5b8e7d' },
  { levelId: 25, name: 'אוביראפטור', body: 'biped', extra: 'crest', color: '#5b8e7d', belly: '#d3e5df', accent: '#bc4b51' },
  { levelId: 26, name: 'אדון החילוק', body: 'biped', extra: 'crown', color: '#264653', belly: '#cfdde2', accent: '#ffd700' },
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
  { levelId: 111, name: 'מיקרורפטור', body: 'flyer', extra: 'spots', color: '#00a6a6', belly: '#c9f0f0', accent: '#efca08' },
  // English world
  { levelId: 201, name: 'קומפסוגנתוס', body: 'biped', extra: 'none', color: '#ff70a6', belly: '#ffd9e8', accent: '#70d6ff' },
  { levelId: 202, name: 'קמרזאורוס', body: 'longneck', extra: 'spots', color: '#70d6ff', belly: '#d9f4ff', accent: '#ff9770' },
  { levelId: 203, name: 'קוריתוזאורוס', body: 'biped', extra: 'crest', color: '#ff9770', belly: '#ffe3d6', accent: '#7b2cbf' },
  { levelId: 204, name: 'סאורופלטה', body: 'quad', extra: 'spikes', color: '#7b2cbf', belly: '#e4d4f4', accent: '#ffd670' },
  { levelId: 205, name: 'דימורפודון', body: 'flyer', extra: 'crest', color: '#e9ff70', belly: '#f8ffd6', accent: '#ff70a6' },
  { levelId: 206, name: 'דילופוזאורוס', body: 'biped', extra: 'crest', color: '#2a9d8f', belly: '#cfeeea', accent: '#e9c46a' },
  { levelId: 207, name: 'סקלידוזאורוס', body: 'quad', extra: 'plates', color: '#e9c46a', belly: '#faf0d4', accent: '#264653' },
  { levelId: 208, name: 'אוראנוזאורוס', body: 'biped', extra: 'sail', color: '#f4a261', belly: '#fde6d2', accent: '#2a9d8f' },
  { levelId: 209, name: 'מאמנצ׳יזאורוס', body: 'longneck', extra: 'none', color: '#a2d2ff', belly: '#e6f2ff', accent: '#cdb4db' },
  { levelId: 210, name: 'נסיך האלף-בית', body: 'biped', extra: 'crown', color: '#3a0ca3', belly: '#dcd3f5', accent: '#ffd700' },
  { levelId: 211, name: 'ספינופס', body: 'quad', extra: 'frill', color: '#f08700', belly: '#fde2c2', accent: '#00a6a6' },
];

export const PROFILE_COLORS = ['#6cc24a', '#4d96ff', '#ff6b81', '#ffd23f', '#9b72e8', '#ff9f43'];

export function dinoForLevel(levelId: number): DinoDef {
  return DINOS.find((d) => d.levelId === levelId) ?? DINOS[0];
}

/** The profile's companion: a T-rex in the profile's color. */
export function avatarDino(color: string): DinoDef {
  return { ...DINOS[0], color, belly: '#fff6dc', accent: color };
}
