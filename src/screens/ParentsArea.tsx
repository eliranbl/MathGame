import { useState } from 'react';
import { ALL_LEVELS, levelsOf, type World } from '../engine/levels';
import { WORLDS as WORLD_LIST } from '../engine/worlds';
import type { Profile, Settings } from '../state/storage';
import { IconButton } from '../components/Common';
import { PrivacyPanel } from '../components/ConsentBanner';
import { InstallPanel } from '../components/InstallBanner';
import { canListen } from '../audio/listen';
import { trophiesFor } from '../engine/challenge';

interface Props {
  profiles: Profile[];
  activeId: string | null;
  settings: Settings;
  onBack: () => void;
  onUpdateSettings: (patch: Partial<Settings>) => void;
  onUnlockUpTo: (profileId: string, levelId: number) => void;
  onReset: (profileId: string) => void;
  onDelete: (profileId: string) => void;
}

const randDigit = () => 6 + Math.floor(Math.random() * 4);

function Gate({ onPass, onBack }: { onPass: () => void; onBack: () => void }) {
  const [[a, b]] = useState(() => [randDigit(), randDigit()]);
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  return (
    <form
      className="parents-gate"
      onSubmit={(e) => {
        e.preventDefault();
        if (Number(value) === a * b) onPass();
        else {
          setError(true);
          setValue('');
        }
      }}
    >
      <h2>אזור הורים</h2>
      <p>כדי להיכנס, פתרו את התרגיל:</p>
      <div className="gate-question" dir="ltr">
        {a} × {b} =
      </div>
      <input
        className="text-input"
        inputMode="numeric"
        aria-label="התשובה לתרגיל"
        value={value}
        onChange={(e) => {
          setValue(e.target.value.replace(/\D/g, ''));
          setError(false);
        }}
        autoFocus
      />
      {error && <p className="gate-error" role="alert">לא נכון, נסו שוב</p>}
      <div className="form-actions">
        <button type="submit" className="big-btn">
          כניסה
        </button>
        <button type="button" className="big-btn big-btn--secondary" onClick={onBack}>
          חזרה
        </button>
      </div>
    </form>
  );
}

const formatTime = (seconds: number) => {
  const m = Math.round(seconds / 60);
  return m < 60 ? `${m} דקות` : `${Math.floor(m / 60)} שעות ו-${m % 60} דקות`;
};

const percent = (part: number, total: number) => (total ? `${Math.round((part / total) * 100)}%` : '—');

const WORLD_NAMES = Object.fromEntries(WORLD_LIST.map((w) => [w.id, w.name])) as Record<World, string>;
const WORLDS = WORLD_LIST.map((w) => w.id);

const READING_MISTAKES: Record<string, string> = {
  letter: 'זיהוי אות',
  similar: 'אותיות דומות',
  first: 'אות פותחת',
  picture: 'תמונה לאות',
  syllable: 'הברה',
  read: 'קריאת מילה',
  find: 'מציאת מילה',
  spell: 'כתיבת מילה',
  case: 'אות גדולה וקטנה',
  listen: 'הבנת מילה',
};

/** Readable label for a mistake key, e.g. "first:דג" → "אות פותחת: דג". */
function MistakeLabel({ mistakeKey }: { mistakeKey: string }) {
  const [prefix, rest] = mistakeKey.split(':');
  if (rest !== undefined && READING_MISTAKES[prefix]) return <span>{`${READING_MISTAKES[prefix]}: ${rest}`}</span>;
  if (prefix === 'count') return <span>ספירה: {rest}</span>;
  return <bdi dir="ltr">{mistakeKey.replace(/^(\d+)\?(\d+)$/, '$1 מול $2')}</bdi>;
}

export function ParentsArea({ profiles, activeId, settings, onBack, onUpdateSettings, onUnlockUpTo, onReset, onDelete }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(activeId ?? profiles[0]?.id ?? null);
  const profile = profiles.find((p) => p.id === selectedId) ?? null;

  if (!unlocked) {
    return (
      <div className="screen parents">
        <Gate onPass={() => setUnlocked(true)} onBack={onBack} />
      </div>
    );
  }

  const topMistakes = profile
    ? Object.entries(profile.mistakes)
        .sort((x, y) => y[1] - x[1])
        .slice(0, 5)
    : [];
  const highestUnlocked = (world: World) =>
    profile ? Math.max(...levelsOf(world).filter((l) => profile.levels[l.id]?.unlocked).map((l) => l.id)) : 0;

  return (
    <div className="screen parents">
      <header className="topbar">
        <IconButton label="חזרה" onClick={onBack}>
          ↩
        </IconButton>
        <h2 className="screen-title">אזור הורים</h2>
        <span className="topbar-spacer" />
      </header>

      <div className="parents-body">
        <section className="panel">
          <h3>הגדרות</h3>
          <label className="row">
            <span>אורך סיבוב (תרגילים)</span>
            <select value={settings.roundLength} onChange={(e) => onUpdateSettings({ roundLength: Number(e.target.value) })}>
              {[5, 10, 15].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="row">
            <span>קול והקראה</span>
            <input type="checkbox" checked={!settings.muted} onChange={(e) => onUpdateSettings({ muted: !e.target.checked })} />
          </label>
          <label className="row">
            <span>קריאה בקול עם מיקרופון</span>
            {canListen() ? (
              <input type="checkbox" checked={settings.micEnabled} onChange={(e) => onUpdateSettings({ micEnabled: e.target.checked })} />
            ) : (
              <span className="muted">לא נתמך בדפדפן הזה</span>
            )}
          </label>
          <p className="muted">
            בשלבי "קוראים בקול" הילד מקריא מילה למיקרופון. הקול נשלח לשירות זיהוי הדיבור של הדפדפן (Google או Apple) כדי
            לבדוק את התשובה, ולא נשמר אצלנו. כשהאפשרות כבויה, בוחרים תמונה במקום.
          </p>
        </section>

        <InstallPanel />
        <PrivacyPanel />

        {profiles.length > 0 && (
          <div className="tabs">
            {profiles.map((p) => (
              <button key={p.id} className={`tab ${p.id === selectedId ? 'tab--on' : ''}`} onClick={() => setSelectedId(p.id)}>
                {p.name}
              </button>
            ))}
          </div>
        )}

        {profile && (
          <>
            <section className="panel">
              <h3>סיכום – {profile.name}</h3>
              <div className="summary">
                <div>
                  <b>{profile.totalScore}</b>
                  <span>נקודות</span>
                </div>
                <div>
                  <b>{ALL_LEVELS.filter((l) => profile.levels[l.id]?.completed).length}</b>
                  <span>שלבים הושלמו</span>
                </div>
                <div>
                  <b>{profile.collected.length}</b>
                  <span>דינוזאורים</span>
                </div>
                <div>
                  <b>{Object.values(profile.challenge).reduce((n, c) => n + trophiesFor(c?.passed ?? 0), 0)}</b>
                  <span>גביעים</span>
                </div>
                <div>
                  <b>{formatTime(profile.playSeconds)}</b>
                  <span>זמן משחק</span>
                </div>
              </div>
            </section>

            {WORLDS.map((world) => (
              <section className="panel" key={world}>
                <h3>התקדמות – {WORLD_NAMES[world]}</h3>
                <table className="stats">
                  <thead>
                    <tr>
                      <th>שלב</th>
                      <th>סיבובים</th>
                      <th>הצלחה בניסיון ראשון</th>
                      <th>כוכבים</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelsOf(world).map((l, i) => {
                      const lp = profile.levels[l.id];
                      return (
                        <tr key={l.id} className={lp.unlocked ? '' : 'stats--locked'}>
                          <td>
                            {i + 1}. {l.name}
                          </td>
                          <td>{lp.rounds}</td>
                          <td>{percent(lp.correctFirstTry, lp.answered)}</td>
                          <td>{'★'.repeat(lp.bestStars) || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
            ))}

            <section className="panel">
              <h3>תרגילים שכדאי לתרגל</h3>
              {topMistakes.length === 0 ? (
                <p className="muted">עדיין אין טעויות. מצוין!</p>
              ) : (
                <ul className="mistakes">
                  {topMistakes.map(([key, count]) => (
                    <li key={key}>
                      <MistakeLabel mistakeKey={key} />
                      <span className="muted">{count} טעויות</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="panel">
              <h3>ניהול</h3>
              {WORLDS.map((world) => (
                <label className="row" key={world}>
                  <span>פתיחת שלבים ב{WORLD_NAMES[world]} עד שלב</span>
                  <select value={highestUnlocked(world)} onChange={(e) => onUnlockUpTo(profile.id, Number(e.target.value))}>
                    {levelsOf(world).map((l, i) => (
                      <option key={l.id} value={l.id}>
                        {i + 1}. {l.name}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <div className="form-actions">
                <button
                  className="big-btn big-btn--secondary"
                  onClick={() => confirm(`לאפס את כל ההתקדמות של ${profile.name}?`) && onReset(profile.id)}
                >
                  איפוס התקדמות
                </button>
                <button
                  className="big-btn big-btn--danger"
                  onClick={() => {
                    if (!confirm(`למחוק את ${profile.name}?`)) return;
                    onDelete(profile.id);
                    setSelectedId(profiles.find((p) => p.id !== profile.id)?.id ?? null);
                  }}
                >
                  מחיקת שחקן
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
