// Audit 20-10-2026 (snelheid-mobiel-ux + beveiliging-juridisch): regressietests.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { a11yTabellen } from '../src/a11y-tabellen.mjs';

const pages = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? pages(p) : p.endsWith('.html') ? [p] : []; });

test('a11yTabellen: wrapper focusbaar met label, lege kopcel krijgt tekst', () => {
  const h = a11yTabellen('<div class="table-wrap"><table><thead><tr><th></th><th>2026</th></tr></thead><tbody><tr><td>a</td><td>b</td></tr></tbody></table></div>');
  assert.match(h, /tabindex="0" role="region" aria-label="Tabel: 2026"/);
  assert.ok(!h.includes('<th></th>'));
});

test('build: privacyblok, tabellen, menu-Escape, cookieknoppen', () => {
  execSync('node build.mjs', { stdio: 'ignore', env: { ...process.env, BASE: '', PREVIEW: '' } });
  const priv = readFileSync('dist/privacy/index.html', 'utf8');
  for (const t of ['Op welke grond?', 'artikel 6 lid 1 sub a AVG', '11.7a Telecommunicatiewet', 'Data Privacy Framework', '2023/1795', '_ga_BVXLE8T5WC', '365 dagen', 'Bewaartermijnen', 'overdraagbaarheid', 'Laatst bijgewerkt', 'Wie is verantwoordelijk?']) assert.ok(priv.includes(t), 'privacy mist: ' + t);
  for (const f of pages('dist')) {
    const s = readFileSync(f, 'utf8');
    if (f.endsWith('.html') && s.includes('<body')) assert.ok(s.includes('<script type="module" src="/js/menu.js"></script>') || /http-equiv="refresh"/.test(s), f + ': menu.js');
    for (const m of s.matchAll(/<div class="(table-wrap|tbl)"[^>]*>\s*<table/g)) assert.match(m[0], /tabindex="0" role="region" aria-label="[^"]+"/, f + ': tabel niet focusbaar');
    assert.ok(!/<th( scope="col")?><\/th>/.test(s), f + ': lege kopcel');
    assert.ok(!/consent-btn\[data-c=no\]\{background/.test(s), f + ': Weigeren anders gestyled');
  }
  assert.match(readFileSync('dist/js/menu.js', 'utf8'), /Escape/);
});
