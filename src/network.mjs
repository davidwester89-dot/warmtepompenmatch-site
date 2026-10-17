// Netwerk-footer ("Ook van ons"). Alleen BoekhoudMatch, VerduurzaamMatch, ShopMatch en WarmtepompenMatch (geen Goodfellas, nooit batterijmatch).
export const NETWORK = [
  { naam: 'BoekhoudMatch', logo: 'Boekhoud<b>Match</b>.nl', url: 'https://boekhoudmatch.nl/', wat: 'Boekhoudprogramma kiezen' },
  { naam: 'VerduurzaamMatch', logo: 'Verduurzaam<b>Match</b>.nl', url: 'https://verduurzaammatch.nl/', wat: 'Je huis verduurzamen' },
  { naam: 'ShopMatch', logo: 'Shop<b>Match</b>.nl', url: 'https://shopmatch.nl/', wat: 'Webshopplatform kiezen' },
  { naam: 'WarmtepompenMatch', logo: 'Warmtepompen<b>Match</b>.nl', url: 'https://warmtepompenmatch.nl/', wat: 'Warmtepomp kiezen' },
];
export const networkFor = (self) => NETWORK.filter((s) => !s.url.includes(self));
