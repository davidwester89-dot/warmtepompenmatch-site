import { revisieDatum } from './nuchter-datums-helper.mjs'; // Latere stijlrevisie, exacte datumtests blijven gelden.
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
    const d = revisieDatum(p, '2026-10-30');
    assert.match(h, new RegExp(`"dateModified": ?"${d}"`), p);
    assert.match(h, new RegExp(`bijgewerkt <time datetime="${d}">`), p);
    assert.match(sm, new RegExp(`${p.replace(/[/.]/g, '\\$&')}</loc><lastmod>${d}</lastmod>`), p);
  }
});

// Bodywijziging 9-11-2026 (prijstabel): op 12-11 opnieuw bijgewerkt (onderhoud, hoofdverwarming), zie test/lucht-lucht-1211.test.js.
