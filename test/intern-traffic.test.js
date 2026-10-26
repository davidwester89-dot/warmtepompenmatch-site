// Markering intern verkeer (traffic_type) voor het GA4-filter. Zie /workspace/rekentools/ga4-intern-verkeer-2026-10-26.md, stap B.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createConsent, syncInternFlag, isInternal, saveConsent, INTERN_KEY } from '../src/lib/consent.js';

const ID = 'G-TEST12345';
const memStore = (init = {}) => {
  const m = new Map(Object.entries(init));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m };
};
function setup(href, store = memStore()) {
  const loads = [];
  const win = { location: { href } };
  const doc = { referrer: '', cookie: '' };
  const c = createConsent({ gaId: ID, storage: store, doc, win, hostname: 'example.nl', load: (s) => loads.push(s) });
  return { c, win, store, loads };
}
const configOf = (win) => [...(win.dataLayer || [])].map((a) => [...a]).find((a) => a[0] === 'config')?.[2];

test('?intern=1 zet bm_intern, ook zonder toestemming; GA laadt dan niet', () => {
  const { c, win, store, loads } = setup('https://example.nl/?intern=1');
  assert.equal(INTERN_KEY, 'bm_intern');
  assert.equal(store.getItem('bm_intern'), '1');
  assert.equal(c.init(), true);
  assert.equal(loads.length, 0);
  assert.equal(win.dataLayer, undefined);
});

test('?intern=0 wist de vlag', () => {
  const { store } = setup('https://example.nl/pagina/?intern=0', memStore({ bm_intern: '1' }));
  assert.equal(store.getItem('bm_intern'), null);
});

test('na toestemming: gtag-config krijgt traffic_type internal als bm_intern = 1', () => {
  const store = memStore({ bm_intern: '1' });
  const { c, win, loads } = setup('https://example.nl/', store);
  c.accept();
  assert.equal(loads.length, 1);
  assert.equal(configOf(win).traffic_type, 'internal');
});

test('zonder vlag: gtag-config ongewijzigd, geen traffic_type', () => {
  const store = memStore();
  saveConsent(store, 'granted');
  const { c, win } = setup('https://example.nl/', store);
  c.init();
  const cfg = configOf(win);
  assert.ok(cfg);
  assert.equal('traffic_type' in cfg, false);
  assert.deepEqual(Object.keys(cfg).sort(), ['allow_ad_personalization_signals', 'allow_google_signals', 'cookie_expires', 'cookie_flags', 'page_location', 'page_referrer']);
});

test('andere waarden dan 1 tellen niet; ?intern=1 komt niet in page_location', () => {
  const { c, win, store } = setup('https://example.nl/?intern=ja', memStore({ bm_intern: 'true' }));
  assert.equal(store.getItem('bm_intern'), 'true');
  c.accept();
  assert.equal('traffic_type' in configOf(win), false);
  const s2 = setup('https://example.nl/x/?intern=1');
  s2.c.accept();
  assert.equal(configOf(s2.win).page_location, 'https://example.nl/x/');
  assert.equal(configOf(s2.win).traffic_type, 'internal');
});

test('localStorage-fouten worden opgevangen', () => {
  const boom = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); }, removeItem() { throw new Error('x'); } };
  assert.doesNotThrow(() => syncInternFlag(boom, 'https://example.nl/?intern=1'));
  assert.doesNotThrow(() => syncInternFlag(boom, 'https://example.nl/?intern=0'));
  assert.doesNotThrow(() => syncInternFlag({ getItem: () => null, setItem() {} }, 'https://example.nl/?intern=0'));
  assert.doesNotThrow(() => syncInternFlag(boom, undefined));
  assert.equal(isInternal(boom), false);
  assert.doesNotThrow(() => setup('https://example.nl/?intern=1', boom).c.accept());
});
