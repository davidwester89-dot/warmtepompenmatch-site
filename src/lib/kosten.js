// Kosten, subsidie en besparing. Gemiddelden van Milieu Centraal en de ISDE-bedragen van RVO voor 2026.
// Puur (ook in de browser gebruikt door de keuzehulp en de rekenhulp). Partnerlinks spelen hier geen rol.
export const BRON = {
  mcHybride: { naam: 'Milieu Centraal: hybride warmtepomp', url: 'https://www.milieucentraal.nl/energie-besparen/duurzaam-verwarmen-en-koelen/hybride-warmtepomp/' },
  mcVolledig: { naam: 'Milieu Centraal: volledige warmtepomp', url: 'https://www.milieucentraal.nl/energie-besparen/duurzaam-verwarmen-en-koelen/volledig-elektrische-warmtepomp/' },
  mcTypes: { naam: 'Milieu Centraal: welke warmtepompen zijn er?', url: 'https://www.milieucentraal.nl/energie-besparen/duurzaam-verwarmen-en-koelen/welke-warmtepompen-zijn-er/' },
  rvo2026: { naam: 'RVO: ISDE, wat wijzigt er in 2026', url: 'https://www.rvo.nl/subsidies-financiering/isde/isde-wat-wijzigt-er-2026' },
  rvoWp: { naam: 'RVO: ISDE voor een warmtepomp', url: 'https://www.rvo.nl/subsidies-financiering/isde/woningeigenaren/warmtepomp' },
  rvo2027: { naam: 'RVO: ISDE, wat wijzigt er in 2027', url: 'https://www.rvo.nl/subsidies-financiering/isde/isde-wat-wijzigt-er-2027' },
};
// Gas- en stroomprijs van Milieu Centraal (Kenniscentrum Duurzaam Leven): de verwachte gemiddelden voor 2026-2040,
// € 1,37 per m³ gas en 21 cent per kWh, uit de toelichting 'Gasprijs en stroomprijs besparingen' op
// https://www.milieucentraal.nl/energie-besparen/duurzaam-verwarmen-en-koelen/hybride-warmtepomp/ (gecontroleerd 20-10-2026).
// ThuisaccuMatch rekent voor stroom met CBS september 2026 (~€ 0,26); beide bronnen zijn geldig.
export const GASPRIJS = 1.37; // € per m³, Milieu Centraal, gecontroleerd 20-10-2026
export const STROOMPRIJS = 0.21; // € per kWh
export const VASTRECHT_GAS = 360; // € per jaar, vervalt als je van het gas af gaat (Milieu Centraal)

/** ISDE 2026, eerste lucht-waterwarmtepomp: € 1.025 + € 225 per kW (vanaf de eerste kW) + € 200 bij energielabel A+++. */
export function isde2026(kw, aPlus3 = true) {
  const k = Math.max(0, Number(kw) || 0);
  return Math.max(500, Math.round(1025 + 225 * k + (aPlus3 ? 200 : 0)));
}

// Typen. kosten = gemiddelde investering incl. installatie (Milieu Centraal), subsidie = voorbeeld Milieu Centraal.
// gasDeel = deel van het gasverbruik dat wegvalt; kwhPerM3 = extra stroom per bespaarde m³ (uit hetzelfde rekenvoorbeeld).
export const TYPES = {
  hybride: { naam: 'Hybride warmtepomp', kort: 'Naast je cv-ketel, 4 kW', kosten: 6200, subsidie: 2125, kw: 4, gasDeel: 0.5, kwhPerM3: 2.375, vastrecht: false, bron: 'mcHybride' },
  allelectric: { naam: 'All-electric warmtepomp', kort: 'Lucht-water met buitenunit, 8 kW', kosten: 12000, subsidie: 3025, kw: 8, gasDeel: 1, kwhPerM3: 3.316, vastrecht: true, bron: 'mcVolledig' },
  bodem: { naam: 'Bodemwarmtepomp', kort: 'Grond-water, 8 kW', kosten: 30000, subsidie: 4425, kw: 8, gasDeel: 1, kwhPerM3: 3.316, vastrecht: true, bron: 'mcVolledig' },
  luchtlucht: { naam: 'Lucht-luchtwarmtepomp', kort: 'Single-split airco als bijverwarming', kosten: 2500, subsidie: 0, kw: null, gasDeel: null, kwhPerM3: null, vastrecht: false, bron: 'mcTypes' },
};

/** Besparing per jaar en terugverdientijd. */
export function bereken({ type = 'hybride', gas = 1360, kosten, subsidie, gasprijs = GASPRIJS, stroomprijs = STROOMPRIJS } = {}) {
  const t = TYPES[type];
  if (!t || t.gasDeel == null) return null;
  const g = Math.max(0, Number(gas) || 0);
  const m3 = g * t.gasDeel;
  const kwh = m3 * t.kwhPerM3;
  const besparing = Math.round(m3 * gasprijs - kwh * stroomprijs + (t.vastrecht ? VASTRECHT_GAS : 0));
  const inv = kosten ?? t.kosten; const sub = subsidie ?? t.subsidie;
  const netto = Math.max(0, inv - sub);
  const jaren = besparing > 0 ? Math.round((netto / besparing) * 10) / 10 : null;
  return { type, m3: Math.round(m3), kwh: Math.round(kwh), besparing, kosten: inv, subsidie: sub, netto, jaren };
}
export const eur = (n) => '€ ' + Math.round(n).toLocaleString('nl-NL');
export const jaarTekst = (j) => (j == null ? 'niet terug te verdienen met deze cijfers' : `${j.toFixed(1).replace('.', ',')} jaar`);
