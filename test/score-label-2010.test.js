// Huisregel 20-10-2026: checklisttelling mag niet lezen als beoordeling.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('Alternatieven op merkpagina: "x van 10 checklistpunten" met link naar methode, geen "score x/10"', () => {
  const s = readFileSync('src/pages.mjs', 'utf8');
  assert.match(s, /van 10 checklistpunten \(<a href="\/over\/#methode">hoe de score werkt<\/a>\)/);
  assert.doesNotMatch(s, /· score \$\{fmtScore\(score\(x\)\.totaal\)\}\/10/);
});
