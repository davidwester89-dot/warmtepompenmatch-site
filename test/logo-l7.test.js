// L7 30-10: pagina's waar logo's in de tabellen bijkwamen hebben dateModified, sitemap-lastmod en de zichtbare bijwerkdatum 30-10-2026.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const PAGINAS = ['/merken/quatt/', '/warmtepomp-geluid/', '/blog/lucht-lucht-warmtepomp-kosten/', '/blog/beste-hybride-warmtepomp/', '/blog/warmtepomp-offerte-vergelijken/'];
const ZICHTBAAR = /bijgewerkt <time datetime="2026-10-30">/;

test('L7 30-10: pagina\'s met logo\'s in de tabellen', () => {
  const sm = readFileSync('dist/sitemap.xml', 'utf8');
  for (const p of PAGINAS) {
    const h = readFileSync(`dist${p}index.html`, 'utf8');
    assert.match(h, /"dateModified": ?"2026-10-30"/, p);
    assert.match(h, ZICHTBAAR, p);
    assert.match(sm, new RegExp(`${p.replace(/[/.]/g, '\\$&')}</loc><lastmod>2026-10-30</lastmod>`), p);
  }
});
