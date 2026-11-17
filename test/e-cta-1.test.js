// E-CTA-1 golf 1 (17-11-2026): CTA-component A (na intro) en C (afsluiter) op gids/blog.
// Controleert: label "Partnerlink" + rel, geen onbetaalde CTA, fallback bij < 2 betaalde partners, plek van A/C,
// geen datums/prijzen in de blokken (L7/geen verzinsels) en de placeholderblokkade (CI faalt zolang er placeholders zijn).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { applyEcta, resolve, placeholders, metSubid, LABEL, REL, MAX_A, POS, INTERN_VENDORS } from '../src/e-cta.mjs';
import { MERKEN } from '../src/lib/merken.js';
import { ECTA } from '../src/e-cta-1.config.mjs';
import { PARTNERLINKS } from '../src/lib/partnerlinks.js';
import * as P from '../src/pages.mjs';
import { loadPosts } from '../src/blog.mjs';

// Site-adapter WarmtepompenMatch: 26 kaartpagina's + 1 nieuwe post (18-11) = 27, allemaal alleen keuzehulp.
const SITE = {
  root: 'dist',
  aantal: 27,
  build: () => execSync('node build.mjs', { stdio: 'ignore', env: { ...process.env, BASE: '', PREVIEW: '' } }),
  file: (p) => join('dist', p, 'index.html'),
  gidsBlog: () => [...P.guides.map((g) => g.path), ...loadPosts().map((x) => x.path), '/gidsen/', '/blog/'],
  betaald: () => Object.values(PARTNERLINKS),
  datumvelden: (s) => [...s.matchAll(/"date(?:Published|Modified)":\s*"[^"]*"|datetime="[^"]*"|<lastmod>[^<]*/g)].map((m) => m[0]),
  onbetaald: 'quatt',
  eenBetaald: [],
};

const STRIP = /<aside class="ecta[^"]*"[^>]*data-ecta="[AC]"[^>]*>[\s\S]*?<\/aside>\n/g;
const BLOK = /<aside class="ecta[^"]*"[^>]*data-ecta="([AC])"[^>]*>[\s\S]*?<\/aside>/g;
const html = (d) => readdirSync(d).flatMap((f) => { if (/^(node_modules|\.git|test|scripts)$/.test(f)) return []; const p = join(d, f); return statSync(p).isDirectory() ? html(p) : p.endsWith('.html') ? [p] : []; });
const blokken = (s) => [...s.matchAll(BLOK)].map((m) => ({ pos: m[1], html: m[0], index: m.index }));
const extern = (b) => [...b.matchAll(/<a\s[^>]*href="(https?:\/\/[^"]*)"[^>]*>/g)];
const paden = Object.keys(ECTA.pages);
let gebouwd = false;
const lees = (p) => { if (!gebouwd) { SITE.build(); gebouwd = true; } return readFileSync(SITE.file(p), 'utf8'); };

test('E-CTA-1: config = PM-partnerkaart; alle gids- en blogpagina\'s erin; reflinks alleen goedgekeurde links', () => {
  assert.ok(ECTA.pmKaart, 'pad naar de PM-partnerkaart');
  for (const p of SITE.gidsBlog()) assert.ok(paden.includes(p), `${p}: gids/blog ontbreekt in de config`);
  for (const p of paden) assert.ok(statSync(SITE.file(p)).isFile(), `${p}: pagina bestaat`);
  assert.deepEqual(paden.length, SITE.aantal, 'aantal pagina\'s volgens kaart + nieuwe posts');
  const betaald = new Set(SITE.betaald());
  for (const [id, x] of Object.entries(ECTA.partners)) if (x.reflink) assert.ok(betaald.has(x.reflink), `${id}: reflink niet in de goedgekeurde partnerlinks van de site`);
  for (const [id, x] of Object.entries(ECTA.partners)) if (x.reflink && x.subid) assert.equal(x.subid.param, 'ws', `${id}: alleen Daisycon ws= als subID`);
  assert.throws(() => resolve({ ...ECTA, pages: { '/x/': { partners: ['bestaat-niet'] } } }, '/x/'), /onbekende partner/);
  const leeg = Object.keys(ECTA.partners).find((id) => !ECTA.partners[id].reflink) || SITE.onbetaald;
  const cfg = { ...ECTA, partners: { ...ECTA.partners, [leeg]: { naam: 'X', reflink: '' } }, pages: { '/x/': { partners: [leeg, ...SITE.eenBetaald] } } };
  const r = resolve(cfg, '/x/');
  assert.deepEqual(r.partners.map((x) => x.id), SITE.eenBetaald, 'leeg reflinkveld = partner valt weg');
  assert.equal(r.fallback, true, '< 2 betaald = fallback');
});

test('E-CTA-1: elke configpagina heeft precies één A (na de intro) en één C (afsluiter); andere pagina\'s geen', () => {
  for (const p of paden) {
    const s = lees(p); const b = blokken(s);
    assert.deepEqual(b.map((x) => x.pos), ['A', 'C'], `${p}: A en C`);
    const h1 = s.indexOf('<h1');
    assert.ok(b[0].index > h1 && b[1].index > b[0].index, `${p}: A na de h1, C na A`);
    const lead = s.indexOf('<p class="lead"', h1);
    if (ECTA.ankerA === 'lead' && lead > 0 && lead < b[0].index + 1) assert.ok(b[0].index > lead, `${p}: A na de lead`);
    const voor = s.slice(h1, b[0].index).replace(/<aside[\s\S]*?<\/aside>/g, '');
    assert.equal((voor.match(/<a\s/g) || []).length, (voor.match(/<\/a>/g) || []).length, `${p}: A niet binnen een link`);
    assert.doesNotMatch(voor.replace(/<a\s[\s\S]*?<\/a>/g, ''), /<h2[\s>]/, `${p}: A staat vóór de eerste h2 van de inhoud`);
    const naC = s.slice(b[1].index + b[1].html.length + 1);
    assert.ok(ECTA.ankersC.some((x) => naC.startsWith(x)), `${p}: C staat vóór een afsluit-anker`);
  }
  for (const f of html(SITE.root)) {
    if (paden.some((p) => SITE.file(p) === f)) continue;
    assert.equal(blokken(readFileSync(f, 'utf8')).length, 0, `${f}: E-CTA buiten de config`);
  }
});

test('E-CTA-1: elke betaalde knop heeft label "Partnerlink" en rel="sponsored nofollow noopener"; geen onbetaalde CTA', () => {
  assert.equal(LABEL, 'Partnerlink'); assert.equal(REL, 'sponsored nofollow noopener');
  const betaald = new Set(SITE.betaald().map((u) => u.replace(/&/g, '&amp;')));
  const zonderWs = (u) => { const x = new URL(u.replace(/&amp;/g, '&')); x.searchParams.delete('ws'); return x.toString(); };
  const basis = new Set(SITE.betaald().map(zonderWs));
  let n = 0;
  for (const p of paden) {
    for (const b of blokken(lees(p))) {
      for (const m of extern(b.html)) {
        n++;
        assert.match(m[0], new RegExp(`rel="${REL}"`), `${p} ${b.pos}: rel`);
        assert.ok(betaald.has(m[1]) || basis.has(zonderWs(m[1])), `${p} ${b.pos}: ${m[1]} is geen goedgekeurde partnerlink`);
        const id = (m[0].match(/data-vendor="([^"]+)"/) || [])[1];
        const ws = new URL(m[1].replace(/&amp;/g, '&')).searchParams.get('ws');
        if (ws !== null && /jf79\.net|daisycon/.test(m[1])) assert.equal(ws, `${ECTA.site}-${p.replace(/\/$/, '').split('/').pop()}-${POS[b.pos]}`, `${p} ${b.pos} ${id}: ws-subID volgens kaart`);
        const na = b.html.slice(m.index + m[0].length);
        assert.match(na, /^[^<]*<\/a> <span class="ecta-label">Partnerlink<\/span>/, `${p} ${b.pos}: label direct na de knop`);
      }
      assert.equal((b.html.match(/class="ecta-label"/g) || []).length, extern(b.html).length, `${p} ${b.pos}: label alleen bij betaalde knoppen`);
    }
  }
  console.log(`# E-CTA-1 ${ECTA.site}: ${n} betaalde knoppen in A/C`);
});

test('E-CTA-1: volgorde = config (neutraal), max 3 in A, C = eerste uit dezelfde volgorde', () => {
  for (const p of paden) {
    const r = resolve(ECTA, p); if (r.fallback) continue;
    const [a, c] = blokken(lees(p));
    const ids = [...a.html.matchAll(/data-vendor="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(ids, r.partners.slice(0, MAX_A).map((x) => x.vendor), `${p}: volgorde A`);
    assert.deepEqual([...c.html.matchAll(/data-vendor="([^"]+)"/g)].map((m) => m[1]), [r.partners[0].vendor], `${p}: C`);
  }
});

test('E-CTA-1: fallback bij < 2 betaalde partners: A en C alleen naar keuzehulp/vergelijker, geen merk', () => {
  const kaal = '<main><article><h1>T</h1><p>intro</p>\n<h2>Een</h2><p>x</p>\n<h2>Veelgestelde vragen</h2></article></main>';
  const cfg = { ...ECTA, ankerA: 'h2', ankersC: ['<h2>Veelgestelde vragen</h2>'], pages: { '/t/': { partners: SITE.eenBetaald } } };
  for (const s of [applyEcta(kaal, '/t/', cfg), applyEcta(kaal, '/t/', { ...cfg, pages: { '/t/': { partners: [] } } })]) {
    const b = blokken(s);
    assert.equal(b.length, 2);
    for (const x of b) {
      assert.equal(extern(x.html).length, 0, 'geen externe link');
      assert.doesNotMatch(x.html, /sponsored|ecta-label/);
      // Sinds SEO-review c120387: alleen de interne waarden keuzehulp/vergelijker als data-vendor, nooit een merk.
      assert.deepEqual([...new Set([...x.html.matchAll(/data-vendor="([^"]+)"/g)].map((m) => m[1]))].sort(), ['keuzehulp', 'vergelijker']);
      assert.match(x.html, new RegExp(`href="${ECTA.keuzehulp.href}"`));
      assert.match(x.html, new RegExp(`href="${ECTA.vergelijker.href}"`));
    }
  }
  for (const p of paden) if (resolve(ECTA, p).fallback) for (const b of blokken(lees(p))) assert.equal(extern(b.html).length, 0, `${p}: fallback zonder merk`);
});

test('E-CTA-1: blokken zonder datums of prijzen; idempotent; tekst buiten de blokken byte-gelijk (geen datum-lift)', () => {
  for (const p of paden) {
    const s = lees(p);
    for (const b of blokken(s)) {
      assert.doesNotMatch(b.html, /<time|datetime=/i, `${p}: datum in E-CTA`);
      assert.doesNotMatch(b.html.replace(/<[^>]+>/g, ' '), /\b20\d\d\b|\d+[,.]\d\d|€|%|\bgratis\b|korting|\bactie|beste deal|goedkoopst/i, `${p}: datum/prijs/claim in E-CTA`);
    }
    assert.equal(applyEcta(s, p, ECTA), s, `${p}: idempotent`);
    const zonder = s.replace(STRIP, '');
    assert.equal(zonder.includes('data-ecta='), false);
    assert.equal(applyEcta(zonder, p, ECTA), s, `${p}: alleen de twee blokken toegevoegd, de rest byte-gelijk`);
    for (const veld of SITE.datumvelden(zonder)) assert.ok(SITE.datumvelden(s).includes(veld), `${p}: datumveld ${veld}`);
  }
});

test('E-CTA-1: placeholders zijn zichtbaar in de HTML en blokkeren CI tot de PM-partnerkaart/subID\'s er zijn', () => {
  const open = placeholders(ECTA);
  let blokPh = 0, linkPh = 0;
  for (const p of paden) for (const b of blokken(lees(p))) {
    if (/^<aside[^>]*data-ecta-placeholder="pm-kaart"/.test(b.html)) blokPh++;
    linkPh += (b.html.match(/<a [^>]*data-ecta-placeholder="subid"/g) || []).length;
  }
  assert.equal(blokPh, ECTA.pmKaart ? 0 : paden.length * 2, 'pm-kaart-placeholder op elk blok zolang de kaart ontbreekt');
  assert.equal(placeholders({ ...ECTA, pmKaart: null })[0].startsWith('pm-kaart'), true, 'ontbrekende kaart wordt gemeld');
  const proef = { ...ECTA, partners: Object.fromEntries(Object.entries(ECTA.partners).map(([id, x]) => [id, { ...x, subid: null }])) };
  const ph = Object.keys(ECTA.pages).some((q) => !resolve(proef, q).fallback);
  if (ph) assert.ok(placeholders(proef).some((x) => x.startsWith('subid:')), 'open subID wordt gemeld');
  if (ph) assert.match(applyEcta(lees(paden.find((q) => !resolve(proef, q).fallback)), paden.find((q) => !resolve(proef, q).fallback), proef), /data-ecta-placeholder="subid"/);
  const subidOpen = open.filter((x) => x.startsWith('subid:')).length;
  assert.equal(linkPh > 0, subidOpen > 0, 'subID-placeholders in HTML ↔ config');
  console.log(`# E-CTA-1 ${ECTA.site} placeholders (${open.length}): ${open.join(' | ') || 'geen'}`);
  if (process.env.GITHUB_ACTIONS === 'true' || process.env.ECTA_STRICT === '1') {
    assert.deepEqual(open, [], `E-CTA-1 placeholders open, niet live zetten: ${open.join(' | ')}`);
  }
});

test('E-CTA-1 WPM: geen goedgekeurde partner → overal alleen keuzehulp; een reflink invullen activeert pas bij ≥ 2', () => {
  assert.deepEqual(Object.keys(PARTNERLINKS), [], 'PARTNERLINKS leeg op 17-11');
  for (const [id, x] of Object.entries(ECTA.partners)) assert.equal(x.reflink, '', `${id}: geen reflink zonder acceptatie`);
  for (const p of paden) assert.equal(resolve(ECTA, p).fallback, true, p);
  const cfg = { ...ECTA, partners: { ...ECTA.partners, quatt: { ...ECTA.partners.quatt, reflink: 'https://example.test/q' } }, pages: { '/t/': { partners: ['quatt', 'adlar'] } } };
  const r = resolve(cfg, '/t/');
  assert.equal(r.partners.length, 1); assert.equal(r.fallback, true, 'één gevulde reflink = nog steeds fallback');
});

test('E-CTA-1 meting (SEO-review c120387): elke fallbacklink heeft data-vendor keuzehulp|vergelijker en data-pos top|eind', () => {
  // consent.js vuurt vendor_click alleen op a[data-vendor]; zonder data-vendor telt de KPI deze kliks niet.
  const consent = readFileSync('src/assets/js/consent.js', 'utf8');
  assert.match(consent, /a\[data-vendor\]/);
  assert.match(consent, /track\('vendor_click', \{ vendor: t\.dataset\.vendor, page: location\.pathname, position: t\.dataset\.pos, cta_type: t\.dataset\.cta \}\)/);
  // Onderscheidbaar van echte affiliates: geen merk-id en geen partner-id.
  assert.deepEqual(INTERN_VENDORS, ['keuzehulp', 'vergelijker']);
  for (const v of INTERN_VENDORS) {
    assert.ok(!(v in MERKEN) && !(v in PARTNERLINKS) && !(v in ECTA.partners), v);
    assert.ok(!Object.values(ECTA.partners).some((x) => x.vendor === v), v);
  }
  let n = 0;
  for (const p of paden) for (const b of blokken(lees(p))) {
    if (!/ecta-fallback/.test(b.html)) continue;
    const links = [...b.html.matchAll(/<a\b[^>]*>/g)].map((m) => m[0]);
    assert.equal(links.length, 2, p);
    for (const a of links) {
      const href = a.match(/href="([^"]+)"/)[1];
      const want = href === ECTA.keuzehulp.href ? 'keuzehulp' : href === ECTA.vergelijker.href ? 'vergelijker' : null;
      assert.ok(want, `${p}: onverwachte link ${a}`);
      assert.match(a, new RegExp(`data-vendor="${want}"`), p);
      assert.match(a, new RegExp(`data-pos="${POS[b.pos]}"`), p);
      assert.match(a, new RegExp(`data-cta="ecta-${b.pos.toLowerCase()}"`), p);
      assert.doesNotMatch(a, /rel=|target=/, p);
      n++;
    }
  }
  assert.equal(n, SITE.aantal * 4, 'A en C, elk keuzehulp + vergelijker');
  console.log(`# E-CTA-1 meting: ${n} fallbacklinks met data-vendor + data-pos`);
});
