import { SITE, esc, ORG, GA_ID, ICONS, fmtDate } from './layout.mjs';
import { IDS, CHECKED, FEATURES, STERK_IN } from './lib/merken.js';
import { knop } from './lib/partnerlinks.js';
import { VRAGEN } from './lib/match.js';
import { TYPES, bereken, isde2026, GASPRIJS, STROOMPRIJS, VASTRECHT_GAS } from './lib/kosten.js';
import { GROEPEN, PUNTEN, IDS_PUNTEN, score, fmtScore, ranglijst, metType } from './lib/checklist.js';
import { M, by, bron, B, featureBronnen, matchCta, article, faqHtml, pcard, matrix, methodBox, scoreBlock, scoreBadge, bars, fv, checklistTable, aanbodTekst, logoImg, eur } from './parts.mjs';
import { leadCta, privacyOffertes } from './offerte.mjs';
import { LEADS_AAN } from './leads.config.mjs';

const RANG = ranglijst();
const logo = (id, maat = 'md') => logoImg(id, { maat });
const komma = (n) => String(n).replace('.', ',');
const H = bereken({ type: 'hybride', gas: 1360 });
const AE = bereken({ type: 'allelectric', gas: 950 });
const typeLijst = (type) => metType(type).map((id) => `<a href="/merken/${M[id].slug}/">${esc(M[id].naam)}</a>`).join(', ');
const faqSchema = (faq) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) });

// ---- Home ----
const homeFaq = [
  ['Hybride of all-electric: wat past bij mijn huis?', 'Is je huis matig of slecht geïsoleerd, dan past een hybride warmtepomp naast je cv-ketel. Een all-electric warmtepomp vraagt minstens redelijke isolatie: Rc 2,5 in dak en vloer, een geïsoleerde spouwmuur en hr++-glas. Zie <a href="/hybride-of-all-electric/">hybride of all-electric</a>.'],
  ['Hoeveel subsidie krijg ik in 2026?', 'Voor je eerste lucht-waterwarmtepomp € 1.025 plus € 225 per kW, en € 200 extra bij energielabel A+++. Een hybride van 4 kW met A+++ geeft € 2.125. Zie <a href="/isde-subsidie-warmtepomp-2026/">ISDE-subsidie 2026</a>.'],
  ['Hoe komt de checklist-score tot stand?', 'We tellen 10 vaste punten, zoals het aanbod (hybride, all-electric, bodem, lucht-lucht), propaan, garantie en of de prijs openbaar is. Ja is 1 punt, deels een half punt, nee of niet vermeld 0. Zie <a href="/over/#methode">zo vergelijken we</a>.'],
  ['Verdient WarmtepompenMatch aan de merken?', 'Nu niet. Komt er later een partnerlink of offertepartner, dan heeft die altijd het label "partnerlink" en telt die nooit mee in de score, de volgorde of het advies.'],
];
const miniRows = RANG.map((id) => `<tr><th scope="row"><span class="rowlogo">${logo(id, 'sm')}</span><a href="/merken/${M[id].slug}/">${esc(M[id].naam)}</a></th><td data-l="Score">${scoreBadge(id)}</td>${[['hybride', 'Hybride'], ['allelectric', 'All-electric'], ['bodem', 'Bodem'], ['propaan', 'Propaan'], ['prijs', 'Prijs openbaar']].map(([k, l]) => `<td data-l="${l}">${fv(FEATURES[id][k], false)}</td>`).join('')}</tr>`).join('');
const typeCards = () => `<div class="grid cards">${[['hybride', '/hybride-of-all-electric/'], ['allelectric', '/hybride-of-all-electric/'], ['bodem', '/warmtepomp-kosten/']].map(([k, h]) => { const t = TYPES[k]; return `<a class="card" href="${h}"><h3>${esc(t.naam)}</h3><p>${esc(t.kort)}. Gemiddeld ${eur(t.kosten)}, subsidie ${eur(t.subsidie)}.</p><span class="more">Lees meer →</span></a>`; }).join('')}</div>`;
const VS = [['/vergelijken/quatt-vs-remeha/', 'Quatt of Remeha', 'Twee hybrides met propaan: vaste prijs of via de installateur.'], ['/vergelijken/daikin-vs-mitsubishi-electric/', 'Daikin of Mitsubishi Electric', 'Twee Japanse merken met lucht-water en lucht-lucht.'], ['/vergelijken/vaillant-vs-nefit-bosch/', 'Vaillant of Nefit Bosch', 'Twee grote ketelmerken met propaan-warmtepompen.']];
const vsCards = () => `<div class="grid cards">${VS.map(([h, t, d]) => `<a class="card" href="${h}"><h3>${esc(t)}</h3><p>${esc(d)}</p><span class="more">Bekijk de vergelijking →</span></a>`).join('')}</div>`;
const GIDSLINKS = [['/warmtepomp-kosten/', 'Wat kost een warmtepomp in 2026?'], ['/warmtepomp-terugverdientijd/', 'Terugverdientijd van een warmtepomp'], ['/isde-subsidie-warmtepomp-2026/', 'ISDE-subsidie voor een warmtepomp in 2026'], ['/hybride-of-all-electric/', 'Hybride of all-electric: wat past bij jouw huis?'], ['/warmtepomp-geluid/', 'Warmtepomp en geluid: regels en afstand'], ['/is-mijn-huis-geschikt-voor-een-warmtepomp/', 'Is mijn huis geschikt voor een warmtepomp?']];

export const home = {
  path: '/', title: 'Warmtepomp kiezen? Vergelijk eerst | WarmtepompenMatch', ogTitle: 'WarmtepompenMatch: welke warmtepomp past bij jouw huis?', h1: 'WarmtepompenMatch.nl', og: 'home',
  description: 'Hybride of all-electric? Doe de keuzehulp, vergelijk 8 merken op een vaste checklist en zie wat een warmtepomp kost met de ISDE-subsidie van 2026.',
  schema: [faqSchema(homeFaq)],
  body: `<section class="hero"><div>
<h1 class="h1-brand">Warmtepompen<b>Match</b>.nl</h1>
<p class="tagline">Warmtepomp kiezen? Vergelijk eerst.</p>
<p class="lead">Hybride of all-electric, welk merk en wat kost het? Zes vragen over je huis en je krijgt een advies met kosten, subsidie en terugverdientijd. Acht merken naast elkaar op 10 vaste punten.</p>
<div class="actions"><a class="btn" href="/warmtepomp-keuzehulp/" data-cta="home_hero">Start de keuzehulp</a><a class="btn ghost" href="/vergelijken/">Vergelijk alle 8 merken</a></div>
</div>
<div class="hero-q"><p class="hero-q-step">Vraag 1 van ${VRAGEN.length}</p><p class="hero-q-title" id="hq">${esc(VRAGEN[0].vraag)}</p><div class="hero-q-opts" role="group" aria-labelledby="hq">${VRAGEN[0].opties.map(([v, l]) => `<a class="choice" href="/warmtepomp-keuzehulp/?woning=${v}" rel="nofollow">${esc(l)}<span aria-hidden="true">→</span></a>`).join('')}</div><p class="hero-q-foot">Daarna nog ${VRAGEN.length - 1} korte vragen. Gratis, zonder account.</p></div>
</section>
<ul class="trustbar">
<li>${ICONS.kalender}<span>Gegevens gecontroleerd op <time datetime="${CHECKED}">${fmtDate(CHECKED)}</time></span></li>
<li>${ICONS.bron}<span>Bron bij elk bedrag en elk punt</span></li>
<li>${ICONS.schild}<span>Volgorde nooit betaald</span></li>
<li>${ICONS.gratis}<span>Gratis, zonder account</span></li>
</ul>
<section class="logobar" aria-labelledby="h-pl"><h2 id="h-pl">Deze 8 merken vergelijken we</h2><div class="logos eight">${[...IDS].sort((a, b) => M[a].naam.localeCompare(M[b].naam, 'nl')).map((id) => `<a class="logo-tile" href="/merken/${M[id].slug}/">${logo(id, 'lg')}</a>`).join('')}</div></section>
<h2>Drie soorten warmtepomp</h2>
<p class="sub">Gemiddelde kosten inclusief installatie en het subsidievoorbeeld van Milieu Centraal.</p>
${typeCards()}
<h2>De merken op een rij</h2>
<p class="sub">Gesorteerd op checklist-score, bij gelijke stand op naam. De score telt wat het merk zelf op de eigen site noemt.</p>
<div class="table-wrap"><table class="data stack"><thead><tr><th scope="col">Merk</th><th scope="col">Score</th><th scope="col">Hybride</th><th scope="col">All-electric</th><th scope="col">Bodem</th><th scope="col">Propaan</th><th scope="col">Prijs openbaar</th></tr></thead><tbody>${miniRows}</tbody></table></div>
<p><a href="/vergelijken/">Alle 10 checklistpunten, met filters →</a></p>
<section class="band method-band">
<h2>Zo vergelijken we</h2>
<ol class="steps">
<li><strong>Bron bij alles.</strong> Merkgegevens komen van de site van het merk, kosten van Milieu Centraal en subsidie van RVO.</li>
<li><strong>Een vaste checklist.</strong> Tien punten, van aanbod en propaan tot garantie. De score telt wat het merk zelf noemt.</li>
<li><strong>Partners veranderen niets.</strong> Partnerlinks en offertepartners tellen nooit mee in de score, de volgorde of het advies.</li>
</ol>
<p class="author">Door de <a href="/over/">${SITE.owner}</a> · <a href="/over/#methode">Hoe de score werkt</a></p>
</section>
<h2>Populaire vergelijkingen</h2>${vsCards()}
<h2>Gidsen</h2><ul class="gidslijst">${GIDSLINKS.map(([h, t]) => `<li><a href="${h}">${esc(t)}</a></li>`).join('')}<li><a href="/terugverdientijd-berekenen/">Rekenhulp: terugverdientijd berekenen</a></li></ul>
{{latest}}
${faqHtml(homeFaq)}`,
};

// ---- Keuzehulp ----
export const quiz = {
  path: '/warmtepomp-keuzehulp/', title: 'Warmtepomp keuzehulp: hybride of all-electric?', h1: 'Welke warmtepomp past bij jouw huis?', crumb: 'Keuzehulp', og: 'match', noCta: true,
  description: 'Zes vragen over je huis, isolatie, budget en gasverbruik. Je krijgt advies (hybride of all-electric) met kosten, ISDE-subsidie, besparing en merken.',
  scripts: ['/js/keuzehulp.js'],
  schema: [{ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'WarmtepompenMatch keuzehulp', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', url: SITE.domain + '/warmtepomp-keuzehulp/', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, publisher: ORG }],
  body: `<h1>Welke warmtepomp past bij jouw huis?</h1><p class="lead">Beantwoord ${VRAGEN.length} korte vragen. Je ziet meteen welk type past, wat het kost, hoeveel subsidie je krijgt en wanneer je het terugverdient.</p>
<div class="mgrid">
<form id="form" class="quiz card" novalidate>
<div class="qprog"><p id="q-prog" aria-live="polite">0 van ${VRAGEN.length} vragen beantwoord</p><div class="qbar"><span id="q-bar"></span></div></div>
${VRAGEN.map((v, i) => `<fieldset class="q"><legend>${i + 1}. ${esc(v.vraag)}</legend>${v.hint ? `<p class="hint">${esc(v.hint)}</p>` : ''}<div class="opts">${v.opties.map(([val, t]) => `<label><input type="radio" name="${v.id}" value="${val}" required><span>${esc(t)}</span></label>`).join('')}</div></fieldset>`).join('')}
<div class="qdone"><button class="btn" type="submit">Toon mijn advies</button><p class="sub">Gratis, zonder account. Je antwoorden blijven in je browser.</p></div>
</form>
<aside class="card mpanel" id="result" aria-live="polite"><h2>Jouw advies</h2><p class="mwait">Beantwoord de vragen. Je advies verschijnt hier, met kosten, subsidie en de merken die het leveren.</p><p class="sub">Of bekijk <a href="/vergelijken/">alle 8 merken naast elkaar</a>.</p></aside>
</div>
<noscript><p class="alert">De keuzehulp werkt met JavaScript. Zonder JavaScript lees je de regels in <a href="/hybride-of-all-electric/">hybride of all-electric</a>.</p></noscript>
<section class="method" id="methode"><h2>Zo werkt de keuzehulp</h2><ol><li><strong>Eerst je isolatie.</strong> Milieu Centraal: all-electric vraagt minstens redelijke isolatie (Rc 2,5 in dak en vloer, geïsoleerde spouw, hr++-glas). Weet je het niet, dan schatten we het uit het bouwjaar: vanaf 1992 meestal redelijk, vanaf 2009 goed.</li><li><strong>Dan je voorkeur en budget.</strong> Bij redelijke of goede isolatie volgt het advies je voorkeur. Weet je het niet, dan all-electric vanaf een budget van € 20.000, anders een hybride die later volledig elektrisch kan.</li><li><strong>Dan de cijfers.</strong> Kosten en subsidie zijn de gemiddelden van Milieu Centraal; de besparing rekenen we met jouw gasverbruik, gas à € ${komma(GASPRIJS)} per m³ en stroom à € ${komma(STROOMPRIJS)} per kWh (afgeleid uit de rekenvoorbeelden van Milieu Centraal).</li><li><strong>Merken:</strong> alleen merken die het type aanbieden, op checklist-score. Partnerlinks tellen nooit mee.</li></ol><p class="src">Bronnen: <a href="https://www.milieucentraal.nl/energie-besparen/duurzaam-verwarmen-en-koelen/volledige-warmtepomp/" rel="noopener">Milieu Centraal: volledige warmtepomp</a> · <a href="https://www.milieucentraal.nl/energie-besparen/duurzaam-verwarmen-en-koelen/hybride-warmtepomp/" rel="noopener">Milieu Centraal: hybride warmtepomp</a> · <a href="https://www.rvo.nl/subsidies-financiering/isde/isde-wat-wijzigt-er-2026" rel="noopener">RVO: ISDE 2026</a></p></section>`,
};

// ---- Merkpagina's ----
const RELATED = {
  quatt: [['/vergelijken/quatt-vs-remeha/', 'Quatt of Remeha']], remeha: [['/vergelijken/quatt-vs-remeha/', 'Quatt of Remeha']],
  daikin: [['/vergelijken/daikin-vs-mitsubishi-electric/', 'Daikin of Mitsubishi Electric']], mitsubishi: [['/vergelijken/daikin-vs-mitsubishi-electric/', 'Daikin of Mitsubishi Electric']],
  vaillant: [['/vergelijken/vaillant-vs-nefit-bosch/', 'Vaillant of Nefit Bosch']], nefitbosch: [['/vergelijken/vaillant-vs-nefit-bosch/', 'Vaillant of Nefit Bosch']],
  itho: [['/warmtepomp-kosten/', 'Wat kost een warmtepomp?']], panasonic: [['/hybride-of-all-electric/', 'Hybride of all-electric']],
};
const typeVan = (id) => (FEATURES[id].hybride.v === 'ja' ? 'hybride' : 'allelectric');
export const merkPages = IDS.map((id) => {
  const p = M[id];
  const path = `/merken/${p.slug}/`;
  const h1 = `${p.naam} warmtepomp: aanbod, checklist en voor wie`;
  const pos = RANG.indexOf(id) + 1;
  const alt = RANG.filter((x) => x !== id).slice(0, 3);
  const t = [`${p.naam} warmtepomp 2026: aanbod en score | WarmtepompenMatch`, `${p.naam} warmtepomp 2026: aanbod en checklist`, `${p.naam} warmtepomp 2026`].find((x) => x.length <= 60);
  const d = [`${p.naam} warmtepomp: ${aanbodTekst(id).toLowerCase()}. De checklist van 10 punten met bron, sterke punten, aandachtspunten en voor wie het past.`, `${p.naam} warmtepomp: aanbod, checklist van 10 punten met bron en voor wie het past.`].find((x) => x.length <= 155);
  const prijsBlok = p.prijzen
    ? `<h2>Prijzen</h2><p class="sub">Zoals ${esc(p.naam)} ze op de eigen site toont.</p><div class="table-wrap"><table class="data stack"><thead><tr><th scope="col">Model</th><th scope="col">Prijs</th><th scope="col">Toelichting</th></tr></thead><tbody>${p.prijzen.map(([n, pr, w]) => `<tr><th scope="row">${esc(n)}</th><td data-l="Prijs"><strong>${esc(pr)}</strong></td><td data-l="Toelichting">${esc(w)}</td></tr>`).join('')}</tbody></table></div>`
    : `<h2>Prijzen (indicatief)</h2><p>${esc(p.naam)} noemt geen consumentenprijzen op de eigen site; je koopt via een installateur en de prijs staat in je offerte.</p>${p.indicatief ? `<p class="sub">${esc(p.indicatief.intro)}</p><div class="table-wrap"><table class="data stack"><caption class="sr-only">Indicatieve prijzen ${esc(p.naam)}</caption><thead><tr><th scope="col">Model</th><th scope="col">Indicatieve prijs</th></tr></thead><tbody>${p.indicatief.rijen.map(([n, pr]) => `<tr><th scope="row">${esc(n)}</th><td data-l="Indicatieve prijs"><strong>${esc(pr)}</strong></td></tr>`).join('')}</tbody></table></div><p class="src">Indicatief. Bron: <a href="${p.indicatief.bron[1]}" rel="noopener">${esc(p.indicatief.bron[0])}</a></p>` : ''}<p>Indicatief voor alle merken: een hybride warmtepomp kost gemiddeld ${eur(TYPES.hybride.kosten)} en een all-electric ${eur(TYPES.allelectric.kosten)}, inclusief installatie en btw, vóór subsidie (Milieu Centraal). De ISDE-subsidie van 2026 is daarvan nog niet afgetrokken. Zie <a href="/warmtepomp-kosten/">wat een warmtepomp kost</a> en <a href="/isde-subsidie-warmtepomp-2026/">de ISDE-subsidie</a>.</p>`;
  return {
    ...article({ path, title: t, h1, description: d, og: `merk-${id}`, parents: [['/merken/', 'Merken']] }),
    navPath: '/merken/',
    body: `<article><div class="phead"><span class="phead-logo">${logoImg(id, { maat: 'lg', eager: true })}</span><span class="tag best">${esc(STERK_IN[id])}</span></div><h1>${esc(h1)}</h1>${by()}<p class="lead">${esc(p.kort)}</p>
<div class="pcard first"><div class="pc-head"><span class="sc-lbl">Aanbod</span><p class="pc-price"><strong>${esc(aanbodTekst(id))}</strong></p></div>
<ul class="pc-facts"><li><span>Propaan (R290)</span><span>${fv(FEATURES[id].propaan, false)}</span></li><li><span>Prijs openbaar</span><span>${fv(FEATURES[id].prijs, false)}</span></li><li><span>Garantie 5 jaar</span><span>${fv(FEATURES[id].garantie, false)}</span></li><li><span>Plek in de vergelijking</span><span>${pos} van ${IDS.length}</span></li></ul>
${scoreBlock(id)}
<div class="pc-cta">${knop(id, 'merk_top')}<a href="/warmtepomp-keuzehulp/">Past het bij mijn huis? Start de keuzehulp →</a></div></div>
<h2>Modellen</h2><div class="table-wrap"><table class="data stack"><thead><tr><th scope="col">Model of lijn</th><th scope="col">Wat</th></tr></thead><tbody>${p.lijnen.map(([n, w]) => `<tr><th scope="row">${esc(n)}</th><td data-l="Wat">${esc(w)}</td></tr>`).join('')}</tbody></table></div>
${prijsBlok}
<h2>Checklist: wat biedt ${esc(p.naam)}?</h2><p class="sub">Tien vaste punten, uit de site van het merk. Niet vermeld telt als 0. <a href="/over/#methode">Zo tellen we</a></p>${checklistTable(id)}
<h2>Sterk en let op</h2><div class="pm"><div class="card plus"><h3>Sterk</h3><ul>${p.plus.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><div class="card min"><h3>Let op</h3><ul>${p.min.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
<h2>Voor wie?</h2><p>${esc(p.voor)}</p>
${leadCta(typeVan(id), 'merk')}
<div class="out">${knop(id, 'merk_bottom')}</div>
<h2>Alternatieven</h2><ul class="gidslijst">${alt.map((x) => `<li class="withlogo">${logo(x, 'sm')}<a href="/merken/${M[x].slug}/">${esc(M[x].naam)}</a> · ${esc(STERK_IN[x])} · score ${fmtScore(score(x).totaal)}/10</li>`).join('')}${(RELATED[id] || []).map(([h, tt]) => `<li><a href="${h}">${esc(tt)}</a></li>`).join('')}<li><a href="/vergelijken/">Alle merken naast elkaar</a></li></ul>
<h2>Voor je tekent</h2><ul class="gidslijst"><li><a href="/blog/warmtepomp-offerte-vergelijken/">Warmtepomp-offertes vergelijken in 6 stappen</a></li><li><a href="/isde-subsidie-warmtepomp-2026/">ISDE-subsidie 2026: bedragen en voorwaarden</a></li><li><a href="/warmtepomp-kosten/">Wat kost een warmtepomp in 2026?</a></li></ul>
${matchCta(`Past ${esc(p.naam)} bij jouw huis?`)}${bron(p.bronnen, featureBronnen(id))}</article>`,
  };
});

export const merkHub = {
  path: '/merken/', title: 'Warmtepomp merken 2026: 8 merken op een rij', h1: 'Alle warmtepompmerken op een rij', crumb: 'Merken', og: 'merken', stamp: { checked: CHECKED, updated: CHECKED },
  description: 'Quatt, Daikin, Mitsubishi Electric, Vaillant, Nefit Bosch, Itho Daalderop, Remeha en Panasonic: per merk het aanbod, de score en voor wie het past.',
  schema: [{ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: RANG.map((id, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE.domain}/merken/${M[id].slug}/`, name: M[id].naam })) }],
  body: `<h1>Alle warmtepompmerken op een rij</h1><p class="lead">Acht merken die in Nederland warmtepompen leveren. Gesorteerd op checklist-score, bij gelijke stand op naam.</p>
<div class="actions"><a class="btn" href="/warmtepomp-keuzehulp/">Liever advies op maat? Start de keuzehulp</a><a class="btn ghost" href="/vergelijken/">Filter en vergelijk</a></div>
<ol class="plist">${RANG.map((id, i) => pcard(id, { rank: i + 1, pos: 'lijst' })).join('')}</ol>
${methodBox()}`,
};

// ---- Vergelijken ----
const FILTERS = ['hybride', 'allelectric', 'bodem', 'luchtlucht', 'propaan', 'koelen', 'app', 'prijs'];
const sel = (id, label, opts) => `<div class="field"><label for="${id}">${label}</label><select id="${id}" name="${id}">${opts.map(([v, t]) => `<option value="${v}">${esc(t)}</option>`).join('')}</select></div>`;
export const vsHub = {
  path: '/vergelijken/', title: 'Warmtepompen vergelijken 2026 | WarmtepompenMatch', h1: 'Warmtepompen vergelijken', crumb: 'Vergelijken', og: 'vergelijken', stamp: { checked: CHECKED, updated: CHECKED },
  scripts: ['/js/vergelijk.js'],
  description: 'Acht warmtepompmerken in één tabel: hybride, all-electric, bodem, lucht-lucht, propaan, koelen, app, prijs en garantie. Filter op wat jij nodig hebt.',
  body: `<h1>Warmtepompen vergelijken (2026)</h1><p class="lead">Acht merken op 10 vaste punten. Filter op wat jij zoekt.</p>
<div class="actions"><a class="btn" href="/warmtepomp-keuzehulp/">Liever advies op maat? Start de keuzehulp</a></div>
<form class="filters card" id="filters" aria-labelledby="h-f"><h2 id="h-f">Filter de merken</h2>
<fieldset class="q"><legend>Moet het merk hebben</legend><div class="fchecks">${FILTERS.map((k) => `<label class="check"><input type="checkbox" name="need" value="${k}"><span>${esc(PUNTEN[k].lang)}</span></label>`).join('')}</div></fieldset>
<p class="sub">"Deels" telt mee. Niet vermeld telt niet mee.</p>
<p class="count" id="f-count" aria-live="polite">${IDS.length} van ${IDS.length} merken</p>
</form>
<div class="sortbar"><h2 style="margin:0">Alle merken naast elkaar</h2>${sel('f-sort', 'Sorteer op', [['score', 'Checklist-score'], ['naam', 'Naam']])}</div>
${matrix(RANG)}
<p class="empty" id="f-empty" hidden>Geen merk voldoet aan alles. Zet een filter uit of <a href="/warmtepomp-keuzehulp/">start de keuzehulp</a>.</p>
<p class="src">De bron van elk punt staat op de pagina van elk merk.</p>
${methodBox()}
<h2>Twee merken naast elkaar</h2>${vsCards()}${matchCta()}`,
};

const sideRow = (label, a, b) => `<tr><th scope="row">${label}</th><td>${a}</td><td>${b}</td></tr>`;
const cmp = ({ slug, a, b, h1, title, description, intro, rows, kiesA, kiesB, faq }) => {
  const side = (id, kies, posn) => `<div class="card"><span class="pc-logo">${logo(id)}</span><span class="tag best">${esc(STERK_IN[id])}</span><h2>${esc(M[id].naam)}</h2><p class="pc-price"><strong>${esc(aanbodTekst(id))}</strong></p><div class="pc-score" style="margin-top:12px"><span class="sc-lbl">Checklist-score</span>${scoreBadge(id)}${bars(id)}</div><p class="lbl" style="margin-top:14px">Kies ${esc(M[id].naam)} als</p><ul>${kies.map((x) => `<li>${x}</li>`).join('')}</ul><div class="out"><a href="/merken/${M[id].slug}/">Alles over ${esc(M[id].naam)} →</a></div></div>`;
  return {
    ...article({ path: `/vergelijken/${slug}/`, title, h1, description, og: `vs-${slug}`, parents: [['/vergelijken/', 'Vergelijken']], faq }),
    navPath: '/vergelijken/',
    body: `<article><h1>${esc(h1)}</h1>${by()}<p class="lead">${intro}</p>
<h2>Snel antwoord</h2><div class="verdict">${side(a, kiesA, 'vs_a')}${side(b, kiesB, 'vs_b')}</div>
<h2>Verschillen</h2><div class="table-wrap"><table class="data side"><thead><tr><th scope="col"></th><th scope="col"><span class="thlogo">${logo(a, 'sm')}</span>${esc(M[a].naam)}</th><th scope="col"><span class="thlogo">${logo(b, 'sm')}</span>${esc(M[b].naam)}</th></tr></thead><tbody>${rows.map((r) => sideRow(...r)).join('')}</tbody></table></div>
<h2>Checklist naast elkaar</h2><p class="sub">Tien vaste punten uit de sites van de merken. <a href="/over/#methode">Zo tellen we</a></p>
<div class="table-wrap"><table class="data side"><thead><tr><th scope="col">Checklistpunt</th><th scope="col"><span class="thlogo">${logo(a, 'sm')}</span>${esc(M[a].naam)}</th><th scope="col"><span class="thlogo">${logo(b, 'sm')}</span>${esc(M[b].naam)}</th></tr></thead><tbody>${GROEPEN.map((g) => `<tr><th colspan="3" scope="colgroup" style="background:var(--sand)">${esc(g.naam)}</th></tr>${g.punten.map((k) => sideRow(esc(PUNTEN[k].lang), fv(FEATURES[a][k]), fv(FEATURES[b][k]))).join('')}`).join('')}<tr><th scope="row">Checklist-score</th><td>${scoreBadge(a)}</td><td>${scoreBadge(b)}</td></tr></tbody></table></div>
<div class="out">${knop(a, 'vs_a', 'btn ghost')}${knop(b, 'vs_b', 'btn ghost')}</div>
${faqHtml(faq)}${matchCta()}<p>Meer weten? <a href="/merken/${M[a].slug}/">${esc(M[a].naam)}</a> · <a href="/merken/${M[b].slug}/">${esc(M[b].naam)}</a> · <a href="/vergelijken/">alle merken</a></p>${bron(M[a].bronnen, M[b].bronnen, featureBronnen(a, b))}</article>`,
  };
};

export const vsPages = [
  cmp({
    slug: 'quatt-vs-remeha', a: 'quatt', b: 'remeha', h1: 'Quatt of Remeha: welke hybride warmtepomp kies je?',
    title: 'Quatt vs Remeha 2026: hybride warmtepomp',
    description: 'Quatt Hybrid met vaste prijs vanaf € 4.449 na subsidie, of Remeha Elga Ace en Confida via de installateur. De verschillen in aanbod, garantie en koelen.',
    intro: 'Allebei leveren ze een hybride warmtepomp met propaan en een all-electric model. Quatt verkoopt en installeert zelf, met vaste prijzen op de site. Remeha verkoopt via installateurs en noemt geen prijzen.',
    rows: [['Hybride', 'Hybrid Single (7 kW) en Duo (14 kW)', 'Elga Ace en Confida'], ['All-electric', 'Quatt All-Electric', 'Mercuria Ace en Confida'], ['Prijs op de site', 'Ja: Hybrid Single € 4.449, Duo € 5.399 (na ISDE 2026, incl. basisinstallatie)', 'Niet vermeld'], ['Koelen', 'Met de add-on Chill, via de radiatoren', 'Verwarmen en koelen (all-electric)'], ['Garantie', '2 jaar product, 1 jaar installatie', '2 jaar fabrieksgarantie; tot 10 jaar met een betaald garantieplan via de installateur'], ['Kopen', 'Direct bij Quatt, eigen monteurs', 'Via een installateur']],
    kiesA: ['je vooraf een vaste prijs wilt, inclusief installatie', 'je de subsidieaanvraag uit handen wilt geven', 'je later van hybride naar all-electric wilt (Duo is All-Electric ready)'],
    kiesB: ['je al een Remeha-ketel hebt en met je eigen installateur werkt', 'je ook wilt koelen met een all-electric model'],
    faq: [['Is Quatt goedkoper dan Remeha?', 'Quatt noemt vaste prijzen: Hybrid Single € 4.449 en Duo € 5.399, inclusief basisinstallatie en na ISDE 2026. Remeha noemt geen prijzen; de prijs hoor je van je installateur. Gemiddeld kost een hybride warmtepomp € 6.200 vóór subsidie (Milieu Centraal).'], ['Werken beide met propaan?', 'Ja. Quatt Hybrid werkt met propaan, en Remeha heeft de Confida-monoblock met propaan.']],
  }),
  cmp({
    slug: 'daikin-vs-mitsubishi-electric', a: 'daikin', b: 'mitsubishi', h1: 'Daikin of Mitsubishi Electric: welke warmtepomp?',
    title: 'Daikin vs Mitsubishi Electric warmtepomp 2026',
    description: 'Daikin Altherma of Mitsubishi Ecodan? Twee Japanse merken met lucht-water en lucht-lucht. Verschillen in bodem, koelen, app en garantie op een rij.',
    intro: 'Twee Japanse merken die je via een installateur koopt. Beide hebben lucht-waterwarmtepompen met propaan en airconditioners. Daikin heeft ook een bodemwarmtepomp.',
    rows: [['Lucht-water met propaan', 'Altherma 4 H (R-290)', 'Ecodan monoblock (R290)'], ['Hybride', 'Ja', 'Ja, All-Electric Ready'], ['Bodem', 'Altherma 3 GEO', 'Niet vermeld'], ['App', 'Onecta', 'MELCloud Home'], ['Koelen met lucht-water', 'Ja', 'Ja'], ['Garantie', 'Tot 5 jaar na registratie (Stand By Me)', '3 jaar op onderdelen, via de installateur'], ['Installateur vinden', 'Dealer locator', 'Comfort Coach']],
    kiesA: ['je ook een bodemwarmtepomp wilt overwegen', 'je garantie tot 5 jaar wilt (na registratie)'],
    kiesB: ['je een hybride wilt die later all-electric kan', 'je hulp wilt bij het vinden van een installateur (Comfort Coach)'],
    faq: [['Wat kost een Daikin of Mitsubishi warmtepomp?', 'Beide merken noemen geen consumentenprijzen; je koopt via een installateur. Gemiddeld kost een all-electric lucht-waterwarmtepomp € 12.000 vóór subsidie (Milieu Centraal).'], ['Kunnen beide koelen?', 'Ja. Daikin noemt verwarmen en koelen, en Mitsubishi Electric schrijft dat de Ecodan-warmtepompen ook kunnen koelen. Volgens Mitsubishi Electric is dat geen airco: je krijgt geen koude luchtstroom zoals in een auto.']],
  }),
  cmp({
    slug: 'vaillant-vs-nefit-bosch', a: 'vaillant', b: 'nefitbosch', h1: 'Vaillant of Nefit Bosch: welke warmtepomp kies je?',
    title: 'Vaillant vs Nefit Bosch warmtepomp 2026',
    description: 'Vaillant aroTHERM plus of Nefit Bosch Compress 5800i? Allebei met propaan en stil. Verschillen in geluid, bodem, koelen en garantie naast elkaar.',
    intro: 'Twee grote ketelmerken met lucht-waterwarmtepompen op propaan (R290). Vaillant noemt 27,5 dB(A) op 3 meter voor de aroTHERM plus, Nefit Bosch 26,5 dB(A) op 3 meter voor de Compress 5800i AW.',
    rows: [['Lucht-water', 'aroTHERM plus, 3 tot 12 kW', 'Compress 5800i AW, hybride en all-electric'], ['Geluid op 3 meter', '27,5 dB(A)', '26,5 dB(A)'], ['Bodem', 'geoCOMPACT exclusive (R290)', 'Compress 7801i LW(M) (R290), eind 2026'], ['Koelen met lucht-water', 'Ja', 'Ja, alle all-electric modellen'], ['App', 'myVAILLANT', 'HomeCom Easy'], ['Garantie', '2 jaar, plus 3 jaar als de installateur die aanvraagt', '7 jaar op onderdelen bij inbedrijfname door Nefit Bosch']],
    kiesA: ['je een lucht-waterwarmtepomp zoekt in vermogens van 3 tot 12 kW', 'je nu al een bodemwarmtepomp met propaan wilt'],
    kiesB: ['je als hybride wilt beginnen en later all-electric wilt', 'je de langste garantie op onderdelen wilt (7 jaar, met inbedrijfname door Nefit Bosch)'],
    faq: [['Welke is stiller, Vaillant of Nefit Bosch?', 'Volgens de merken zelf: Nefit Bosch Compress 5800i AW 26,5 dB(A) op 3 meter, Vaillant aroTHERM plus 27,5 dB(A) op 3 meter. Het verschil is klein; de plek van de buitenunit telt meer. Zie <a href="/warmtepomp-geluid/">warmtepomp en geluid</a>.'], ['Hebben beide een bodemwarmtepomp?', 'Ja. Vaillant heeft de geoCOMPACT exclusive, Nefit Bosch de Compress 7801i LW(M), die eind 2026 komt.']],
  }),
];

// ---- Gidsen ----
const G = [['/gidsen/', 'Gidsen']];
const kostenFaq = [
  ['Wat kost een hybride warmtepomp?', 'Gemiddeld € 6.200 inclusief installatie voor 4 kW, of € 8.300 met een nieuwe cv-ketel erbij. Met € 2.125 ISDE-subsidie betaal je netto ongeveer € 4.075 (Milieu Centraal).'],
  ['Wat kost een all-electric warmtepomp?', 'Gemiddeld € 12.000 voor een lucht-waterwarmtepomp van 8 kW met buitenunit. De ISDE-subsidie is dan € 3.025 (Milieu Centraal).'],
  ['Waarom is een bodemwarmtepomp zo duur?', 'Er moet een bron in de grond worden geboord. Milieu Centraal noemt gemiddeld € 30.000 voor 8 kW, met € 4.425 subsidie in het voorbeeld.'],
];
export const kosten = {
  ...article({ path: '/warmtepomp-kosten/', title: 'Wat kost een warmtepomp in 2026? Alle prijzen', h1: 'Wat kost een warmtepomp in 2026?', description: 'Hybride gemiddeld € 6.200, all-electric € 12.000, bodem € 30.000. De kosten per type, de ISDE-subsidie van 2026 en wat je netto betaalt.', og: 'warmtepomp-kosten', parents: G, faq: kostenFaq }),
  navPath: '/gidsen/',
  body: `<article class="prose"><h1>Wat kost een warmtepomp in 2026?</h1>${by()}<p class="lead">Een hybride warmtepomp kost gemiddeld ${eur(TYPES.hybride.kosten)}, een all-electric ${eur(TYPES.allelectric.kosten)}. Dat zijn de gemiddelden van Milieu Centraal, inclusief installatie en vóór subsidie.</p>
<h2>Kosten per type</h2><div class="table-wrap"><table class="data stack"><thead><tr><th scope="col">Type</th><th scope="col">Gemiddeld</th><th scope="col">ISDE-subsidie</th><th scope="col">Netto</th></tr></thead><tbody>${['hybride', 'allelectric', 'bodem', 'luchtlucht'].map((k) => { const t = TYPES[k]; return `<tr><th scope="row">${esc(t.naam)}<span class="fnote">${esc(t.kort)}</span></th><td class="n" data-l="Gemiddeld">${eur(t.kosten)}</td><td class="n" data-l="ISDE-subsidie">${t.subsidie ? eur(t.subsidie) : 'Geen ISDE'}</td><td class="n" data-l="Netto">${eur(t.kosten - t.subsidie)}</td></tr>`; }).join('')}<tr><th scope="row">Ventilatiewarmtepomp<span class="fnote">Haalt warmte uit ventilatielucht</span></th><td class="n" data-l="Gemiddeld">€ 6.500</td><td class="n" data-l="ISDE-subsidie">€ 1.675</td><td class="n" data-l="Netto">€ 4.825</td></tr></tbody></table></div>
<p>Wil je bij een hybride ook een nieuwe cv-ketel, dan noemt Milieu Centraal gemiddeld € 8.300. Een lucht-luchtwarmtepomp (single-split airco) krijgt geen ISDE-subsidie.</p>
<h2>Merken met een vaste prijs</h2><p>Van de acht merken die we vergelijken noemt alleen <a href="/merken/quatt/">Quatt</a> consumentenprijzen op de eigen site: Hybrid Single (7 kW) € 4.449 en Hybrid Duo (14 kW) € 5.399, beide inclusief basisinstallatie en na aftrek van de ISDE-subsidie van 2026. All-Electric kost bij Quatt vanaf € 8.949. De andere merken verkopen via installateurs; de prijs staat dan in je offerte.</p>
<h2>Wat bepaalt de prijs?</h2><ul><li><strong>Vermogen in kW.</strong> Meer vermogen kost meer, maar levert ook meer subsidie op (€ 225 per kW in 2026).</li><li><strong>Type.</strong> Hybride is het goedkoopst, bodem het duurst.</li><li><strong>Installatie.</strong> Leidingen, een extra groep in de meterkast of een boilervat voor warm water. Een hybride installeren duurt 1 tot 2 dagen.</li><li><strong>Isolatie.</strong> Voor all-electric moet je huis minstens redelijk geïsoleerd zijn. Isoleer je eerst, dan komen die kosten erbij, maar binnen 24 maanden verdubbelt de ISDE voor de isolatiemaatregel.</li></ul>
<h2>Na 2026</h2><p>Voor 2027 kondigt RVO een lagere ISDE aan voor lucht-waterwarmtepompen: € 120 in plaats van € 225 per kW. Koop je uiterlijk 31 december 2026, dan houd je met bewijs van aankoop het bedrag van 2026. Zie <a href="/isde-subsidie-warmtepomp-2026/">ISDE-subsidie 2026</a>.</p>
<p><a class="btn" href="/terugverdientijd-berekenen/" data-tool="terugverdientijd">Bereken je terugverdientijd</a></p>
${leadCta('hybride', 'gids_kosten')}${faqHtml(kostenFaq)}${matchCta('Welke warmtepomp past bij jouw budget?')}${bron(B('mcHybride', 'mcVolledig', 'mcTypes', 'rvo2026', 'rvo2027'), [['Quatt Hybrid prijs', 'https://www.quatt.io/waarom-quatt/hybride-warmtepomp/prijs-kopen'], ['Quatt All-Electric prijs', 'https://www.quatt.io/waarom-quatt/all-electric-warmtepomp/prijs-kopen']])}</article>`,
};

const tvtFaq = [
  ['Hoe snel verdien je een hybride warmtepomp terug?', `In het voorbeeld van Milieu Centraal (matig geïsoleerde hoekwoning, 1.360 m³ gas) bespaar je ongeveer € 600 per jaar. Met € 4.075 netto na subsidie is dat ${komma(H.jaren)} jaar.`],
  ['Hoe snel verdien je een all-electric warmtepomp terug?', `In het voorbeeld van Milieu Centraal (goed geïsoleerde hoekwoning, 950 m³ gas) bespaar je ongeveer € 1.000 per jaar, inclusief het vastrecht voor gas. Met € 8.975 netto is dat ${komma(AE.jaren)} jaar.`],
];
export const terugverdientijd = {
  ...article({ path: '/warmtepomp-terugverdientijd/', title: 'Terugverdientijd warmtepomp 2026: zo reken je', h1: 'Terugverdientijd van een warmtepomp', description: `Een hybride warmtepomp verdien je in ongeveer ${komma(H.jaren)} jaar terug, all-electric in ${komma(AE.jaren)} jaar. Zo reken je het uit voor je eigen huis.`, og: 'warmtepomp-terugverdientijd', parents: G, faq: tvtFaq }),
  navPath: '/gidsen/',
  body: `<article class="prose"><h1>Terugverdientijd van een warmtepomp</h1>${by()}<p class="lead">Terugverdientijd = wat je netto betaalt (na subsidie), gedeeld door wat je per jaar bespaart. Met de voorbeelden van Milieu Centraal komt een hybride uit op ${komma(H.jaren)} jaar en all-electric op ${komma(AE.jaren)} jaar.</p>
<h2>Twee voorbeelden</h2><div class="table-wrap"><table class="data stack"><thead><tr><th scope="col"></th><th scope="col">Hybride</th><th scope="col">All-electric</th></tr></thead><tbody>
<tr><th scope="row">Woning</th><td data-l="Hybride">Matig geïsoleerde hoekwoning</td><td data-l="All-electric">Goed geïsoleerde hoekwoning</td></tr>
<tr><th scope="row">Gas vóór</th><td data-l="Hybride">1.360 m³ + 310 kWh: € 1.950 per jaar</td><td data-l="All-electric">950 m³ + 250 kWh: € 1.360 per jaar, plus € 360 vastrecht gas</td></tr>
<tr><th scope="row">Na</th><td data-l="Hybride">680 m³ + 1.925 kWh: € 1.350 per jaar</td><td data-l="All-electric">3.400 kWh: € 720 per jaar</td></tr>
<tr><th scope="row">Besparing per jaar</th><td data-l="Hybride">${eur(H.besparing)}</td><td data-l="All-electric">${eur(AE.besparing)}</td></tr>
<tr><th scope="row">Netto investering</th><td data-l="Hybride">${eur(H.kosten)} − ${eur(H.subsidie)} = ${eur(H.netto)}</td><td data-l="All-electric">${eur(AE.kosten)} − ${eur(AE.subsidie)} = ${eur(AE.netto)}</td></tr>
<tr><th scope="row">Terugverdientijd</th><td data-l="Hybride"><strong>${komma(H.jaren)} jaar</strong></td><td data-l="All-electric"><strong>${komma(AE.jaren)} jaar</strong></td></tr>
</tbody></table></div>
<p>Verbruik en bedragen per jaar komen uit de rekenvoorbeelden van Milieu Centraal. Daaruit volgen een gasprijs van ongeveer € ${komma(GASPRIJS)} per m³ en een stroomprijs van ongeveer € ${komma(STROOMPRIJS)} per kWh. Een hybride gaat volgens Milieu Centraal ongeveer 15 jaar mee.</p>
<h2>Wat maakt het sneller of langzamer?</h2><ul><li><strong>Meer gasverbruik</strong> = meer besparing, dus sneller terugverdiend.</li><li><strong>Van het gas af.</strong> Met all-electric vervalt het vastrecht voor gas (€ ${VASTRECHT_GAS} per jaar in het voorbeeld).</li><li><strong>Isolatie.</strong> Een goed geïsoleerd huis heeft een kleinere warmtepomp nodig en verbruikt minder stroom.</li><li><strong>Subsidie.</strong> In 2027 daalt de ISDE voor lucht-water naar € 120 per kW (aangekondigd door RVO). Kopen in 2026 scheelt dus.</li></ul>
<p><a class="btn" href="/terugverdientijd-berekenen/" data-tool="terugverdientijd">Reken het uit met jouw gasverbruik</a></p>
${faqHtml(tvtFaq)}${matchCta()}${bron(B('mcHybride', 'mcVolledig', 'rvo2026', 'rvo2027'))}</article>`,
};

const isdeFaq = [
  ['Hoeveel ISDE krijg ik voor een hybride warmtepomp in 2026?', 'Voor je eerste lucht-waterwarmtepomp € 1.025 plus € 225 per kW, plus € 200 bij energielabel A+++. Een hybride van 4 kW met A+++ geeft € 2.125. Je krijgt altijd minimaal € 500.'],
  ['Mag ik de warmtepomp zelf installeren?', 'Nee. Voor ISDE moet een bouwinstallatiebedrijf de volledige installatie doen.'],
  ['Wanneer moet ik de subsidie aanvragen?', 'Na de installatie, binnen 24 maanden. Je hebt de DigiD-app nodig of DigiD met sms-controle.'],
  ['Wat verandert er in 2027?', 'RVO kondigt voor lucht-water € 120 per kW aan in plaats van € 225, een bonus van € 200 voor slimme sturing (EEBus, S2 of Matter) en € 250 bij A+++. Koop je uiterlijk 31 december 2026, dan houd je met bewijs het bedrag per kW van 2026.'],
];
export const isde = {
  ...article({ path: '/isde-subsidie-warmtepomp-2026/', title: 'ISDE-subsidie warmtepomp 2026: bedragen en regels', h1: 'ISDE-subsidie voor een warmtepomp in 2026', description: 'ISDE 2026 voor een warmtepomp: € 1.025 plus € 225 per kW, € 200 extra bij A+++. Voorbeeld 4 kW: € 2.125. Alle voorwaarden en wat er in 2027 verandert.', og: 'isde-subsidie-warmtepomp-2026', parents: G, faq: isdeFaq }),
  navPath: '/gidsen/',
  body: `<article class="prose"><h1>ISDE-subsidie voor een warmtepomp in 2026</h1>${by()}<p class="lead">Met de ISDE (Investeringssubsidie duurzame energie en energiebesparing) krijg je een deel van je warmtepomp terug van RVO. In 2026 is het bedrag voor een lucht-waterwarmtepomp anders berekend dan in 2025.</p>
<h2>Bedragen in 2026</h2><div class="table-wrap"><table class="data stack"><thead><tr><th scope="col">Onderdeel</th><th scope="col">Bedrag</th></tr></thead><tbody>
<tr><th scope="row">Startbedrag, eerste lucht-waterwarmtepomp</th><td class="n" data-l="Bedrag">€ 1.025</td></tr>
<tr><th scope="row">Per kW vermogen, vanaf de eerste kW</th><td class="n" data-l="Bedrag">€ 225</td></tr>
<tr><th scope="row">Bonus energielabel A+++</th><td class="n" data-l="Bedrag">€ 200</td></tr>
<tr><th scope="row">Tweede of volgende lucht-waterwarmtepomp</th><td class="n" data-l="Bedrag">Alleen € 225 per kW</td></tr>
<tr><th scope="row">Minimaal</th><td class="n" data-l="Bedrag">€ 500</td></tr>
</tbody></table></div>
<p><strong>Voorbeeld:</strong> een hybride van 4 kW met A+++ geeft € 1.025 + 4 × € 225 + € 200 = ${eur(isde2026(4))}. Een all-electric van 8 kW met A+++ geeft ${eur(isde2026(8))}.</p>
<p>Voor warmtepompboilers, grond-water- en water-waterwarmtepompen blijven de bedragen gelijk aan 2025. Split lucht-waterwarmtepompen met een vulgewicht onder 3 kg en een koudemiddel met een GWP boven 750 krijgen vanaf 2026 geen subsidie meer. Aanvragen kan sinds 5 januari 2026, 12:00 uur.</p>
<h2>Voorwaarden</h2><ul><li>De warmtepomp is <strong>nieuw</strong> en staat op de <strong>meldcodelijst</strong> van RVO.</li><li>Een <strong>bouwinstallatiebedrijf</strong> doet de volledige installatie. Zelf installeren mag niet.</li><li>Je huis is gebouwd <strong>vóór 1 januari 2019</strong>, of de omgevingsvergunning is aangevraagd vóór 1 juli 2018.</li><li>Je vraagt aan <strong>na de installatie</strong>, binnen <strong>24 maanden</strong>.</li><li>Je hebt de <strong>DigiD-app</strong> nodig of DigiD met sms-controle.</li><li>Bij de aanvraag: meldcode, factuur en betaalbewijs met datum, installatiedatum en de gegevens van het installatiebedrijf.</li></ul>
<p><strong>Tip:</strong> isoleer je binnen 24 maanden ook, dan verdubbelt het subsidiebedrag voor de isolatiemaatregel.</p>
<h2>Wat verandert er in 2027?</h2><p>RVO kondigt voor 2027 aan:</p><ul><li>Lucht-water: <strong>€ 120 per kW</strong> in plaats van € 225.</li><li>Nieuwe bonus van <strong>€ 200 voor slimme sturing</strong> (EEBus, S2 of Matter).</li><li>Bonus voor A+++ stijgt naar <strong>€ 250</strong>. Voorbeeld van RVO: € 1.955.</li><li>Koop je <strong>uiterlijk 31 december 2026</strong> en kun je dat aantonen, dan houd je € 225 per kW. De bonus voor slimme sturing en de hogere labelbonus krijg je dan niet.</li><li>Aanvragen voor 2027 kan vanaf 5 januari 2027, 12:00 uur.</li></ul>
<p>Omdat vooral het bedrag per kW daalt, scheelt kopen in 2026 meer naarmate het vermogen groter is.</p>
<div class="actions"><a class="btn" href="/terugverdientijd-berekenen/" data-tool="terugverdientijd">Bereken subsidie en terugverdientijd</a></div>
${leadCta('hybride', 'gids_isde')}${faqHtml(isdeFaq)}${matchCta()}${bron(B('rvo2026', 'rvoWp', 'rvo2027'))}</article>`,
};

const haeFaq = [
  ['Is all-electric beter dan hybride?', 'Niet altijd. All-electric bespaart meer en je gaat van het gas af, maar je huis moet minstens redelijk geïsoleerd zijn. Is dat niet zo, dan is een hybride de betere eerste stap.'],
  ['Kan ik later van hybride naar all-electric?', 'Ja, als je een hybride kiest die "all-electric ready" is. Milieu Centraal raadt dat aan. Bij Quatt is de Hybrid Duo All-Electric ready, bij Mitsubishi Electric de Ecodan hybride.'],
  ['Komt er een warmtenet in mijn wijk?', 'Vraag het je gemeente. Komt er binnen 5 jaar een warmtenet, dan is een hybride volgens Milieu Centraal niet logisch.'],
];
export const hybrideAe = {
  ...article({ path: '/hybride-of-all-electric/', title: 'Hybride of all-electric warmtepomp: wat past?', h1: 'Hybride of all-electric: wat past bij jouw huis?', description: 'Hybride werkt naast je cv-ketel en bespaart 60 tot 70% gas voor verwarming. All-electric vraagt redelijke isolatie. Zo kies je wat past.', og: 'hybride-of-all-electric', parents: G, faq: haeFaq }),
  navPath: '/gidsen/',
  body: `<article class="prose"><h1>Hybride of all-electric: wat past bij jouw huis?</h1>${by()}<p class="lead">De vraag is vooral: hoe goed is je huis geïsoleerd? Matig geïsoleerd: begin met een hybride. Minstens redelijk geïsoleerd: all-electric kan.</p>
<h2>Op een rij</h2><div class="table-wrap"><table class="data stack"><thead><tr><th scope="col"></th><th scope="col">Hybride</th><th scope="col">All-electric</th></tr></thead><tbody>
<tr><th scope="row">Hoe het werkt</th><td data-l="Hybride">Warmtepomp naast je cv-ketel; de ketel springt bij als het koud is</td><td data-l="All-electric">Alleen de warmtepomp, ook voor warm water (met boilervat)</td></tr>
<tr><th scope="row">Gemiddelde kosten</th><td data-l="Hybride">${eur(TYPES.hybride.kosten)} (4 kW)</td><td data-l="All-electric">${eur(TYPES.allelectric.kosten)} (8 kW)</td></tr>
<tr><th scope="row">ISDE 2026</th><td data-l="Hybride">${eur(TYPES.hybride.subsidie)}</td><td data-l="All-electric">${eur(TYPES.allelectric.subsidie)}</td></tr>
<tr><th scope="row">Besparing</th><td data-l="Hybride">60 tot 70% minder gas voor verwarming; ongeveer ${eur(H.besparing)} per jaar in het voorbeeld</td><td data-l="All-electric">Geen gas meer; ongeveer ${eur(AE.besparing)} per jaar in het voorbeeld</td></tr>
<tr><th scope="row">Isolatie nodig</th><td data-l="Hybride">Werkt ook bij matige isolatie</td><td data-l="All-electric">Minstens redelijk: Rc 2,5 dak en vloer, geïsoleerde spouw, hr++-glas</td></tr>
<tr><th scope="row">Radiatoren</th><td data-l="Hybride">Bestaande radiatoren blijven</td><td data-l="All-electric">Lage temperatuur; soms grotere radiatoren of vloerverwarming</td></tr>
<tr><th scope="row">Gasaansluiting</th><td data-l="Hybride">Blijft</td><td data-l="All-electric">Kan eruit: geen vastrecht gas (€ ${VASTRECHT_GAS} per jaar)</td></tr>
</tbody></table></div>
<h2>Kies hybride als</h2><ul><li>je huis matig of slecht geïsoleerd is;</li><li>je budget onder de € 10.000 ligt;</li><li>je eerst wilt isoleren en later volledig elektrisch wilt (kies dan "all-electric ready").</li></ul>
<h2>Kies all-electric als</h2><ul><li>je huis minstens redelijk geïsoleerd is. Milieu Centraal: huizen van 1992 tot 2000 zijn vaak redelijk geïsoleerd, vanaf 2000 beter en vanaf 2009 goed tot zeer goed. Bij oudere huizen hangt het af van wat er later is verbeterd;</li><li>je helemaal van het gas af wilt;</li><li>je ruimte hebt voor een boilervat: ongeveer 80 liter voor 2 personen, 150 liter voor 4 en 220 liter voor 6.</li></ul>
<h2>Welke merken leveren wat?</h2><p><strong>Hybride:</strong> ${typeLijst('hybride')}.</p><p><strong>All-electric:</strong> ${typeLijst('allelectric')}.</p><p><strong>Bodem:</strong> ${typeLijst('bodem')}.</p>
${leadCta('hybride', 'gids_hae')}${faqHtml(haeFaq)}${matchCta('Wat past bij jouw huis?')}${bron(B('mcHybride', 'mcVolledig', 'rvo2026'))}</article>`,
};

const geluidFaq = [
  ['Hoeveel geluid mag een warmtepomp maken?', 'Maximaal 40 dB op de erfgrens van de buren, tussen 19:00 en 07:00 uur. Overdag mag 45 dB als de installatie meerdere standen heeft. Bij een andere woning op hetzelfde terrein geldt de grens bij een open raam of deur.'],
  ['Heb ik een vergunning nodig voor de buitenunit?', 'Meestal niet. Warmtepompen tot 1 meter hoog en 2 m² zijn meestal vergunningvrij (artikel 2.29 Bbl). De geluidsregels gelden wel altijd.'],
  ['Hoe ver moet de buitenunit van de erfgrens?', 'Volgens het Nationaal Programma Lokale Warmtetransitie: vrijstaand (minstens 2 meter van een gevel) 3 tot 4 meter, tegen een gevel of berging 4 tot 5 meter.'],
];
export const geluid = {
  ...article({ path: '/warmtepomp-geluid/', title: 'Warmtepomp geluid: regels, afstand en tips 2026', h1: 'Warmtepomp en geluid: regels en afstand', description: 'Een warmtepomp mag 40 dB maken op de erfgrens van de buren. Hoe ver de buitenunit moet staan, wat een scherm doet en hoe stil de merken zijn.', og: 'warmtepomp-geluid', parents: G, faq: geluidFaq }),
  navPath: '/gidsen/',
  body: `<article class="prose"><h1>Warmtepomp en geluid: regels en afstand</h1>${by()}<p class="lead">De buitenunit van een lucht-waterwarmtepomp maakt geluid. Volgens Milieu Centraal heeft 72% van de eigenaren daar nooit last van. Voor de buren gelden vaste regels.</p>
<h2>De regels</h2><ul><li>Maximaal <strong>40 dB op de erfgrens</strong> van de buren, in de avond en nacht (19:00 tot 07:00 uur).</li><li>Overdag (07:00 tot 19:00 uur) mag <strong>45 dB</strong> als de installatie meerdere standen heeft.</li><li>Een andere woning op hetzelfde terrein, zoals een bovenwoning: de 40 dB geldt bij een <strong>open raam of deur</strong> van die woning.</li><li>Warmtepompen tot 1 meter hoog en 2 m² zijn meestal <strong>vergunningvrij</strong>. Je gemeente kan in het omgevingsplan regels opnemen.</li></ul>
<h2>Zo reken je het uit</h2><p>Omgevingsdienst Twente legt het zo uit: noemt de leverancier het geluid op 1 meter, tel er 9 dB bij op voor het bronvermogen. Tel daarna nog 3 dB op als marge. Voorbeeld: 48 dB op 1 meter + 9 + 3 = 60 dB bronvermogen. Om op 40 dB uit te komen moet het geluid dan 20 dB afnemen over de afstand tot de erfgrens.</p>
<h2>Afstand en afscherming</h2><ul><li><strong>Vrijstaand</strong> (minstens 2 meter van een gevel): 3 tot 4 meter van de erfgrens.</li><li><strong>Tegen een gevel of berging</strong>: 4 tot 5 meter.</li><li><strong>Scherm:</strong> volledig gesloten, minstens 1,8 meter hoog en idealiter minstens 10 kg per m². De meeste schuttingen hebben kieren en helpen weinig.</li><li><strong>Omkasting:</strong> ongeveer 5 dB minder geluid.</li><li><strong>Trillingdempers</strong> als de unit aan de gevel of op het dak hangt.</li></ul>
<h2>Hoe stil zijn de merken?</h2><div class="table-wrap"><table class="data stack"><thead><tr><th scope="col">Model</th><th scope="col">Geluid volgens het merk</th></tr></thead><tbody><tr><th scope="row"><a href="/merken/nefit-bosch/">Nefit Bosch Compress 5800i AW</a></th><td data-l="Geluid">26,5 dB(A) op 3 meter</td></tr><tr><th scope="row"><a href="/merken/vaillant/">Vaillant aroTHERM plus</a></th><td data-l="Geluid">27,5 dB(A) op 3 meter</td></tr><tr><th scope="row"><a href="/merken/itho-daalderop/">Itho Daalderop Amber</a></th><td data-l="Geluid">Geluidsvermogen 54 tot 56 dB</td></tr></tbody></table></div>
<p>Let op het verschil: geluid op een afstand (dB(A) op 3 meter) is iets anders dan het geluidsvermogen van de bron. Vergelijk dus dezelfde soort waarde. De andere merken noemen geen vergelijkbaar getal op hun consumentensite.</p>
${faqHtml(geluidFaq)}${matchCta()}${bron([['Omgevingsdienst Twente: warmtepomp, airco en geluid', 'https://www.odtwente.nl/kennisbank/warmtepomp-airco-en-geluid/'], ['IPLO: ruimtelijke inpassing warmtepomp', 'https://iplo.nl/thema/toepassing-regels-praktijk/warmtepomp/ruimtelijke-inpassing/'], ['NPLW: omgaan met geluid van warmtepompen', 'https://www.nplw.nl/warmte-en-ruimte/omgaan-met-geluid-warmtepompen']], B('mcVolledig'), [['Nefit Bosch all-electric', 'https://www.nefit-bosch.nl/producten/warmtepompen/all-electric-warmtepompen/'], ['Vaillant aroTHERM plus', 'https://www.vaillant.nl/producten/arothermplus/'], ['Itho Daalderop Amber', 'https://www.ithodaalderop.nl/amber']])}</article>`,
};

const geschiktFaq = [
  ['Is mijn huis geschikt voor een hybride warmtepomp?', 'Bijna altijd, als je een cv-ketel met radiatoren hebt. Een hybride werkt met water van 30 tot 55 °C en je bestaande radiatoren; de ketel springt bij als het koud is.'],
  ['Wanneer is mijn huis geschikt voor all-electric?', 'Als het minstens redelijk geïsoleerd is: Rc 2,5 in dak en vloer, een geïsoleerde spouwmuur en hr++-glas. Huizen vanaf 1992 voldoen daar vaak aan.'],
  ['Kan een warmtepomp in een appartement?', 'Vaak wel, maar je hebt een plek nodig voor de buitenunit en overlegt met je VvE.'],
];
export const geschikt = {
  ...article({ path: '/is-mijn-huis-geschikt-voor-een-warmtepomp/', title: 'Is mijn huis geschikt voor een warmtepomp?', h1: 'Is mijn huis geschikt voor een warmtepomp?', description: 'Hybride past bijna altijd. All-electric vraagt redelijke isolatie (Rc 2,5, spouw, hr++). Check bouwjaar, radiatoren, ruimte en buitenunit in vijf stappen.', og: 'is-mijn-huis-geschikt', parents: G, faq: geschiktFaq }),
  navPath: '/gidsen/',
  body: `<article class="prose"><h1>Is mijn huis geschikt voor een warmtepomp?</h1>${by()}<p class="lead">Een hybride warmtepomp past in bijna elk huis met een cv-ketel. Voor all-electric moet je huis minstens redelijk geïsoleerd zijn. Loop deze vijf punten langs.</p>
<h2>1. Isolatie</h2><p>Milieu Centraal noemt als minimum voor all-electric: Rc 2,5 in dak en vloer, een geïsoleerde spouwmuur en hr++-glas. Weet je het niet? Kijk naar het bouwjaar:</p><div class="table-wrap"><table class="data stack"><thead><tr><th scope="col">Bouwjaar</th><th scope="col">Isolatie meestal</th><th scope="col">Advies</th></tr></thead><tbody><tr><th scope="row">Voor 1992</th><td data-l="Isolatie">Hangt af van latere verbeteringen</td><td data-l="Advies">Hybride, of eerst isoleren</td></tr><tr><th scope="row">1992 tot 2000</th><td data-l="Isolatie">Redelijk</td><td data-l="Advies">All-electric kan</td></tr><tr><th scope="row">2000 tot 2009</th><td data-l="Isolatie">Beter</td><td data-l="Advies">All-electric kan</td></tr><tr><th scope="row">Vanaf 2009</th><td data-l="Isolatie">Goed tot zeer goed</td><td data-l="Advies">All-electric</td></tr></tbody></table></div>
<p>ISDE-subsidie krijg je alleen voor huizen van vóór 2019 (of met een vergunning aangevraagd vóór 1 juli 2018).</p>
<h2>2. Radiatoren</h2><p>Een cv-ketel verwarmt water tot 60 à 80 °C, een warmtepomp tot 30 à 55 °C. Een hybride werkt met je bestaande radiatoren. Bij all-electric heb je soms grotere radiatoren of vloerverwarming nodig.</p>
<h2>3. Ruimte binnen</h2><p>All-electric verwarmt ook je tapwater, met een boilervat: ongeveer 80 liter voor 2 personen, 150 liter voor 4 en 220 liter voor 6. Je hebt binnen dus ruimte nodig voor dat vat.</p>
<h2>4. Plek voor de buitenunit</h2><p>De buitenunit mag op de erfgrens van de buren maximaal 40 dB maken. Vrijstaand houd je 3 tot 4 meter afstand, tegen een gevel 4 tot 5 meter. Zie <a href="/warmtepomp-geluid/">warmtepomp en geluid</a>.</p>
<h2>5. Toekomst van je wijk</h2><p>Komt er binnen 5 jaar een warmtenet, dan is een hybride volgens Milieu Centraal niet logisch. Vraag het je gemeente.</p>
<h2>Andere opties</h2><ul><li><strong>Ventilatiewarmtepomp:</strong> haalt warmte uit ventilatielucht, gemiddeld € 6.500 met € 1.675 subsidie.</li><li><strong>Lucht-luchtwarmtepomp:</strong> een airco die ook verwarmt, vanaf ongeveer € 2.500 voor een single-split. Geen ISDE en minder comfort als enige verwarming.</li><li><strong>Hogetemperatuurwarmtepomp:</strong> alleen voor uitzonderingen, zoals monumenten.</li></ul>
${faqHtml(geschiktFaq)}${matchCta('Check je huis in 1 minuut')}${bron(B('mcVolledig', 'mcHybride', 'mcTypes', 'rvoWp'), [['Omgevingsdienst Twente: warmtepomp, airco en geluid', 'https://www.odtwente.nl/kennisbank/warmtepomp-airco-en-geluid/'], ['NPLW: omgaan met geluid van warmtepompen', 'https://www.nplw.nl/warmte-en-ruimte/omgaan-met-geluid-warmtepompen']])}</article>`,
};
// Lees ook: per gids drie verwante pagina's (incl. de blog), net boven de bronnen.
const OFFERTEBLOG = ['/blog/warmtepomp-offerte-vergelijken/', 'Warmtepomp-offertes vergelijken in 6 stappen'];
const LEESOOK = {
  '/warmtepomp-kosten/': [OFFERTEBLOG, ['/isde-subsidie-warmtepomp-2026/', 'ISDE-subsidie 2026 en wat er in 2027 verandert'], ['/warmtepomp-terugverdientijd/', 'Terugverdientijd van een warmtepomp']],
  '/warmtepomp-terugverdientijd/': [['/warmtepomp-kosten/', 'Wat kost een warmtepomp in 2026?'], ['/isde-subsidie-warmtepomp-2026/', 'ISDE-subsidie 2026'], OFFERTEBLOG],
  '/isde-subsidie-warmtepomp-2026/': [OFFERTEBLOG, ['/warmtepomp-kosten/', 'Wat kost een warmtepomp in 2026?'], ['/vergelijken/', 'Alle 8 merken naast elkaar']],
  '/hybride-of-all-electric/': [['/is-mijn-huis-geschikt-voor-een-warmtepomp/', 'Is mijn huis geschikt?'], ['/warmtepomp-kosten/', 'Wat kost een warmtepomp in 2026?'], OFFERTEBLOG],
  '/warmtepomp-geluid/': [['/is-mijn-huis-geschikt-voor-een-warmtepomp/', 'Is mijn huis geschikt?'], OFFERTEBLOG, ['/vergelijken/', 'Alle 8 merken naast elkaar']],
  '/is-mijn-huis-geschikt-voor-een-warmtepomp/': [['/hybride-of-all-electric/', 'Hybride of all-electric?'], ['/warmtepomp-geluid/', 'Warmtepomp en geluid'], OFFERTEBLOG],
};
const leesOok = (path) => (LEESOOK[path] ? `<h2>Lees ook</h2><ul class="gidslijst">${LEESOOK[path].map(([h, t]) => `<li><a href="${h}">${esc(t)}</a></li>`).join('')}</ul>` : '');
export const guides = [kosten, terugverdientijd, isde, hybrideAe, geluid, geschikt].map((g) => {
  const i = g.body.lastIndexOf('<p class="src">Bronnen:');
  return i < 0 ? g : { ...g, body: g.body.slice(0, i) + leesOok(g.path) + g.body.slice(i) };
});

// ---- Rekenhulp ----
const num = (id, label, val, unit, hint, attrs = '') => `<div class="field"><label for="${id}">${label}</label><div class="inline"><input type="text" inputmode="decimal" id="${id}" name="${id}" value="${val}" ${attrs}><span class="unit">${unit}</span></div>${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
export const calc = {
  path: '/terugverdientijd-berekenen/', title: 'Terugverdientijd warmtepomp berekenen (2026)', h1: 'Terugverdientijd van je warmtepomp berekenen', crumb: 'Rekenhulp', og: 'rekenhulp', noCta: false,
  description: 'Bereken hoeveel je bespaart met een hybride of all-electric warmtepomp, hoeveel ISDE-subsidie je krijgt in 2026 en na hoeveel jaar je het terugverdient.',
  scripts: ['/js/rekenhulp.js'],
  schema: [{ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Terugverdientijd warmtepomp berekenen', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', url: SITE.domain + '/terugverdientijd-berekenen/', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, publisher: ORG }],
  body: `<h1>Terugverdientijd van je warmtepomp berekenen</h1><p class="lead">Vul je gasverbruik in. De rest staat op de gemiddelden van Milieu Centraal en de ISDE-bedragen van 2026; pas ze aan met de cijfers uit je offerte.</p>
<div class="grid calc">
<form class="calc-form card" id="form" novalidate>
<fieldset class="q"><legend>Welk type?</legend><div class="opts"><label><input type="radio" name="type" value="hybride" checked><span>Hybride</span></label><label><input type="radio" name="type" value="allelectric"><span>All-electric</span></label></div></fieldset>
${num('gas', 'Gasverbruik per jaar', 1360, 'm³', 'Staat op je jaarafrekening.')}
${num('kosten', 'Investering, inclusief installatie', TYPES.hybride.kosten, '€', 'Gemiddelde van Milieu Centraal. Vul de prijs uit je offerte in.')}
${num('kw', 'Vermogen', TYPES.hybride.kw, 'kW', 'Voor de ISDE: € 1.025 + € 225 per kW.')}
<label class="check"><input type="checkbox" id="aplus" name="aplus" checked><span>Energielabel A+++ (€ 200 extra subsidie)</span></label>
<details><summary>Energieprijzen aanpassen</summary>${num('gasprijs', 'Gasprijs', komma(GASPRIJS), '€ per m³', '')}${num('stroomprijs', 'Stroomprijs', komma(STROOMPRIJS), '€ per kWh', '')}</details>
</form>
<aside class="card result" id="result" aria-live="polite"><h2>Jouw uitkomst</h2><p class="big" id="r-jaren">${komma(H.jaren)} jaar</p><p class="sub">terugverdientijd</p>
<table class="kv"><tbody><tr><td>Besparing per jaar</td><td id="r-besp">${eur(H.besparing)}</td></tr><tr><td>Minder gas</td><td id="r-m3">${H.m3.toLocaleString('nl-NL')} m³</td></tr><tr><td>Extra stroom</td><td id="r-kwh">${H.kwh.toLocaleString('nl-NL')} kWh</td></tr><tr><td>Investering</td><td id="r-kost">${eur(H.kosten)}</td></tr><tr><td>ISDE-subsidie 2026</td><td id="r-sub">${eur(H.subsidie)}</td></tr><tr class="total"><td>Netto</td><td id="r-net">${eur(H.netto)}</td></tr></tbody></table>
<p class="src" id="r-noot">Hybride: de helft van je gas valt weg, per bespaarde m³ komt er 2,4 kWh stroom bij (rekenvoorbeeld Milieu Centraal).</p></aside>
</div>
<section class="method" id="methode"><h2>Zo rekenen we</h2><ul><li><strong>Hybride:</strong> de helft van je gasverbruik valt weg (Milieu Centraal: 1.360 naar 680 m³). Per bespaarde m³ komt er 2,375 kWh stroom bij.</li><li><strong>All-electric:</strong> al je gas valt weg. Per bespaarde m³ komt er 3,3 kWh stroom bij en het vastrecht voor gas (€ ${VASTRECHT_GAS} per jaar) vervalt.</li><li><strong>Prijzen:</strong> gas € ${komma(GASPRIJS)} per m³ en stroom € ${komma(STROOMPRIJS)} per kWh, afgeleid uit de rekenvoorbeelden van Milieu Centraal.</li><li><strong>ISDE 2026:</strong> € 1.025 + € 225 per kW + € 200 bij A+++, minimaal € 500. Voor een tweede lucht-waterwarmtepomp geldt alleen € 225 per kW.</li></ul><p class="src">Bronnen: <a href="https://www.milieucentraal.nl/energie-besparen/duurzaam-verwarmen-en-koelen/hybride-warmtepomp/" rel="noopener">Milieu Centraal: hybride warmtepomp</a> · <a href="https://www.milieucentraal.nl/energie-besparen/duurzaam-verwarmen-en-koelen/volledige-warmtepomp/" rel="noopener">Milieu Centraal: volledige warmtepomp</a> · <a href="https://www.rvo.nl/subsidies-financiering/isde/isde-wat-wijzigt-er-2026" rel="noopener">RVO: ISDE 2026</a></p></section>
<p>Meer uitleg: <a href="/warmtepomp-terugverdientijd/">terugverdientijd van een warmtepomp</a> · <a href="/isde-subsidie-warmtepomp-2026/">ISDE-subsidie 2026</a> · <a href="/warmtepomp-keuzehulp/">welke warmtepomp past?</a></p>`,
};

export const gidsHub = {
  path: '/gidsen/', title: 'Gidsen over warmtepompen | WarmtepompenMatch', h1: 'Warmtepomp kiezen: alle gidsen', crumb: 'Gidsen', og: 'gidsen',
  description: 'Gidsen over de kosten van een warmtepomp, de terugverdientijd, de ISDE-subsidie van 2026, hybride of all-electric, geluid en of je huis geschikt is.',
  body: `<h1>Warmtepomp kiezen: alle gidsen</h1><div class="grid cards two">${guides.map((g) => `<a class="card" href="${g.path}"><h2 class="h3">${esc(g.h1)}</h2><p>${esc(g.description)}</p><span class="more">Lees de gids →</span></a>`).join('')}<a class="card" href="/terugverdientijd-berekenen/"><h2 class="h3">Rekenhulp: terugverdientijd berekenen</h2><p>${esc(calc.description)}</p><span class="more">Naar de rekenhulp →</span></a></div>${matchCta()}`,
};

// ---- Statisch ----
export const over = {
  path: '/over/', title: 'Over WarmtepompenMatch: wie we zijn en hoe we werken', h1: 'Over ons', crumb: 'Over ons', og: 'home',
  description: 'WarmtepompenMatch helpt huiseigenaren kiezen tussen hybride en all-electric en tussen merken. Hoe we gegevens controleren en hoe we onafhankelijk blijven.',
  schema: [{ '@context': 'https://schema.org', '@type': 'AboutPage', name: 'Over WarmtepompenMatch', about: ORG }],
  body: `<article class="prose"><h1>Over ons</h1><p class="lead">WarmtepompenMatch komt van het team achter BoekhoudMatch, VerduurzaamMatch en ShopMatch. We horen steeds dezelfde vragen: hybride of all-electric, welk merk, en wat kost het nu echt?</p>
<p>Veel informatie over warmtepompen komt van installateurs en merken die je hun eigen product willen verkopen. Wij zetten de merken naast elkaar met wat ze zelf op hun site zetten, en rekenen met de onafhankelijke cijfers van Milieu Centraal en RVO.</p>
<h2>Hoe we werken</h2><ul><li><strong>Alleen de bron.</strong> Elk checklistpunt komt van de site van het merk, elk bedrag van Milieu Centraal, RVO of het merk zelf, met link.</li><li><strong>Niets verzonnen.</strong> Staat iets niet op de site van het merk, dan staat er "niet vermeld". We plaatsen geen reviews of beoordelingen.</li><li><strong>Onafhankelijk.</strong> We installeren geen warmtepompen en verkopen niets.</li><li><strong>Partners tellen nooit mee</strong> in de score, de volgorde of het advies. Een partnerlink heeft altijd het label "partnerlink".</li></ul>
</article>${methodBox()}<article class="prose"><h2>Wat telt de checklist?</h2><ul>${GROEPEN.map((g) => `<li><strong>${esc(g.naam)}:</strong> ${g.punten.map((k) => esc(PUNTEN[k].lang[0].toLowerCase() + PUNTEN[k].lang.slice(1))).join(', ')}.</li>`).join('')}</ul><p>"Standaard minstens 5 jaar garantie" is ja als het merk dat zonder voorwaarden geeft, deels als het alleen met een voorwaarde kan (zoals registratie of inbedrijfname door het merk) en nee als de standaardgarantie korter is. Noemt een merk een punt niet op de eigen site, dan staat er "niet vermeld" en telt het als 0. Mist er iets? Mail ons, dan passen we het aan met bron.</p>
<p>Fout gezien? Mail naar <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>${LEADS_AAN ? `<p>Offertes vraag je aan via een offertepartner. ${SITE.name} is geen partij bij de offerte of de opdracht en ontvangt een vergoeding per aanvraag.</p>` : ''}</article>`,
};

export const privacy = {
  path: '/privacy/', title: 'Privacy en cookies | WarmtepompenMatch', h1: 'Privacy en cookies', crumb: 'Privacy', og: 'home',
  description: 'Hoe WarmtepompenMatch met je gegevens omgaat: geen account, je antwoorden blijven in je browser en statistieken alleen na jouw toestemming.',
  body: `<article class="prose"><h1>Privacy en cookies</h1>
<p>Vragen? Mail naar <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
<h2>Wie is verantwoordelijk?</h2><p>Verantwoordelijk voor de verwerking van persoonsgegevens op deze site: ${SITE.name}, <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
<h2>Welke gegevens?</h2><p>Je antwoorden in de keuzehulp en de rekenhulp blijven in je browser. We slaan ze niet op en sturen ze nergens heen. We vragen geen naam, e-mailadres of andere persoonsgegevens.</p>
${GA_ID ? `<h2 id="cookies">Cookies en statistieken</h2><p>We gebruiken geen advertentiecookies. Statistieken met Google Analytics zetten we alleen aan als je in de cookiemelding op "Accepteren" klikt. Zonder toestemming laden we Google Analytics niet en gaat er niets naar Google.</p>
<p>Geef je toestemming, dan plaatst Google Analytics cookies (zoals <code>_ga</code>) en meten we welke pagina's bezocht worden en op welke knoppen en links wordt geklikt. Google Analytics 4 slaat geen IP-adressen op. We gebruiken de gegevens alleen voor statistieken en bewaren ze maximaal 14 maanden. Google verwerkt de gegevens als verwerker; zie het <a href="https://policies.google.com/privacy" rel="noopener">privacybeleid van Google</a>.</p>
<p>Je keuze bewaren we 12 maanden in je browser (localStorage). Je kunt je toestemming altijd intrekken via <a href="/privacy/#cookies" data-consent-open>Cookie-instellingen</a> (ook onderaan elke pagina). Dan stoppen we Google Analytics en wissen we de <code>_ga</code>-cookies.</p>` : '<h2 id="cookies">Cookies en statistieken</h2><p>We plaatsen geen cookies: geen advertentiecookies en geen statistiekcookies. Zetten we later statistieken aan, dan vragen we eerst je toestemming in een cookiemelding en passen we deze pagina aan.</p>'}
<h2>Links naar merken</h2><p>Klik je door naar een merk, dan geldt de privacyverklaring van dat merk.</p>
${privacyOffertes()}
<h2>Hosting</h2><p>De site draait op GitHub Pages. GitHub verwerkt technische gegevens zoals je IP-adres om de site te leveren.</p>
<h2>Je rechten</h2><p>Je mag vragen welke gegevens we van je hebben en die laten verwijderen. Een klacht kun je indienen bij de Autoriteit Persoonsgegevens.</p></article>`,
};

export const notfound = {
  path: '/404.html', title: 'Pagina niet gevonden | WarmtepompenMatch', h1: 'Niet gevonden', noindex: true, og: 'home',
  description: 'Deze pagina bestaat niet.',
  body: `<div class="notfound"><h1>Deze pagina bestaat niet</h1><div class="actions"><a class="btn" href="/warmtepomp-keuzehulp/">Start de keuzehulp</a><a class="btn ghost" href="/merken/">Alle merken</a><a class="btn ghost" href="/">Homepage</a></div></div>`,
};
