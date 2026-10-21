import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { advies, VRAGEN, isolatieVan, compleet } from '../src/lib/match.js';
import { bereken, isde2026, TYPES, GASPRIJS, STROOMPRIJS, jaarTekst } from '../src/lib/kosten.js';
import { IDS, FEATURES, MERKEN, STERK_IN } from '../src/lib/merken.js';
import { IDS_PUNTEN, MAX, score, ranglijst, punt, metType } from '../src/lib/checklist.js';
import { uitgaand, knop, PARTNERLINKS } from '../src/lib/partnerlinks.js';

const A = { woning: 'tussen', bouwjaar: '1975', isolatie: 'matig', budget: '10', gas: '1500', voorkeur: 'weetniet' };

test('ISDE 2026: € 1.025 + € 225/kW + € 200 bij A+++, minimaal € 500 (RVO)', () => {
  assert.equal(isde2026(4), 2125); // voorbeeld RVO / Milieu Centraal
  assert.equal(isde2026(8), 3025); // voorbeeld Milieu Centraal all-electric
  assert.equal(isde2026(4, false), 1925);
  assert.equal(isde2026(0, false), 1025);
  assert.ok(isde2026(-3, false) >= 500);
});

test('rekenvoorbeelden Milieu Centraal: besparing ~€ 600 (hybride) en ~€ 1.000 (all-electric)', () => {
  const h = bereken({ type: 'hybride', gas: 1360 });
  assert.equal(h.m3, 680); assert.equal(h.kwh, 1615); assert.ok(Math.abs(h.besparing - 600) <= 30, String(h.besparing));
  assert.equal(h.netto, 4075); assert.ok(h.jaren > 6 && h.jaren < 7.5);
  // Prijzen van Milieu Centraal (2026-2040): € 1,37/m³ gas, € 0,21/kWh (gecontroleerd 20-10-2026).
  assert.equal(GASPRIJS, 1.37); assert.equal(STROOMPRIJS, 0.21);
  assert.equal(h.besparing, 592); assert.equal(h.jaren, 6.9);
  const ae = bereken({ type: 'allelectric', gas: 950 });
  assert.equal(ae.kwh, 3150); assert.ok(Math.abs(ae.besparing - 1000) <= 40, String(ae.besparing));
  assert.ok(ae.jaren > 8 && ae.jaren < 10);
  assert.equal(ae.besparing, 1000); assert.equal(ae.jaren, 9);
  assert.equal(jaarTekst(9), '9,0 jaar'); assert.equal(jaarTekst(6.9), '6,9 jaar');
  assert.equal(bereken({ type: 'luchtlucht' }), null);
  assert.equal(bereken({ type: 'hybride', gas: 0 }).jaren, null);
});

test('keuzehulp: regels van Milieu Centraal', () => {
  // Matige isolatie: altijd hybride, ook met voorkeur all-electric.
  for (const voorkeur of ['hybride', 'allelectric', 'weetniet']) for (const budget of ['5', '10', '20', 'meer']) assert.equal(advies({ ...A, voorkeur, budget }).type, 'hybride');
  assert.equal(advies({ ...A, isolatie: 'slecht', voorkeur: 'allelectric' }).type, 'hybride');
  // Goede isolatie volgt de voorkeur.
  assert.equal(advies({ ...A, isolatie: 'goed', voorkeur: 'allelectric' }).type, 'allelectric');
  assert.equal(advies({ ...A, isolatie: 'goed', voorkeur: 'hybride' }).type, 'hybride');
  assert.equal(advies({ ...A, isolatie: 'redelijk', voorkeur: 'weetniet', budget: '20' }).type, 'allelectric');
  assert.equal(advies({ ...A, isolatie: 'redelijk', voorkeur: 'weetniet', budget: '10' }).type, 'hybride');
  // Weet niet: bouwjaar beslist.
  assert.deepEqual(isolatieVan({ isolatie: 'weetniet', bouwjaar: '2009' }), { niveau: 'goed', geschat: true });
  assert.equal(isolatieVan({ isolatie: 'weetniet', bouwjaar: 'voor1975' }).niveau, 'matig');
  // Bodem alleen met groot budget, goede isolatie en vrijstaand of 2-onder-1-kap.
  assert.ok(advies({ ...A, isolatie: 'goed', budget: 'meer', woning: 'vrijstaand' }).alternatieven.includes('bodem'));
  assert.ok(!advies({ ...A, isolatie: 'goed', budget: 'meer', woning: 'tussen' }).alternatieven.includes('bodem'));
  // Huis van 2019 of later: geen ISDE.
  assert.equal(advies({ ...A, bouwjaar: '2019' }).reken.subsidie, 0);
  // Merken in de uitslag bieden het type echt aan, in de vaste volgorde.
  for (const t of ['hybride', 'allelectric']) for (const id of metType(t)) assert.ok(['ja', 'deels'].includes(FEATURES[id][t].v), `${id} ${t}`);
  assert.ok(!metType('hybride').includes('panasonic'));
  assert.ok(compleet(A)); assert.ok(!compleet({ woning: 'tussen' }));
  for (const v of VRAGEN) for (const [val] of v.opties) assert.match(val, /^[a-z0-9]+$/);
});

test('checklist: 10 punten per merk, alleen ja/deels/nee/niet vermeld, met bron', () => {
  assert.equal(MAX, 10); assert.equal(IDS.length, 8);
  for (const id of IDS) {
    assert.deepEqual(Object.keys(FEATURES[id]).sort(), [...IDS_PUNTEN].sort(), id);
    for (const k of IDS_PUNTEN) {
      const f = FEATURES[id][k];
      assert.ok([null, 'ja', 'deels', 'nee'].includes(f.v), `${id}.${k}`);
      if (f.v) assert.match(f.s || '', /^https:\/\//, `${id}.${k} zonder bron`);
      if (f.v === null) assert.ok(!f.t && !f.s, `${id}.${k}: niet vermeld hoort geen toelichting te hebben`);
    }
    assert.ok(STERK_IN[id] && MERKEN[id].bronnen.length && MERKEN[id].plus.length && MERKEN[id].min.length);
  }
});

test('score = som van de punten; volgorde = score, dan naam', () => {
  for (const id of IDS) assert.equal(score(id).totaal, IDS_PUNTEN.reduce((t, k) => t + punt(FEATURES[id][k].v), 0));
  const r = ranglijst();
  for (let i = 1; i < r.length; i++) {
    const [a, b] = [score(r[i - 1]).totaal, score(r[i]).totaal];
    assert.ok(a > b || (a === b && MERKEN[r[i - 1]].naam.localeCompare(MERKEN[r[i]].naam, 'nl') < 0));
  }
});

test('partnerlinks leeg; gevuld = sponsored nofollow, geen zichtbaar label; nooit in keuzehulp of checklist', () => {
  assert.deepEqual(PARTNERLINKS, {});
  for (const id of IDS) { const o = uitgaand(id); assert.equal(o.partner, false); assert.equal(o.href, MERKEN[id].url); assert.ok(!knop(id, 't').includes('partner"')); }
  const k = knop('quatt', 't', 'btn', { quatt: 'https://example.com/aff' });
  assert.match(k, /rel="sponsored nofollow noopener"/); assert.match(k, /<\/a>$/); assert.ok(!/<span class="partner"|>\s*partnerlink\s*</i.test(k));
  for (const f of ['../src/lib/checklist.js', '../src/lib/match.js', '../src/lib/kosten.js']) {
    const s = readFileSync(new URL(f, import.meta.url), 'utf8');
    assert.ok(!/partnerlinks|leads|LEADPARTNERS|ROUTING/.test(s), f);
  }
});

test('typen: kosten en subsidie volgens Milieu Centraal', () => {
  assert.equal(TYPES.hybride.kosten, 6200); assert.equal(TYPES.hybride.subsidie, 2125);
  assert.equal(TYPES.allelectric.kosten, 12000); assert.equal(TYPES.allelectric.subsidie, 3025);
  assert.equal(TYPES.bodem.kosten, 30000); assert.equal(TYPES.luchtlucht.subsidie, 0);
});

test('blog beste hybride: genoemde rekenhulp-uitkomst klopt met bereken()', () => {
  const md = readFileSync('content/blog/2026-10-20-beste-hybride-warmtepomp.md', 'utf8');
  assert.ok(md.includes(`komt op ${jaarTekst(bereken({ type: 'hybride', gas: 1360 }).jaren)}`));
});
