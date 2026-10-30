// Gebruiksrecht logo's (SC 30-10): geen logo van een merk in ZONDER_LOGO in de tabelcellen; elk merk heeft een richtlijn en status.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ZONDER_LOGO, LOGO_RECHTEN } from '../src/lib/logo-rechten.js';

const DIST = 'dist';
const pages = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? pages(p) : p.endsWith('.html') ? [p] : []; });

test('logo-rechten: elk merk heeft een richtlijn-URL (of "geen merkrichtlijn gevonden") en een status', () => {
  for (const [id, r] of Object.entries(LOGO_RECHTEN)) {
    assert.match(r.richtlijn, /^https:\/\/|^geen merkrichtlijn gevonden/, id);
    assert.match(r.status, /^(logo:|GEEN LOGO:)/, id);
    assert.equal(ZONDER_LOGO.has(id), r.status.startsWith('GEEN LOGO'), id);
  }
});

test('logo-rechten: geen tabelcel-logo van een merk in ZONDER_LOGO', () => {
  assert.ok(existsSync(DIST), 'dist ontbreekt');
  let n = 0;
  for (const p of pages(DIST)) {
    for (const [, src] of readFileSync(p, 'utf8').matchAll(/<span class="cel-logo"><img src="[^"]*\/(?:logos|brands)\/([a-z0-9-]+)\.(?:svg|webp|png)"/g)) {
      n++;
      assert.ok(!ZONDER_LOGO.has(src), p + ': logo van ' + src + ' mag niet');
    }
  }
  assert.ok(n > 0);
});
