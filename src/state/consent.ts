import { useEffect, useState } from 'react';

/** Google Analytics loads only after a parent agrees; until then nothing is sent to Google. */
const GA_ID = 'G-FDKXX62CGY';
const CONSENT_KEY = 'dino-math:consent';

export type Consent = 'granted' | 'denied' | null;

declare global {
  interface Window {
    dataLayer?: unknown[];
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

const read = (): Consent => {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
};

let consent: Consent = typeof window === 'undefined' ? null : read();
let loaded = false;
const listeners = new Set<() => void>();

function loadAnalytics() {
  window[`ga-disable-${GA_ID}`] = false;
  if (loaded) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  // gtag must push the arguments object itself, not an array.
  function gtag(..._args: unknown[]) {
    window.dataLayer!.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

/** Stops the loaded script from sending and removes the _ga cookies it set. */
function stopAnalytics() {
  window[`ga-disable-${GA_ID}`] = true;
  const host = location.hostname;
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];
  for (const c of document.cookie.split(';')) {
    const name = c.split('=')[0].trim();
    if (!name.startsWith('_ga')) continue;
    for (const d of domains) document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ''}`;
  }
}

if (consent === 'granted') loadAnalytics();

export function setConsent(value: 'granted' | 'denied') {
  consent = value;
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Private mode: the question comes back next visit.
  }
  if (value === 'granted') loadAnalytics();
  else stopAnalytics();
  listeners.forEach((l) => l());
}

export function useConsent(): Consent {
  const [, rerender] = useState(0);
  useEffect(() => {
    const update = () => rerender((n) => n + 1);
    listeners.add(update);
    return () => void listeners.delete(update);
  }, []);
  return consent;
}
