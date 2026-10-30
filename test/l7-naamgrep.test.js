// L7-datumcheck (A), dist-brede naamgrep + repo-root-404 (B). Voorstel SEO-specialist 4-11-2026, review Site-controleur.
// Kern: scripts/l7check.mjs, siteconfig: scripts/l7.config.mjs (beide niet geserveerd). Draaien:
//   npm test                                         → basis = merge-base met origin/main, pushdatum = vandaag (Europe/Amsterdam)
//   PUSH_DATE=2026-11-12 L7_BASE=<laatste live commit> npm test   → voor een geplande keten (bv. BM 12-11: L7_BASE=956a419)
// Zonder basis (CI met shallow clone zonder origin/main) wordt alleen de L7-test overgeslagen; naamgrep en 404 draaien altijd.
// UITZONDERING: alleen ONTBREKENDE velden op pagina's waarvan de template dat veld niet heeft (SC beslist; een aanwezig veld
// moet altijd de pushdatum hebben). BEKEND_*: bestaande bevindingen die bij deze test hoorden; elk opgelost item meldt de test.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { runL7, nameGrep, repoRoot404, hubAudit, materialize, dateFields, bodyFingerprint, jsFingerprint, ownPublished, isBekend, bekendActief } from '../scripts/l7check.mjs';
import * as SITE from '../scripts/l7.config.mjs';
const { CFG, ALLOW_NAME = [], BEKEND_ORPHAN = [], BEKEND_HUB = [], BEKEND_L7 = [] } = SITE;

const ROOT = fileURLToPath(new URL('..', import.meta.url));

test('L7: elke pagina met bodywijziging (ook client-side uitslag, hubs) heeft overal de pushdatum', (t) => {
  const r = runL7(ROOT, CFG);
  // In CI (L7_BASE = github.event.before) is een ontbrekende basis een fout, geen skip: anders is de test daar stil groen.
  if (r.skipped) { if (process.env.CI && process.env.L7_BASE) assert.fail(`L7 in CI zonder basis: ${r.skipped}`); t.skip(r.skipped); return; }
  t.diagnostic(`basis ${r.base.slice(0, 7)} (${r.how}), pushdatum ${r.pushDate}, ${r.changed.length} gewijzigd, hubs: ${r.hubs.join(' ') || '-'}`);
  for (const l of r.report) t.diagnostic(l);
  for (const f of r.failures.filter((f) => isBekend(f, BEKEND_L7))) t.diagnostic(`BEKEND_L7 (tot ${BEKEND_L7.find((b) => f.startsWith(b.pad))?.tot || '-'}): ${f}`);
  for (const b of BEKEND_L7.filter((b) => !bekendActief(b))) t.diagnostic(`BEKEND_L7 verlopen op ${b.tot}, telt weer als fout: ${b.pad}`);
  assert.deepEqual(r.failures.filter((f) => !isBekend(f, BEKEND_L7)), []);
});

let OUT, TMP;
const out = () => {
  if (!OUT) {
    TMP = mkdtempSync(join(tmpdir(), 'naamgrep-'));
    materialize(ROOT, process.env.L7_TIP || 'WORKTREE', TMP);
    const env = { ...process.env };
    if (process.env.PUSH_DATE) env.BUILD_DATE = process.env.PUSH_DATE;
    OUT = CFG.build(TMP, env);
  }
  return OUT;
};
after(() => TMP && rmSync(TMP, { recursive: true, force: true }));

test('hub-audit (L7): elke hub draagt de nieuwste datum van zijn kinderen (zichtbare regel en lastmod)', (t) => {
  const alle = hubAudit(out(), CFG);
  const bekend = (h) => isBekend(h, BEKEND_HUB);
  for (const b of BEKEND_HUB.filter((b) => !bekendActief(b))) t.diagnostic(`BEKEND_HUB verlopen op ${b.tot}, telt weer als fout: ${b.pad}`);
  for (const h of alle.filter(bekend)) t.diagnostic(`BEKEND (bevinding, nog niet opgelost): ${h}`);
  for (const b of BEKEND_HUB) if (!alle.some((h) => h.startsWith(b.pad + ':'))) t.diagnostic(`BEKEND_HUB opgelost, haal weg: ${b.pad}`);
  assert.deepEqual(alle.filter((h) => !bekend(h)), []);
});

test('naamgrep: geen Dave/Wester/gmail in ENIG geserveerd bestand (html, js, mjs, json, xml, txt, …)', () => {
  assert.deepEqual(nameGrep(out(), ALLOW_NAME), []);
});

test('repo-root-404: geen repo-/buildbestanden of build-only scripts in de output', (t) => {
  const fout = repoRoot404(out(), { allowOrphans: BEKEND_ORPHAN.map((b) => b.re) });
  for (const b of BEKEND_ORPHAN) t.diagnostic(`BEKEND: ${b.reden}`);
  assert.deepEqual(fout, []);
});

test('zelftest BEKEND met vervaldatum (besluit A): actief t/m tot, daarna weer fout; alleen = smal', () => {
  const lijst = [{ pad: '/gidsen/', alleen: /: lastmod 2026-10-10$/, tot: '2026-11-12', reden: 'test' }];
  const l7 = '/gidsen/ (bodywijziging; verwacht 2026-11-03): lastmod 2026-10-10', hub = '/gidsen/: hub ouder dan nieuwste kind 2026-11-03 (/x/): lastmod 2026-10-10';
  assert.ok(isBekend(l7, lijst, '2026-11-12') && isBekend(hub, lijst, '2026-10-30'));
  assert.ok(!isBekend(l7, lijst, '2026-11-13') && !isBekend(hub, lijst, '2026-11-13'), 'na tot vervallen');
  assert.ok(!isBekend('/gidsen/ (bodywijziging; verwacht 2026-11-03): zichtbaar 2026-10-10, lastmod 2026-10-10', lijst, '2026-10-30'), 'ander veld fout = niet bekend');
  assert.ok(!isBekend('/gidsen/x/ (bodywijziging): lastmod 2026-10-10', lijst, '2026-10-30') && !isBekend('/blog/: lastmod 2026-10-10', lijst, '2026-10-30'));
  assert.ok(isBekend('/blog/: hub ouder', [{ pad: '/blog/', reden: 'zonder tot' }], '2099-01-01'));
});

test('zelftest l7check: datums, logo en footer tellen niet als bodywijziging; naam en repo-bestand vallen op', () => {
  const page = (main, foot = '', logo = 'a') => `<html><body><header>nav</header><main><p>Laatst bijgewerkt <time datetime="2026-11-12">12 november 2026</time></p><img src="/logos/${logo}.svg" alt="${logo} logo"><p>Tekst gecontroleerd op 30 oktober 2026.</p>${main}</main><footer>${foot}</footer></body></html>`;
  assert.equal(bodyFingerprint(page('', 'x', 'a')), bodyFingerprint(page('', 'y', 'b').replace('30 oktober', '2 november')));
  assert.notEqual(bodyFingerprint(page('')), bodyFingerprint(page('<p>Nieuwe zin.</p>')));
  assert.notEqual(bodyFingerprint(page('')), bodyFingerprint(page('<a href="/nieuw/">x</a>').replace('>x<', '><')));
  assert.notEqual(bodyFingerprint(page('<p>Actie tot 30 november 2026.</p>')), bodyFingerprint(page('<p>Actie tot 31 december 2026.</p>'))); // datum in tekst = inhoud
  assert.notEqual(jsFingerprint("x = `${logoImg(id, { maat: 'sm' })}<p>€ 9,95</p>`;"), jsFingerprint("x = `${logoImg(id, { maat: 'sm' })}<p>€ 12,95</p>`;")); // prijs op logoregel telt
  assert.equal(jsFingerprint("x = `<h3>${esc(n)}</h3>`;"), jsFingerprint("import { logoImg } from './logos.js';\nx = `${logoImg(id, { maat: 'sm', base: B })}<h3>${esc(n)}</h3>`;")); // alleen logo erbij telt niet
  assert.deepEqual(ownPublished('<script type="application/ld+json">{"@type":"Blog","datePublished":"2026-10-01","blogPost":[{"datePublished":"2026-11-10"}]}</script>'), ['2026-10-01']);
  const d = dateFields('<script type="application/ld+json">{"@type":"Article","dateModified":"2026-11-12","hasPart":[{"dateModified":"2026-01-01"}]}</script><body><p>bijgewerkt op 12 november 2026.</p></body>');
  assert.deepEqual([d.ld, d.visible], [['2026-11-12'], '2026-11-12']);
  assert.equal(dateFields('<body>Updated <time datetime="2026-11-12">12 November 2026</time></body>').visible, '2026-11-12');
  const tmp = mkdtempSync(join(tmpdir(), 'l7zelf-'));
  try {
    mkdirSync(join(tmp, 'js/lib'), { recursive: true });
    writeFileSync(join(tmp, 'index.html'), '<html><body><script type="module" src="/js/app.js"></script></body></html>');
    writeFileSync(join(tmp, 'js/app.js'), "import './lib/a.js';");
    writeFileSync(join(tmp, 'js/lib/a.js'), '// geen naam');
    writeFileSync(join(tmp, 'js/lib/logo-rechten.js'), '// Rechten: zie mail van d' + 'ave@' + 'gm' + 'ail.com');
    writeFileSync(join(tmp, 'package.json'), '{}');
    writeFileSync(join(tmp, 'x.mjs'), 'export const a = "We' + 'ster";');
    assert.equal(nameGrep(tmp).length, 3); // dave + gmail in logo-rechten.js, Wester in x.mjs
    const r = repoRoot404(tmp).join('\n');
    assert.match(r, /package\.json/); assert.match(r, /logo-rechten\.js/); assert.doesNotMatch(r, /js\/lib\/a\.js/);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});
