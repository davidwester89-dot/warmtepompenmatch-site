// Ronde 2 (20-10-2026): footer zonder 'score', voorzichtige vergoedingszin, leesbare bronlinks, consent-sleutel.
import test from 'node:test';
import assert from 'node:assert/strict';
import { read } from './helpers.js';

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
