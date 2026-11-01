import { useState } from 'react';
import { LINES } from '../audio/lines';
import { speak } from '../audio/speech';
import type { Profile } from '../state/storage';
import { Dino } from '../components/Dino';
import { PROFILE_COLORS, avatarDino } from '../components/dinos';

interface Props {
  profiles: Profile[];
  onSelect: (id: string) => void;
  onAdd: (name: string, color: string) => void;
}

export function ProfileSelect({ profiles, onSelect, onAdd }: Props) {
  const [adding, setAdding] = useState(profiles.length === 0);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROFILE_COLORS[0]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), color);
    setName('');
    setAdding(false);
  };

  return (
    <div className="screen profiles">
      <h1 className="title">חשבון עם דינו</h1>
      <p className="subtitle">מי משחק?</p>

      <div className="profile-grid">
        {profiles.map((p) => (
          <button
            key={p.id}
            className="profile-card"
            onClick={() => {
              speak([LINES.hello, { say: p.name }]);
              onSelect(p.id);
            }}
          >
            <Dino dino={avatarDino(p.color)} size={130} />
            <span className="profile-name">{p.name}</span>
          </button>
        ))}
        {!adding && (
          <button className="profile-card profile-card--add" onClick={() => setAdding(true)} aria-label="שחקן חדש">
            <span className="plus">+</span>
          </button>
        )}
      </div>

      {adding && (
        <form className="add-profile" onSubmit={submit}>
          <Dino dino={avatarDino(color)} size={120} />
          <input
            className="text-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="שם השחקן"
            maxLength={14}
            autoFocus
          />
          <div className="color-row">
            {PROFILE_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                className={`color-dot ${c === color ? 'color-dot--on' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label="בחירת צבע"
              />
            ))}
          </div>
          <div className="form-actions">
            <button type="submit" className="big-btn" disabled={!name.trim()}>
              יאללה!
            </button>
            {profiles.length > 0 && (
              <button type="button" className="big-btn big-btn--secondary" onClick={() => setAdding(false)}>
                ביטול
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
