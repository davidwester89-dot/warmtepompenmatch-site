import { mkdirSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { layout, SITE, BASE, PREVIEW, NAV_OPT } from './src/layout.mjs';
import { partnerNoten } from './src/lib/partnerlinks.js';
import { loadPosts, postPage, blogIndex, latestHtml, feed } from './src/blog.mjs';
import { LEADS, ROUTING, LEADS_PREVIEW } from './src/leads.config.mjs';
import { maakLogoCellen } from './src/lib/logo-cellen.mjs';
import { MERKEN } from './src/lib/merken.js';
import { ZONDER_LOGO } from './src/lib/logo-rechten.js';
const OUT = 'dist';
rmSync(OUT, { recursive: true, force: true });
// Logo's in tabelcellen met precies de naam van een aanbieder (30-10); zelfde vak voor iedereen, alleen beeld.
// Niet voor merken in ZONDER_LOGO (merkrichtlijn vraagt toestemming; SC 30-10): daar blijft alleen de naam.
const logoCellen = maakLogoCellen(Object.entries(MERKEN).filter(([id]) => !ZONDER_LOGO.has(id)).map(([id, m]) => ({ namen: [...new Set([m.naam, m.naam.split(' ')[0]])], src: `${BASE}/logos/${id}.svg`, merk: m.naam })), { productrijen: true });
const write = (p, s) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, p.endsWith('.html') ? logoCellen(s) : s); };
// Blog: content/blog/*.md (nieuwste eerst; posts met een datum in de toekomst worden overgeslagen). Geen posts = geen blog in menu en sitemap.
const posts = loadPosts();
NAV_OPT.blog = posts.length > 0;
const P = await import('./src/pages.mjs');
const { offertePages } = await import('./src/offerte.mjs');
const home = { ...P.home, body: P.home.body.replace('{{latest}}', latestHtml(posts)) };
export const pages = [home, P.quiz, P.calc, P.merkHub, ...P.merkPages, P.vsHub, ...P.vsPages, P.gidsHub, ...P.guides, ...(posts.length ? [blogIndex(posts), ...posts.map((x) => postPage(x, posts))] : []), ...offertePages, P.over, P.privacy, P.notfound].map((p) => (P.LOGO_PADEN.has(p.path) ? P.bijgewerkt(p, P.LOGO_UPD) : p));
for (const p of pages) write(p.path.endsWith('.html') ? join(OUT, p.path) : join(OUT, p.path, 'index.html'), partnerNoten(layout(p)));
cpSync('src/assets/js', join(OUT, 'js'), { recursive: true });
cpSync('src/lib', join(OUT, 'js/lib'), { recursive: true, filter: (p) => !/logo-(rechten|cellen)\.m?js$/.test(p) }); // alleen build-time, niet publiceren
// Offertepartners voor de browser (leeg = geen offerteknoppen). Alleen velden die de browser nodig heeft.
const pub = Object.fromEntries(Object.entries(LEADS).map(([id, x]) => [id, { naam: x.naam, type: x.type, url: x.url, origin: x.origin, privacy: x.privacy, max: x.max, prefill: x.prefill, subidParam: x.subidParam, klaar: x.klaar }]));
write(join(OUT, 'js/lib/leads.config.js'), `// Gegenereerd door build.mjs${LEADS_PREVIEW ? ' (LEADS_PREVIEW)' : ''}. Niet bewerken.\nexport const LEADS = ${JSON.stringify(pub)};\nexport const ROUTING = ${JSON.stringify(ROUTING)};\n`);
cpSync('src/assets/og', join(OUT, 'og'), { recursive: true });
cpSync('src/assets/img', join(OUT, 'img'), { recursive: true, filter: (f) => !f.endsWith('.md') });
cpSync('src/assets/logos', join(OUT, 'logos'), { recursive: true, filter: (f) => !f.endsWith('.md') });
cpSync('src/assets/icons', OUT, { recursive: true });
cpSync('src/assets/fonts', join(OUT, 'fonts'), { recursive: true });
cpSync('src/root', OUT, { recursive: true });
// CNAME pas bij livegang (GO_LIVE=1, na akkoord Dave). Zonder CNAME blijft dit een test-site op github.io.
if (process.env.GO_LIVE === '1' && !PREVIEW) write(join(OUT, 'CNAME'), `${SITE.host}\n`);
write(join(OUT, '.nojekyll'), '');
if (posts.length) write(join(OUT, 'blog/feed.xml'), feed(posts));
write(join(OUT, 'robots.txt'), PREVIEW ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${SITE.domain}/sitemap.xml\n`);
write(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter((p) => !p.noindex).map((p) => `<url><loc>${SITE.domain}${p.path}</loc><lastmod>${p.lastmod || SITE.updated}</lastmod></url>`).join('\n')}\n</urlset>\n`);
// URL-lijst voor Search Console en IndexNow (na livegang).
write(join(OUT, 'urls.txt'), pages.filter((p) => !p.noindex).map((p) => SITE.domain + p.path).join('\n') + '\n');
console.log(`Built ${pages.length} pages (${posts.length} blogposts) → ${OUT}/${PREVIEW ? ` (preview, BASE=${BASE || '/'}, noindex)` : ''}`);
