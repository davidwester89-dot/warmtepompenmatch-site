// Ronde 2 (20-10-2026): footer zonder 'score', voorzichtige vergoedingszin, leesbare bronlinks, consent-sleutel.
import test from 'node:test';
import assert from 'node:assert/strict';
import { read, buildLive, htmlFiles } from './helpers.js';

test('footer: geen "score", wel volgorde (partnerlinks)', () => {
  const fine = read('src/layout.mjs').match(/<p class="fine">.*?<\/p>/)[0];
  assert.doesNotMatch(fine, /score/i);
  assert.match(fine, /nooit invloed op de volgorde/);
});

test('privacy: vergoeding is een mogelijkheid ("kunnen ... krijgen"), geen zekerheid', () => {
  const s = read('src/privacy-avg.mjs');
  assert.doesNotMatch(s, /dan krijgen wij daardoor een vergoeding/);
  assert.match(s, /dan kunnen wij daardoor een vergoeding krijgen/);
});

test('bronlinks: geen kale URL (domein/pad) als linktekst', () => {
  buildLive();
  const kaal = htmlFiles().flatMap((f) => [...read(f).matchAll(/<a [^>]*>([^<]*)<\/a>/g)].map((m) => m[1]).filter((t) => /(^|: )[a-z0-9.-]+\.[a-z]{2,}\/\S/.test(t)).map((t) => `${f}: ${t}`));
  assert.deepEqual(kaal, []);
  const dk = read('dist/merken/daikin/index.html');
  for (const t of ['Daikin: Het Nieuwe Verwarmen, Daikin-warmtepompen (daikin.nl)', 'Daikin: Onecta-app (daikin.nl)', 'Daikin: Dealer Locator voor consumenten (daikin.nl)']) assert.ok(dk.includes(`>${t}</a>`), t);
});

test('wetten.overheid.nl-link: & ge-escaped als &amp; in href', () => {
  buildLive();
  const h = read('dist/warmtepomp-geluid/index.html');
  assert.match(h, /href="https:\/\/wetten\.overheid\.nl\/jci1\.3:c:BWBR0041297&amp;hoofdstuk=4&amp;afdeling=4\.2&amp;paragraaf=4\.2\.6&amp;artikel=4\.107"/);
  const bare = htmlFiles().filter((f) => /href="https?:[^"]*&(?!amp;|#|[a-z]+;)[^"]*"/.test(read(f)));
  assert.deepEqual(bare, []);
});

test('fout-melden-mailto: & in href ge-escaped als &amp;', () => {
  buildLive();
  const files = htmlFiles();
  const bad = files.filter((f) => /href="mailto:[^"]*&(?!amp;|#|[a-z]+;)[^"]*"/.test(read(f)));
  assert.deepEqual(bad, []);
  assert.match(read('dist/index.html'), /href="mailto:info@warmtepompenmatch\.nl\?subject=[^"&]+&amp;body=[^"&]+" data-cta="report_error"/);
});
