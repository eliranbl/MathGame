import { useConsent } from '../state/consent';
import { useInstall } from '../state/install';

const IOS_STEPS = (
  <>
    לוחצים על <b>שיתוף</b> <span aria-hidden>⬆️</span> ואז על <b>״הוספה למסך הבית״</b>
  </>
);

/** A small bar at the bottom of the screen, inviting a parent to add the game to the home screen. */
export function InstallBanner() {
  const { installed, platform, dismissed, install, dismiss } = useInstall();
  // One bar at a time: the privacy question comes first.
  const consent = useConsent();
  if (installed || dismissed || !platform || consent === null) return null;

  return (
    <div className="notice-banner" role="region" aria-label="הוספה למסך הבית">
      <span className="notice-banner-icon" aria-hidden>
        🦖
      </span>
      <span className="notice-banner-text">
        {platform === 'prompt' ? 'הוסיפו את דינו למסך הבית' : <>להוספה למסך הבית: {IOS_STEPS}</>}
      </span>
      {platform === 'prompt' && (
        <button className="notice-banner-add" onClick={install}>
          הוספה
        </button>
      )}
      <button className="notice-banner-close" onClick={dismiss} aria-label="סגירה">
        ✕
      </button>
    </div>
  );
}

/** The parents-area version: always there, never dismissed. */
export function InstallPanel() {
  const { installed, platform, install } = useInstall();

  return (
    <section className="panel install-panel">
      <h3>התקנה בטלפון</h3>
      {installed ? (
        <p>המשחק מותקן ✓</p>
      ) : platform === 'prompt' ? (
        <>
          <p>מוסיפים את המשחק למסך הבית, והוא נפתח כמו אפליקציה – במסך מלא, בלי שורת כתובת.</p>
          <button className="big-btn" onClick={install}>
            הוספה למסך הבית
          </button>
        </>
      ) : platform === 'ios' ? (
        <p>בספארי: {IOS_STEPS}. המשחק ייפתח כמו אפליקציה, במסך מלא.</p>
      ) : (
        <p>פתחו את המשחק בטלפון בדפדפן Chrome (אנדרואיד) או Safari (אייפון), ומשם אפשר להוסיף אותו למסך הבית.</p>
      )}
    </section>
  );
}
