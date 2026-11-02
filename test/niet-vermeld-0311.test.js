// Externe feedback nov: 'Niet vermeld' overal dezelfde, ware uitleg. Code: checklist.js punt(null) = 0 (net als nee),
// ranglijst = meeste punten; /vergelijken/ zei 'telt niet mee', /over/ en de merkpagina's 'telt als 0'. Nu overal:
// 'Niet vermeld levert geen punt op, net als nee.' L7: EF_PADEN op 2026-11-03.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { EF_UPD, EF_PADEN } from '../src/pages.mjs';
import { punt } from '../src/lib/checklist.js';

const read = (p) => readFileSync(p, 'utf8');
const files = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? files(p) : p.endsWith('.html') ? [p] : []; });
const zichtbaar = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');

test('Niet vermeld: één uitleg die klopt met de code', () => {
  execSync('node build.mjs', { env: { ...process.env, BASE: '', PREVIEW: '' }, stdio: 'ignore' });
  assert.equal(punt(null), 0, 'checklist: niet vermeld = 0 punten (anders klopt de uitleg niet meer)');
  for (const f of files('dist')) assert.doesNotMatch(zichtbaar(read(f)), /[Nn]iet vermeld telt (als 0|niet mee)|telt het als 0/, f);
  for (const p of ['/over/']) assert.match(zichtbaar(read(`dist${p}index.html`)), /levert (het )?geen punt op, net als nee/, p);
  // SC-review 2cfdc56: onder de filters gaat het om meetellen, niet om punten (vergelijk.js: alleen ja of deels komt door een filter).
  assert.ok(read('dist/vergelijken/index.html').includes('<p class="sub">"Deels" telt mee. Niet vermeld telt, net als nee, niet mee.</p>'));
});

test('L7 3-11: lastmod, zichtbare bijgewerkt-regel en dateModified', () => {
  const sm = read('dist/sitemap.xml');
  for (const p of EF_PADEN) {
    assert.ok(sm.includes(`<loc>https://warmtepompenmatch.nl${p}</loc><lastmod>${EF_UPD}</lastmod>`), p);
    const h = read(`dist${p}index.html`);
    assert.match(h, new RegExp(`bijgewerkt (op )?<time datetime="${EF_UPD}">`, 'i'), p);
    assert.doesNotMatch(h, new RegExp(`"dateModified": ?"(?!${EF_UPD})`), p);
  }
});

test('L7-hubregel 3-11: /gidsen/ met zichtbare bijgewerkt-regel en lastmod op de pushdatum', () => {
  const h = read('dist/gidsen/index.html');
  assert.match(h, new RegExp(`Laatst bijgewerkt <time datetime="${EF_UPD}">`));
  assert.ok(read('dist/sitemap.xml').includes(`<loc>https://warmtepompenmatch.nl/gidsen/</loc><lastmod>${EF_UPD}</lastmod>`));
});
