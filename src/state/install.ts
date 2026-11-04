import { useEffect, useState } from 'react';

/** Chrome's install event; not in the DOM typings yet. */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'dino-math:install-dismissed';

// Chrome fires the event once, early — catch it at import time, before any screen mounts.
let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
}

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;

// iPadOS reports itself as a Mac, so a touch screen gives it away.
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
};

export type InstallPlatform = 'prompt' | 'ios' | null;

export function useInstall() {
  const [, rerender] = useState(0);
  const [dismissed, setDismissed] = useState(readDismissed);

  useEffect(() => {
    const update = () => rerender((n) => n + 1);
    listeners.add(update);
    return () => void listeners.delete(update);
  }, []);

  const installed = isStandalone();
  const platform: InstallPlatform = deferred ? 'prompt' : isIos() ? 'ios' : null;

  const install = async () => {
    if (!deferred) return;
    const event = deferred;
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === 'accepted') deferred = null;
    notify();
  };

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Private mode: the banner just comes back next visit.
    }
  };

  return { installed, platform, dismissed, install, dismiss };
}
