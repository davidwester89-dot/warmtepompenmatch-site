// Offertemodule: vijf vragen (geen persoonsgegevens naar ons), toestemming, dan het formulier van de partner.
// Contactgegevens vult de bezoeker in bij de partner (iframe of doorverwijzing). Niets naar onze server, niets in localStorage.
import { LEADS, ROUTING } from './lib/leads.config.js';
import { CATEGORIEEN, WANNEER, valideer, iframeUrl, analytics, normPostcode, POSTCODE_RE } from './lib/leads.js';
import { OPTIES } from './lib/match.js';
import { track } from './consent.js';
import { metNoot } from './lib/partnerlinks.js';

const form = document.getElementById('lead');
const sets = [...form.querySelectorAll('fieldset[data-q]')];
const gegevens = document.getElementById('l-gegevens');
const nav = document.getElementById('l-nav');
const pcIn = document.getElementById('l-postcode'), pcFout = document.getElementById('l-postcode-fout');
const ok = document.getElementById('l-ok'), okFout = document.getElementById('l-ok-fout');
const vak = document.getElementById('l-partner');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const antwoorden = () => Object.fromEntries(new FormData(form));
const pid = () => ROUTING[antwoorden().maatregel];
let stap = 0, gestart = false, verder = false;

// ?m=hybride vanuit een gids of de match: maatregel alvast kiezen.
const m = new URLSearchParams(location.search).get('m');
if (m && m in CATEGORIEEN && ROUTING[m]) { const el = form.querySelector(`input[name="maatregel"][value="${m}"]`); if (el) { el.checked = true; stap = 1; } }

function toonStap(i, focus) {
  stap = Math.max(0, Math.min(sets.length - 1, i));
  sets.forEach((f, j) => f.classList.toggle('nu', j === stap));
  nav.hidden = stap === 0;
  document.getElementById('l-prog').textContent = `Vraag ${stap + 1} van ${sets.length}`;
  document.getElementById('l-bar').style.width = `${Math.round((stap / sets.length) * 100)}%`;
  form.querySelector('.qbar').setAttribute('aria-valuenow', String(stap));
  if (focus) sets[stap].querySelector('input:checked, input')?.focus({ preventScroll: true });
}
function start() { if (gestart) return; gestart = true; track('lead_form_start', analytics(antwoorden(), pid())); }
function postcodeOk() {
  const goed = POSTCODE_RE.test(pcIn.value.trim());
  pcFout.hidden = goed; pcFout.textContent = goed ? '' : 'Vul een postcode in zoals 1234 AB.';
  pcIn.setAttribute('aria-invalid', String(!goed));
  if (goed) pcIn.value = normPostcode(pcIn.value);
  return goed;
}
function volgende() {
  if (sets[stap].dataset.q === 'postcode' && !postcodeOk()) { pcIn.focus(); return; }
  track('lead_form_step', { stap: stap + 1, vraag: sets[stap].dataset.q });
  if (stap < sets.length - 1) toonStap(stap + 1, true); else naarGegevens();
}
function naarGegevens() {
  const a = antwoorden();
  const fout = valideer(a, OPTIES.woning, OPTIES.bouwjaar);
  const eerste = sets.findIndex((f) => fout[f.dataset.q]);
  if (eerste >= 0) { toonStap(eerste, true); return; }
  const p = LEADS[pid()];
  gegevens.querySelectorAll('[data-pnaam]').forEach((el) => { el.textContent = p.naam; });
  gegevens.querySelectorAll('[data-pmax]').forEach((el) => { el.textContent = String(p.max); });
  gegevens.querySelector('[data-pprivacy]').href = p.privacy;
  document.getElementById('l-samenvatting').textContent = `${CATEGORIEEN[a.maatregel].naam} · ${normPostcode(a.postcode)} · ${OPTIES.woning[a.woning]} · bouwjaar ${OPTIES.bouwjaar[a.bouwjaar].toLowerCase()} · ${WANNEER[a.wanneer].toLowerCase()}`;
  form.hidden = true; gegevens.hidden = false; vak.innerHTML = ''; verder = false;
  gegevens.querySelector('h2').setAttribute('tabindex', '-1'); gegevens.querySelector('h2').focus();
  gegevens.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
}

form.addEventListener('change', (e) => {
  if (!e.isTrusted) return;
  start();
  if (e.target.type === 'radio') setTimeout(volgende, reduce ? 0 : 180);
});
form.addEventListener('click', (e) => { if (e.target.closest('[data-volgende]')) { start(); volgende(); } });
pcIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); start(); volgende(); } });
form.addEventListener('submit', (e) => e.preventDefault());
document.getElementById('l-terug').addEventListener('click', () => toonStap(stap - 1, true));
document.getElementById('l-wijzig').addEventListener('click', () => { gegevens.hidden = true; form.hidden = false; vak.innerHTML = ''; toonStap(0, true); });

const BASE = document.body.dataset.base || '';
const bedankt = (a, id) => `${BASE}/offerte/bedankt/?m=${encodeURIComponent(a.maatregel)}&p=${encodeURIComponent(id)}`;

// Voorbeeldformulier (alleen preview): verstuurt en bewaart niets.
function voorbeeld(a, id) {
  vak.innerHTML = `<div class="pframe" role="group" aria-label="Formulier van de offertepartner"><p class="pkop"><span>Formulier van de offertepartner</span><span class="partner">voorbeeld</span></p>
<form id="l-demo" class="pform" novalidate><label class="fld"><span>Naam</span><input name="naam" autocomplete="name" required></label>
<div class="m2"><label class="fld"><span>Huisnummer</span><input name="huisnr" autocomplete="address-line2" inputmode="numeric" required></label><label class="fld"><span>Postcode</span><input value="${normPostcode(a.postcode)}" readonly></label></div>
<label class="fld"><span>E-mail</span><input type="email" name="email" autocomplete="email" required></label>
<label class="fld"><span>Telefoon</span><input type="tel" name="tel" autocomplete="tel" required></label>
<button class="btn" type="submit">Offertes aanvragen</button><p class="src">Preview: dit voorbeeld verstuurt niets. Live staat hier het formulier van de partner.</p></form></div>`;
  const f = document.getElementById('l-demo');
  f.addEventListener('submit', (e) => { e.preventDefault(); f.reset(); location.href = bedankt(a, id); });
}
function iframe(a, id, p) {
  const fr = document.createElement('iframe');
  fr.src = iframeUrl(p, a); fr.title = `Offerteformulier van ${p.naam}`; fr.className = 'pframe-if';
  fr.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  fr.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin allow-popups allow-top-navigation-by-user-activation');
  fr.addEventListener('load', () => track('lead_partner_view', analytics(a, id)), { once: true });
  vak.replaceChildren(fr);
  if (p.klaar && p.klaar.bericht) {
    addEventListener('message', (e) => {
      if (e.origin !== p.origin) return;
      const d = typeof e.data === 'string' ? e.data : JSON.stringify(e.data || '');
      if (d.includes(p.klaar.bericht)) location.href = bedankt(a, id);
    });
  }
}
function redirect(a, id, p) {
  vak.innerHTML = metNoot(`<p><a class="btn" href="${p.url}" rel="sponsored nofollow noopener" target="_blank" data-lead-out="${id}">Naar het formulier van ${p.naam}</a></p><p class="src">Het formulier opent in een nieuw venster op de site van ${p.naam}.</p>`);
  vak.querySelector('a').addEventListener('click', () => track('lead_partner_click', analytics(a, id)));
}
document.getElementById('l-door').addEventListener('click', () => {
  if (!ok.checked) { okFout.hidden = false; ok.focus(); return; }
  okFout.hidden = true;
  if (verder) return; verder = true;
  const a = antwoorden(), id = pid(), p = LEADS[id];
  track('lead_consent', analytics(a, id));
  if (p.type === 'iframe') iframe(a, id, p); else if (p.type === 'redirect') redirect(a, id, p); else voorbeeld(a, id);
  vak.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
});
ok.addEventListener('change', () => { if (ok.checked) okFout.hidden = true; });
toonStap(stap, false);
