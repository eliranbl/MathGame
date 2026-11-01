import { useEffect } from 'react';
import { sfx } from '../audio/sfx';

interface Props {
  value: string;
  disabled: boolean;
  maxDigits?: number;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];

export function NumberPad({ value, disabled, maxDigits = 2, onChange, onSubmit }: Props) {
  const press = (key: string) => {
    if (disabled) return;
    if (key === 'ok') {
      if (value) onSubmit();
      return;
    }
    sfx.tap();
    if (key === 'del') onChange(value.slice(0, -1));
    else if (value.length < maxDigits) onChange(value === '0' ? key : value + key);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') press('del');
      else if (e.key === 'Enter') press('ok');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="numpad" dir="ltr">
      {KEYS.map((k) => (
        <button
          key={k}
          className={`numpad-key ${k === 'ok' ? 'numpad-key--ok' : ''} ${k === 'del' ? 'numpad-key--del' : ''}`}
          disabled={disabled || (k === 'ok' && !value)}
          onClick={() => press(k)}
          aria-label={k === 'ok' ? 'אישור' : k === 'del' ? 'מחיקה' : k}
        >
          {k === 'ok' ? '✓' : k === 'del' ? '⌫' : k}
        </button>
      ))}
    </div>
  );
}
