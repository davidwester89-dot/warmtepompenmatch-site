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
