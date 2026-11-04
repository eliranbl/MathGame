import { useState } from 'react';
import { canListen } from '../audio/listen';
import { useConsent } from '../state/consent';
import { useInstall } from '../state/install';

const DISMISS_KEY = 'dino-math:mic-notice-dismissed';

const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
};

interface Props {
  micEnabled: boolean;
  onParents: () => void;
}

/** Tells parents about the read-aloud levels, until the microphone is turned on or they ask not to see it again. */
export function MicNotice({ micEnabled, onParents }: Props) {
  const [dismissed, setDismissed] = useState(readDismissed);
  // One bar at a time: the privacy question and the install bar come first.
  const consent = useConsent();
  const install = useInstall();
  const installShown = !install.installed && !install.dismissed && !!install.platform;
  if (micEnabled || dismissed || !canListen() || consent === null || installShown) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Private mode: the notice just comes back next visit.
    }
  };

  return (
    <div className="notice-banner consent-banner" role="region" aria-label="הקראה בקול">
      <span className="notice-banner-icon" aria-hidden>
        🎤
      </span>
      <p className="notice-banner-text">
        <b>חדש!</b> הילד יכול לקרוא מילים בקול למיקרופון, בעברית ובאנגלית. ההפעלה דורשת אישור הורים באזור ההורים.
      </p>
      <div className="consent-actions">
        <button className="notice-banner-add" onClick={onParents}>
          לאזור ההורים
        </button>
        <button className="consent-decline" onClick={dismiss}>
          לא להציג שוב
        </button>
      </div>
    </div>
  );
}
