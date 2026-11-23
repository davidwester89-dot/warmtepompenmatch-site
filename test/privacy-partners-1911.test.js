// /privacy/ + home-FAQ bij partnerlinks Groenpand/TradeTracker en Huisassist/Daisycon.
// Privacy-datumlift 26-11 (TradeTracker erbij). Home-FAQ was al 24-11 en krijgt geen nieuwe bodywijziging.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { PRIVACY_UPDATED, netwerkenVan } from '../src/privacy-avg.mjs';
import { GROENPAND_TT_URL, HUISASSIST_URL, PARTNERLINKS } from '../src/lib/partnerlinks.js';

execSync('node build.mjs', { env: { ...process.env, BASE: '', PREVIEW: '' }, stdio: 'ignore' });
const lees = (p) => readFileSync(`dist${p === '/' ? '/index.html' : p + 'index.html'}`, 'utf8');

test('privacy-partners: lastmod 2026-11-26, TradeTracker en Daisycon, geen verzonnen cookies', () => {
  assert.equal(PRIVACY_UPDATED, '2026-11-26');
  assert.equal(Object.keys(PARTNERLINKS).length, 0);
  const nw = netwerkenVan({ groenpand: GROENPAND_TT_URL, huisassist: HUISASSIST_URL });
  assert.deepEqual(nw.map((n) => n.naam), ['TradeTracker', 'Daisycon']);
  const h = lees('/privacy/');
  assert.match(h, /Laatst bijgewerkt <time datetime="2026-11-26">/);
  assert.match(h, /Sommige knoppen zijn partnerlinks/);
  assert.match(h, /<span class="ecta-label">Partnerlink<\/span>/);
  assert.match(h, /rel="sponsored nofollow noopener"/);
  assert.match(h, /dan kunnen wij daardoor een vergoeding krijgen/);
  assert.match(h, /Dat kost jou niets extra/);
  assert.match(h, /TradeTracker/);
  assert.match(h, /Daisycon/);
  assert.match(h, /href="https:\/\/tradetracker.com\/nl\/privacy-policy\/"/);
  assert.match(h, /href="https:\/\/daisycon.com\/en\/legal-information\/privacy-policy\/"/);
  assert.match(h, /analytics\.groenpand\.nl/);
  assert.match(h, /glp8\.net/);
  assert.match(h, /zet zelf geen cookies bij die klik/);
  assert.doesNotMatch(h, /__tdat40779/); // geen onbevestigde cookienaam
  assert.doesNotMatch(h, /Op dit moment staan er geen partnerlinks/);
  assert.doesNotMatch(h, /Impact/);
  const sm = readFileSync('dist/sitemap.xml', 'utf8');
  assert.match(sm, /<loc>https:\/\/warmtepompenmatch\.nl\/privacy\/<\/loc><lastmod>2026-11-26<\/lastmod>/);
  assert.match(sm, /<loc>https:\/\/warmtepompenmatch\.nl\/<\/loc><lastmod>2026-11-24<\/lastmod>/);
});

test('home-FAQ: verdienen via partnerlinks, datum blijft 24-11 (geen nieuwe bodywijziging)', () => {
  const h = lees('/');
  assert.match(h, /Verdient WarmtepompenMatch aan de merken\?/);
  assert.match(h, /Ja, via partnerlinks/);
  assert.doesNotMatch(h, /Nu niet\. Komt er later een partnerlink/);
  assert.match(h, /bijgewerkt op <time datetime="2026-11-24">/);
  assert.match(h, /"name":"Verdient WarmtepompenMatch aan de merken\?"/);
  assert.match(h, /Ja, via partnerlinks/);
});
