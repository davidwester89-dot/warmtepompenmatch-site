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
export const revisieDatum = (pad, vorige) => STIJL_PADEN.has(pad) ? '2026-11-13' : vorige;
