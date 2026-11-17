// Onbetaalde merkknoppen neutraal (besluit Moneymaker 17-11-2026, zoals TM dee721c): zonder goedgekeurde partnerlink geen knop
// meer, maar een neutrale bronlink <a href="officiële site" rel="noopener">Bron: Merk</a> (geen class, target, data-cta,
// data-vendor of sponsored). Info, checklist en ranglijst blijven gelijk. L7: alleen de 12 pagina's met een zichtbare
// bodywijziging naar de pushdatum 2026-11-25; hub /vergelijken/ (geen eigen bodywijziging) niet gelift.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { MERKEN } from '../src/lib/merken.js';
import { ranglijst } from '../src/lib/checklist.js';
import { PARTNERLINKS, knop } from '../src/lib/partnerlinks.js';
import { NEUTRAAL_PADEN as HELPER_PADEN } from './nuchter-datums-helper.mjs';
import { NEUTRAAL_PADEN, NEUTRAAL_UPD } from '../src/pages.mjs';

execSync('node build.mjs', { env: { ...process.env, BASE: '', PREVIEW: '' }, stdio: 'ignore' });
const lees = (p) => readFileSync(`dist${p}index.html`, 'utf8');
const files = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? files(p) : p.endsWith('.html') ? [p] : []; });
const bron = (id) => `<a href="${MERKEN[id].url}" rel="noopener">Bron: ${MERKEN[id].naam}</a>`;
const CTA = /class="[^"]*\bbtn\b|data-cta=|data-vendor=|rel="[^"]*\bsponsored\b/;

test('statisch: geen enkele knop/data-cta/data-vendor/sponsored-link naar een merk zonder goedgekeurde partnerlink', () => {
  const betaald = new Set(Object.values(PARTNERLINKS));
  const fout = [];
  for (const f of files('dist')) for (const [tag] of readFileSync(f, 'utf8').matchAll(/<a\b[^>]*>/g)) {
    const href = (tag.match(/href="([^"]*)"/) || [])[1] || '';
    if (/^https?:/.test(href) && CTA.test(tag) && !betaald.has(href)) fout.push(`${f}: ${tag}`);
  }
  assert.equal(fout.join('\n'), '');
  assert.equal(readFileSync('dist/merken/daikin/index.html', 'utf8').includes('data-partner-slot'), false);
});

test('bronlink in plaats van knop op /merken/*, /merken/ en de 3 vs-pagina\'s; volgorde gelijk aan de ranglijst', () => {
  const RANG = ranglijst();
  const hub = lees('/merken/');
  assert.deepEqual([...hub.matchAll(/<li class="pcard" data-id="([a-z-]+)"/g)].map((m) => m[1]), RANG);
  for (const id of RANG) assert.equal(hub.split(bron(id)).length - 1, 1, '/merken/ ' + id);
  for (const id of Object.keys(MERKEN)) {
    const h = lees(`/merken/${MERKEN[id].slug}/`);
    assert.equal(h.split(bron(id)).length - 1, 2, id + ': top (pc-cta) en onder (out)');
    assert.ok(h.includes(`<div class="pc-cta">${bron(id)}<a href="/warmtepomp-keuzehulp/">`), id + ': keuzehulplink blijft naast de bronlink');
    assert.ok(h.includes(`<div class="out">${bron(id)}</div>`), id);
  }
  for (const [p, a, b] of [['/vergelijken/quatt-vs-remeha/', 'quatt', 'remeha'], ['/vergelijken/daikin-vs-mitsubishi-electric/', 'daikin', 'mitsubishi'], ['/vergelijken/vaillant-vs-nefit-bosch/', 'vaillant', 'nefitbosch']])
    assert.ok(lees(p).includes(`<div class="out">${bron(a)}${bron(b)}</div>`), p);
});

test('knop(): met goedgekeurde partnerlink blijft het de betaalde knop (rel sponsored), zonder wordt het een bronlink', () => {
  assert.equal(knop('quatt', 'x'), bron('quatt'));
  const k = knop('quatt', 'merk_top', 'btn', { quatt: 'https://example.invalid/ref' });
  assert.match(k, /^<a class="btn" href="https:\/\/example\.invalid\/ref" rel="sponsored nofollow noopener" target="_blank" data-vendor="quatt" data-pos="merk_top" data-cta="outbound"/);
});

test('L7 neutraal: precies de 12 gewijzigde pagina\'s op 2026-11-25; hub /vergelijken/ niet gelift', () => {
  assert.equal(NEUTRAAL_UPD, '2026-11-25');
  assert.deepEqual([...NEUTRAAL_PADEN].sort(), [...HELPER_PADEN].sort());
  const sm = readFileSync('dist/sitemap.xml', 'utf8');
  for (const p of NEUTRAAL_PADEN) {
    assert.match(sm, new RegExp(`<loc>https://warmtepompenmatch\\.nl${p.replace(/[/.]/g, '\\$&')}</loc><lastmod>2026-11-25</lastmod>`), p);
    assert.match(lees(p), /bijgewerkt (op )?<time datetime="2026-11-25">/i, p);
  }
  assert.match(sm, /<loc>https:\/\/warmtepompenmatch\.nl\/vergelijken\/<\/loc><lastmod>2026-11-03<\/lastmod>/);
  assert.match(readFileSync('scripts/l7.config.mjs', 'utf8'), /bodyOnlyHubs: \["\/blog\/", "\/gidsen\/", "\/merken\/", "\/vergelijken\/"\]/);
});
