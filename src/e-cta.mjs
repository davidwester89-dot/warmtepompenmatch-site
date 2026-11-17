// E-CTA-1 (plan MM 17-11-2026, addendum Dave via GB2): vaste CTA-component op de pagina's van de PM-partnerkaart.
// A = keuzebox direct na de intro, C = afsluiter (vóór FAQ/Verder lezen/Bronnen/slotnoot, de vroegste die er is).
// B (tekstlinks) is werk van Blogschrijver en zit hier niet in.
// Regels: alleen betaalde partners met een reflink in de config (één veld per partner), label "Partnerlink" bij elke
// betaalde knop, rel="sponsored nofollow noopener", volgorde = de neutrale volgorde uit de config, nooit op commissie.
// Leeg reflink-veld = die partner valt weg. Minder dan 2 betaalde partners over: A en C linken alleen naar de eigen
// keuzehulp/vergelijker. Een reflink later invullen activeert de partner zonder copywijziging.
// Geen prijzen, geen claims, geen datums: de component verandert geen datePublished/dateModified/lastmod (L7).
// subID: alleen waar de partnerkaart de parameter bevestigt (Daisycon ws=). subid: false = bewust geen subID (kaart),
// subid: null = nog open (placeholder). Placeholders staan als data-ecta-placeholder in de HTML en laten
// test/e-cta-1.test.js falen in CI (GITHUB_ACTIONS) en met ECTA_STRICT=1.
export const LABEL = 'Partnerlink';
export const REL = 'sponsored nofollow noopener';
export const MAX_A = 3;
export const POS = { A: 'top', C: 'eind' }; // subID-posities volgens de partnerkaart
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const BLOK_RE = /<aside class="ecta[^"]*"[^>]*data-ecta="[AC]"[^>]*>[\s\S]*?<\/aside>\n?/g;

/** Betaalde partners voor een pagina in configvolgorde; partners zonder reflink vallen weg; < 2 over = fallback. */
export function resolve(cfg, path) {
  const entry = cfg.pages[path];
  if (!entry) return null;
  const partners = [];
  for (const id of entry.partners) {
    const p = cfg.partners[id];
    if (!p) throw new Error(`E-CTA-1 ${path}: onbekende partner ${id}`);
    if (!p.reflink) continue; // geen (goedgekeurde) reflink = geen CTA
    partners.push({ id, naam: p.naam, href: p.reflink, subid: p.subid, vendor: p.vendor || id, zelfdeTab: !!p.zelfdeTab });
  }
  return { path, partners, fallback: partners.length < 2 };
}

export const slugVan = (path) => path.replace(/\/$/, '').split('/').pop() || 'home';

/** subID volgens de partnerkaart: { param, waarde: '{site}-{slug}-{pos}' } | false (bewust geen) | null (open). */
export function metSubid(cfg, partner, path, blok) {
  const s = partner.subid;
  if (s === false) return { href: partner.href, placeholder: false };
  if (!s) return { href: partner.href, placeholder: true };
  const waarde = s.waarde.replace('{site}', cfg.site).replace('{slug}', slugVan(path)).replace('{pos}', POS[blok]);
  const u = new URL(partner.href);
  u.searchParams.set(s.param, waarde);
  return { href: u.toString(), placeholder: false };
}

function knop(cfg, partner, path, blok, n, cls) {
  const { href, placeholder } = metSubid(cfg, partner, path, blok);
  const target = partner.zelfdeTab ? '' : ' target="_blank"';
  const ph = placeholder ? ' data-ecta-placeholder="subid"' : '';
  // Optioneel per site (cfg.knop): eigen data-cta, knoptekst en aria-label, zodat de knop de bestaande
  // site-conventies volgt (bv. ToolMatch: data-cta="partner", "Naar de site van …" + nieuw-tabblad-melding).
  const k = cfg.knop || {};
  const tekst = k.tekst ? k.tekst(partner) : `Bekijk ${partner.naam}`;
  const aria = k.aria ? ` aria-label="${esc(k.aria(partner))}"` : '';
  return `<a class="${cls}" href="${esc(href)}" rel="${REL}"${target} data-vendor="${partner.vendor}" data-cta="${k.dataCta || 'outbound'}" data-ecta-pos="${blok}${n}"${ph}${aria}>${esc(tekst)}</a> <span class="ecta-label">${LABEL}</span>`;
}

// Optioneel per site (cfg.noot): partnerzin onderaan een blok mét betaalde links (site-conventie, bv. p.pnoot).
const noot = (cfg) => cfg.noot || '';

const pmAttr = (cfg) => (cfg.pmKaart ? '' : ' data-ecta-placeholder="pm-kaart"');

export function blokA(cfg, r) {
  if (r.fallback) {
    return `<aside class="ecta ecta-a ecta-fallback" data-ecta="A"${pmAttr(cfg)} aria-label="Direct vergelijken"><p class="ecta-kop"><strong>Direct vergelijken</strong></p><p class="ecta-knoppen"><a class="btn" href="${cfg.keuzehulp.href}" data-cta="ecta-a">${esc(cfg.keuzehulp.tekst)}</a></p><p class="ecta-alt"><a href="${cfg.vergelijker.href}" data-cta="ecta-a">${esc(cfg.vergelijker.tekst)}</a></p></aside>`;
  }
  const kaarten = r.partners.slice(0, MAX_A).map((p, i) => `<li class="ecta-kaart"><span class="ecta-naam">${esc(p.naam)}</span> ${knop(cfg, p, r.path, 'A', i + 1, 'btn ecta-knop')}</li>`).join('');
  return `<aside class="ecta ecta-a" data-ecta="A"${pmAttr(cfg)} aria-label="Direct vergelijken"><p class="ecta-kop"><strong>Direct vergelijken</strong></p><ul class="ecta-lijst">${kaarten}</ul><p class="ecta-alt"><a href="${cfg.keuzehulp.href}" data-cta="ecta-a">Of doe de keuzehulp</a></p>${noot(cfg)}</aside>`;
}

export function blokC(cfg, r) {
  const kh = `<p class="ecta-knoppen"><a class="btn" href="${cfg.keuzehulp.href}" data-cta="ecta-c">${esc(cfg.keuzehulp.tekst)}</a></p>`;
  if (r.fallback) {
    return `<aside class="ecta ecta-c ecta-fallback" data-ecta="C"${pmAttr(cfg)} aria-label="Verder kiezen"><p class="ecta-kop"><strong>Nog niet zeker?</strong></p>${kh}<p class="ecta-alt"><a href="${cfg.vergelijker.href}" data-cta="ecta-c">${esc(cfg.vergelijker.tekst)}</a></p></aside>`;
  }
  return `<aside class="ecta ecta-c" data-ecta="C"${pmAttr(cfg)} aria-label="Verder kiezen"><p class="ecta-kop"><strong>Nog niet zeker?</strong></p>${kh}<p class="ecta-top">${esc((cfg.knop && cfg.knop.cIntro) || 'Of ga direct naar')} ${knop(cfg, r.partners[0], r.path, 'C', 1, 'btn ghost ecta-knop')}</p>${noot(cfg)}</aside>`;
}

/** Index waar A komt. cfg.ankerA = 'lead' (na <p class="lead"> en een direct volgende <div class="actions">) of 'h2'. */
export function plekA(html, cfg, path) {
  const h1 = html.indexOf('<h1');
  if (h1 < 0) throw new Error(`E-CTA-1 ${path}: geen <h1>`);
  const h2 = html.indexOf('<h2', h1);
  if (cfg.ankerA === 'lead') {
    const lead = html.indexOf('<p class="lead"', h1);
    if (lead >= 0 && (h2 < 0 || lead < h2)) {
      let i = html.indexOf('</p>', lead) + 4;
      const rest = html.slice(i);
      const m = rest.match(/^\s*<div class="actions">[\s\S]*?<\/div>/);
      if (m) i += m[0].length;
      return i + (html[i] === '\n' ? 1 : 0);
    }
  }
  if (h2 < 0) throw new Error(`E-CTA-1 ${path}: geen plek voor A`);
  const tussen = html.slice(h1, h2);
  if ((tussen.match(/<a\s/g) || []).length > (tussen.match(/<\/a>/g) || []).length) {
    // eerste h2 zit in een kaartlink (hub zonder lead): A direct na de stempelregel onder de h1
    const st = html.indexOf('<p class="stamp"', h1);
    if (st < 0 || st > h2) throw new Error(`E-CTA-1 ${path}: geen plek voor A (h2 in kaart, geen stempel)`);
    return html.indexOf('</p>', html.indexOf('</time>', st)) + 4;
  }
  return h2;
}

/** Zet A en C in de html van één pagina. Idempotent: bestaande E-CTA-blokken worden eerst weggehaald. */
export function applyEcta(html, path, cfg) {
  const kaal = html.replace(BLOK_RE, '');
  const r = resolve(cfg, path);
  if (!r) return kaal;
  const iA = plekA(kaal, cfg, path);
  const kandidaten = cfg.ankersC.map((a) => kaal.indexOf(a, iA)).filter((i) => i >= iA);
  if (!kandidaten.length) throw new Error(`E-CTA-1 ${path}: geen plek voor de afsluiter`);
  const iC = Math.min(...kandidaten);
  return kaal.slice(0, iA) + blokA(cfg, r) + '\n' + kaal.slice(iA, iC) + blokC(cfg, r) + '\n' + kaal.slice(iC);
}

/** Alle placeholders die nog openstaan (voor de CI-blokkade en het rapport). */
export function placeholders(cfg) {
  const uit = [];
  if (!cfg.pmKaart) uit.push('pm-kaart: partnerkaart van Partnermanager ontbreekt');
  const ids = new Set();
  for (const path of Object.keys(cfg.pages)) {
    const r = resolve(cfg, path);
    if (!r.fallback) r.partners.slice(0, MAX_A).forEach((p) => ids.add(p.id));
  }
  for (const id of [...ids].sort()) if (cfg.partners[id].subid == null) uit.push(`subid: ${id}`);
  return uit;
}
