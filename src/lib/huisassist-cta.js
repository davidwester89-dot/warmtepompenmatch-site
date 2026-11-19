// Huisassist-partnerknop voor het bestaande offerteblok in de keuzehulp-uitslag (MM-OK 19-11).
// Trackinglink van Partnermanager, exact (Daisycon 22344, media 445224). Geen e-cta.mjs-import: dit bestand gaat naar de client.
export const HUISASSIST_URL = 'https://glp8.net/c/?si=22344&li=1962824&wi=445224&ws=&dl=';
export const HUISASSIST_TEKST = 'Offertes aanvragen bij Huisassist';
const LABEL = 'Partnerlink';
const REL = 'sponsored nofollow noopener';
const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Bestaande keuzehulp-offerteplek. data-pos="keuzehulp" is de bestaande slotnaam van dit blok. */
export function huisassistKnop(pos = 'keuzehulp', cls = 'btn') {
  return `<a class="${cls}" href="${escAttr(HUISASSIST_URL)}" rel="${REL}" target="_blank" data-vendor="huisassist" data-pos="${escAttr(pos)}" data-cta="outbound">${escAttr(HUISASSIST_TEKST)}</a> <span class="ecta-label">${LABEL}</span>`;
}
