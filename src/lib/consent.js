// Toestemming voor statistieken (Google Analytics 4). Pure logica, getest in test/consent.test.js.
// - Zonder toestemming wordt gtag.js nooit geladen (geen verzoek naar Google).
// - De keuze staat in localStorage (geen cookie), met versie en datum; na 12 maanden of bij een nieuwe versie vragen we opnieuw.
// - Intrekken: status 'denied', _ga-cookies wissen en Analytics stoppen.

export const CONSENT_KEY = 'wm-consent';
export const CONSENT_VERSION = 1;
export const MAX_AGE_DAYS = 365;
export const GA_ID_RE = /^G-[A-Z0-9]{4,20}$/;

/** Lees de opgeslagen keuze. Geeft null als er niets (geldigs) is, de versie anders is of de keuze ouder is dan 12 maanden. */
export function readConsent(storage, now = new Date()) {
  let raw;
  try { raw = storage.getItem(CONSENT_KEY); } catch { return null; }
  if (!raw) return null;
  let c;
  try { c = JSON.parse(raw); } catch { return null; }
  if (!c || c.v !== CONSENT_VERSION || (c.choice !== 'granted' && c.choice !== 'denied')) return null;
  const t = Date.parse(c.date);
  if (!Number.isFinite(t) || now.getTime() - t > MAX_AGE_DAYS * 864e5 || t - now.getTime() > 864e5) return null;
  return c;
}

export function saveConsent(storage, choice, now = new Date()) {
  const c = { v: CONSENT_VERSION, choice, date: now.toISOString() };
  try { storage.setItem(CONSENT_KEY, JSON.stringify(c)); } catch { /* opslag geblokkeerd: keuze geldt alleen voor deze pagina */ }
  return c;
}

/** Wis alle Google Analytics-cookies (_ga, _ga_<id>, _gid, _gat*) op dit domein en het hoofddomein. */
export function clearGaCookies(doc, hostname) {
  const names = String(doc.cookie || '').split(';').map((s) => s.split('=')[0].trim()).filter((n) => /^_g(a|id|at)/.test(n));
  const parts = hostname.split('.');
  const domains = ['', hostname];
  for (let i = 1; i < parts.length - 1; i++) domains.push(parts.slice(i).join('.'));
  for (const n of names) {
    for (const d of domains) {
      doc.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=.${d}` : ''}`;
    }
  }
  return names;
}

/** URL zonder querystring en hash: tools zetten invoer (zoals omzet) in de adresbalk; die gaat nooit naar Google. */
export function cleanUrl(href) {
  if (!href) return '';
  try { const u = new URL(href); return u.origin + u.pathname; } catch { return ''; }
}

/** Alleen korte, niet-persoonlijke waarden in events: strings (max 100 tekens), geen getallen of invoer. */
export function cleanParams(params = {}) {
  const out = {};
  for (const [k, v] of Object.entries(params)) if (typeof v === 'string' && v) out[k] = v.slice(0, 100);
  return out;
}

/** De vlag zelf blijft in de browser; alleen traffic_type gaat na toestemming mee naar GA. */
export const INTERN_KEY = 'bm_intern';

export function syncInternFlag(storage, href) {
  let v = null;
  try { v = new URL(href).searchParams.get('intern'); } catch { return; }
  try {
    if (v === '1') storage.setItem(INTERN_KEY, '1');
    else if (v === '0') storage.removeItem(INTERN_KEY);
  } catch { /* opslag geblokkeerd: geen markering */ }
}

export function isInternal(storage) {
  try { return storage.getItem(INTERN_KEY) === '1'; } catch { return false; }
}

/**
 * Toestemmingsbeheer. Afhankelijkheden worden meegegeven zodat het testbaar is zonder browser.
 * @param {{gaId:string, storage:Storage, doc:Document, win:object, hostname:string, load:(src:string)=>void, now?:()=>Date}} o
 */
export function createConsent({ gaId, storage, doc, win, hostname, load, now = () => new Date() }) {
  const enabled = GA_ID_RE.test(gaId || '');
  let loaded = false;
  let active = false;
  syncInternFlag(storage, win.location && win.location.href);

  function gtag() { (win.dataLayer = win.dataLayer || []).push(arguments); }

  function start() {
    if (!enabled) return;
    win[`ga-disable-${gaId}`] = false;
    active = true;
    if (loaded) { gtag('consent', 'update', { analytics_storage: 'granted' }); return; }
    loaded = true;
    win.gtag = gtag;
    gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    gtag('set', 'ads_data_redaction', true);
    gtag('set', 'url_passthrough', false);
    gtag('js', now());
    // Schone URL voor alle hits (ook latere events), nooit de invoer uit de querystring.
    const page = { page_location: cleanUrl(win.location && win.location.href), page_referrer: cleanUrl(doc.referrer) };
    gtag('set', page);
    gtag('config', gaId, {
      ...page,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: MAX_AGE_DAYS * 86400,
      cookie_flags: 'SameSite=Lax;Secure',
      ...(isInternal(storage) ? { traffic_type: 'internal' } : {}),
    });
    load(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`);
  }

  function stop() {
    active = false;
    if (enabled) win[`ga-disable-${gaId}`] = true;
    if (loaded) gtag('consent', 'update', { analytics_storage: 'denied' });
    clearGaCookies(doc, hostname);
  }

  return {
    enabled,
    get loaded() { return loaded; },
    get active() { return active; },
    /** Keuze van de bezoeker: 'granted', 'denied' of null (nog niet gekozen / verlopen). */
    choice() { return enabled ? (readConsent(storage, now())?.choice ?? null) : null; },
    /** Bij het laden van een pagina: alleen starten als er een geldige toestemming is. True = melding tonen. */
    init() {
      if (!enabled) return false;
      const c = this.choice();
      if (c === 'granted') start();
      else clearGaCookies(doc, hostname);
      return c === null;
    },
    accept() { if (!enabled) return; saveConsent(storage, 'granted', now()); start(); },
    reject() { if (!enabled) return; saveConsent(storage, 'denied', now()); stop(); },
    /** Event naar GA, alleen na toestemming. */
    track(name, params) {
      if (!active) return false;
      gtag('event', name, cleanParams(params));
      return true;
    },
  };
}
