import type { ItemType } from '../engine/generator';

const OUTLINE = '#3b2a1e';

function Egg() {
  return (
    <g stroke={OUTLINE} strokeWidth={2.5}>
      <ellipse cx={20} cy={22} rx={13} ry={16} fill="#fff3d6" />
      <circle cx={15} cy={17} r={3} fill="#7bd389" stroke="none" />
      <circle cx={25} cy={24} r={3.5} fill="#7bd389" stroke="none" />
      <circle cx={16} cy={29} r={2.2} fill="#7bd389" stroke="none" />
    </g>
  );
}

function Bone() {
  return (
    <g stroke={OUTLINE} strokeWidth={2.5} fill="#fffaf0" transform="rotate(-30 20 20)">
      <circle cx={8} cy={16} r={5} />
      <circle cx={8} cy={24} r={5} />
      <circle cx={32} cy={16} r={5} />
      <circle cx={32} cy={24} r={5} />
      <rect x={8} y={15} width={24} height={10} rx={3} />
      <path d="M8 16 L8 24 M32 16 L32 24" stroke="#fffaf0" strokeWidth={6} />
    </g>
  );
}

function Leaf() {
  return (
    <g stroke={OUTLINE} strokeWidth={2.5}>
      <path d="M6 34 Q4 6 34 6 Q36 34 6 34 Z" fill="#5cbf4a" />
      <path d="M8 32 L30 10" stroke="#2f7a24" strokeWidth={2} />
    </g>
  );
}

function Foot() {
  return (
    <g fill="#a0663a" stroke={OUTLINE} strokeWidth={2}>
      <ellipse cx={20} cy={27} rx={9} ry={9} />
      <ellipse cx={9} cy={14} rx={4} ry={7} transform="rotate(-25 9 14)" />
      <ellipse cx={20} cy={9} rx={4} ry={7} />
      <ellipse cx={31} cy={14} rx={4} ry={7} transform="rotate(25 31 14)" />
    </g>
  );
}

const ITEMS: Record<ItemType, () => JSX.Element> = { egg: Egg, bone: Bone, leaf: Leaf, foot: Foot };

export function Item({ type, size }: { type: ItemType; size: number }) {
  const Shape = ITEMS[type];
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <Shape />
    </svg>
  );
}
