// Aanvullende AVG-blokken voor /privacy/ (audit beveiliging & juridisch 20-10-2026, punt A.6 / F1).
// Alleen vaststaande feiten: cookielooptijd uit consent.js (cookie_expires), GA4-bewaartermijn uit de property-instelling.
// "Wie is verantwoordelijk?" staat hier bewust NIET in: dat volgt na het KvK-besluit.
export const PRIVACY_UPDATED = '2026-10-21';

const NETWERKEN = [
  { re: /(^|\.)pxf\.io$|impact\.com$/, naam: 'Impact', privacy: 'https://impact.com/privacy-policy/' },
  { re: /(^|\.)jf79\.net$|ds1\.nl$|daisycon\./, naam: 'Daisycon', privacy: 'https://daisycon.com/en/legal-information/privacy-policy/' },
];

/** Privacybeleid van de netwerken (geen affiliate-links; tests laten deze URL's toe). */
export const NETWERK_PRIVACY = NETWERKEN.map((n) => n.privacy);

/** Welke affiliatenetwerken zitten achter de huidige partnerlinks? Onbekend netwerk = bouwfout, zodat de tekst nooit achterloopt. */
export function netwerkenVan(partnerlinks) {
  const uit = [];
  for (const url of Object.values(partnerlinks || {})) {
    const host = new URL(url).hostname;
    const n = NETWERKEN.find((x) => x.re.test(host));
    if (!n) throw new Error(`Onbekend affiliatenetwerk voor ${host}: vul privacy-avg.mjs aan`);
    if (!uit.includes(n)) uit.push(n);
  }
  return uit;
}

/** Cookietabel. storageKey = localStorage-sleutel van de cookiekeuze (consent.js). */
export function cookieTabel(gaId, storageKey) {
  return `<div class="tbl table-wrap" tabindex="0" role="region" aria-label="Tabel: cookies en lokale opslag"><table><thead><tr><th scope="col">Naam</th><th scope="col">Van</th><th scope="col">Waarvoor</th><th scope="col">Looptijd</th></tr></thead><tbody>
<tr><td><code>_ga</code></td><td>Google Analytics, alleen na toestemming</td><td>Herkent je browser met een willekeurig nummer, zodat we bezoekers kunnen tellen</td><td>365 dagen, verlengd bij elk bezoek</td></tr>
<tr><td><code>_ga_${gaId.replace(/^G-/, '')}</code></td><td>Google Analytics, alleen na toestemming</td><td>Houdt je bezoek (sessie) bij</td><td>365 dagen, verlengd bij elk bezoek</td></tr>
<tr><td><code>${storageKey}</code> (lokale opslag, geen cookie)</td><td>Deze site</td><td>Onthoudt of je statistieken hebt geaccepteerd of geweigerd</td><td>12 maanden</td></tr>
</tbody></table></div>`;
}

/** Zin over het netwerkcookie na een klik op een partnerlink. */
export function partnerNetwerk(siteNaam, partnerlinks) {
  const nw = netwerkenVan(partnerlinks);
  if (!nw.length) return `<p>Op dit moment staan er geen partnerlinks op deze site. Komen die er, dan worden ze bij de knoppen vermeld en noemen we hier het affiliatenetwerk dat bij een klik een cookie plaatst.</p>`;
  const lijst = nw.map((n) => `<a href="${n.privacy}" rel="noopener">${n.naam}</a>`).join(' en ');
  return `<p>Partnerlinks worden bij de knoppen vermeld. Klik je erop, dan ga je via een affiliatenetwerk (${nw.map((n) => n.naam).join(', ')}) naar de aanbieder. Dat netwerk plaatst op zijn eigen domein een cookie of klik-ID, om vast te leggen dat je via ${siteNaam} kwam. Sluit je iets af, dan kunnen wij daardoor een vergoeding krijgen. Het netwerk is zelf verantwoordelijk voor die gegevens; zie het privacybeleid van ${lijst}.</p>`;
}

export function grondslag() {
  return `<h2>Op welke grond?</h2><ul>
<li><strong>Statistieken (Google Analytics):</strong> alleen met je toestemming (artikel 6 lid 1 sub a AVG). Ook voor het plaatsen van de cookies vragen we toestemming (artikel 11.7a Telecommunicatiewet).</li>
<li><strong>E-mail aan ons:</strong> we gebruiken je bericht en e-mailadres om je vraag te beantwoorden. Dat is ons gerechtvaardigd belang (artikel 6 lid 1 sub f AVG).</li>
<li><strong>Hosting:</strong> technische gegevens zoals je IP-adres zijn nodig om de site veilig te leveren. Ook dat is gerechtvaardigd belang (artikel 6 lid 1 sub f AVG).</li></ul>`;
}

export function doorgifte() {
  return `<h2>Gegevens buiten de EU</h2><p>Google (Google Analytics) en GitHub (hosting) kunnen gegevens verwerken in de Verenigde Staten. Google LLC en GitHub, Inc. doen mee aan het EU-US Data Privacy Framework. De Europese Commissie heeft besloten dat gegevens bij deelnemende bedrijven voldoende beschermd zijn (<a href="https://eur-lex.europa.eu/eli/dec_impl/2023/1795/oj" rel="noopener">besluit (EU) 2023/1795</a>). Je kunt de deelnemers opzoeken in de <a href="https://www.dataprivacyframework.gov/list" rel="noopener">DPF-lijst</a>.</p>`;
}

/** eventMaanden: GA4-instelling "Bewaring van gebeurtenisgegevens" van deze property. */
export function bewaartermijnen(eventMaanden) {
  return `<h2 id="bewaren">Bewaartermijnen</h2><ul>
<li><strong>Google Analytics:</strong> gegevens over bezoeken en klikken bewaart Google ${eventMaanden} maanden, gegevens op gebruikersniveau maximaal 14 maanden. Daarna worden ze automatisch verwijderd. Totalen in rapporten, zonder gegevens per bezoeker, blijven bestaan.</li>
<li><strong>Cookies:</strong> zie de tabel hierboven.</li>
<li><strong>E-mail:</strong> zolang nodig is om je vraag te beantwoorden.</li></ul>`;
}

export function rechten(email) {
  return `<h2>Je rechten</h2><p>Je hebt recht op inzage, correctie, verwijdering, beperking van de verwerking, bezwaar en overdraagbaarheid van je gegevens. Gaf je toestemming voor statistieken, dan kun je die altijd intrekken via <a href="/privacy/#cookies" data-consent-open>Cookie-instellingen</a>. Dat geldt vanaf dat moment.</p>
<p>We hebben zelf weinig gegevens die naar jou te herleiden zijn: statistieken hangen aan een willekeurig nummer in je browser, niet aan je naam. Een verzoek stuur je naar <a href="mailto:${email}">${email}</a>. We reageren binnen een maand. Een klacht kun je indienen bij de Autoriteit Persoonsgegevens.</p>`;
}
