import type { DinoDef } from './dinos';

export type DinoMood = 'happy' | 'think' | 'cheer';

interface Props {
  dino: DinoDef;
  mood?: DinoMood;
  size?: number;
  silhouette?: boolean;
  className?: string;
}

const OUTLINE = '#3b2a1e';

interface Face {
  eye: [number, number, number];
  cheek: [number, number];
  smile?: string;
  o: [number, number];
}

const FACES: Record<DinoDef['body'], Face> = {
  biped: { eye: [138, 52, 11], cheek: [150, 74], smile: 'M132 80 Q148 92 162 74', o: [150, 80] },
  quad: { eye: [162, 88, 8], cheek: [172, 104], smile: 'M160 108 Q170 114 180 104', o: [172, 108] },
  longneck: { eye: [156, 24, 7], cheek: [166, 36], smile: 'M154 38 Q164 42 172 34', o: [166, 38] },
  flyer: { eye: [106, 52, 8], cheek: [114, 66], o: [0, 0] },
};

function Eyes({ face, mood }: { face: Face; mood: DinoMood }) {
  const [x, y, r] = face.eye;
  const look = mood === 'think' ? -r * 0.45 : 0;
  if (mood === 'cheer') {
    return <path d={`M${x - r} ${y + 2} Q${x} ${y - r} ${x + r} ${y + 2}`} fill="none" stroke={OUTLINE} strokeWidth={3.5} strokeLinecap="round" />;
  }
  return (
    <g stroke="none">
      <circle cx={x} cy={y} r={r} fill="#fff" stroke={OUTLINE} strokeWidth={2.5} />
      <circle cx={x + r * 0.25} cy={y + look + 1} r={r * 0.55} fill={OUTLINE} />
      <circle cx={x + r * 0.45} cy={y + look - r * 0.2} r={r * 0.2} fill="#fff" />
    </g>
  );
}

function Mouth({ face, mood }: { face: Face; mood: DinoMood }) {
  if (!face.smile) return null;
  if (mood === 'think') return <circle cx={face.o[0]} cy={face.o[1]} r={4} fill={OUTLINE} stroke="none" />;
  return <path d={face.smile} fill="none" stroke={OUTLINE} strokeWidth={3} strokeLinecap="round" />;
}

function Biped({ d }: { d: DinoDef }) {
  return (
    <>
      {d.extra === 'sail' && (
        <>
          <path d="M50 96 Q72 10 116 80 Z" fill={d.accent} />
          <path d="M66 86 L72 40 M82 80 L86 34 M98 78 L100 50" stroke={OUTLINE} strokeOpacity={0.35} strokeWidth={2} />
        </>
      )}
      {d.extra === 'spikes' && <path d="M56 92 L60 74 L70 84 L74 66 L82 78 L88 60 L96 76 Z" fill={d.accent} />}
      <path d="M62 95 Q25 100 6 70 Q22 112 70 124 Z" fill={d.color} />
      <rect x={62} y={118} width={20} height={34} rx={9} fill={d.color} />
      <ellipse cx={88} cy={108} rx={38} ry={34} fill={d.color} />
      <ellipse cx={100} cy={116} rx={22} ry={24} fill={d.belly} stroke="none" />
      <rect x={92} y={124} width={20} height={30} rx={9} fill={d.color} />
      {d.extra === 'crest' && <path d="M104 50 Q78 14 58 30 Q74 36 104 64 Z" fill={d.accent} />}
      {d.extra === 'dome' && <ellipse cx={122} cy={38} rx={30} ry={20} fill={d.accent} />}
      <ellipse cx={128} cy={62} rx={38} ry={32} fill={d.color} />
      <ellipse cx={124} cy={112} rx={11} ry={5} transform="rotate(35 124 112)" fill={d.color} />
      <circle cx={160} cy={56} r={2.2} fill={OUTLINE} stroke="none" />
      {d.extra === 'crown' && (
        <path d="M106 34 L110 10 L122 24 L130 4 L138 24 L150 10 L152 36 Z" fill={d.accent} stroke={OUTLINE} />
      )}
    </>
  );
}

function Quad({ d }: { d: DinoDef }) {
  return (
    <>
      {d.extra === 'plates' && (
        <path
          d="M50 92 L58 62 L70 84 Z M68 82 L80 48 L92 78 Z M88 76 L102 44 L114 76 Z M110 78 L124 54 L132 86 Z"
          fill={d.accent}
        />
      )}
      <path d="M52 100 Q20 100 4 78 Q16 120 60 120 Z" fill={d.color} />
      {d.extra === 'club' && <ellipse cx={10} cy={84} rx={12} ry={10} fill={d.accent} />}
      <rect x={50} y={110} width={18} height={38} rx={8} fill={d.color} />
      <rect x={70} y={112} width={18} height={36} rx={8} fill={d.color} />
      <rect x={106} y={112} width={18} height={36} rx={8} fill={d.color} />
      <rect x={124} y={110} width={18} height={38} rx={8} fill={d.color} />
      <ellipse cx={92} cy={102} rx={50} ry={32} fill={d.color} />
      <ellipse cx={96} cy={118} rx={36} ry={11} fill={d.belly} stroke="none" />
      {d.extra === 'club' && (
        <g fill={d.accent}>
          <circle cx={70} cy={84} r={6} />
          <circle cx={92} cy={78} r={6} />
          <circle cx={114} cy={84} r={6} />
        </g>
      )}
      {d.extra === 'frill' && <circle cx={140} cy={84} r={30} fill={d.accent} />}
      <ellipse cx={156} cy={96} rx={28} ry={24} fill={d.color} />
      {d.extra === 'frill' && (
        <path d="M150 76 L176 56 L162 84 Z M174 94 L190 84 L180 102 Z" fill="#fff7e0" />
      )}
    </>
  );
}

function Longneck({ d }: { d: DinoDef }) {
  return (
    <>
      <path d="M45 108 Q10 112 2 142 Q30 122 55 126 Z" fill={d.color} />
      <rect x={42} y={112} width={18} height={40} rx={8} fill={d.color} />
      <rect x={62} y={114} width={18} height={38} rx={8} fill={d.color} />
      <rect x={92} y={114} width={18} height={38} rx={8} fill={d.color} />
      <rect x={110} y={112} width={18} height={40} rx={8} fill={d.color} />
      <path d="M100 100 Q130 82 142 32" fill="none" stroke={OUTLINE} strokeWidth={27} strokeLinecap="round" />
      <path d="M100 100 Q130 82 142 32" fill="none" stroke={d.color} strokeWidth={21} strokeLinecap="round" />
      <ellipse cx={80} cy={108} rx={46} ry={30} fill={d.color} />
      <ellipse cx={84} cy={124} rx={32} ry={9} fill={d.belly} stroke="none" />
      {d.extra === 'spots' && (
        <g fill={d.accent} stroke="none" opacity={0.7}>
          <circle cx={60} cy={96} r={7} />
          <circle cx={82} cy={88} r={5} />
          <circle cx={100} cy={102} r={6} />
          <circle cx={128} cy={70} r={4} />
        </g>
      )}
      <ellipse cx={150} cy={30} rx={24} ry={17} fill={d.color} />
    </>
  );
}

function Flyer({ d }: { d: DinoDef }) {
  return (
    <>
      <path d="M88 82 L8 58 Q30 95 18 112 Q55 100 92 110 Z" fill={d.accent} />
      <path d="M112 82 L192 58 Q170 95 182 112 Q145 100 108 110 Z" fill={d.accent} />
      <rect x={88} y={124} width={10} height={20} rx={4} fill={d.color} />
      <rect x={102} y={124} width={10} height={20} rx={4} fill={d.color} />
      <ellipse cx={100} cy={104} rx={22} ry={28} fill={d.color} />
      <ellipse cx={100} cy={112} rx={13} ry={16} fill={d.belly} stroke="none" />
      <path d="M94 46 L56 26 L98 60 Z" fill={d.accent} />
      <ellipse cx={102} cy={58} rx={22} ry={18} fill={d.color} />
      <path d="M118 52 L162 62 L118 70 Z" fill="#ffcf5a" />
    </>
  );
}

const BODIES = { biped: Biped, quad: Quad, longneck: Longneck, flyer: Flyer };

export function Dino({ dino, mood = 'happy', size = 140, silhouette = false, className = '' }: Props) {
  const Body = BODIES[dino.body];
  const face = FACES[dino.body];
  return (
    <svg
      viewBox="0 0 200 160"
      width={size}
      height={size * 0.8}
      className={`dino ${silhouette ? 'dino--silhouette' : ''} ${mood === 'cheer' ? 'dino--cheer' : ''} ${className}`}
      aria-label={dino.name}
      role="img"
    >
      <ellipse cx={100} cy={152} rx={70} ry={6} fill="#000" opacity={0.12} />
      <g stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round">
        <Body d={dino} />
        {!silhouette && (
          <>
            <circle cx={face.cheek[0]} cy={face.cheek[1]} r={6} fill="#ff8fa3" opacity={0.55} stroke="none" />
            <Eyes face={face} mood={mood} />
            <Mouth face={face} mood={mood} />
          </>
        )}
      </g>
    </svg>
  );
}
