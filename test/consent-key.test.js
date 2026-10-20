// Eigen consent-sleutel per site (wm-consent, niet meer sm-consent); keuze en GA-gating blijven werken.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONSENT_KEY, createConsent } from '../src/lib/consent.js';

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });

test('consent-sleutel is wm-consent; geen sm-consent meer in src of dist', () => {
  assert.equal(CONSENT_KEY, 'wm-consent');
  execSync('node build.mjs', { env: { ...process.env, BASE: '', PREVIEW: '', GO_LIVE: '1', GA_ID: 'G-TEST1234', LEADS_PREVIEW: '' } });
  const files = [...walk('src'), ...walk('dist')].filter((f) => /\.(m?js|html)$/.test(f));
  assert.deepEqual(files.filter((f) => readFileSync(f, 'utf8').includes('sm-consent')), []);
  assert.match(readFileSync('dist/privacy/index.html', 'utf8'), /wm-consent/);
});

test('weigeren en accepteren: GA pas na toestemming, keuze onder de nieuwe sleutel', () => {
  const mk = () => {
    const store = { data: {}, getItem(k) { return this.data[k] ?? null; }, setItem(k, v) { this.data[k] = v; } };
    const loads = [];
    const c = createConsent({ gaId: 'G-TEST1234', storage: store, doc: { cookie: '', referrer: '' }, win: { location: { href: 'https://example.test/' } }, hostname: 'example.test', load: (s) => loads.push(s) });
    return { store, loads, c };
  };
  const a = mk();
  assert.equal(a.c.init(), true, 'zonder keuze: melding tonen');
  assert.equal(a.loads.length, 0, 'zonder keuze geen gtag.js');
  a.c.reject();
  assert.equal(a.loads.length, 0, 'na Weigeren geen gtag.js');
  assert.equal(JSON.parse(a.store.data['wm-consent']).choice, 'denied');
  assert.equal(a.c.track('x'), false);
  const b = mk();
  b.c.accept();
  assert.equal(b.loads.length, 1);
  assert.match(b.loads[0], /googletagmanager\.com\/gtag\/js\?id=G-TEST1234/);
  assert.equal(JSON.parse(b.store.data['wm-consent']).choice, 'granted');
  b.store.data['sm-consent'] = b.store.data['wm-consent']; delete b.store.data['wm-consent'];
  const c2 = createConsent({ gaId: 'G-TEST1234', storage: b.store, doc: { cookie: '' }, win: {}, hostname: 'example.test', load: () => { throw new Error('mag niet laden'); } });
  assert.equal(c2.init(), true, 'oude sm-consent-keuze telt niet: melding opnieuw (goedgekeurd)');
});
