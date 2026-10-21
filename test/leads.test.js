import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { actievePartners, routing, categorieVan, valideer, iframeUrl, analytics, frameOrigins, LEADPARTNERS, CATEGORIEEN } from '../src/lib/leads.js';
import { OPTIES } from '../src/lib/match.js';
import { buildLive, htmlFiles } from './helpers.js';

const IF = { naam: 'X', type: 'iframe', url: 'https://x.nl/form?a=1', origin: 'https://x.nl', privacy: 'https://x.nl/p', voor: ['hybride'], max: 3, prefill: { postcode: 'pc', woning: 'type', email: 'mail' }, subidParam: 'sub' };
const RD = { naam: 'Y', type: 'redirect', url: 'https://y.nl/c?x', privacy: 'https://y.nl/p', voor: ['hybride', 'allelectric'], max: 1 };
const A = { maatregel: 'hybride', postcode: '3512ab', woning: 'hoek', bouwjaar: '1975', wanneer: 'direct' };

test('leads: leeg tot goedkeuring; build zonder offertepagina, -knoppen of formulieren', () => {
  assert.deepEqual(LEADPARTNERS, {});
  buildLive();
  assert.ok(!existsSync('dist/offerte/index.html'));
  for (const f of htmlFiles()) { const h = readFileSync(f, 'utf8'); assert.doesNotMatch(h, /class="leadcta"|data-lead=|id="offertes"|Offertes aanvragen|frame-src|id="lead"/, f); }
  assert.match(readFileSync('dist/js/lib/leads.config.js', 'utf8'), /export const LEADS = \{\};/);
  assert.ok(!readFileSync('dist/sitemap.xml', 'utf8').includes('/offerte/'));
});
test('leads: één partner per categorie, eerste wint; validatie partners', () => {
  assert.deepEqual(routing(actievePartners({ partners: { x: IF, y: RD } })), { hybride: 'x', allelectric: 'y' });
  assert.equal(categorieVan('hybride'), 'hybride'); assert.equal(categorieVan('bodem'), 'allelectric'); assert.equal(categorieVan('luchtlucht'), null);
  assert.throws(() => actievePartners({ partners: { z: { ...IF, url: 'http://x.nl' } } }));
  assert.throws(() => actievePartners({ partners: { z: { ...IF, origin: 'https://ander.nl' } } }));
  assert.throws(() => actievePartners({ partners: { z: { ...RD, voor: ['zonnepanelen'] } } }));
});
test('leads: validatie, prefill zonder contactgegevens, GA zonder postcode', () => {
  assert.deepEqual(valideer(A, OPTIES.woning, OPTIES.bouwjaar), {});
  const f = valideer({ ...A, postcode: '0123 AB', wanneer: 'x' }, OPTIES.woning, OPTIES.bouwjaar);
  assert.ok(f.postcode && f.wanneer);
  const u = new URL(iframeUrl(IF, { ...A, email: 'a@b.nl' }));
  assert.equal(u.searchParams.get('pc'), '3512 AB'); assert.equal(u.searchParams.get('type'), 'hoek'); assert.equal(u.searchParams.get('mail'), null); assert.equal(u.searchParams.get('sub'), 'wpm_hybride');
  const g = analytics(A, 'x');
  assert.deepEqual(g, { maatregel: 'hybride', termijn: 'direct', partner: 'x' });
  assert.ok(!JSON.stringify(g).includes('3512'));
  assert.deepEqual(frameOrigins({ x: IF, y: RD }), ['https://x.nl']);
});
test('leads preview (LEADS_PREVIEW=1): offertepagina met toestemming, zonder label partnerlink, overal noindex', () => {
  execSync('node build.mjs', { stdio: 'ignore', env: { ...process.env, BASE: '', GO_LIVE: '', LEADS_PREVIEW: '1' } });
  try {
    const o = readFileSync('dist/offerte/index.html', 'utf8');
    assert.match(o, /name="robots" content="noindex"/);
    assert.match(o, /<input type="checkbox" id="l-ok">/);
    assert.doesNotMatch(o, /<span class="partner">\s*partner ?link/i);
    for (const k of ['maatregel', 'postcode', 'woning', 'bouwjaar', 'wanneer']) assert.match(o, new RegExp(`data-q="${k}"`));
    assert.doesNotMatch(o, /type="email"|type="tel"/);
    for (const c of Object.keys(CATEGORIEEN)) assert.match(o, new RegExp(`value="${c}"`));
    assert.match(readFileSync('dist/isde-subsidie-warmtepomp-2026/index.html', 'utf8'), /class="leadcta"[\s\S]*data-lead="hybride"/);
    assert.match(readFileSync('dist/privacy/index.html', 'utf8'), /id="offertes"/);
    assert.equal(readFileSync('dist/robots.txt', 'utf8'), 'User-agent: *\nDisallow: /\n');
    const js = readFileSync('src/assets/js/offerte.js', 'utf8').replace(/^\s*\/\/.*$/gm, '');
    assert.doesNotMatch(js, /fetch\(|sendBeacon|XMLHttpRequest|localStorage/);
    assert.match(js, /if \(!ok\.checked\)/);
  } finally { buildLive(); }
});
