// CHECKLIST VOOR ACTIVERING (audit 20-10-2026, F10). Pas een partner in actievePartners zetten als dit klaar is:
// 1. Privacyblok (/privacy/#offertes): welke gegevens (postcode, woning, contactgegevens) naar de partner gaan en wie verantwoordelijk is (rolverdeling, art. 26/28 AVG: D6, beslissing Dave).
// 2. CSP: layout.mjs zet frame-src al uit frameOrigins; controleer de partner-origin en dat het iframe pas laadt na een bewuste klik, binnen de consentregels.
// 3. Cookietabel in privacy-avg.mjs aanvullen als de partner-iframe cookies zet.
// 4. OK van Moneymaker en Site-controleur.
// Welke offertepartners zijn actief in deze build. Productie en test-site: alleen goedgekeurde partners (nu: geen).
// LEADS_PREVIEW=1: voorbeeldpartner, alle pagina's noindex. Nooit deployen met LEADS_PREVIEW aan.
import { actievePartners, routing, frameOrigins } from './lib/leads.js';
export const LEADS_PREVIEW = process.env.LEADS_PREVIEW === '1';
export const LEADS = actievePartners({ preview: LEADS_PREVIEW });
export const ROUTING = routing(LEADS);
export const LEADS_AAN = Object.keys(LEADS).length > 0;
export const FRAMES = frameOrigins(LEADS);
