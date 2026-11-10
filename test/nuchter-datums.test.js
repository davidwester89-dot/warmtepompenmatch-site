import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dateFields, readSitemap } from '../scripts/l7check.mjs';
import { STIJL_PADEN } from './nuchter-datums-helper.mjs';
test('stijlrelease 13-11: exacte bijgewerkt-/lastmod-/dateModified-datums, uitsluitend op de vastgelegde pagina’s', () => {
  const out = 'dist';
  const sitemap = readSitemap(out);
  for (const pad of STIJL_PADEN) {
    const file = pad.endsWith('.html') ? out + pad : out + pad + 'index.html';
    const fields = dateFields(readFileSync(file, 'utf8'));
    assert.equal(fields.visible, '2026-11-13', pad + ': zichtbaar');
    assert.equal(sitemap.get(pad), '2026-11-13', pad + ': sitemap');
    for (const date of [...fields.ld, ...fields.og]) assert.equal(date, '2026-11-13', pad + ': dateModified');
  }
});
