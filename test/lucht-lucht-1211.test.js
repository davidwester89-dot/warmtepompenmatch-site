// Bodywijziging 12-11-2026: lucht-lucht deep-dive (hoofdverwarming, onderhoud) en contextlink vanaf /merken/daikin/.
// L7: dateModified, zichtbare bijgewerkt-regel en lastmod = pushdatum op de blog, /merken/daikin/, hub /merken/ en home (leestijd).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LL_UPD } from '../src/pages.mjs';

const lees = (p) => readFileSync(`dist${p}index.html`, 'utf8');
const sm = () => readFileSync('dist/sitemap.xml', 'utf8');
const esc = (p) => p.replace(/[/.]/g, '\\$&');

test('L7 12-11: blog lucht-lucht en /merken/daikin/ dragen de pushdatum', () => {
  assert.equal(LL_UPD, '2026-11-12');
  for (const p of ['/blog/lucht-lucht-warmtepomp-kosten/', '/merken/daikin/']) {
    const h = lees(p);
    assert.match(h, /"dateModified": ?"2026-11-12"/, p);
    assert.match(h, /bijgewerkt <time datetime="2026-11-12">/, p);
    assert.match(sm(), new RegExp(`${esc(p)}</loc><lastmod>2026-11-12</lastmod>`), p);
  }
  for (const p of ['/merken/', '/']) {
    assert.match(lees(p), /bijgewerkt (op )?<time datetime="2026-11-12">/i, p);
    assert.match(sm(), new RegExp(`${esc(p)}</loc><lastmod>2026-11-12</lastmod>`), p);
  }
});

test('lucht-lucht 12-11: title/meta 41d6eaa, nieuwe H2\'s en contextlink', () => {
  const h = lees('/blog/lucht-lucht-warmtepomp-kosten/');
  const t = h.match(/<title>([^<]+)<\/title>/)[1].replace(/&amp;/g, '&');
  const d = h.match(/<meta name="description" content="([^"]+)"/)[1];
  // SEO-B1 df9584c: title en meta blijven exact de versie van 41d6eaa (7-11; nog geen hercrawl + 7 dagen).
  assert.ok(t.startsWith('Wat kost een lucht-luchtwarmtepomp? Prijs per bron'), t);
  assert.equal(d, 'Lucht-luchtwarmtepomp: Milieu Centraal noemt € 2.500 voor single-split, btw niet vermeld. Bekijk bronprijzen, installatie en stroom. Geen ISDE.');
  assert.ok(d.length >= 120 && d.length <= 155, String(d.length));
  assert.match(h, /<h2[^>]*>Als hoofdverwarming: wat kost dat\?<\/h2>/);
  assert.match(h, /<h2[^>]*>Onderhoud: wat kost het\?<\/h2>/);
  assert.match(h, /href="\/merken\/daikin\/"/);
  assert.match(lees('/merken/daikin/'), /<a href="\/blog\/lucht-lucht-warmtepomp-kosten\/">/);
});
