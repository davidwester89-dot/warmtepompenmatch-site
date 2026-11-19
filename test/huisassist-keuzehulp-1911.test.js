// Huisassist in het bestaande offerteblok van de keuzehulp-uitslag (MM-OK 19-11).
// Alleen die plek, geen /offerte/-pagina's, ranking ongewijzigd, datumlift 24-11 op /warmtepomp-keuzehulp/.
// Zelfstandig t.o.v. ff42883: geen import van e-cta.mjs of e-cta-1.config.mjs (die zitten niet op a1754d4).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { HUISASSIST_URL, HUISASSIST_TEKST, huisassistKnop } from '../src/lib/huisassist-cta.js';
import { LEADPARTNERS } from '../src/lib/leads.js';
import { ranglijst } from '../src/lib/checklist.js';

execSync('node build.mjs', { env: { ...process.env, BASE: '', PREVIEW: '' }, stdio: 'ignore' });
const files = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? files(p) : p.endsWith('.html') ? [p] : []; });
const padVan = (f) => '/' + f.replace(/^dist\/?/, '').replace(/index\.html$/, '');

test('Huisassist: exacte Daisycon-link, label Partnerlink, alleen keuzehulp-uitslag', () => {
  assert.equal(HUISASSIST_URL, 'https://glp8.net/c/?si=22344&li=1962824&wi=445224&ws=&dl=');
  assert.equal(HUISASSIST_TEKST, 'Offertes aanvragen bij Huisassist');
  assert.deepEqual(LEADPARTNERS, {});
  assert.ok(!existsSync('dist/offerte/index.html'), 'geen /offerte/-pagina');

  const knop = huisassistKnop('keuzehulp');
  assert.match(knop, /rel="sponsored nofollow noopener"/);
  assert.match(knop, /data-vendor="huisassist"/);
  assert.match(knop, /data-pos="keuzehulp"/);
  assert.match(knop, /data-cta="outbound"/);
  assert.match(knop, /<span class="ecta-label">Partnerlink<\/span>/);
  assert.match(knop, /href="https:\/\/glp8\.net\/c\/\?si=22344&amp;li=1962824&amp;wi=445224&amp;ws=&amp;dl="/);

  const js = readFileSync('dist/js/keuzehulp.js', 'utf8');
  assert.match(js, /huisassistKnop\('keuzehulp'\)/);
  const cta = readFileSync('dist/js/lib/huisassist-cta.js', 'utf8');
  assert.match(cta, /si=22344/);
  assert.match(cta, /wi=445224/);

  // Statische HTML: geen Huisassist-knop (alleen in de JS-uitslag). /privacy/ mag het trackingdomein noemen.
  for (const f of files('dist')) {
    const url = padVan(f);
    const h = readFileSync(f, 'utf8');
    assert.doesNotMatch(h, /data-vendor="huisassist"/, url);
    if (url !== '/privacy/') assert.doesNotMatch(h, /glp8\.net/, url);
  }
});

test('Huisassist: keuzehulp datumlift 24-11; ranglijst ongewijzigd', () => {
  const sm = readFileSync('dist/sitemap.xml', 'utf8');
  assert.match(sm, /<loc>https:\/\/warmtepompenmatch\.nl\/warmtepomp-keuzehulp\/<\/loc><lastmod>2026-11-24<\/lastmod>/);
  const h = readFileSync('dist/warmtepomp-keuzehulp/index.html', 'utf8');
  assert.match(h, /"dateModified":"2026-11-24"/);
  assert.match(h, /Laatst bijgewerkt <time datetime="2026-11-24">/);
  assert.deepEqual(ranglijst(), ['daikin', 'nefitbosch', 'vaillant', 'mitsubishi', 'itho', 'panasonic', 'quatt', 'remeha']);
});
