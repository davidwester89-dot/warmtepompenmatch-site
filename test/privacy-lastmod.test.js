import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('privacy: lastmod in de sitemap = PRIVACY_UPDATED (2026-10-21), niet SITE.updated', async () => {
  const { PRIVACY_UPDATED } = await import('../src/privacy-avg.mjs');
  assert.equal(PRIVACY_UPDATED, '2026-10-21');
  assert.match(readFileSync('src/pages.mjs', 'utf8'), /path: '\/privacy\/'[^\n]*lastmod: PRIVACY_UPDATED/);
  if (existsSync('dist/sitemap.xml')) assert.match(readFileSync('dist/sitemap.xml', 'utf8'), /<loc>https:\/\/warmtepompenmatch\.nl\/privacy\/<\/loc><lastmod>2026-10-21<\/lastmod>/);
});
