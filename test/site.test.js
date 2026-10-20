import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { buildLive, buildPreview, htmlFiles, read, DOMAIN } from './helpers.js';
import { IDS, MERKEN } from '../src/lib/merken.js';
import { PARTNERLINKS } from '../src/lib/partnerlinks.js';
import { ranglijst, score } from '../src/lib/checklist.js';
import { loadPosts } from '../src/blog.mjs';

const VERBODEN = [/Dave/i, /Wester/i, /batterijmatch/i, /goodfellas/i, /reddit/i, /geraadpleegd op/i, /check altijd/i, /controleer altijd/i, /kan veranderen/i, /dit is geen advies/i, /shopmatch-site/i, /e08923fead07e26/];
const NEP = [/★/, /aggregateRating/, /reviewCount/, /ratingValue/, /sterren/i, /klantbeoordeling/i, /AI-gegenereerd/i, /gemaakt met AI/i, /\bAI-disclaimer/i, /trustpilot/i];

test('build (productie): pagina’s, sitemap, robots, IndexNow, CNAME, huisregels', () => {
  buildLive();
  const html = htmlFiles();
  assert.equal(html.length, 27 + loadPosts().length); // 26 + blogindex + gepubliceerde blogposts (datum <= vandaag)
  const sm = read('dist/sitemap.xml');
  assert.equal((sm.match(/<loc>/g) || []).length, html.length - 1);
  assert.match(read('dist/robots.txt'), /Sitemap: https:\/\/warmtepompenmatch.nl\/sitemap.xml/);
  assert.equal(read('dist/CNAME').trim(), 'warmtepompenmatch.nl');
  const key = readdirSync('dist').find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  assert.ok(key && read(join('dist', key)) === key.replace('.txt', ''), 'IndexNow-sleutelbestand');
  assert.equal(read('dist/urls.txt').trim().split('\n').length, html.length - 1);
  for (const f of html) {
    const s = read(f);
    for (const r of [...VERBODEN, ...NEP]) assert.ok(!r.test(s), `${f} bevat ${r}`);
    if (!f.endsWith('404.html')) { assert.match(s, /<link rel="canonical" href="https:\/\/warmtepompenmatch.nl\//); assert.ok(!s.includes('noindex'), f); }
    const title = s.match(/<title>(.*?)<\/title>/)[1]; assert.ok(title.length <= 60, `${f}: titel te lang (${title.length})`);
    assert.match(s, /Ook van ons/); assert.match(s, /https:\/\/thuisaccumatch.nl\//);
    const net = s.slice(s.indexOf('<div class="net">'), s.indexOf('<p class="fine">'));
    assert.deepEqual([...net.matchAll(/href="([^"]+)"/g)].map((m) => m[1]), ['https://boekhoudmatch.nl/', 'https://verduurzaammatch.nl/', 'https://shopmatch.nl/', 'https://thuisaccumatch.nl/', 'https://kassamatch.nl/'], `${f}: netwerkfooter`);
    for (const m of s.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)) JSON.parse(m[1]);
    for (const m of s.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
      const p = m[1]; const t = p.endsWith('/') ? join('dist', p, 'index.html') : join('dist', p);
      assert.ok(existsSync(t), `${f}: kapotte link ${p}`);
    }
    for (const m of s.matchAll(/<a [^>]*data-partner-slot="([^"]+)"[^>]*>/g)) {
      const href = m[0].match(/href="([^"]+)"/)[1];
      assert.equal(href, MERKEN[m[1]].url, `${f}: ${m[1]}`); assert.match(m[0], /rel="noopener"/);
    }
    assert.ok(!/class="partner"/.test(s), `${f}: partnerlabel zonder goedgekeurde partner`);
    assert.ok(!/rel="[^"]*sponsored/.test(s), `${f}: sponsored link zonder goedgekeurde partner`);
    if (/<article/.test(s) && /class="src">Door/.test(s)) assert.match(s, /Door Redactie WarmtepompenMatch/);
    // Logo's: lokaal, vaste maat, alt = merknaam.
    for (const m of s.matchAll(/<img class="plogo plogo-(sm|md|lg)[^"]*" src="\/logos\/([a-z]+)\.svg" alt="([^"]+)" width="(\d+)" height="(\d+)"/g)) {
      assert.equal(m[3], MERKEN[m[2]].naam);
      assert.deepEqual([m[4], m[5]], { sm: ['100', '30'], md: ['120', '36'], lg: ['160', '48'] }[m[1]]);
    }
    assert.ok(!/<img(?![^>]*\balt=)/.test(s), `${f}: img zonder alt`);
  }
  for (const id of IDS) assert.ok(existsSync(`dist/logos/${id}.svg`), `logo ${id}`);
});

test('build: componenten, vergelijking in vaste volgorde, keuzehulp en rekenhulp', () => {
  buildLive();
  const css = read('src/assets/css/style.css');
  assert.match(css, /--brand:#2f7a3a/); assert.match(css, /font-family:Inter/);
  assert.ok(!/#b44d22|#0e6b63|#4b3fc4/i.test(css), 'geen BM-, VM- of SM-accent');
  const v = read('dist/vergelijken/index.html');
  const rows = [...v.matchAll(/<tr data-id="(\w+)" data-naam="[^"]+" data-score="([\d.]+)"/g)];
  assert.deepEqual(rows.map((r) => r[1]), ranglijst());
  for (const [, id, sc] of rows) assert.equal(Number(sc), score(id).totaal);
  const h = read('dist/index.html');
  for (const k of ['class="hero-q"', 'class="trustbar"', 'class="logobar"', 'method-band']) assert.ok(h.includes(k), k);
  assert.equal((h.match(/class="logo-tile"/g) || []).length, 8);
  const q = read('dist/warmtepomp-keuzehulp/index.html');
  assert.match(q, /id="result"/); assert.match(q, /Zo werkt de keuzehulp/); assert.equal((q.match(/<fieldset class="q">/g) || []).length, 6);
  const c = read('dist/terugverdientijd-berekenen/index.html');
  assert.match(c, /id="r-jaren"/); assert.match(c, /src="\/js\/rekenhulp.js"/);
  for (const id of IDS) assert.match(read(`dist/merken/${MERKEN[id].slug}/index.html`), /Checklist: wat biedt/);
  const isde = read('dist/isde-subsidie-warmtepomp-2026/index.html');
  for (const t of ['€ 1.025', '€ 225', '€ 200', '€ 2.125', '24 maanden', '1 januari 2019', '€ 120 per kW', '31 december 2026']) assert.ok(isde.includes(t), `ISDE-pagina mist ${t}`);
  assert.match(read('dist/merken/quatt/index.html'), /€ 4\.449/);
  // blog: index, RSS, menu, homepage en de eerste post met kopfoto en schema
  assert.ok(existsSync('dist/blog/index.html') && existsSync('dist/blog/feed.xml'), 'blogindex en RSS');
  assert.ok(/href="\/blog\/"/.test(h), 'bloglink in menu');
  assert.match(h, /Nieuw op de blog/);
  assert.match(read('dist/sitemap.xml'), /\/blog\/warmtepomp-offerte-vergelijken\//);
  assert.match(read('dist/blog/feed.xml'), /<item>[\s\S]*warmtepomp-offerte-vergelijken/);
  const post = read('dist/blog/warmtepomp-offerte-vergelijken/index.html');
  assert.match(post, /Door Redactie WarmtepompenMatch/);
  assert.match(post, /<figure class="post-hero"><img src="\/img\/blog\/warmtepomp-offerte-vergelijken-1200\.webp" srcset="[^"]+600w[^"]+1200w" [^>]*width="1200" height="630" alt="[^"]{20,}"/);
  for (const w of [600, 900, 1200]) assert.ok(existsSync(`dist/img/blog/warmtepomp-offerte-vergelijken-${w}.webp`), `webp ${w}`);
  assert.ok(!existsSync('dist/img/blog/BRONNEN.md'), 'fotobronnen niet in dist');
  // beste hybride: kopfoto en sectiefoto (zonder bijschrift), bron in BRONNEN.md
  const hyb = read('dist/blog/beste-hybride-warmtepomp/index.html');
  assert.match(hyb, /<figure class="post-hero"><img src="\/img\/blog\/beste-hybride-warmtepomp-1200\.webp" [^>]*alt="[^"]{20,}"[^>]*><\/figure>/);
  assert.match(hyb, /<figure class="post-fig"><img src="\/img\/blog\/hybride-warmtepomp-rijtjeshuizen-1200\.webp" [^>]*alt="[^"]{20,}" loading="lazy"[^>]*><\/figure>/);
  assert.ok(!/<figcaption/.test(hyb), 'geen bijschriften');
  for (const n of ['beste-hybride-warmtepomp', 'hybride-warmtepomp-rijtjeshuizen']) {
    for (const w of [600, 900, 1200]) assert.ok(existsSync(`dist/img/blog/${n}-${w}.webp`), `${n} ${w}`);
    assert.ok(read('src/assets/img/blog/BRONNEN.md').includes(`## ${n}-{600,900,1200}.webp`), `bron ${n}`);
  }
  const types = [...post.matchAll(/"@type":"(\w+)"/g)].map((m) => m[1]);
  for (const t of ['BlogPosting', 'HowTo', 'HowToStep', 'FAQPage', 'BreadcrumbList', 'ImageObject']) assert.ok(types.includes(t), `schema ${t}`);
  assert.equal(types.filter((t) => t === 'HowToStep').length, 6);
  // interne links naar de blog vanuit gidsen en merkpagina's
  assert.match(read('dist/warmtepomp-kosten/index.html'), /<h2>Lees ook<\/h2>[\s\S]*href="\/blog\/warmtepomp-offerte-vergelijken\/"/);
  assert.match(read('dist/merken/remeha/index.html'), /<h2>Voor je tekent<\/h2>/);
  // indicatieve prijzen met bron
  assert.match(read('dist/merken/remeha/index.html'), /Prijzen \(indicatief\)[\s\S]*€ 3\.154/);
  assert.ok(existsSync('dist/site.webmanifest') && existsSync('dist/icon-512.png'), 'manifest');
  assert.match(h, /<link rel="manifest" href="\/site\.webmanifest">/);
  assert.equal(Object.keys(PARTNERLINKS).length, 0);
});

test('build (test-site): noindex overal, Disallow, BASE-paden, geen CNAME, preview-balk', () => {
  buildPreview();
  for (const f of htmlFiles()) {
    const s = read(f);
    assert.match(s, /<meta name="robots" content="noindex">/, f);
    assert.match(s, /url\(\/warmtepompenmatch-site\/fonts\/inter-400\.woff2\)/, `${f}: fontpad zonder BASE`);
    assert.match(s, /Testversie van WarmtepompenMatch.nl, nog niet live/);
  }
  const s = read('dist/index.html');
  assert.match(s, /href="\/warmtepompenmatch-site\/warmtepomp-keuzehulp\/"/);
  assert.match(s, /<link rel="canonical" href="https:\/\/warmtepompenmatch.nl\/">/);
  assert.equal(read('dist/robots.txt'), 'User-agent: *\nDisallow: /\n');
  assert.ok(!existsSync('dist/CNAME'));
  // Ook met GO_LIVE=1 en een BASE nooit een CNAME (veiligheid).
});

test('blog: post van 20-10-2026 staat pas vanaf die datum in loadPosts', () => {
  const slugs = (d) => loadPosts('content/blog', d).map((p) => p.slug);
  assert.ok(!slugs('2026-10-19').includes('beste-hybride-warmtepomp'), 'niet op 19-10');
  assert.ok(slugs('2026-10-20').includes('beste-hybride-warmtepomp'), 'wel op 20-10');
});

test('mobiele header: compacte breakpoint t/m 419px (geen overloop op 361-413px, iPhone 375/390)', () => {
  const css = read('src/assets/css/style.css');
  assert.match(css, /@media\(max-width:419px\)\{header\.site \.wrap\{gap:8px\}[^]*?details\.menu \.menu-txt\{position:absolute/);
  assert.ok(!css.includes('@media(max-width:374px)'), 'oude breakpoint 374px weg');
});
