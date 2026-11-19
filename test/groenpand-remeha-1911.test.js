// Remeha-CTA → Groenpand (MM-OK 19-11), Itho blijft neutraal. Alleen bestaande knop()-plekken, geen extra plek,
// bronregels ongewijzigd, geen datumlift, ranglijst ongewijzigd. Label "Partnerlink" (WPM E-CTA-1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { LABEL } from '../src/e-cta.mjs';
import { ranglijst } from '../src/lib/checklist.js';
import { GROENPAND_TT_URL, GROENPAND_REMEHA_TEKST, groenpandRemehaKnop, PARTNERLINKS } from '../src/lib/partnerlinks.js';
import { ECTA } from '../src/e-cta-1.config.mjs';

execSync('node build.mjs', { env: { ...process.env, BASE: '', PREVIEW: '' }, stdio: 'ignore' });
const lees = (p) => readFileSync(`dist${p}index.html`, 'utf8');
const files = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? files(p) : p.endsWith('.html') ? [p] : []; });
const padVan = (f) => '/' + f.replace(/^dist\/?/, '').replace(/index\.html$/, '');
const gpHref = GROENPAND_TT_URL.replace(/&/g, '&amp;');
const gpRe = /<a class="[^"]*" href="https:\/\/analytics\.groenpand\.nl\/c\?c=40779&amp;m=12&amp;a=519643&amp;r=&amp;u=%2F" rel="sponsored nofollow noopener" target="_blank" data-vendor="groenpand" data-pos="([^"]*)" data-cta="outbound">Offerte bij Groenpand \(Remeha-installateur\)<\/a> <span class="ecta-label">Partnerlink<\/span>/g;

test('Groenpand-Remeha: exact 4 CTA’s op 3 pagina’s; Itho neutraal; bronregels blijven; PARTNERLINKS/E-CTA-1-reflink leeg', () => {
  assert.equal(LABEL, 'Partnerlink');
  assert.equal(GROENPAND_REMEHA_TEKST, 'Offerte bij Groenpand (Remeha-installateur)');
  assert.equal(GROENPAND_TT_URL, 'https://analytics.groenpand.nl/c?c=40779&m=12&a=519643&r=&u=%2F');
  assert.equal(Object.keys(PARTNERLINKS).length, 0);
  assert.equal(ECTA.partners.groenpand.reflink, '');

  const hits = [];
  for (const f of files('dist')) {
    const h = readFileSync(f, 'utf8');
    for (const m of h.matchAll(gpRe)) hits.push([padVan(f), m[1]]);
  }
  const key = (x) => x.join('\0');
  assert.deepEqual(hits.slice().sort((a, b) => key(a).localeCompare(key(b))), [
    ['/merken/', 'lijst'],
    ['/merken/remeha/', 'merk_bottom'],
    ['/merken/remeha/', 'merk_top'],
    ['/vergelijken/quatt-vs-remeha/', 'vs_b'],
  ], JSON.stringify(hits));

  const hub = lees('/merken/');
  assert.ok(hub.includes(groenpandRemehaKnop('lijst', 'btn ghost sm')));
  assert.equal((hub.match(new RegExp(gpRe.source, 'g')) || []).length, 1);

  const rm = lees('/merken/remeha/');
  assert.ok(rm.includes(`<div class="pc-cta">${groenpandRemehaKnop('merk_top')}<a href="/warmtepomp-keuzehulp/">`));
  assert.ok(rm.includes(`<div class="out">${groenpandRemehaKnop('merk_bottom')}</div>`));
  assert.equal((rm.match(new RegExp(gpRe.source, 'g')) || []).length, 2);
  // Bronregels naar remeha.nl blijven (prijslijst, productpagina's); geen CTA-attributen.
  assert.match(rm, /<p class="src">Bronnen:[\s\S]*href="https:\/\/www\.remeha\.nl\/producten\/warmtepompen\/hybride-warmtepompen"/);
  assert.match(rm, /href="https:\/\/www\.remeha\.nl\/zakelijk\/documentatie\/product-prijslijst"/);
  for (const [tag] of rm.matchAll(/<a\b[^>]*>/g)) {
    const href = (tag.match(/href="([^"]*)"/) || [])[1] || '';
    if (/remeha\.nl/i.test(href)) assert.ok(!CTA_ATTR(tag), `bronlink met CTA-attr: ${tag}`);
  }

  const vs = lees('/vergelijken/quatt-vs-remeha/');
  assert.ok(vs.includes(`<div class="out">${bronQuatt()}${groenpandRemehaKnop('vs_b', 'btn ghost')}</div>`));
  assert.equal((vs.match(new RegExp(gpRe.source, 'g')) || []).length, 1);

  const it = lees('/merken/itho-daalderop/');
  assert.doesNotMatch(it, /groenpand|sponsored nofollow/i);
  assert.match(it, /<a href="https:\/\/www\.ithodaalderop\.nl\/" rel="noopener">Bron: Itho Daalderop<\/a>/);
  assert.equal((hub.match(/Bron: Itho Daalderop/g) || []).length, 1);

  // Geen Groenpand op andere pagina's (blogs, geluid, privacy, home, Itho).
  for (const f of files('dist')) {
    const url = padVan(f);
    if (['/merken/', '/merken/remeha/', '/vergelijken/quatt-vs-remeha/'].includes(url)) continue;
    assert.doesNotMatch(readFileSync(f, 'utf8'), /analytics\.groenpand\.nl/, url);
  }
});

test('Groenpand-Remeha: ranglijst en lastmods ongewijzigd t.o.v. ad2659a', () => {
  assert.deepEqual(ranglijst(), ['daikin', 'nefitbosch', 'vaillant', 'mitsubishi', 'itho', 'panasonic', 'quatt', 'remeha']);
  const sm = readFileSync('dist/sitemap.xml', 'utf8');
  assert.match(sm, /<loc>https:\/\/warmtepompenmatch\.nl\/merken\/<\/loc><lastmod>2026-11-25<\/lastmod>/);
  assert.match(sm, /<loc>https:\/\/warmtepompenmatch\.nl\/merken\/remeha\/<\/loc><lastmod>2026-11-26<\/lastmod>/);
  assert.match(sm, /<loc>https:\/\/warmtepompenmatch\.nl\/merken\/itho-daalderop\/<\/loc><lastmod>2026-11-26<\/lastmod>/);
  assert.match(sm, /<loc>https:\/\/warmtepompenmatch\.nl\/vergelijken\/quatt-vs-remeha\/<\/loc><lastmod>2026-11-25<\/lastmod>/);
  assert.match(sm, /<loc>https:\/\/warmtepompenmatch\.nl\/privacy\/<\/loc><lastmod>2026-10-21<\/lastmod>/);
  assert.match(lees('/privacy/'), /Op dit moment staan er geen partnerlinks op deze site/);
});

function CTA_ATTR(tag) {
  return /class="[^"]*\bbtn\b|data-cta=|data-vendor=|rel="[^"]*\bsponsored\b/.test(tag);
}
function bronQuatt() {
  return '<a href="https://www.quatt.io/" rel="noopener">Bron: Quatt</a>';
}
