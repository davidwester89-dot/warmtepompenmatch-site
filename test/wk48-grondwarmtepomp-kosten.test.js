// wk48 batch 3 (push 30-11): /blog/grondwarmtepomp-kosten/. Bedragen exact uit src/lib/kosten.js; E-CTA alleen keuzehulp (Huisassist-reflink leeg).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { TYPES, eur } from '../src/lib/kosten.js';
import { ECTA } from '../src/e-cta-1.config.mjs';
execSync('node build.mjs', { env: { ...process.env, BUILD_DATE: process.env.BUILD_DATE || '2026-11-30', PUSH_DATE: process.env.PUSH_DATE || '2026-11-30', BASE: '', PREVIEW: '' }, stdio: 'ignore' });
const lees = (p) => readFileSync(`dist${p === '/' ? '/index.html' : p + 'index.html'}`, 'utf8');
const P = '/blog/grondwarmtepomp-kosten/';
const PUSH = '2026-11-30';

test('grondwarmtepomp: title, meta, byline Redactie, datums = pushdag', () => {
  const h = lees(P);
  const t = h.match(/<title>([^<]+)<\/title>/)[1];
  assert.ok(t.startsWith('Grondwarmtepomp kosten: bron, installatie en ISDE'), t);
  const d = h.match(/<meta name="description" content="([^"]+)"/)[1];
  assert.ok(d.length >= 120 && d.length <= 155, String(d.length));
  assert.match(h, /Door Redactie WarmtepompenMatch/);
  for (const m of h.matchAll(/"dateModified":"([^"]+)"/g)) assert.equal(m[1], PUSH);
  assert.match(readFileSync('dist/sitemap.xml', 'utf8'), new RegExp(`/blog/grondwarmtepomp-kosten/</loc><lastmod>${PUSH}</lastmod>`));
});

test('grondwarmtepomp: bedragen exact gelijk aan kosten.js', () => {
  const h = lees(P).replace(/&nbsp;|\u00a0/g, ' ');
  const b = TYPES.bodem, a = TYPES.allelectric;
  for (const n of [b.kosten, b.subsidie, b.kosten - b.subsidie, a.kosten, a.subsidie, a.kosten - a.subsidie]) assert.ok(h.includes(eur(n).replace(/\u00a0/g, ' ')), eur(n));
  const bedragen = new Set([...h.matchAll(/€ ?([\d.]+)/g)].map((m) => Number(m[1].replace(/\./g, ''))));
  const toegestaan = new Set([b.kosten, b.subsidie, b.kosten - b.subsidie, a.kosten, a.subsidie, a.kosten - a.subsidie, 500]);
  for (const x of bedragen) assert.ok(toegestaan.has(x), 'onbekend bedrag ' + x);
});

test('grondwarmtepomp: E-CTA alleen keuzehulp, geen partnerlink/Groenpand in het artikel, kosten-FAQ linkt terug', () => {
  assert.deepEqual(ECTA.pages[P], { partners: [] });
  assert.equal(ECTA.partners.huisassist.reflink, '');
  const h = lees(P);
  const art = h.slice(h.indexOf('<article'), h.indexOf('</article>'));
  assert.doesNotMatch(art, /sponsored|glp8\.net|groenpand|tradetracker/i);
  assert.match(h, /data-ecta="A"/); assert.match(h, /data-ecta="C"/);
  assert.doesNotMatch(art, /\b(volgens|aldus)\b|reddit|disclaimer/i);
  for (const u of ['/warmtepomp-kosten/', '/isde-subsidie-warmtepomp-2026/', '/hybride-of-all-electric/', '/is-mijn-huis-geschikt-voor-een-warmtepomp/', '/warmtepomp-terugverdientijd/', '/warmtepomp-geluid/', '/blog/warmtepomp-offerte-vergelijken/', '/warmtepomp-keuzehulp/'])
    assert.match(art, new RegExp(`href="${u}"`), u);
  const k = lees('/warmtepomp-kosten/');
  assert.match(k, /href="\/blog\/grondwarmtepomp-kosten\/"/);
  assert.match(k, /Laatst bijgewerkt <time datetime="2026-11-30">/);
  const w = Number(h.match(/"wordCount":(\d+)/)[1]);
  assert.ok(w >= 700 && w <= 1200, 'woorden ' + w);
});
