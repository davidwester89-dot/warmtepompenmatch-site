import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { buildLive, htmlFiles, read, DOMAIN } from './helpers.js';
const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

test('on-page SEO: unieke titels, meta 70-155, één H1, canonical = eigen URL, og, schema', () => {
  buildLive();
  const files = htmlFiles().filter((f) => !f.endsWith('404.html'));
  const sm = read('dist/sitemap.xml');
  const titles = new Map(); const descs = new Map();
  for (const f of files) {
    const s = read(f);
    const url = DOMAIN + '/' + f.replace(/^dist\//, '').replace(/index\.html$/, '');
    const title = unesc(s.match(/<title>(.*?)<\/title>/)[1]);
    assert.ok(!titles.has(title), `${f}: dubbele titel met ${titles.get(title)}`); titles.set(title, f);
    const desc = unesc(s.match(/<meta name="description" content="([^"]*)"/)[1]);
    assert.ok(desc.length >= 70 && desc.length <= 155, `${f}: meta description ${desc.length} tekens`);
    assert.ok(!descs.has(desc), `${f}: dubbele description`); descs.set(desc, f);
    assert.equal((s.match(/<h1[\s>]/g) || []).length, 1, `${f}: precies één H1`);
    assert.match(s, /<html lang="nl">/);
    assert.ok(s.includes(`<link rel="canonical" href="${url}">`), `${f}: canonical`);
    assert.ok(s.includes(`<meta property="og:url" content="${url}">`), `${f}: og:url`);
    const og = s.match(/<meta property="og:image" content="https:\/\/warmtepompenmatch.nl(\/[^"]+)"/)[1];
    assert.ok(existsSync(join('dist', og)), `${f}: og:image ${og} bestaat`);
    assert.ok(sm.includes(`<loc>${url}</loc>`), `${f}: staat in sitemap`);
    const ld = [...s.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const types = ld.map((x) => x['@type'] || 'graph');
    if (url !== DOMAIN + '/') assert.ok(types.includes('BreadcrumbList'), `${f}: BreadcrumbList`);
    for (const a of ld.filter((x) => x['@type'] === 'Article')) { assert.equal(a.author.name, 'Redactie WarmtepompenMatch', `${f}: auteur`); assert.equal(a.author['@type'], 'Organization'); }
    const faq = ld.find((x) => x['@type'] === 'FAQPage');
    if (faq) assert.ok((s.match(/<details>/g) || []).length >= faq.mainEntity.length, `${f}: FAQPage zonder zichtbare FAQ`);
    if (/\/(vergelijken|merken)\/.+|kosten|terugverdientijd\/|isde|hybride|geluid|geschikt/.test(url)) {
      const main = s.split('<main')[1].split('</main>')[0];
      assert.match(main, /href="\/(warmtepomp-keuzehulp|vergelijken|terugverdientijd-berekenen)\//, `${f}: link naar keuzehulp, vergelijking of rekenhulp`);
    }
    // Bron = naam + link, altijd https.
    for (const m of s.matchAll(/<p class="src">Bronnen: (.*?)<\/p>/g)) for (const h of m[1].matchAll(/href="([^"]+)"/g)) assert.match(h[1], /^https:\/\//);
  }
  const home = read('dist/index.html');
  assert.match(home, /"@type":"Organization"/); assert.match(home, /"@type":"WebSite"/);
  assert.match(home, /<link rel="preload" href="\/fonts\/inter-400.woff2"/);
});
