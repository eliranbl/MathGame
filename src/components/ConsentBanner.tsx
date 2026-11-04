import { setConsent, useConsent } from '../state/consent';

/** Asks once whether anonymous usage statistics may be collected. Nothing is sent before a yes. */
export function ConsentBanner() {
  const consent = useConsent();
  if (consent !== null) return null;

  return (
    <div className="notice-banner consent-banner" role="region" aria-label="עוגיות וסטטיסטיקה">
      <span className="notice-banner-icon" aria-hidden>
        🍪
      </span>
      <p className="notice-banner-text">
        אפשר לאסוף סטטיסטיקה אנונימית כדי לשפר את המשחק? (עוגיות של <bdi>Google Analytics</bdi>, בלי שמות או פרטים
        מזהים) <a href="/privacy.html">מדיניות הפרטיות</a>
      </p>
      <div className="consent-actions">
        <button className="notice-banner-add" onClick={() => setConsent('granted')}>
          מאשר/ת
        </button>
        <button className="consent-decline" onClick={() => setConsent('denied')}>
          לא, תודה
        </button>
      </div>
    </div>
  );
}

/** The parents-area switch, so consent can be changed or withdrawn at any time. */
export function PrivacyPanel() {
  const consent = useConsent();

  return (
    <section className="panel">
      <h3>פרטיות ונגישות</h3>
      <label className="row">
        <span>
          סטטיסטיקה אנונימית: <bdi className="nowrap">Google Analytics</bdi>
        </span>
        <input
          type="checkbox"
          checked={consent === 'granted'}
          onChange={(e) => setConsent(e.target.checked ? 'granted' : 'denied')}
        />
      </label>
      <p className="muted">ההתקדמות ושמות השחקנים נשמרים רק במכשיר הזה ולא נשלחים לשום מקום.</p>
      <p className="legal-links">
        <a href="/privacy.html">מדיניות פרטיות</a>
        <a href="/accessibility.html">הצהרת נגישות</a>
      </p>
    </section>
  );
}
