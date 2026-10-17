// Cookiemelding en Google Analytics 4. Doet niets als er geen Metings-ID is (data-ga op <body> ontbreekt).
// gtag.js wordt pas geladen na "Accepteren". Logica: ./lib/consent.js (getest).
import { createConsent } from './lib/consent.js';

const body = document.body;
const gaId = body.dataset.ga || '';
let store;
try { store = window.localStorage; } catch { store = { getItem: () => null, setItem() {} }; }

const consent = createConsent({
  gaId, storage: store, doc: document, win: window, hostname: location.hostname,
  load(src) { const s = document.createElement('script'); s.async = true; s.src = src; document.head.append(s); },
});

/** Stuur een event naar Analytics, alleen als de bezoeker toestemming gaf. Geen persoonsgegevens of invoer meegeven. */
export const track = (name, params) => consent.track(name, params);

const BASE = body.dataset.base || '';
const TOOLS = { [BASE + '/warmtepomp-keuzehulp/']: 'warmtepomp_keuzehulp', [BASE + '/terugverdientijd-berekenen/']: 'terugverdientijd' };

let banner = null;
let returnFocus = null;

function close() {
  if (!banner) return;
  banner.hidden = true;
  body.classList.remove('has-consent');
  const wasInside = banner.contains(document.activeElement) || document.activeElement === body;
  if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
  else if (wasInside) { const m = document.getElementById('inhoud'); if (m) { if (!m.hasAttribute('tabindex')) m.setAttribute('tabindex', '-1'); m.focus({ preventScroll: true }); } }
  returnFocus = null;
}

function choose(ok) {
  if (ok) consent.accept(); else consent.reject();
  const msg = banner.querySelector('.consent-status');
  if (msg) msg.textContent = ok ? 'Bedankt, statistieken staan aan.' : 'Statistieken staan uit.';
  close();
}

function build() {
  const el = document.createElement('section');
  el.className = 'consent';
  el.setAttribute('role', 'region');
  el.setAttribute('aria-label', 'Cookie-instellingen');
  el.hidden = true;
  el.innerHTML = '<div class="consent-in"><p id="consent-text">Mogen we statistieken bijhouden met Google Analytics? Zo zien we welke pagina’s helpen. Je kunt dit altijd wijzigen. <a href="' + BASE + '/privacy/#cookies">Meer info</a></p>'
    + '<div class="consent-btns"><button type="button" class="consent-btn" data-c="yes" aria-describedby="consent-text">Accepteren</button>'
    + '<button type="button" class="consent-btn" data-c="no" aria-describedby="consent-text">Weigeren</button></div></div>';
  el.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-c]');
    if (b) choose(b.dataset.c === 'yes');
  });
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  // Vroeg in de tabvolgorde (direct na "Naar de inhoud"), zichtbaar onderaan het scherm.
  const skip = body.querySelector('.skip');
  if (skip) skip.after(el); else body.prepend(el);
  const status = document.createElement('p');
  status.className = 'consent-status sr';
  status.setAttribute('role', 'status');
  body.append(status);
  return el;
}

function open(focus) {
  banner = banner || build();
  banner.hidden = false;
  body.classList.add('has-consent');
  const c = consent.choice();
  banner.querySelectorAll('button[data-c]').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.c === 'yes' && c === 'granted') || (b.dataset.c === 'no' && c === 'denied'))));
  if (focus) { returnFocus = document.activeElement; banner.querySelector('button').focus(); }
}

if (consent.enabled) {
  if (consent.init()) open(false);
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-consent-open], a[data-vendor], a[data-tool], a[data-lead]');
    if (!t) return;
    if (t.matches('[data-consent-open]')) { e.preventDefault(); open(true); return; }
    if (t.dataset.vendor) track('vendor_click', { vendor: t.dataset.vendor, page: location.pathname, position: t.dataset.pos, cta_type: t.dataset.cta });
    if (t.dataset.tool) track('calculator_use', { tool_name: t.dataset.tool });
    if (t.dataset.lead) track('lead_cta_click', { maatregel: t.dataset.lead, page: location.pathname, position: t.dataset.pos });
  });
  const tool = TOOLS[location.pathname];
  const form = document.getElementById('form');
  if (tool && form) {
    let used = false;
    const once = (e) => { if (used || !e.isTrusted) return; used = true; track('calculator_use', { tool_name: tool }); };
    form.addEventListener('input', once);
    form.addEventListener('change', once);
    form.addEventListener('click', (e) => { if (e.target.closest('button')) once(e); });
  }
}
