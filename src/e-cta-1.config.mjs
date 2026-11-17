// E-CTA-1 golf 1 – WarmtepompenMatch: pagina → betaalde partners (config voor src/e-cta.mjs).
// Bron: PM-partnerkaart /workspace/plannen/e-cta-1/partnerkaart-warmtepompenmatch.md (17-11-2026): geen bevestigde,
// geaccepteerde, betaalde reflink op WPM. Alle 26 kaartpagina's + de nieuwe post /blog/warmtepomp-huren-of-kopen/ (18-11,
// na de sitemap van de kaart) = ALLEEN KEUZEHULP: A en C linken alleen naar /warmtepomp-keuzehulp/ en /vergelijken/.
// Reflinks: één veld per partner. Leeg = geen CTA. Een reflink invullen + de partner op een pagina zetten activeert hem
// zonder copywijziging (pas na acceptatie, PM-kaart en MM/SC). subID: alleen Daisycon ws= (wpm-<slug>-top|eind);
// TradeTracker-notatie onbekend (subid: null zolang open).
const KEUZEHULP = { partners: [] };

export const ECTA = {
  site: 'wpm',
  pmKaart: '/workspace/plannen/e-cta-1/partnerkaart-warmtepompenmatch.md',
  ankerA: 'lead',
  ankersC: ['<h2>Veelgestelde vragen</h2>', '<h2>Bronnen</h2>', '<aside class="cta">', '<div class="cta">', '</article>', '<p class="report">'],
  keuzehulp: { href: '/warmtepomp-keuzehulp/', tekst: 'Doe de keuzehulp' },
  vergelijker: { href: '/vergelijken/', tekst: 'Vergelijk de warmtepompen' },
  partners: {
    // Wacht (kaart): geen enkele WPM-link geaccepteerd.
    huisassist: { naam: 'Huisassist', reflink: '', subid: { param: 'ws', waarde: '{site}-{slug}-{pos}' } }, // Daisycon 22344, wacht adverteerder
    adlar: { naam: 'Adlår', reflink: '', subid: null }, // TradeTracker 39211, onder beoordeling
    groenpand: { naam: 'Groenpand', reflink: '', subid: null }, // TradeTracker 40779, onder beoordeling
    quatt: { naam: 'Quatt', reflink: '', subid: false }, // direct, aangevraagd
  },
  pages: {
    '/merken/': KEUZEHULP,
    '/merken/quatt/': KEUZEHULP,
    '/merken/daikin/': KEUZEHULP,
    '/merken/mitsubishi-electric/': KEUZEHULP,
    '/merken/vaillant/': KEUZEHULP,
    '/merken/nefit-bosch/': KEUZEHULP,
    '/merken/itho-daalderop/': KEUZEHULP,
    '/merken/remeha/': KEUZEHULP,
    '/merken/panasonic/': KEUZEHULP,
    '/vergelijken/': KEUZEHULP,
    '/vergelijken/quatt-vs-remeha/': KEUZEHULP,
    '/vergelijken/daikin-vs-mitsubishi-electric/': KEUZEHULP,
    '/vergelijken/vaillant-vs-nefit-bosch/': KEUZEHULP,
    '/gidsen/': KEUZEHULP,
    '/warmtepomp-kosten/': KEUZEHULP,
    '/hybride-warmtepomp-kosten/': KEUZEHULP,
    '/warmtepomp-terugverdientijd/': KEUZEHULP,
    '/isde-subsidie-warmtepomp-2026/': KEUZEHULP,
    '/hybride-of-all-electric/': KEUZEHULP,
    '/warmtepomp-geluid/': KEUZEHULP,
    '/is-mijn-huis-geschikt-voor-een-warmtepomp/': KEUZEHULP,
    '/blog/': KEUZEHULP,
    '/blog/warmtepompboiler-kosten/': KEUZEHULP,
    '/blog/lucht-lucht-warmtepomp-kosten/': KEUZEHULP,
    '/blog/beste-hybride-warmtepomp/': KEUZEHULP,
    '/blog/warmtepomp-offerte-vergelijken/': KEUZEHULP,
    '/blog/warmtepomp-huren-of-kopen/': KEUZEHULP, // niet op de kaart (post 18-11): ook alleen keuzehulp
  },
};
