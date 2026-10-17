// WarmtepompenMatch-keuzehulp: pure adviesregels (ook in de browser gebruikt).
// Regels volgen Milieu Centraal: all-electric vraagt minstens redelijke isolatie (Rc 2,5 dak en vloer, geïsoleerde spouw, hr++-glas).
// Merken in de uitslag: alleen merken die het type aanbieden, in de vaste volgorde van de checklist. Partnerlinks spelen hier geen rol.
import { TYPES, bereken } from './kosten.js';
import { metType } from './checklist.js';

export const VRAGEN = [
  { id: 'woning', vraag: 'In wat voor huis woon je?', opties: [['appartement', 'Appartement'], ['tussen', 'Tussenwoning'], ['hoek', 'Hoekwoning'], ['twee', '2-onder-1-kap'], ['vrijstaand', 'Vrijstaand']] },
  { id: 'bouwjaar', vraag: 'Wanneer is je huis gebouwd?', opties: [['voor1975', 'Voor 1975'], ['1975', '1975 tot 1992'], ['1992', '1992 tot 2000'], ['2000', '2000 tot 2009'], ['2009', '2009 tot 2019'], ['2019', '2019 of later']] },
  { id: 'isolatie', vraag: 'Hoe goed is je huis geïsoleerd?', hint: 'Redelijk = geïsoleerde spouwmuur, dak en vloer en hr++-glas.', opties: [['slecht', 'Slecht: weinig of niets geïsoleerd'], ['matig', 'Matig: een deel geïsoleerd'], ['redelijk', 'Redelijk: dak, vloer, spouw en hr++-glas'], ['goed', 'Goed of zeer goed'], ['weetniet', 'Weet ik niet']] },
  { id: 'budget', vraag: 'Hoeveel wil je ongeveer uitgeven?', hint: 'Vóór subsidie, inclusief installatie.', opties: [['5', 'Tot € 5.000'], ['10', '€ 5.000 tot € 10.000'], ['20', '€ 10.000 tot € 20.000'], ['meer', 'Meer dan € 20.000']] },
  { id: 'gas', vraag: 'Hoeveel gas gebruik je per jaar?', hint: 'Staat op je jaarafrekening.', opties: [['600', 'Minder dan 800 m³'], ['1000', '800 tot 1.200 m³'], ['1500', '1.200 tot 1.800 m³'], ['2100', 'Meer dan 1.800 m³']] },
  { id: 'voorkeur', vraag: 'Wat heeft je voorkeur?', opties: [['hybride', 'Hybride: cv-ketel blijft'], ['allelectric', 'All-electric: van het gas af'], ['weetniet', 'Weet ik nog niet']] },
];
export const VRAAG = Object.fromEntries(VRAGEN.map((v) => [v.id, v]));
export const label = (id, val) => (VRAAG[id].opties.find(([v]) => v === val) || [])[1] || '';

/** Isolatie zoals de keuzehulp ermee rekent. "Weet ik niet" volgt het bouwjaar (Milieu Centraal). */
export function isolatieVan(a) {
  if (a.isolatie && a.isolatie !== 'weetniet') return { niveau: a.isolatie, geschat: false };
  const n = { voor1975: 'matig', 1975: 'matig', 1992: 'redelijk', 2000: 'redelijk', 2009: 'goed', 2019: 'goed' }[a.bouwjaar] || 'matig';
  return { niveau: n, geschat: true };
}
const ISO_OK = (n) => n === 'redelijk' || n === 'goed';

export function advies(a) {
  const iso = isolatieVan(a);
  const ok = ISO_OK(iso.niveau);
  const budget = { 5: 5000, 10: 10000, 20: 20000, meer: 40000 }[a.budget] ?? 10000;
  const gas = Number(a.gas) || 1360;
  const notes = [];
  let type;
  if (!ok) {
    type = 'hybride';
    notes.push(a.voorkeur === 'allelectric'
      ? 'Je wilt van het gas af, maar je huis is nog niet goed genoeg geïsoleerd voor all-electric. Begin met een hybride warmtepomp en isoleer eerst dak, vloer, spouw en glas.'
      : 'Een hybride warmtepomp werkt met je bestaande radiatoren, ook als je huis matig geïsoleerd is. Isoleren verlaagt je verbruik nog verder.');
  } else if (a.voorkeur === 'hybride') {
    type = 'hybride';
    notes.push('Je huis is geïsoleerd genoeg voor all-electric. Kies een hybride die later volledig elektrisch kan ("all-electric ready").');
  } else if (a.voorkeur === 'allelectric' || budget >= 20000) {
    type = 'allelectric';
    notes.push('Je huis is geïsoleerd genoeg om volledig elektrisch te verwarmen. Je gasaansluiting kan eruit, dan betaal je geen vastrecht voor gas meer.');
  } else {
    type = 'hybride';
    notes.push('All-electric kan in jouw huis, maar kost gemiddeld € 12.000. Met je budget past een hybride beter. Kies er een die later volledig elektrisch kan.');
  }
  if (type === 'allelectric' && budget < 10000) notes.push('Een all-electric warmtepomp kost gemiddeld € 12.000 vóór subsidie, meer dan je budget.');
  if (type === 'hybride' && budget < 5000) notes.push('Een hybride warmtepomp kost gemiddeld € 6.200, of € 4.075 na ISDE-subsidie.');
  const alternatieven = [];
  if (ok && budget >= 30000 && ['twee', 'vrijstaand'].includes(a.woning)) alternatieven.push('bodem');
  if (type === 'hybride' && ok) alternatieven.push('allelectric');
  if (a.budget === '5') alternatieven.push('luchtlucht');
  if (iso.geschat) notes.push(`We schatten je isolatie als "${iso.niveau}" op basis van het bouwjaar. Een installateur kan dat bij je thuis bepalen.`);
  if (a.woning === 'appartement') notes.push('In een appartement overleg je met je VvE over de plek van de buitenunit en de leidingen.');
  if (a.bouwjaar === '2019') notes.push('ISDE-subsidie geldt alleen voor huizen van vóór 2019 (of met een vergunning aangevraagd vóór 1 juli 2018).');
  const r = bereken({ type, gas, subsidie: a.bouwjaar === '2019' ? 0 : undefined });
  return { type, iso, notes, alternatieven, reken: r, merken: metType(type), naam: TYPES[type].naam };
}
export const compleet = (a) => VRAGEN.every((v) => a[v.id]);
/** Opties als object (id -> label), o.a. voor de offertemodule. */
export const OPTIES = Object.fromEntries(VRAGEN.map((v) => [v.id, Object.fromEntries(v.opties)]));
