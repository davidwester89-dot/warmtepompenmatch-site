// Huisregel 20-10-2026: checklisttelling mag niet lezen als beoordeling.
// Aangepast 29-10-2026: bij de alternatieven staat helemaal geen telling of score meer.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('Alternatieven op merkpagina: geen "x van 10 checklistpunten" en geen "score x/10"', () => {
  const s = readFileSync('src/pages.mjs', 'utf8');
  assert.doesNotMatch(s, /van 10 checklistpunten/);
  assert.doesNotMatch(s, /hoe de score werkt/i);
  assert.doesNotMatch(s, /· score \$\{fmtScore\(score\(x\)\.totaal\)\}\/10/);
});
