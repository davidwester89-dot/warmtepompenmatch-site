// Welke offertepartners zijn actief in deze build. Productie en test-site: alleen goedgekeurde partners (nu: geen).
// LEADS_PREVIEW=1: voorbeeldpartner, alle pagina's noindex. Nooit deployen met LEADS_PREVIEW aan.
import { actievePartners, routing, frameOrigins } from './lib/leads.js';
export const LEADS_PREVIEW = process.env.LEADS_PREVIEW === '1';
export const LEADS = actievePartners({ preview: LEADS_PREVIEW });
export const ROUTING = routing(LEADS);
export const LEADS_AAN = Object.keys(LEADS).length > 0;
export const FRAMES = frameOrigins(LEADS);
