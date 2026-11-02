interface Spell {
  letters: string[];
  tiles: string[];
}

/** Index of an unused tile holding the next needed letter, for the hint. */
export function nextSpellTile(spell: Spell, placed: number[]): number | null {
  const needed = spell.letters[placed.length];
  const i = spell.tiles.findIndex((t, j) => t === needed && !placed.includes(j));
  return i < 0 ? null : i;
}

interface Props {
  tiles: string[];
  lang: 'he' | 'en';
  placed: number[];
  wrong: number[];
  hintTile: number | null;
  disabled: boolean;
  onPick: (index: number) => void;
}

/** Shuffled letter tiles for building a word; used tiles leave an empty spot. */
export function SpellTiles({ tiles, lang, placed, wrong, hintTile, disabled, onPick }: Props) {
  return (
    <div className="choices choices--spell">
      {tiles.map((t, i) => {
        const used = placed.includes(i);
        return (
          <button
            key={i}
            className={`choice tile tile--letter ${lang === 'en' ? 'eng' : 'heb'} ${used ? 'tile--used' : ''} ${wrong.includes(i) ? 'choice--wrong' : ''} ${hintTile === i ? 'tile--hint' : ''}`}
            style={{ ['--choice-color' as string]: '#4d96ff' }}
            disabled={disabled || used || wrong.includes(i)}
            onClick={() => onPick(i)}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
