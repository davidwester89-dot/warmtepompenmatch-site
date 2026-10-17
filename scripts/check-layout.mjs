// Controle: geen horizontale overflow op 360/390/768/1280 en tapdoelen >= 44px (mobiel).
import { createRequire } from 'node:module';
const require = createRequire('/home/box/.local/lib/node_modules/');
const { chromium } = require('playwright-core');
const base = process.argv[2] || 'http://localhost:8083';
const fs = await import('node:fs');
const urls = fs.readFileSync('dist/urls.txt', 'utf8').trim().split('\n').map(u => new URL(u).pathname);
const exe = process.env.CHROME || '/usr/bin/google-chrome';
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
let fail = 0;
for (const w of [360, 390, 768, 1280]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, isMobile: w < 768, hasTouch: w < 768 });
  const page = await ctx.newPage();
  for (const p of urls) {
    await page.goto(base + p, { waitUntil: 'load' });
    const r = await page.evaluate((w) => {
      const out = { over: document.documentElement.scrollWidth - window.innerWidth, wide: [], small: [] };
      for (const el of document.querySelectorAll('body *')) {
        if (el.closest('details:not([open])') && el.tagName !== 'SUMMARY' && !el.closest('summary')) continue;
        const b = el.getBoundingClientRect();
        if (b.width && b.left < window.innerWidth && b.right > window.innerWidth + 1 && !el.closest('.tablewrap,.table-wrap,[data-scroll],.scroll-x')) {
          const cs = getComputedStyle(el); if (cs.position !== 'fixed') out.wide.push(el.tagName + '.' + el.className + ' ' + Math.round(b.right));
        }
      }
      if (w < 768) for (const el of document.querySelectorAll('a,button,input,select,summary,label[for]')) {
        if (el.closest('details:not([open])') && el.tagName !== 'SUMMARY') continue;
        const b = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        if (!b.width || cs.visibility === 'hidden' || b.right <= 0 || b.bottom <= 0 || b.left >= window.innerWidth) continue;
        if (el.tagName === 'LABEL') { const c = el.querySelector('select,input') || document.getElementById(el.htmlFor); if (c && c.getBoundingClientRect().height >= 44) continue; }
        const inline = el.tagName === 'A' && el.closest('p,li,td,figcaption,dd,small') && cs.display === 'inline';
        if (inline) continue;
        if (b.height < 44 && !(el.type === 'radio' || el.type === 'checkbox')) out.small.push(el.tagName + ' "' + (el.textContent || el.name || '').trim().slice(0, 30) + '" ' + Math.round(b.width) + 'x' + Math.round(b.height));
      }
      out.wide = out.wide.slice(0, 5); out.small = [...new Set(out.small)].slice(0, 8); return out;
    }, w);
    if (r.over > 0 || r.wide.length || r.small.length) { fail++; console.log(w, p, JSON.stringify(r)); }
  }
  await ctx.close();
}
await browser.close();
console.log(fail ? `FOUT: ${fail} pagina/breedte-combinaties` : `OK: ${urls.length} pagina's x 4 breedtes`);
process.exit(fail ? 1 : 0);
