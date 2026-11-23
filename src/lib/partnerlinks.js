// Goedgekeurde partnerlinks per merk-id. LEEG zolang er geen goedgekeurd programma is (Quatt: aangevraagd, nog niet goedgekeurd).
// Pas invullen na goedkeuring en akkoord. De keuzehulp en de checklist lezen dit bestand NOOIT: geen invloed op advies, score of volgorde.
import { MERKEN } from './merken.js';
export const PARTNERLINKS = {};

// Huisassist: bron in huisassist-cta.js (gaat ook naar de client / keuzehulp). Niet in PARTNERLINKS (geen merkenplek).
export { HUISASSIST_URL, HUISASSIST_TEKST, huisassistKnop } from './huisassist-cta.js';

// Remeha-CTA's (MM-OK 19-11): bestaande knop()-plekken gaan naar Groenpand (TradeTracker 40779).
// Trackinglink van Partnermanager, exact. Niet in PARTNERLINKS (dat zou merkenknoppen vullen);
// de E-CTA-1-reflink blijft leeg (geen extra plekken). Itho en overige merken blijven bronlink.
// Privacy krijgt de URL via een expliciete aanroep in pages.mjs.
import { LABEL as ECTA_LABEL, REL as ECTA_REL } from '../e-cta.mjs';
export const GROENPAND_TT_URL = 'https://analytics.groenpand.nl/c?c=40779&m=12&a=519643&r=&u=%2F';
export const GROENPAND_REMEHA_TEKST = 'Offerte bij Groenpand (Remeha-installateur)';
const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Partnerknop Remeha → Groenpand. Label "Partnerlink" volgens WPM E-CTA-1 (src/e-cta.mjs), niet "(partnerlink)". */
export function groenpandRemehaKnop(pos, cls = 'btn') {
  return `<a class="${cls}" href="${escAttr(GROENPAND_TT_URL)}" rel="${ECTA_REL}" target="_blank" data-vendor="groenpand" data-pos="${escAttr(pos)}" data-cta="outbound">${escAttr(GROENPAND_REMEHA_TEKST)}</a> <span class="ecta-label">${ECTA_LABEL}</span>`;
}

/** Uitgaande link: partnerlink (rel sponsored nofollow, zonder zichtbaar label) als die er is, anders de officiële site. */
export function uitgaand(id, partnerlinks = PARTNERLINKS) {
  const p = MERKEN[id];
  if (!p) throw new Error('Onbekend merk ' + id);
  const pl = partnerlinks[id];
  return pl ? { href: pl, rel: 'sponsored nofollow noopener', partner: true, naam: p.naam } : { href: p.url, rel: 'noopener', partner: false, naam: p.naam };
}

/** Knop naar het merk. Partnerlink: rel sponsored nofollow noopener, geen zichtbaar label (uitleg in de FAQ).
 *  Zonder goedgekeurde partnerlink (besluit Moneymaker 17-11, zoals TM dee721c): géén knop maar een neutrale bronlink
 *  <a href="officiële site" rel="noopener">Bron: Merk</a>, zonder class, target, data-cta, data-vendor of sponsored.
 *  Uitzondering Remeha (MM-OK 19-11): groenpandRemehaKnop, met E-CTA-1-label "Partnerlink". */
export function knop(id, pos, cls = 'btn', partnerlinks = PARTNERLINKS) {
  if (id === 'remeha') return groenpandRemehaKnop(pos, cls);
  const o = uitgaand(id, partnerlinks);
  if (!o.partner) return `<a href="${o.href}" rel="noopener">Bron: ${o.naam}</a>`;
  return `<a class="${cls}" href="${o.href}" rel="${o.rel}" target="_blank" data-vendor="${id}" data-pos="${pos}" data-cta="outbound" data-partner-slot="${id}">Naar de site van ${o.naam}</a>`;
}

// Partnerzin: geen label per knop, maar precies één korte zin direct na elk blok waarin een partnerlink staat
// (rel sponsored). Werkt automatisch: staat er geen partnerlink in een blok, dan komt er ook geen zin.
export const PARTNER_NOOT = 'Sommige links zijn partnerlinks; dat verandert de volgorde nooit.';
export const NOOT_HTML = `<p class="pnoot">${PARTNER_NOOT}</p>`;
const SPONSORED = /<a\s[^>]*rel="[^"]*\bsponsored\b/;
/** Eén blok als string: de zin erachter als er een partnerlink in staat. */
export const metNoot = (html) => (SPONSORED.test(html) ? html + NOOT_HTML : html);
/** Blokken (op class) met knoppen of links naar aanbieders. Het buitenste blok telt; binnen een blok komt geen tweede zin. */
export const BLOKKEN = ['plist', 'out', 'pc-cta'];
/** Begin en eind van elk blok in html (buitenste eerst), en of er een partnerlink in staat. kaal = ook <p>, <ul>, <ol> zonder class. */
export function partnerBlokken(html, { blokken = BLOKKEN, kaal = false } = {}) {
  const cls = `<(div|ol|ul|p|aside|section)\\s[^>]*class="(?:[^"]*\\s)?(?:${blokken.join('|')})(?:\\s[^"]*)?"[^>]*>`;
  const re = new RegExp(kaal ? `${cls}|<(p|ul|ol)>` : cls, 'g');
  const res = []; let m;
  while ((m = re.exec(html))) {
    const tag = m[1] || m[2];
    const t = new RegExp(`<${tag}\\b|</${tag}>`, 'g'); t.lastIndex = m.index;
    let d = 0, eind = -1, x;
    while ((x = t.exec(html))) { if (x[0][1] === '/') { if (--d === 0) { eind = x.index + x[0].length; break; } } else d++; }
    if (eind < 0) continue;
    res.push({ start: m.index, end: eind, partner: SPONSORED.test(html.slice(m.index, eind)) });
    re.lastIndex = eind;
  }
  return res;
}
/** Hele pagina: precies één zin direct na elk blok met een partnerlink. */
export function partnerNoten(html, opts) {
  let out = '', i = 0;
  for (const b of partnerBlokken(html, opts)) if (b.partner && !html.startsWith(NOOT_HTML, b.end)) { out += html.slice(i, b.end) + NOOT_HTML; i = b.end; }
  return out + html.slice(i);
}
