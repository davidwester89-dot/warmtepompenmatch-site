import { test } from 'node:test';
import assert from 'node:assert/strict';
import { partnerBlokken, partnerNoten, metNoot, NOOT_HTML, PARTNER_NOOT } from '../src/lib/partnerlinks.js';

// Partnerzin i.p.v. label per knop: precies één zin per blok met partnerlinks; rel sponsored nofollow noopener blijft.
const A = '<a class="btn" href="https://example.com/a" rel="sponsored nofollow noopener" data-vendor="x">Naar A</a>';
const B = A.replace('/a"', '/b"');
const G = '<a class="btn" href="https://example.com/g" rel="noopener" data-vendor="g">Naar G</a>';

test('partnerzin: één zin per blok met partnerlink(s), geen zin zonder partnerlink, geen label', () => {
  assert.equal(PARTNER_NOOT, 'Sommige links zijn partnerlinks; dat verandert de volgorde nooit.');
  const blok = (x) => `<div class="out">${x}</div>`;
  const out = partnerNoten(`<main>${blok(A + B)}<p>tekst</p>${blok(G)}</main>`);
  assert.equal(out.split(NOOT_HTML).length - 1, 1);
  assert.ok(out.includes(blok(A + B) + NOOT_HTML));
  assert.ok(out.includes(blok(G) + '</main>'));
  assert.equal(partnerNoten(out), out, 'geen tweede zin bij opnieuw draaien');
  assert.equal(metNoot(G), G);
  assert.equal(metNoot(A + B), A + B + NOOT_HTML);
  assert.doesNotMatch(out, />\s*partner ?link\s*<\/span>/i);
});

