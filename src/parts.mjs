import { SITE, esc, ORG, AUTHOR, fmtDate } from './layout.mjs';
import { MERKEN, CHECKED, FEATURES, STERK_IN } from './lib/merken.js';
import { GROEPEN, PUNTEN, IDS_PUNTEN, score, fmtScore, waardeTekst } from './lib/checklist.js';
import { BRON } from './lib/kosten.js';
import { knop } from './lib/partnerlinks.js';
import { logoImg } from './lib/logos.js';
export { logoImg };
export const M = MERKEN;
export const DATE = '2026-10-17';
export const by = (d = DATE) => `<p class="src">Door de ${SITE.owner} · ${fmtDate(d)}</p>`;
export const bron = (...lists) => {
  const all = lists.flat();
  const seen = new Set();
  const uniq = all.filter(([, u]) => (seen.has(u) ? false : seen.add(u)));
  return `<p class="src">Bronnen: ${uniq.map(([t, u]) => `<a href="${u}" rel="noopener">${esc(t)}</a>`).join(' · ')}</p>`;
};
/** Bron uit kosten.js als [naam, url]. */
export const B = (...ids) => ids.map((k) => [BRON[k].naam, BRON[k].url]);
/** Bronnen van de checklist van één of meer merken (unieke URL's). */
export const featureBronnen = (...ids) => ids.flatMap((id) => [...new Set(Object.values(FEATURES[id]).map((f) => f.s).filter(Boolean))].map((u) => [`${M[id].naam}: ${new URL(u).hostname.replace(/^www\./, '')}${new URL(u).pathname.replace(/\/$/, '')}`, u]));
export const matchCta = (t = 'Twijfel je nog?') => `<div class="cta"><h2>${t}</h2><p>Zes vragen over je huis, isolatie, budget en gasverbruik. Je krijgt een advies (hybride of all-electric), wat het kost, de subsidie en de merken die het type leveren.</p><a class="btn" href="/warmtepomp-keuzehulp/" data-cta="match">Start de keuzehulp</a></div>`;
export const article = ({ path, title, h1, description, og, parents, date = DATE, faq, schemaType = 'Article' }) => ({
  path, title, h1, crumb: h1, description, og, parents, ogType: 'article', lastmod: date,
  article: { date, updated: date }, stamp: { checked: CHECKED },
  schema: [
    { '@context': 'https://schema.org', '@type': schemaType, headline: h1, description, mainEntityOfPage: SITE.domain + path, image: `${SITE.domain}/og/${og}.png`, datePublished: date, dateModified: date, author: AUTHOR, publisher: ORG, inLanguage: 'nl' },
    ...(faq ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) }] : []),
  ],
});
export const faqHtml = (faq) => `<h2>Veelgestelde vragen</h2>${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${a}</p></details>`).join('')}`;
export const eur = (n) => '€ ' + Math.round(n).toLocaleString('nl-NL');

// ---- Checklist-weergave ----
const VCLS = { ja: 'ja', deels: 'deels', nee: 'nee' };
export const fv = (f, note = true) => `<span class="fv ${VCLS[f?.v] || 'nv'}">${waardeTekst(f?.v)}</span>${note && f?.t ? `<span class="fnote">${esc(f.t)}</span>` : ''}`;
export const scoreBadge = (id) => { const s = score(id); return `<span class="sc" aria-label="Checklist-score ${fmtScore(s.totaal)} van ${s.max}">${fmtScore(s.totaal)}<small>/${s.max}</small></span>`; };
export const bars = (id) => `<ul class="bars">${score(id).groepen.map((g) => `<li><span>${esc(g.naam)}</span><i><b style="width:${Math.round((g.score / g.max) * 100)}%"></b></i><span>${fmtScore(g.score)}/${g.max}</span></li>`).join('')}</ul>`;
export const scoreBlock = (id) => `<div class="pc-score"><span class="sc-lbl">Checklist-score</span>${scoreBadge(id)}${bars(id)}<p class="src" style="margin:8px 0 0"><a href="/over/#methode">Zo tellen we</a></p></div>`;
/** Tabel met alle 10 punten voor één merk. */
export const checklistTable = (id) => `<div class="table-wrap"><table class="data side"><thead><tr><th scope="col">Checklistpunt</th><th scope="col"><span class="thlogo">${logoImg(id, { maat: 'sm' })}</span></th></tr></thead><tbody>${GROEPEN.map((g) => `<tr><th colspan="2" scope="colgroup" style="background:var(--sand)">${esc(g.naam)}</th></tr>${g.punten.map((k) => `<tr><th scope="row">${esc(PUNTEN[k].lang)}</th><td>${fv(FEATURES[id][k])}${FEATURES[id][k].s ? ` <a class="src" href="${FEATURES[id][k].s}" rel="noopener">bron<span class="sr-only"> ${esc(PUNTEN[k].kort)}</span></a>` : ''}</td></tr>`).join('')}`).join('')}</tbody></table></div>`;

const TYPES_KORT = [['hybride', 'Hybride'], ['allelectric', 'All-electric'], ['bodem', 'Bodem'], ['luchtlucht', 'Lucht-lucht']];
export const aanbodTekst = (id) => TYPES_KORT.filter(([k]) => ['ja', 'deels'].includes(FEATURES[id][k].v)).map(([, t]) => t).join(', ') || 'Niet vermeld';

// ---- Merkkaart (overzicht, home) ----
export function pcard(id, { rank, level = 'h2', pos = 'lijst' } = {}) {
  const p = M[id]; const f = FEATURES[id];
  const facts = [['Aanbod', esc(aanbodTekst(id))], ['Propaan (R290)', fv(f.propaan, false)], ['Prijs openbaar', fv(f.prijs, false)], ['Garantie 5 jaar', fv(f.garantie, false)]];
  return `<li class="pcard" data-id="${id}"><div class="pc-head">${rank ? `<span class="pc-rank">${rank}.</span>` : ''}<span class="pc-logo">${logoImg(id, { maat: 'md' })}</span><span><span class="tag best">${esc(STERK_IN[id])}</span></span><${level}><a href="/merken/${p.slug}/">${esc(p.naam)}</a></${level}><p class="pc-kort">${esc(p.kort)}</p></div>
<ul class="pc-facts">${facts.map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join('')}</ul>
${scoreBlock(id)}
<div class="pc-pm"><div><p class="lbl ok">Sterk</p><ul>${p.plus.slice(0, 2).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><div><p class="lbl warn">Let op</p><ul>${p.min.slice(0, 2).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
<div class="pc-cta"><a class="btn sm" href="/merken/${p.slug}/">Alles over ${esc(p.naam)}</a>${knop(id, pos, 'btn ghost sm')}</div></li>`;
}

/** Vergelijkingstabel: rij per merk, kolom per checklistpunt. Data-attributen voor de filters. */
export function matrix(ids) {
  const head = `<tr><th scope="col">Merk</th><th scope="col">Score</th>${IDS_PUNTEN.map((k) => `<th scope="col">${esc(PUNTEN[k].kort)}</th>`).join('')}</tr>`;
  const rows = ids.map((id) => {
    const f = FEATURES[id];
    const data = IDS_PUNTEN.map((k) => `data-${k}="${f[k].v || 'nv'}"`).join(' ');
    return `<tr data-id="${id}" data-naam="${esc(M[id].naam)}" data-score="${score(id).totaal}" ${data}><th scope="row"><span class="rowlogo">${logoImg(id, { maat: 'sm' })}</span><a href="/merken/${M[id].slug}/">${esc(M[id].naam)}</a><span class="fnote">${esc(STERK_IN[id])}</span></th><td data-l="Checklist-score">${scoreBadge(id)}</td>${IDS_PUNTEN.map((k) => `<td data-l="${esc(PUNTEN[k].lang)}">${fv(f[k])}</td>`).join('')}</tr>`;
  }).join('');
  return `<p class="scrollhint mx">Veeg opzij voor alle kolommen →</p><div class="table-wrap"><table class="data matrix stack" id="matrix"><caption class="sr-only">Alle merken naast elkaar: score en checklist</caption><thead>${head}</thead><tbody>${rows}</tbody></table></div>`;
}

export const methodBox = (h = 'h2') => `<section class="method" id="methode"><${h}>Zo vergelijken we</${h}><ol><li><strong>Alleen wat het merk zelf zegt.</strong> Elk checklistpunt komt van de eigen site van het merk, met link naar de bron. Kosten en subsidie komen van Milieu Centraal en RVO.</li><li><strong>Vaste checklist van 10 punten.</strong> Per punt: ja = 1, deels = 0,5, nee of niet vermeld = 0. De score is een telling van wat het merk zelf noemt, geen oordeel over kwaliteit en geen review.</li><li><strong>Partners veranderen niets.</strong> De volgorde is score, dan naam (A-Z). Partnerlinks en offertepartners tellen nooit mee in de score, de volgorde of het advies.</li></ol><p class="src">Door de ${SITE.owner} · Gegevens gecontroleerd op ${fmtDate(CHECKED)}</p></section>`;
