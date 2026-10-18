// WarmtepompenMatch keuzehulp: leest de antwoorden, rekent met ./lib/match.js en toont het advies. Niets verlaat de browser.
import { advies, compleet, VRAGEN, label } from './lib/match.js';
import { MERKEN, STERK_IN } from './lib/merken.js';
import { TYPES, bereken, eur, jaarTekst } from './lib/kosten.js';
import { score as checklist, fmtScore } from './lib/checklist.js';
import { logoImg } from './lib/logos.js';
import { LEADS, ROUTING } from './lib/leads.config.js';
import { categorieVan } from './lib/leads.js';

const BASE = document.body.dataset.base || '';
const form = document.getElementById('form');
const out = document.getElementById('result');
const prog = document.getElementById('q-prog');
const bar = document.getElementById('q-bar');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const WACHT = out.innerHTML;
const GIDS = { hybride: '/hybride-of-all-electric/', allelectric: '/hybride-of-all-electric/', bodem: '/warmtepomp-kosten/', luchtlucht: '/is-mijn-huis-geschikt-voor-een-warmtepomp/' };

function antwoorden() {
  const fd = new FormData(form); const a = {};
  for (const v of VRAGEN) if (fd.get(v.id)) a[v.id] = fd.get(v.id);
  return a;
}
// Offerteknop: alleen met een goedgekeurde offertepartner (nu leeg). Verandert niets aan het advies of de volgorde.
function offerte(type) {
  const c = categorieVan(type);
  if (!c || !ROUTING[c]) return '';
  return `<p class="leadlink"><a class="btn" href="${BASE}/offerte/?m=${c}" data-lead="${c}" data-pos="keuzehulp">Offertes aanvragen</a> <span class="partner">partnerlink</span></p>`;
}
function alt(k, gas) {
  const t = TYPES[k]; const r = bereken({ type: k, gas });
  return `<li><strong>${esc(t.naam)}</strong>: gemiddeld ${eur(t.kosten)}${t.subsidie ? `, subsidie ${eur(t.subsidie)}` : ', geen ISDE'}${r ? `, terugverdiend in ${jaarTekst(r.jaren)}` : ''}. <a href="${BASE}${GIDS[k]}">Lees meer</a></li>`;
}

function toon(a, scroll) {
  const r = advies(a); const c = r.reken;
  const merken = r.merken.slice(0, 4);
  out.innerHTML = `<h2>Jouw advies</h2><p class="big">${esc(r.naam)}</p><p class="pc-price">${esc(TYPES[r.type].kort)}</p>`
    + `<table class="kv"><tbody><tr><td>Gemiddelde kosten</td><td>${eur(c.kosten)}</td></tr><tr><td>ISDE-subsidie 2026</td><td>${c.subsidie ? eur(c.subsidie) : 'Geen (huis van 2019 of later)'}</td></tr><tr><td>Besparing per jaar</td><td>${eur(c.besparing)}</td></tr><tr class="total"><td>Terugverdientijd</td><td>${jaarTekst(c.jaren)}</td></tr></tbody></table>`
    + `<p class="src">Met jouw gasverbruik (${esc(label('gas', a.gas))}) en de gemiddelden van Milieu Centraal. <a href="${BASE}/terugverdientijd-berekenen/">Reken na met je offerte</a></p>`
    + `<ul class="why">${r.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`
    + offerte(r.type)
    + (r.alternatieven.length ? `<h3>Ook het overwegen waard</h3><ul class="why">${r.alternatieven.map((k) => alt(k, Number(a.gas))).join('')}</ul>` : '')
    + `<h3>Merken met een ${esc(r.naam.toLowerCase())}</h3><ol class="mtop">${merken.map((id, i) => {
      const p = MERKEN[id]; const s = checklist(id);
      return `<li${i === 0 ? ' class="first"' : ''}><div class="mhead">${logoImg(id, { maat: 'sm', base: BASE })}<h3>${esc(p.naam)}</h3></div><p class="pc-price">${esc(STERK_IN[id])} · checklistscore ${fmtScore(s.totaal)}/${s.max}</p><div class="mini-cta"><a href="${BASE}/merken/${p.slug}/">Alles over ${esc(p.naam)}</a></div></li>`;
    }).join('')}</ol>`
    + (r.merken.length > merken.length ? `<p><a href="${BASE}/vergelijken/">Alle ${r.merken.length} merken met dit type vergelijken</a></p>` : '')
    + `<p class="mlinks"><button type="button" class="linkbtn" id="m-reset">Opnieuw beginnen</button><button type="button" class="linkbtn" id="m-share">Deel of bewaar: kopieer de link</button></p>`
    + `<p class="sub">Merken op checklistscore, bij gelijke stand op naam. Partnerlinks tellen niet mee.${Object.keys(LEADS).length ? ' Offertes lopen via een offertepartner (partnerlink); die vergoeding heeft geen invloed op dit advies.' : ''}</p>`;
  history.replaceState(null, '', `${location.pathname}?${new URLSearchParams(a)}`);
  document.getElementById('m-reset').addEventListener('click', () => { form.reset(); history.replaceState(null, '', location.pathname); update(); out.innerHTML = WACHT; form.querySelector('input').focus(); });
  document.getElementById('m-share').addEventListener('click', async (e) => { try { await navigator.clipboard.writeText(location.href); e.target.textContent = 'Link gekopieerd'; } catch { e.target.textContent = location.href; } });
  if (scroll && matchMedia('(max-width: 899px)').matches) out.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

function update() {
  const a = antwoorden(); const n = Object.keys(a).length;
  prog.textContent = `${n} van ${VRAGEN.length} vragen beantwoord`;
  bar.style.width = `${(n / VRAGEN.length) * 100}%`;
  return a;
}

const params = new URLSearchParams(location.search);
for (const v of VRAGEN) { const val = params.get(v.id); const el = val && form.querySelector(`input[name="${v.id}"][value="${CSS.escape(val)}"]`); if (el) el.checked = true; }
const start = update();
if (compleet(start)) toon(start, false);

form.addEventListener('change', () => { const a = update(); if (compleet(a)) toon(a, false); });
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const a = update();
  if (!compleet(a)) {
    const open = VRAGEN.find((v) => !a[v.id]);
    const el = form.querySelector(`input[name="${open.id}"]`);
    if (el) el.focus();
    out.innerHTML = `<h2>Jouw advies</h2><p class="alert">Beantwoord nog: ${esc(open.vraag)}</p>`;
    return;
  }
  toon(a, true);
});
