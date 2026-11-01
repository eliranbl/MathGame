import { useEffect, useRef, useState } from 'react';

export type EggState = 'pending' | 'current' | 'first' | 'second' | 'missed';

export function ProgressEggs({ states }: { states: EggState[] }) {
  return (
    <div className="progress-eggs" aria-label="התקדמות">
      {states.map((s, i) => (
        <span key={i} className={`progress-egg progress-egg--${s}`} />
      ))}
    </div>
  );
}

/** Golden-bone score counter that ticks up to its new value. */
export function ScoreBadge({ score }: { score: number }) {
  const [shown, setShown] = useState(score);
  const shownRef = useRef(score);

  useEffect(() => {
    const id = setInterval(() => {
      const cur = shownRef.current;
      if (cur === score) return clearInterval(id);
      const step = Math.max(1, Math.round(Math.abs(score - cur) / 8));
      shownRef.current = cur < score ? Math.min(score, cur + step) : Math.max(score, cur - step);
      setShown(shownRef.current);
    }, 40);
    return () => clearInterval(id);
  }, [score]);

  return (
    <div className="score-badge" aria-label={`ניקוד ${score}`}>
      <svg viewBox="0 0 40 40" width={30} height={30} aria-hidden="true">
        <g fill="#ffd23f" stroke="#a86b00" strokeWidth={2.5} transform="rotate(-30 20 20)">
          <circle cx={8} cy={16} r={5} />
          <circle cx={8} cy={24} r={5} />
          <circle cx={32} cy={16} r={5} />
          <circle cx={32} cy={24} r={5} />
          <rect x={8} y={15} width={24} height={10} rx={3} />
          <path d="M8 16 L8 24 M32 16 L32 24" stroke="#ffd23f" strokeWidth={6} />
        </g>
      </svg>
      <span>{shown}</span>
    </div>
  );
}

export function IconButton({
  label,
  onClick,
  children,
  className = '',
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button className={`icon-btn ${className}`} onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  );
}

export function Stars({ count, max = 3, size = 22 }: { count: number; max?: number; size?: number }) {
  return (
    <span className="stars" style={{ fontSize: size }}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < count ? 'star star--on' : 'star'}>
          ★
        </span>
      ))}
    </span>
  );
}

const LEAF_COLORS = ['#6cc24a', '#ffd23f', '#ff9f43', '#4d96ff', '#ff6b81', '#9b72e8'];

/** Falling leaves and petals for celebrations. */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
  const [items] = useState(() =>
    Array.from({ length: pieces }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 2 + Math.random() * 1.5,
      color: LEAF_COLORS[i % LEAF_COLORS.length],
      rotate: Math.random() * 360,
    })),
  );
  return (
    <div className="confetti" aria-hidden="true">
      {items.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/** Background landscape: sky, sun, volcano, hills and palm trees. */
export function Scenery() {
  return (
    <svg className="scenery" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fd8ff" />
          <stop offset="1" stopColor="#d9f4ff" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#sky)" />
      <circle cx="1060" cy="120" r="70" fill="#ffe066" />
      <circle cx="1060" cy="120" r="95" fill="#ffe066" opacity="0.25" />
      <g fill="#fff" opacity="0.9">
        <ellipse cx="220" cy="130" rx="80" ry="28" />
        <ellipse cx="270" cy="110" rx="50" ry="30" />
        <ellipse cx="700" cy="80" rx="70" ry="22" />
        <ellipse cx="740" cy="66" rx="40" ry="22" />
      </g>
      <path d="M760 520 L900 300 L940 300 L1080 520 Z" fill="#8d6e63" />
      <path d="M900 300 L940 300 L960 340 Q920 360 880 340 Z" fill="#ff7043" />
      <g fill="#cfd8dc" opacity="0.8">
        <circle cx="925" cy="260" r="22" />
        <circle cx="950" cy="220" r="28" />
        <circle cx="985" cy="175" r="34" />
      </g>
      <path d="M0 560 Q200 460 420 540 T860 520 T1200 540 L1200 800 L0 800 Z" fill="#7cc95b" />
      <path d="M0 640 Q300 570 600 640 T1200 620 L1200 800 L0 800 Z" fill="#5fb045" />
      {[90, 520, 1130].map((x, i) => (
        <g key={i} transform={`translate(${x} ${560 + (i % 2) * 40})`}>
          <path d="M0 0 Q-6 -80 6 -150" stroke="#8d6e63" strokeWidth="14" fill="none" strokeLinecap="round" />
          <g fill="#3f9b35">
            <path d="M6 -150 Q-50 -170 -80 -120 Q-40 -150 6 -150" />
            <path d="M6 -150 Q60 -175 90 -125 Q50 -150 6 -150" />
            <path d="M6 -150 Q-20 -200 -60 -200 Q-20 -180 6 -150" />
            <path d="M6 -150 Q30 -205 75 -195 Q30 -180 6 -150" />
          </g>
        </g>
      ))}
    </svg>
  );
}
