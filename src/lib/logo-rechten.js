// Gebruiksrecht van de logo's (nagekeken 30-10-2026 op de merkrichtlijn of perskit van de maker; SC 30-10).
// ZONDER_LOGO: de maker staat logogebruik alleen toe met toestemming, licentie of partnerovereenkomst.
// Die merken krijgen geen logo in de tabelcellen: de naam blijft gewoon staan, net als bij elk ander merk zonder logo.
// 'Geen gepubliceerde beperking gevonden' is geen toestemming: MM beslist; bij een bezwaar gaat het logo eruit.
export const ZONDER_LOGO = new Set(['daikin', 'mitsubishi', 'nefitbosch', 'panasonic']);
export const LOGO_RECHTEN = {
  'daikin': { richtlijn: 'https://www.daikin.eu/en_us/legal-notice.html', status: "GEEN LOGO: merken en logo's alleen met voorafgaande schriftelijke toestemming" },
  'itho': { richtlijn: 'geen merkrichtlijn gevonden (ithodaalderop.nl, 30-10)', status: 'logo: geen gepubliceerde beperking gevonden' },
  'mitsubishi': { richtlijn: 'https://www.mitsubishielectric.com/en/terms/', status: 'GEEN LOGO: geen gebruik zonder toestemming; commercieel gebruik met schriftelijke toestemming' },
  'nefitbosch': { richtlijn: 'https://us.bosch-press.com/pressportal/us/en/imprint/legal-notice.html', status: "GEEN LOGO: Bosch verleent geen licentie op logo's; alleen geautoriseerde dealers" },
  'panasonic': { richtlijn: 'https://www.panasonic.com/global/about/terms-of-use.html', status: "GEEN LOGO: logo's en merken alleen met voorafgaande toestemming" },
  'quatt': { richtlijn: 'geen merkrichtlijn gevonden (quatt.io, 30-10)', status: 'logo: geen gepubliceerde beperking gevonden' },
  'remeha': { richtlijn: 'https://tools.remeha.nl/remeha-beeldbank/', status: "logo: beeldbank met logo's openbaar" },
  'vaillant': { richtlijn: 'https://www.vaillant-group.com/news-stories/media-downloads/vaillant-group-logos.html', status: 'logo: logo-downloads openbaar (media); geen suggestie van officiële samenwerking' },
};
