// WarmtepompenMatch-checklist: de score is een telling, geen oordeel of review.
// 10 vaste punten. Per punt: ja = 1, deels = 0,5, nee of niet vermeld op de site van het merk = 0.
// Prijs van een offerte telt niet mee. Partnerlinks en offertepartners spelen hier geen rol: dit bestand leest ze niet.
import { MERKEN, FEATURES } from './merken.js';

export const GROEPEN = [
  { id: 'aanbod', naam: 'Aanbod', punten: ['hybride', 'allelectric', 'bodem', 'luchtlucht'] },
  { id: 'techniek', naam: 'Techniek', punten: ['propaan', 'koelen', 'app'] },
  { id: 'kopen', naam: 'Kopen en garantie', punten: ['prijs', 'garantie', 'installateur'] },
];
export const PUNTEN = {
  hybride: { kort: 'Hybride', lang: 'Hybride warmtepomp (naast de cv-ketel)' },
  allelectric: { kort: 'All-electric', lang: 'Volledig elektrische lucht-waterwarmtepomp' },
  bodem: { kort: 'Bodem', lang: 'Bodemwarmtepomp (grond-water)' },
  luchtlucht: { kort: 'Lucht-lucht', lang: 'Lucht-luchtwarmtepomp (airco)' },
  propaan: { kort: 'Propaan', lang: 'Model met propaan (R290) als koudemiddel' },
  koelen: { kort: 'Koelen', lang: 'Koelen met een lucht-waterwarmtepomp' },
  app: { kort: 'App', lang: 'Bediening met een app' },
  prijs: { kort: 'Prijs openbaar', lang: 'Consumentenprijs op de eigen site' },
  garantie: { kort: 'Garantie 5 jaar', lang: 'Standaard minstens 5 jaar garantie' },
  installateur: { kort: 'Installateur', lang: 'Installateur zoeken of eigen installatie' },
};
export const IDS_PUNTEN = GROEPEN.flatMap((g) => g.punten);
export const MAX = IDS_PUNTEN.length;
const W = { ja: 1, deels: 0.5, nee: 0 };
export const punt = (v) => W[v] ?? 0;
export const WAARDE = { ja: 'Ja', deels: 'Deels', nee: 'Nee' };
export const waardeTekst = (v) => WAARDE[v] || 'Niet vermeld';

/** Score per merk: totaal (0-10) en per groep. */
export function score(id) {
  const f = FEATURES[id];
  if (!f) throw new Error('Onbekend merk ' + id);
  const groepen = GROEPEN.map((g) => ({ id: g.id, naam: g.naam, max: g.punten.length, score: g.punten.reduce((s, k) => s + punt(f[k]?.v), 0) }));
  return { id, totaal: groepen.reduce((s, g) => s + g.score, 0), max: MAX, groepen };
}
export const fmtScore = (n) => String(n).replace('.', ',');

/** Vaste volgorde voor lijsten: hoogste checklist-score, bij gelijke stand op naam (A-Z). */
export function ranglijst(ids = Object.keys(MERKEN)) {
  return [...ids].sort((a, b) => score(b).totaal - score(a).totaal || MERKEN[a].naam.localeCompare(MERKEN[b].naam, 'nl'));
}
/** Merken die een type warmtepomp aanbieden (ja of deels), in vaste volgorde. */
export const metType = (type, ids = Object.keys(MERKEN)) => ranglijst(ids.filter((id) => ['ja', 'deels'].includes(FEATURES[id][type]?.v)));
