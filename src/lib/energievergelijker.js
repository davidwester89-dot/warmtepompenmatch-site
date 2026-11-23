// Daisycon Energievergelijker NL (programma 13017, mediaId 445224).
// Officiële embed uit /workspace/rekentools/partners/wpm-energievergelijker-2026-11-23.md.
// Geen invloed op ranking, checklist of keuzehulp. Het script laadt pas na een
// expliciete keuze op de pagina (niet via de GA-toestemming wm-consent): het
// officiële script kan cookies zetten en Amplitude laden.

export const SCRIPT_SRC = 'https://energie.whitelabeled.nl/dist-v2/main.js';
export const API_ORIGIN = 'https://api-energie.whitelabeled.nl';
export const AMPLITUDE_SCRIPT = 'https://cdn.amplitude.com/libs/amplitude-5.2.2-min.gz.js';
export const MEDIA_ID = 445224;
export const BUTTON_TEXT = 'Bekijk';
export const CONFIG_JSON = JSON.stringify({ mediaId: MEDIA_ID, buttonText: BUTTON_TEXT });
export const ENERGY_CONSENT_KEY = 'wm-energy-tool';
export const ENERGY_CONSENT_VERSION = 1;
export const ENERGY_MAX_AGE_DAYS = 365;
export const VENDOR = 'daisycon-energievergelijker';
export const POS = 'gids_energievergelijker';

/** CSP-aanvulling, alleen op de gids. Herkomst uit het officiële script. */
export const CSP = {
  script: ' https://energie.whitelabeled.nl https://cdn.amplitude.com',
  connect: ' https://api-energie.whitelabeled.nl https://cdn.amplitude.com https://*.amplitude.com',
  img: ' https://energie.whitelabeled.nl https://api-energie.whitelabeled.nl',
};

export function readEnergyConsent(storage, now = new Date()) {
  let raw;
  try { raw = storage.getItem(ENERGY_CONSENT_KEY); } catch { return null; }
  if (!raw) return null;
  let c;
  try { c = JSON.parse(raw); } catch { return null; }
  if (!c || c.v !== ENERGY_CONSENT_VERSION || (c.choice !== 'granted' && c.choice !== 'denied')) return null;
  const t = Date.parse(c.date);
  if (!Number.isFinite(t) || now.getTime() - t > ENERGY_MAX_AGE_DAYS * 864e5 || t - now.getTime() > 864e5) return null;
  return c;
}

export function saveEnergyConsent(storage, choice, now = new Date()) {
  const c = { v: ENERGY_CONSENT_VERSION, choice, date: now.toISOString() };
  try { storage.setItem(ENERGY_CONSENT_KEY, JSON.stringify(c)); } catch { /* alleen deze pagina */ }
  return c;
}

/** Alleen 'granted' laadt het script. Een GA-toestemming (wm-consent) telt niet. */
export function shouldLoadWidget(storage, now = new Date()) {
  return readEnergyConsent(storage, now)?.choice === 'granted';
}

export function loadWidgetScript(doc, src = SCRIPT_SRC) {
  if (doc.querySelector('script[data-energy-script]')) return false;
  const s = doc.createElement('script');
  s.src = src;
  s.async = true;
  s.dataset.energyScript = '1';
  doc.head.append(s);
  return true;
}

export function widgetBlok() {
  return `<aside id="vergelijker" data-energy-tool data-vendor="${VENDOR}" data-pos="${POS}">
<h2>Energiecontracten vergelijken <span class="ecta-label">Partnerlink</span></h2>
<p>Hieronder kun je energiecontracten vergelijken met de Energievergelijker NL, een hulpmiddel van een derde partij via Daisycon. Dat is een partnerwidget: sluit je via de vergelijker een contract af, dan kunnen wij daardoor een vergoeding krijgen. Dat kost jou niets extra en telt nooit mee in de merkenvolgorde of het advies op deze site. We nemen zelf geen tarieven of aanbiedingen over.</p>
<div class="energy-ph">
<p>De vergelijker laadt een script van energie.whitelabeled.nl. Dat script kan cookies plaatsen en gegevens uitwisselen met de aanbieder van de tool. Het wordt daarom pas geladen als je daarvoor kiest. Meer uitleg staat bij <a href="/privacy/#energievergelijker">privacy: energievergelijker</a>.</p>
<p><button type="button" class="btn" data-energy-accept data-vendor="${VENDOR}" data-pos="${POS}">Toon de energievergelijker</button></p>
</div>
<div class="dc-tool dc-energy-tool" hidden data-config='${CONFIG_JSON}'></div>
</aside>`;
}
