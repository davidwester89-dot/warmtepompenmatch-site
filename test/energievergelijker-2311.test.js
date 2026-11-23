// Daisycon Energievergelijker NL op /energiecontract-warmtepomp/ (mediaId 445224).
// Script pas na eigen toestemming (niet via wm-consent). Label Partnerlink. Ranking ongewijzigd.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { LABEL, REL } from '../src/e-cta.mjs';
import { ranglijst } from '../src/lib/checklist.js';
import { PARTNERLINKS } from '../src/lib/partnerlinks.js';
import { ECTA } from '../src/e-cta-1.config.mjs';
import {
  SCRIPT_SRC, MEDIA_ID, BUTTON_TEXT, CONFIG_JSON, ENERGY_CONSENT_KEY,
  shouldLoadWidget, saveEnergyConsent, readEnergyConsent, loadWidgetScript, CSP,
} from '../src/lib/energievergelijker.js';
import { GIDSEN_UPD, ENERGIE_UPD } from '../src/pages.mjs';
import { revisieDatum } from './nuchter-datums-helper.mjs';

execSync('node build.mjs', { env: { ...process.env, BASE: '', PREVIEW: '' }, stdio: 'ignore' });
const lees = (p) => readFileSync(`dist${p === '/' ? '/index.html' : p + 'index.html'}`, 'utf8');
const sm = () => readFileSync('dist/sitemap.xml', 'utf8');

test('energievergelijker: consent-gating los van GA; script pas na granted', () => {
  assert.equal(ENERGY_CONSENT_KEY, 'wm-energy-tool');
  assert.notEqual(ENERGY_CONSENT_KEY, 'wm-consent');
  const store = { data: {}, getItem(k) { return this.data[k] ?? null; }, setItem(k, v) { this.data[k] = v; } };
  assert.equal(shouldLoadWidget(store), false);
  assert.equal(readEnergyConsent(store), null);
  // Een GA-toestemming mag de widget niet laden.
  store.setItem('wm-consent', JSON.stringify({ v: 1, choice: 'granted', date: new Date().toISOString() }));
  assert.equal(shouldLoadWidget(store), false);
  saveEnergyConsent(store, 'granted');
  assert.equal(shouldLoadWidget(store), true);
  assert.equal(JSON.parse(store.data[ENERGY_CONSENT_KEY]).choice, 'granted');

  const doc = {
    head: { kids: [], append(n) { this.kids.push(n); } },
    querySelector() { return this.head.kids[0] || null; },
    createElement() { return { dataset: {}, async: false, src: '' }; },
  };
  assert.equal(loadWidgetScript(doc), true);
  assert.equal(doc.head.kids[0].src, SCRIPT_SRC);
  assert.equal(doc.head.kids[0].async, true);
  assert.equal(doc.head.kids[0].dataset.energyScript, '1');
  assert.equal(loadWidgetScript(doc), false, 'tweede keer niet opnieuw laden');
});

test('energievergelijker: pagina heeft label, exacte embedconfig, geen script in de HTML', () => {
  assert.equal(LABEL, 'Partnerlink');
  assert.equal(REL, 'sponsored nofollow noopener');
  assert.equal(MEDIA_ID, 445224);
  assert.equal(BUTTON_TEXT, 'Bekijk');
  assert.equal(CONFIG_JSON, '{"mediaId":445224,"buttonText":"Bekijk"}');
  assert.equal(SCRIPT_SRC, 'https://energie.whitelabeled.nl/dist-v2/main.js');

  const h = lees('/energiecontract-warmtepomp/');
  assert.match(h, /<h1>Energiecontract bij een warmtepomp<\/h1>/);
  assert.match(h, /<span class="ecta-label">Partnerlink<\/span>/);
  assert.match(h, /data-energy-tool/);
  assert.match(h, /data-energy-accept/);
  assert.match(h, /Toon de energievergelijker/);
  assert.match(h, /class="dc-tool dc-energy-tool"/);
  assert.match(h, /class="dc-tool dc-energy-tool"[^>]*style="min-height:28rem"/);
  assert.match(h, /<noscript><p>De energievergelijker werkt alleen met JavaScript\./);
  assert.doesNotMatch(h, /<noscript>[\s\S]*energie\.whitelabeled\.nl[\s\S]*<\/noscript>/);
  assert.match(h, /data-config='\{"mediaId":445224,"buttonText":"Bekijk"\}'/);
  assert.match(h, /data-vendor="daisycon-energievergelijker"/);
  assert.match(h, /href="\/privacy\/#energievergelijker"/);
  assert.doesNotMatch(h, /<script[^>]+src="https:\/\/energie\.whitelabeled\.nl/);
  assert.match(h, /<script type="module" src="\/js\/energievergelijker\.js">/);
  assert.match(h, /script-src[^\"]*energie\.whitelabeled\.nl/);
  assert.match(h, /connect-src[^\"]*api-energie\.whitelabeled\.nl/);
  assert.doesNotMatch(h, /bespaar €/i);
  assert.doesNotMatch(h, /het goedkoopste contract/i);
  assert.ok(readFileSync('dist/js/lib/energievergelijker.js', 'utf8').includes(SCRIPT_SRC));
  assert.equal(Object.keys(PARTNERLINKS).length, 0);
  assert.equal(ECTA.pages['/energiecontract-warmtepomp/'].partners.length, 0);
});

test('energievergelijker: andere pagina\'s laden het script niet en krijgen geen extra CSP', () => {
  const home = lees('/');
  const merken = lees('/merken/');
  for (const [n, h] of [['home', home], ['merken', merken]]) {
    assert.doesNotMatch(h, /energievergelijker\.js/, n);
    assert.doesNotMatch(h, /data-energy-tool/, n);
    assert.doesNotMatch(h, /energie\.whitelabeled\.nl/, n);
    assert.doesNotMatch(h, /cdn\.amplitude\.com/, n);
  }
  // Contextlinks vanuit drie gidsen, in lopende tekst (niet alleen in een kop).
  for (const p of ['/warmtepomp-kosten/', '/warmtepomp-terugverdientijd/', '/hybride-warmtepomp-kosten/']) {
    const h = lees(p);
    assert.match(h, /<p[^>]*>[\s\S]*?<a href="\/energiecontract-warmtepomp\/">/, p);
    for (const kop of h.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/g)) {
      assert.doesNotMatch(kop[1], /energiecontract-warmtepomp/, p + ' link in kop');
    }
  }
});

test('energievergelijker: datums 2026-11-26 alleen op gewijzigde pagina\'s; sitemap en hub', () => {
  assert.equal(ENERGIE_UPD, '2026-11-26');
  assert.equal(GIDSEN_UPD, '2026-11-26');
  const xml = sm();
  const paden = ['/energiecontract-warmtepomp/', '/warmtepomp-kosten/', '/warmtepomp-terugverdientijd/', '/hybride-warmtepomp-kosten/', '/gidsen/'];
  for (const p of paden) {
    const d = revisieDatum(p, ENERGIE_UPD);
    assert.equal(d, '2026-11-26', p);
    assert.match(xml, new RegExp(`<loc>https://warmtepompenmatch\\.nl${p.replaceAll('/', '\\/')}<\\/loc><lastmod>2026-11-26<\\/lastmod>`), p);
    const h = lees(p);
    assert.match(h, /Laatst bijgewerkt <time datetime="2026-11-26">/, p);
    if (p === '/energiecontract-warmtepomp/') {
      assert.match(h, /"datePublished":"2026-11-26"/);
      assert.match(h, /"dateModified":"2026-11-26"/);
    } else if (p !== '/gidsen/') {
      assert.match(h, /"dateModified":"2026-11-26"/);
      assert.doesNotMatch(h, /"datePublished":"2026-11-26"/, p);
    }
  }
  // Geen meelift van een willekeurige ongewijzigde gids.
  assert.match(xml, /<loc>https:\/\/warmtepompenmatch\.nl\/warmtepomp-geluid\/<\/loc><lastmod>2026-11-17<\/lastmod>/);
  assert.match(xml, /<loc>https:\/\/warmtepompenmatch\.nl\/isde-subsidie-warmtepomp-2026\/<\/loc><lastmod>2026-10-20<\/lastmod>/);
});

test('energievergelijker: ranglijst en top-3 onbetaalde merken ongewijzigd', () => {
  assert.deepEqual(ranglijst(), ['daikin', 'nefitbosch', 'vaillant', 'mitsubishi', 'itho', 'panasonic', 'quatt', 'remeha']);
  const hub = lees('/merken/');
  const volgorde = [...hub.matchAll(/<a href="\/merken\/([^"]+)\/">/g)].map((m) => m[1]);
  // De kaarten op /merken/ staan in ranglijst-volgorde; eerste drie onbetaald blijven Daikin, Nefit Bosch, Vaillant.
  const kaarten = [...hub.matchAll(/<li class="pcard" data-id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(kaarten, ranglijst());
  assert.deepEqual(kaarten.slice(0, 3), ['daikin', 'nefitbosch', 'vaillant']);
  assert.doesNotMatch(hub, /energie\.whitelabeled\.nl|dc-energy-tool|data-energy-tool/);
  assert.doesNotMatch(lees('/warmtepomp-keuzehulp/'), /dc-energy-tool|data-energy-tool/);
});

test('energievergelijker: /privacy/ noemt derde-partijscript, consent-gating en Daisycon; lastmod blijft 26-11', () => {
  const h = lees('/privacy/');
  assert.match(h, /<h2 id="energievergelijker">Energievergelijker \(Daisycon\)<\/h2>/);
  assert.match(h, /energie\.whitelabeled\.nl/);
  assert.match(h, /cdn\.amplitude\.com/);
  assert.match(h, /api-energie\.whitelabeled\.nl/);
  assert.match(h, /pas nadat je op die pagina kiest/);
  assert.match(h, /toestemming voor statistieken[\s\S]*zet de vergelijker niet aan/);
  assert.match(h, /<code>wm-energy-tool<\/code>/);
  assert.match(h, /href="https:\/\/daisycon.com\/en\/legal-information\/privacy-policy\/"/);
  assert.match(h, /Over de namen en looptijden van die cookies zijn ons geen bevestigde termijnen bekend/);
  assert.doesNotMatch(h, /__tdat|amp_cookie|_lb-node/); // geen onbevestigde cookienaam
  assert.match(h, /Laatst bijgewerkt <time datetime="2026-11-26">/);
  assert.match(sm(), /<loc>https:\/\/warmtepompenmatch\.nl\/privacy\/<\/loc><lastmod>2026-11-26<\/lastmod>/);
  assert.match(h, /Energievergelijker \(Daisycon\):<\/strong> alleen met je toestemming op die pagina/);
});
