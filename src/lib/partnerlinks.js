// Goedgekeurde partnerlinks per merk-id. LEEG zolang er geen goedgekeurd programma is (Quatt: aangevraagd, nog niet goedgekeurd).
// Pas invullen na goedkeuring en akkoord. De keuzehulp en de checklist lezen dit bestand NOOIT: geen invloed op advies, score of volgorde.
import { MERKEN } from './merken.js';
export const PARTNERLINKS = {};

/** Uitgaande link: partnerlink (rel sponsored nofollow, zonder zichtbaar label) als die er is, anders de officiële site. */
export function uitgaand(id, partnerlinks = PARTNERLINKS) {
  const p = MERKEN[id];
  if (!p) throw new Error('Onbekend merk ' + id);
  const pl = partnerlinks[id];
  return pl ? { href: pl, rel: 'sponsored nofollow noopener', partner: true, naam: p.naam } : { href: p.url, rel: 'noopener', partner: false, naam: p.naam };
}

/** Knop naar het merk. Partnerlink: rel sponsored nofollow noopener, geen zichtbaar label (uitleg in de FAQ). */
export function knop(id, pos, cls = 'btn', partnerlinks = PARTNERLINKS) {
  const o = uitgaand(id, partnerlinks);
  return `<a class="${cls}" href="${o.href}" rel="${o.rel}" target="_blank" data-vendor="${id}" data-pos="${pos}" data-cta="outbound" data-partner-slot="${id}">Naar de site van ${o.naam}</a>`;
}
