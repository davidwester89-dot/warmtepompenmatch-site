// Screenshots mobiel (390) en desktop (1280) naar /workspace/artifacts/warmtepompenmatch/
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire('/home/box/.local/lib/node_modules/');
const { chromium } = require('playwright-core');
const base = process.argv[2] || 'http://localhost:8083';
const dir = '/workspace/artifacts/warmtepompenmatch'; mkdirSync(dir, { recursive: true });
const pages = [['home', '/'], ['keuzehulp', '/warmtepomp-keuzehulp/'], ['rekenhulp', '/terugverdientijd-berekenen/'], ['merken', '/merken/'], ['merk-quatt', '/merken/quatt/'], ['vergelijken', '/vergelijken/'], ['vs-quatt-remeha', '/vergelijken/quatt-vs-remeha/'], ['gids-isde-2026', '/isde-subsidie-warmtepomp-2026/'], ['gids-geluid', '/warmtepomp-geluid/']];
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
for (const [dev, w, h] of [['mobiel', 390, 844], ['desktop', 1280, 900]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dev === 'mobiel' ? 2 : 1, isMobile: dev === 'mobiel', hasTouch: dev === 'mobiel' });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  for (const [n, u] of pages) {
    await p.goto(base + u, { waitUntil: 'networkidle' });
    await p.screenshot({ path: `${dir}/${dev}-${n}.png`, fullPage: n !== 'home' ? false : true });
  }
  // Keuzehulp invullen tot het advies
  await p.goto(base + '/warmtepomp-keuzehulp/', { waitUntil: 'networkidle' });
  for (const [k, v] of [['woning', 'tussen'], ['bouwjaar', '1975'], ['isolatie', 'matig'], ['budget', '10'], ['gas', '1500'], ['voorkeur', 'weetniet']]) {
    await p.locator(`input[name="${k}"][value="${v}"]`).check({ force: true }); await p.waitForTimeout(250);
  }
  await p.waitForTimeout(400);
  const res = p.locator('#result'); await res.scrollIntoViewIfNeeded();
  console.log(dev, 'advies:', (await res.innerText()).slice(0, 160).replace(/\n/g, ' | '));
  await res.screenshot({ path: `${dir}/${dev}-keuzehulp-advies.png` });
  console.log(dev, 'JS-fouten:', errs.length ? errs : 'geen');
  await ctx.close();
}
await b.close();
