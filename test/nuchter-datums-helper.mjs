// Onafhankelijke verwachting voor de stijlrelease van 13 november 2026.
export const STIJL_PADEN = new Set([
  "/blog/beste-hybride-warmtepomp/",
  "/blog/lucht-lucht-warmtepomp-kosten/",
  "/blog/warmtepompboiler-kosten/",
  "/hybride-warmtepomp-kosten/",
  "/is-mijn-huis-geschikt-voor-een-warmtepomp/",
  "/merken/daikin/",
  "/merken/nefit-bosch/",
  "/warmtepomp-geluid/",
  "/warmtepomp-keuzehulp/",
  "/warmtepomp-terugverdientijd/"
]);
// Transparantie 24-11: home-FAQ en /privacy/ (partnerlinks, alleen Daisycon/Huisassist).
export const TRANSPARANTIE_PADEN = new Set(["/", "/privacy/"]);
export const HUISASSIST_PADEN = new Set(["/warmtepomp-keuzehulp/"]);
// Onafhankelijke verwachting voor de neutrale merkknoppen (besluit Moneymaker 17-11, pushdatum 25-11): latere bodywijziging,
// dus deze pagina's dragen 2026-11-25. Hub /vergelijken/ heeft geen eigen bodywijziging en staat hier bewust niet in.
export const NEUTRAAL_PADEN = new Set([
  "/merken/", "/merken/daikin/", "/merken/itho-daalderop/", "/merken/mitsubishi-electric/", "/merken/nefit-bosch/",
  "/merken/panasonic/", "/merken/quatt/", "/merken/remeha/", "/merken/vaillant/",
  "/vergelijken/daikin-vs-mitsubishi-electric/", "/vergelijken/quatt-vs-remeha/", "/vergelijken/vaillant-vs-nefit-bosch/"
]);
// Onafhankelijke verwachting voor de upgrade positie 8–20, batch 1 (bouw 19-11, push 26-11): zichtbare bodywijziging op deze twee
// merkpagina's, dus 2026-11-26.
export const UPGRADE_PADEN = new Set(["/merken/itho-daalderop/", "/merken/remeha/"]);
// Groenpand-Remeha (SEO-review 484cf28): zichtbare knoptekst + partnerzin, echte datumlift 26-11.
// Hub /merken/ heeft wél eigen bodywijziging (Remeha-kaart). Hub /vergelijken/ niet, en staat hier bewust niet in.
export const GROENPAND_PADEN = new Set(["/merken/", "/vergelijken/quatt-vs-remeha/", "/merken/remeha/"]);
export const revisieDatum = (pad, vorige) => (UPGRADE_PADEN.has(pad) || GROENPAND_PADEN.has(pad)) ? '2026-11-26' : NEUTRAAL_PADEN.has(pad) ? '2026-11-25' : (TRANSPARANTIE_PADEN.has(pad) || HUISASSIST_PADEN.has(pad)) ? '2026-11-24' : STIJL_PADEN.has(pad) ? '2026-11-17' : vorige;
