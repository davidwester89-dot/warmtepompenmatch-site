// Elke lastmod-lift vereist dateModified (les 19-11, SEO-les 23-11).
// CI (pages.yml) draait `npm test` zonder PUSH_DATE/BUILD_DATE: dan skip. 0 lifts is groen
// (geen lastmod verzinnen). De lastmod⇒dateModified-check zelf blijft hard.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const PUSH = process.env.PUSH_DATE || process.env.BUILD_DATE;

const dateModifieds = (html) => {
  const out = [];
  const walk = (o) => {
    if (!o || typeof o !== 'object') return;
    if (typeof o.dateModified === 'string') out.push(o.dateModified.slice(0, 10));
    for (const v of Object.values(o)) walk(v);
  };
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    walk(JSON.parse(m[1]));
  }
  return out;
};

test('elke pagina met lastmod = PUSH_DATE heeft dateModified = PUSH_DATE', (t) => {
  if (!PUSH) {
    t.skip('PUSH_DATE en BUILD_DATE ontbreken (CI/pages.yml zet ze niet)');
    return;
  }
  assert.match(PUSH, /^\d{4}-\d{2}-\d{2}$/, 'PUSH_DATE of BUILD_DATE ongeldig');
  execSync('node build.mjs', { env: { ...process.env, BASE: '', PREVIEW: '' }, stdio: 'ignore' });
  const sm = readFileSync('dist/sitemap.xml', 'utf8');
  const pages = [...sm.matchAll(/<loc>https:\/\/warmtepompenmatch\.nl([^<]*)<\/loc><lastmod>([^<]*)<\/lastmod>/g)];
  const lifted = pages.filter(([, , last]) => last === PUSH);
  const missing = [];
  for (const [, path, last] of lifted) {
    const file = path === '/' ? 'dist/index.html' : `dist${path}index.html`;
    const dms = dateModifieds(readFileSync(file, 'utf8'));
    if (!dms.includes(last)) missing.push(`${path}: lastmod ${last}, dateModified ${dms.join('/') || 'ontbreekt'}`);
  }
  assert.equal(missing.length, 0, missing.join('\n'));
});
