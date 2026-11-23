// /privacy/ + home-FAQ bij partnerlinks Huisassist/Daisycon (24-11). Geen TradeTracker/Groenpand op deze tak.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { PRIVACY_UPDATED, netwerkenVan } from '../src/privacy-avg.mjs';
import { HUISASSIST_URL, PARTNERLINKS } from '../src/lib/partnerlinks.js';

execSync('node build.mjs', { env: { ...process.env, BASE: '', PREVIEW: '' }, stdio: 'ignore' });
const lees = (p) => readFileSync(`dist${p === '/' ? '/index.html' : p + 'index.html'}`, 'utf8');

test('privacy-partners: lastmod 2026-11-24, alleen Daisycon, geen verzonnen cookies', () => {
  assert.equal(PRIVACY_UPDATED, '2026-11-24');
  assert.equal(Object.keys(PARTNERLINKS).length, 0);
  const nw = netwerkenVan({ huisassist: HUISASSIST_URL });
  assert.deepEqual(nw.map((n) => n.naam), ['Daisycon']);
  const h = lees('/privacy/');
  assert.match(h, /Laatst bijgewerkt <time datetime="2026-11-24">/);
  assert.match(h, /Sommige knoppen zijn partnerlinks/);
  assert.match(h, /<span class="ecta-label">Partnerlink<\/span>/);
  assert.match(h, /rel="sponsored nofollow noopener"/);
  assert.match(h, /dan kunnen wij daardoor een vergoeding krijgen/);
  assert.match(h, /Dat kost jou niets extra/);
  assert.match(h, /via het affiliatenetwerk Daisycon/);
  assert.match(h, /Daisycon/);
  assert.match(h, /href="https:\/\/daisycon.com\/en\/legal-information\/privacy-policy\/"/);
  assert.match(h, /glp8\.net/);
  assert.match(h, /Huisassist via Daisycon/);
  assert.match(h, /zet zelf geen cookies bij die klik/);
  assert.doesNotMatch(h, /TradeTracker/);
  assert.doesNotMatch(h, /Groenpand/);
  assert.doesNotMatch(h, /affiliatenetwerken/);
  assert.doesNotMatch(h, /analytics\.groenpand\.nl/);
  assert.doesNotMatch(h, /Op dit moment staan er geen partnerlinks/);
  assert.doesNotMatch(h, /Impact/);
  const sm = readFileSync('dist/sitemap.xml', 'utf8');
  assert.match(sm, /<loc>https:\/\/warmtepompenmatch\.nl\/privacy\/<\/loc><lastmod>2026-11-24<\/lastmod>/);
  assert.match(sm, /<loc>https:\/\/warmtepompenmatch\.nl\/<\/loc><lastmod>2026-11-24<\/lastmod>/);
});

test('home-FAQ: verdienen via partnerlinks, datumlift 24-11', () => {
  const h = lees('/');
  assert.match(h, /Verdient WarmtepompenMatch aan de merken\?/);
  assert.match(h, /Ja, via partnerlinks/);
  assert.doesNotMatch(h, /Nu niet\. Komt er later een partnerlink/);
  assert.match(h, /bijgewerkt op <time datetime="2026-11-24">/);
  assert.match(h, /"name":"Verdient WarmtepompenMatch aan de merken\?"/);
  assert.match(h, /Ja, via partnerlinks/);
});
