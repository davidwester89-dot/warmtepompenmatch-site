// Upgrade positie 8–20, batch 1 (upgradelijst E-CTA-1 17-11; bouw 19-11, push 26-11): /merken/itho-daalderop/ en /merken/remeha/.
// Controleert: title/meta (Itho-title ongewijzigd), prijs-H2's met alleen bronbedragen uit de eigen prijslijst van het merk,
// Amber 120 in het modelblok, propaanblok Remeha, FAQ (+ FAQPage), interne links, geen merkknop (WPM heeft geen betaalde partner),
// L7 alleen op deze twee pagina's (2026-11-26, hub /merken/ niet gelift), ranglijst en clientmodule merken.js ongewijzigd.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { MERKEN, FEATURES } from '../src/lib/merken.js';
import { ranglijst } from '../src/lib/checklist.js';
import { PARTNERLINKS, GROENPAND_TT_URL, groenpandRemehaKnop } from '../src/lib/partnerlinks.js';
import { UPGRADE_UPD, UPGRADE_PADEN } from '../src/pages.mjs';
import { UPGRADE_PADEN as HELPER_PADEN } from './nuchter-datums-helper.mjs';

execSync('node build.mjs', { env: { ...process.env, BASE: '', PREVIEW: '' }, stdio: 'ignore' });
const lees = (p) => readFileSync(`dist${p}index.html`, 'utf8');
const meta = (h, n) => (h.match(new RegExp(`<meta name="${n}" content="([^"]*)"`)) || [])[1];
const title = (h) => (h.match(/<title>([^<]*)<\/title>/) || [])[1];
const IT = '/merken/itho-daalderop/'; const RM = '/merken/remeha/';

test('upgrade: title en meta', () => {
  const it = lees(IT); const rm = lees(RM);
  assert.equal(title(it), 'Itho Daalderop warmtepomp 2026: aanbod en checklist', 'Itho-title ongewijzigd');
  assert.equal(title(rm), 'Remeha warmtepomp 2026: prijslijst en checklist');
  assert.ok(title(rm).length <= 60);
  for (const h of [it, rm]) assert.ok(meta(h, 'description').length <= 155, meta(h, 'description'));
  assert.match(meta(it, 'description'), /prijs 2026: Amber 65, 95 en 120 .*prijslijst per 1-1-2026/);
  assert.match(meta(rm, 'description'), /^Remeha prijslijst 2026: /);
});

test('upgrade: prijs-H2 met alleen bronbedragen en bron', () => {
  const it = lees(IT); const rm = lees(RM);
  assert.match(it, /<h2>Itho Daalderop warmtepomp prijs 2026<\/h2>[\s\S]*€ 4\.750[\s\S]*€ 5\.450[\s\S]*€ 6\.450[\s\S]*Prijslijst%20IDNL_WEB\.pdf/);
  assert.match(rm, /<h2>Remeha prijslijst 2026<\/h2>[\s\S]*€ 3\.154[\s\S]*€ 4\.038[\s\S]*€ 4\.364[\s\S]*€ 5\.424[\s\S]*Confida 10 met buitendeel Confida MB 400-4 \(propaan\), 4 kW[\s\S]*€ 4\.010[\s\S]*product-prijslijst/);
  // Geen andere eurobedragen in de prijsblokken dan die uit de prijslijsten plus de bestaande Milieu Centraal-gemiddelden.
  const blok = (h, kop) => h.slice(h.indexOf(kop), h.indexOf('<h2>Checklist'));
  const bedr = (s) => [...new Set([...s.matchAll(/€ [\d.]+/g)].map((m) => m[0]))].sort();
  assert.deepEqual(bedr(blok(it, '<h2>Itho Daalderop warmtepomp prijs 2026')), ['€ 12.000', '€ 4.750', '€ 5.450', '€ 6.200', '€ 6.450'].sort());
  assert.deepEqual(bedr(blok(rm, '<h2>Remeha prijslijst 2026')), ['€ 12.000', '€ 3.154', '€ 4.010', '€ 4.038', '€ 4.364', '€ 5.424', '€ 6.200'].sort());
  assert.match(it, /Bedragen gecontroleerd op 19 november 2026/);
  assert.match(rm, /Bedragen gecontroleerd op 19 november 2026/);
});

test('upgrade: Amber 120 in het modelblok, propaanblok Remeha, FAQ + FAQPage', () => {
  const it = lees(IT); const rm = lees(RM);
  assert.match(it, /<h2>Modellen<\/h2>[\s\S]*<th scope="row">Amber 120<\/th>[\s\S]*11,9 kW[\s\S]*<h2>Itho Daalderop warmtepomp prijs 2026/);
  assert.match(rm, /<h2>Remeha warmtepomp met propaan<\/h2>[\s\S]*Confida 10 en de Confida 40[\s\S]*R32, niet met propaan/);
  for (const [h, n] of [[it, 3], [rm, 3]]) {
    assert.match(h, /"@type":"FAQPage"/);
    assert.equal((h.match(/<details><summary>/g) || []).length, n);
  }
  assert.match(it, /<summary>Wat kost een Itho Daalderop warmtepomp\?<\/summary>/);
  assert.match(rm, /<summary>Heeft Remeha een warmtepomp met propaan\?<\/summary>/);
});

test('upgrade: interne links Itho naar quatt-vs-remeha en hybride-warmtepomp-kosten', () => {
  const it = lees(IT);
  const alt = it.slice(it.indexOf('<h2>Alternatieven</h2>'), it.indexOf('<h2>Voor je tekent</h2>'));
  assert.match(alt, /href="\/hybride-warmtepomp-kosten\/"/);
  assert.match(alt, /href="\/vergelijken\/quatt-vs-remeha\/"/);
});

test('upgrade: Itho geen merkknop; Remeha-CTA alleen Groenpand; partnerkaart leeg', () => {
  assert.equal(Object.keys(PARTNERLINKS).length, 0);
  const gpHref = GROENPAND_TT_URL.replace(/&/g, '&amp;');
  const it = lees(IT);
  for (const [tag] of it.matchAll(/<a\b[^>]*>/g)) {
    const href = (tag.match(/href="([^"]*)"/) || [])[1] || '';
    if (/class="[^"]*\bbtn\b|data-cta=|data-vendor=|rel="[^"]*\bsponsored\b/.test(tag)) assert.ok(href.startsWith('/') || href.startsWith('mailto:'), `${IT}: externe CTA ${tag}`);
  }
  assert.doesNotMatch(it, /Naar de site van|Groenpand/);
  const rm = lees(RM);
  const extern = [];
  for (const [tag] of rm.matchAll(/<a\b[^>]*>/g)) {
    const href = (tag.match(/href="([^"]*)"/) || [])[1] || '';
    if (/class="[^"]*\bbtn\b|data-cta=|data-vendor=|rel="[^"]*\bsponsored\b/.test(tag) && !href.startsWith('/') && !href.startsWith('mailto:')) extern.push({ href, tag });
  }
  assert.equal(extern.length, 2, 'twee Groenpand-CTA\'s (merk_top + merk_bottom)');
  for (const x of extern) {
    assert.equal(x.href, gpHref);
    assert.match(x.tag, /data-vendor="groenpand"/);
    assert.match(x.tag, /rel="sponsored nofollow noopener"/);
  }
  assert.ok(rm.includes(groenpandRemehaKnop('merk_top')));
  assert.ok(rm.includes(groenpandRemehaKnop('merk_bottom')));
  assert.doesNotMatch(rm, /Naar de site van/);
});

test('upgrade L7: alleen deze twee pagina\'s op 2026-11-26; hub /merken/ niet gelift; geen datum na de pushdatum', () => {
  assert.equal(UPGRADE_UPD, '2026-11-26');
  assert.deepEqual([...UPGRADE_PADEN].sort(), [...HELPER_PADEN].sort());
  const sm = readFileSync('dist/sitemap.xml', 'utf8');
  const lm = [...sm.matchAll(/<loc>https:\/\/warmtepompenmatch\.nl([^<]*)<\/loc><lastmod>([^<]*)<\/lastmod>/g)];
  assert.deepEqual(lm.filter((m) => m[2] === '2026-11-26').map((m) => m[1]).sort(), [IT, RM]);
  assert.ok(lm.every((m) => m[2] <= '2026-11-26'));
  assert.match(sm, /<loc>https:\/\/warmtepompenmatch\.nl\/merken\/<\/loc><lastmod>2026-11-25<\/lastmod>/);
  for (const p of [IT, RM]) {
    const h = lees(p);
    assert.match(h, /"dateModified":"2026-11-26"/);
    assert.match(h, /article:modified_time" content="2026-11-26"/);
    assert.match(h, /Laatst bijgewerkt <time datetime="2026-11-26">/);
    assert.match(h, /"datePublished":"2026-10-17"/);
  }
});

test('upgrade: ranglijst en clientmodule ongewijzigd', () => {
  const RANG = ranglijst();
  assert.deepEqual(RANG, ['daikin', 'nefitbosch', 'vaillant', 'mitsubishi', 'itho', 'panasonic', 'quatt', 'remeha'], 'ranglijst gelijk aan 1109607');
  const hub = lees('/merken/');
  assert.deepEqual([...hub.matchAll(/<li class="pcard" data-id="([a-z-]+)"/g)].map((m) => m[1]), RANG);
  assert.doesNotMatch(readFileSync('src/lib/merken.js', 'utf8'), /Amber 120', 'Grootste|Remeha warmtepomp met propaan/);
  assert.equal(FEATURES.itho.prijs.v, null); assert.equal(FEATURES.remeha.prijs.v, null);
  assert.equal(MERKEN.remeha.bronnen.length, 5);
});
