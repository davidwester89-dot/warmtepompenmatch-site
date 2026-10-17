// Logo's van de merken (officiële logo's van hun eigen site; zie src/assets/logos/BRONNEN.md).
// Neutraal: elk merk krijgt exact hetzelfde vak (zelfde breedte en hoogte, object-fit: contain), geen merk groter of eerder.
// Ook in de browser gebruikt (keuzehulp.js), daarom zonder Node-imports.
import { MERKEN } from './merken.js';

/** Vaste vakmaten per formaat; width/height staan altijd in de HTML (geen layoutverschuiving). */
export const LOGO_MATEN = { sm: [100, 30], md: [120, 36], lg: [160, 48] };

/** <img> met het logo van een merk. alt = merknaam. Standaard lazy; eager alleen boven de vouw. */
export function logoImg(id, { maat = 'md', eager = false, base = '', cls = '' } = {}) {
  const p = MERKEN[id];
  if (!p) throw new Error('Onbekend merk ' + id);
  const [w, h] = LOGO_MATEN[maat];
  return `<img class="plogo plogo-${maat}${cls ? ' ' + cls : ''}" src="${base}/logos/${id}.svg" alt="${p.naam}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}
