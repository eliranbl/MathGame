import type { ItemType } from '../engine/generator';
import { ObjectGroup } from './ObjectGroup';

interface Props {
  total: number;
  groups: number;
  /** Items already in each group; the rest wait in the pile. */
  dealt: number;
  item: ItemType;
  hint?: boolean;
}

/** Division as sharing: plates in a row and a pile still to share. Too many to draw shows numbers on the plates. */
export function ShareView({ total, groups, dealt, item, hint = false }: Props) {
  const left = total - groups * dealt;
  const draw = total <= 40;
  const size = total > 20 ? 22 : total > 10 ? 30 : 40;
  return (
    <div className="share" dir="ltr">
      <div className="share-plates">
        {Array.from({ length: groups }, (_, i) => (
          <div className="share-plate" key={i}>
            {draw ? dealt > 0 && <ObjectGroup count={dealt} item={item} size={size} hint={hint} /> : <b>{dealt || ''}</b>}
          </div>
        ))}
      </div>
      {left > 0 && (
        <div className="share-pile">
          {draw ? <ObjectGroup count={left} item={item} size={size} hint={hint} /> : <b>{left}</b>}
        </div>
      )}
    </div>
  );
}
