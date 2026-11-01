import type { ItemType } from '../engine/generator';
import { Item } from './Items';

interface Props {
  count: number;
  item: ItemType;
  /** The last N items are crossed out (subtraction). */
  crossed?: number;
  /** The last N items are drawn faded (missing-number hint). */
  ghost?: number;
  /** Pulse the items one after another to help counting. */
  hint?: boolean;
  size?: number;
}

/** Items laid out in rows of five, like a ten-frame, so they are easy to count. */
export function ObjectGroup({ count, item, crossed = 0, ghost = 0, hint = false, size }: Props) {
  const itemSize = size ?? (count > 10 ? 40 : count > 5 ? 54 : 72);
  const rows: number[][] = [];
  for (let i = 0; i < count; i += 5) rows.push(Array.from({ length: Math.min(5, count - i) }, (_, k) => i + k));

  return (
    <div className="object-group" dir="ltr" style={{ ['--item-size' as string]: `${itemSize}px` }}>
      {rows.map((row, r) => (
        <div className="object-row" key={r}>
          {row.map((i) => {
            const isCrossed = i >= count - crossed;
            const isGhost = i >= count - ghost;
            return (
              <span
                key={i}
                className={`object ${isCrossed ? 'object--crossed' : ''} ${isGhost ? 'object--ghost' : ''} ${hint ? 'object--hint' : ''}`}
                style={{ animationDelay: hint ? `${i * 0.35}s` : `${i * 0.05}s` }}
              >
                <Item type={item} size={itemSize} />
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
