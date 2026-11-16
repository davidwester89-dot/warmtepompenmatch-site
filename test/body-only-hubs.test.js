import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unchangedHubDateErrors, bodyFingerprint } from '../scripts/l7check.mjs';
const h = (date, extra = '') => `<html><body><main><h1>Blog</h1><p>Updated <time datetime="${date}">${date}</time></p><p>Vaste inleiding.</p>${extra}</main></body></html>`;
const cfg = { bodyOnlyHubs: ['/blog/'] };
test('een ongewijzigde hub behoudt zijn eigen datum, ook als een kind later wijzigt', () => {
  assert.deepEqual(unchangedHubDateErrors('/blog/', h('2026-11-11'), h('2026-11-11'), '2026-11-11', '2026-11-11', cfg), []);
});
test('een datum-only lift van de hub is juist rood, niet vrijgesteld', () => {
  assert.equal(bodyFingerprint(h('2026-11-11')), bodyFingerprint(h('2026-11-18')));
  assert.equal(unchangedHubDateErrors('/blog/', h('2026-11-11'), h('2026-11-18'), '2026-11-11', '2026-11-18', cfg).length, 1);
});
test('een echte eigen hub-bodywijziging blijft beschikbaar voor de gewone L7-pushdatumcheck', () => {
  assert.notEqual(bodyFingerprint(h('2026-11-11')), bodyFingerprint(h('2026-11-18', '<p>Nieuwe samenvatting.</p>')));
  assert.deepEqual(unchangedHubDateErrors('/blog/', h('2026-11-11'), h('2026-11-18', '<p>Nieuwe samenvatting.</p>'), '2026-11-11', '2026-11-18', cfg), []);
});
