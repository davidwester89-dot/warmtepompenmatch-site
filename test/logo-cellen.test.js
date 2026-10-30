// Logo's van aanbieders in tabellen (Dave 30-10): lokaal, vaste maat, lazy, alt "<Merk> logo"; alleen beeld.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { maakLogoCellen } from '../src/lib/logo-cellen.mjs';

const DIST = 'dist';
const pages = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? pages(p) : p.endsWith('.html') ? [p] : []; });

test('logoCellen: alleen een cel met precies de naam krijgt een logo; tekst, links en rel blijven gelijk', () => {
  const t = maakLogoCellen([{ namen: ['Acme'], src: '/logos/acme.svg', merk: 'Acme' }]);
  const h = '<table><tr><th scope="row"><a href="https://x.test/" rel="sponsored nofollow noopener">Acme</a></th><td>Acme Pro</td><td>Acme</td></tr></table><p>Acme</p>';
  const u = t(h);
  assert.equal(u.match(/class="cel-logo"/g).length, 2);
  assert.ok(u.includes('<td>Acme Pro</td>') && u.includes('<p>Acme</p>'));
  assert.ok(u.includes('<a href="https://x.test/" rel="sponsored nofollow noopener">Acme</a>'));
  assert.equal(u.replace(/<span class="cel-logo"><img [^>]*><\/span>/g, ''), h);
  assert.equal(t(u), u, 'geen dubbel logo');
  assert.match(u, /<img src="\/logos\/acme.svg" alt="Acme logo" width="80" height="24" loading="lazy" decoding="async">/);
});

test('logoCellen productrijen: eerste cel "<merk> <product>" krijgt een logo, andere cellen niet', () => {
  const t = maakLogoCellen([{ namen: ['Acme'], src: '/logos/acme.svg', merk: 'Acme' }], { productrijen: true });
  const u = t('<table><tr><th scope="col">Acme Pro</th></tr><tr><th scope="row">Acme Pro 5</th><td>Acme Pro</td></tr></table>');
  assert.equal(u.match(/class="cel-logo"/g).length, 1);
  assert.ok(u.includes('<td>Acme Pro</td>') && u.includes('<th scope="col">Acme Pro</th>'));
});

test('logo\'s in de gebouwde site: alt "<Merk> logo", vaste maat, lazy, bestand bestaat; geen score-icoontjes', () => {
  let n = 0;
  for (const p of pages(DIST)) {
    const h = readFileSync(p, 'utf8');
    for (const [, tag] of h.matchAll(/<span class="cel-logo">(<img [^>]*>)<\/span>/g)) {
      n++;
      assert.match(tag, / alt="[^"]+ logo"/, p);
      assert.match(tag, / width="\d+" height="\d+"/, p);
      assert.match(tag, / loading="lazy"/, p);
      const src = tag.match(/ src="([^"]+)"/)[1].replace(/^\/[^/]*?(?=\/logos\/|\/brands\/)/, '');
      assert.ok(existsSync(join(DIST, src)), p + ' ' + src);
    }
    assert.doesNotMatch(h, /★|☆/, p);
  }
  assert.ok(n > 0, 'geen logo in tabellen gevonden');
});
