// L7 30-10: pagina's waar logo's in de tabellen bijkwamen hebben dateModified, sitemap-lastmod en de zichtbare bijwerkdatum 30-10-2026.
import test from 'node:test';
import assert from 'node:assert/strict';
import { EF_PADEN } from '../src/pages.mjs'; // op 3-11 opnieuw bijgewerkt ('Niet vermeld'): test/niet-vermeld-0311.test.js
import { readFileSync } from 'node:fs';

const PAGINAS = ['/merken/quatt/', '/merken/daikin/', '/warmtepomp-geluid/', '/blog/beste-hybride-warmtepomp/', '/blog/warmtepomp-offerte-vergelijken/'];
const ZICHTBAAR = /bijgewerkt <time datetime="2026-10-30">/;

test('L7 30-10: pagina\'s met logo\'s in de tabellen', () => {
  const sm = readFileSync('dist/sitemap.xml', 'utf8');
  for (const p of PAGINAS.filter((x) => !EF_PADEN.has(x))) {
    const h = readFileSync(`dist${p}index.html`, 'utf8');
    assert.match(h, /"dateModified": ?"2026-10-30"/, p);
    assert.match(h, ZICHTBAAR, p);
    assert.match(sm, new RegExp(`${p.replace(/[/.]/g, '\\$&')}</loc><lastmod>2026-10-30</lastmod>`), p);
  }
});

// Bodywijziging 7-11-2026 (prijstabel). L7: dateModified, zichtbare bijgewerkt-regel en lastmod = pushdatum.
test('L7 7-11: blog lucht-lucht warmtepomp kosten', () => {
  const p = '/blog/lucht-lucht-warmtepomp-kosten/';
  const h = readFileSync(`dist${p}index.html`, 'utf8');
  const sm = readFileSync('dist/sitemap.xml', 'utf8');
  assert.match(h, /"dateModified": ?"2026-11-07"/, p);
  assert.match(h, /bijgewerkt <time datetime="2026-11-07">/, p);
  assert.match(sm, /blog\/lucht-lucht-warmtepomp-kosten\/<\/loc><lastmod>2026-11-07<\/lastmod>/);
});
