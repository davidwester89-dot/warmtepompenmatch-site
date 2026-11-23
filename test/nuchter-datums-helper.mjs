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
export const revisieDatum = (pad, vorige) => (TRANSPARANTIE_PADEN.has(pad) || HUISASSIST_PADEN.has(pad)) ? '2026-11-24' : STIJL_PADEN.has(pad) ? '2026-11-17' : vorige;
