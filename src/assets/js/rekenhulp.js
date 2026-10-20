// Rekenhulp terugverdientijd: rekent met ./lib/kosten.js. Niets verlaat de browser.
import { TYPES, bereken, isde2026, eur, jaarTekst } from './lib/kosten.js';

const form = document.getElementById('form');
const $ = (id) => document.getElementById(id);
const num = (id) => { const v = parseFloat(String($(id).value).replace(/\./g, '').replace(',', '.')); return Number.isFinite(v) ? v : 0; };
const prijs = (id) => { const v = parseFloat(String($(id).value).replace(',', '.')); return Number.isFinite(v) ? v : 0; };
const NOOT = {
  hybride: 'Hybride: de helft van je gas valt weg, per bespaarde m³ komt er 2,4 kWh stroom bij (rekenvoorbeeld Milieu Centraal).',
  allelectric: 'All-electric: al je gas valt weg, per bespaarde m³ komt er 3,3 kWh stroom bij en het vastrecht voor gas vervalt (rekenvoorbeeld Milieu Centraal). Milieu Centraal-voorbeeld: 950 m³ gas per jaar (goed geïsoleerde hoekwoning).',
};
let type = 'hybride';

function reken() {
  const sub = isde2026(num('kw'), $('aplus').checked);
  const r = bereken({ type, gas: num('gas'), kosten: num('kosten'), subsidie: sub, gasprijs: prijs('gasprijs'), stroomprijs: prijs('stroomprijs') });
  $('r-jaren').textContent = jaarTekst(r.jaren);
  $('r-besp').textContent = eur(r.besparing);
  $('r-m3').textContent = `${r.m3.toLocaleString('nl-NL')} m³`;
  $('r-kwh').textContent = `${r.kwh.toLocaleString('nl-NL')} kWh`;
  $('r-kost').textContent = eur(r.kosten);
  $('r-sub').textContent = eur(r.subsidie);
  $('r-net').textContent = eur(r.netto);
  $('r-noot').textContent = NOOT[type];
}
form.addEventListener('change', (e) => {
  if (e.target.name === 'type') {
    type = e.target.value;
    $('kosten').value = TYPES[type].kosten; $('kw').value = TYPES[type].kw;
  }
  reken();
});
form.addEventListener('input', reken);
form.addEventListener('submit', (e) => e.preventDefault());
reken();
