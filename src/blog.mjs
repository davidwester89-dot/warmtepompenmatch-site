// Blog: content/blog/JJJJ-MM-DD-slug.md → /blog/<slug>/. Zelfde opbouw als de BoekhoudMatch-blog.
// Extra tokens in de markdown: {{knop:<merk-id>}} op een eigen regel = knop naar de aanbieder (partnerlink zodra goedgekeurd,
// via partnerlinks.js; heeft nooit invloed op score of volgorde) en {{score:<merk-id>}} = checklistscore uit de data.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE, esc, fmtDate, ORG, AUTHOR } from './layout.mjs';
import { parsePost, markdown, inline } from './markdown.mjs';
import { knop } from './lib/partnerlinks.js';
import { MERKEN as PLATFORMS } from './lib/merken.js';
import { score, fmtScore } from './lib/checklist.js';
import { faqHtml, matchCta } from './parts.mjs';

export const TOOLNAMES = {
  '/warmtepomp-keuzehulp/': 'Welke warmtepomp past bij jouw huis? Doe de keuzehulp',
  '/vergelijken/': 'Alle warmtepompmerken vergelijken',
  '/merken/': 'Alle merken op een rij',
  '/terugverdientijd-berekenen/': 'Terugverdientijd berekenen',
};
const readMin = (w) => Math.max(1, Math.round(w / 200));
const IMG = (name, w) => `/img/blog/${name}-${w}.webp`;
/** Kopfoto: WebP in 600/900/1200 breed (1200×630), vaste maat tegen layoutverschuiving. */
const heroHtml = (img) => `<figure class="post-hero"><img src="${IMG(img.name, 1200)}" srcset="${[600, 900, 1200].map((w) => `${IMG(img.name, w)} ${w}w`).join(', ')}" sizes="(max-width: 760px) calc(100vw - 40px), 700px" width="1200" height="630" alt="${esc(img.alt)}" fetchpriority="high" decoding="async">${img.caption ? `<figcaption class="src">${esc(img.caption)}</figcaption>` : ''}</figure>`;
const thumbHtml = (img) => `<img class="post-thumb" src="${IMG(img.name, 600)}" width="600" height="315" alt="${esc(img.alt)}" loading="lazy" decoding="async">`;
/** HowTo uit de markdown: de genummerde lijst direct onder de kop uit frontmatter 'howto'. Stap = **Naam.** uitleg */
function howtoSteps(md, kop) {
  const i = md.indexOf(`## ${kop}`);
  if (i < 0) throw new Error(`HowTo-kop niet gevonden: ${kop}`);
  const lines = md.slice(i).split('\n').slice(1);
  const steps = [];
  for (const l of lines) {
    if (/^## /.test(l)) break;
    const m = l.match(/^\d+\.\s+\*\*(.+?)\*\*\s*(.*)$/);
    if (m) steps.push({ name: m[1].replace(/\.$/, ''), text: m[2].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '') });
  }
  if (steps.length < 2) throw new Error(`HowTo '${kop}': te weinig stappen`);
  return steps;
}

function tokens(html, slug) {
  let n = 0;
  return html
    .replace(/<p>\{\{knop:([a-z]+)\}\}<\/p>/g, (_, id) => { if (!PLATFORMS[id]) throw new Error(`${slug}: onbekend merk ${id}`); return `<div class="out">${knop(id, `blog_${++n}`)}</div>`; })
    .replace(/\{\{score:([a-z]+)\}\}/g, (_, id) => { if (!PLATFORMS[id]) throw new Error(`${slug}: onbekend merk ${id}`); return `${fmtScore(score(id).totaal)}/10`; });
}

/** FAQ uit de markdown: een sectie "## Veelgestelde vragen" met ### vraag + alinea antwoord. */
function splitFaq(md) {
  const i = md.search(/^## Veelgestelde vragen\s*$/m);
  if (i < 0) return { md, faq: [] };
  const rest = md.slice(i).split('\n').slice(1).join('\n');
  const end = rest.search(/^## /m);
  const faqMd = end < 0 ? rest : rest.slice(0, end);
  const faq = faqMd.split(/^### /m).slice(1).map((b) => { const [q, ...a] = b.split('\n'); return [q.trim(), a.join(' ').trim()]; });
  return { md: md.slice(0, i) + (end < 0 ? '' : rest.slice(end)), faq };
}

export function loadPosts(dir = 'content/blog', today = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10)) {
  return readdirSync(dir).filter((f) => f.endsWith('.md')).sort().reverse()
    .map((f) => {
      const p = parsePost(f, readFileSync(join(dir, f), 'utf8'));
      const { md, faq } = splitFaq(p.md);
      return { ...p, faq, html: tokens(markdown(md), p.slug) };
    })
    .filter((p) => p.date <= today);
}

const faqBlock = (post) => (post.faq.length ? faqHtml(post.faq.map(([q, a]) => [q, tokens(inline(a), post.slug)])) : '');

export function postPage(post, all) {
  const others = all.filter((x) => x.slug !== post.slug).slice(0, 2);
  const og = `blog-${post.slug}`;
  const body = `
<article class="article">
<h1>${esc(post.title)}</h1><p class="src">Door ${SITE.owner} · <time datetime="${post.date}">${fmtDate(post.date)}</time> · ${readMin(post.words)} min lezen</p>
${post.image ? heroHtml(post.image) : ''}
${post.html}
${faqBlock(post)}
${post.tools.length ? `<aside class="cta"><h2>Vergelijk het zelf</h2><ul>${post.tools.map((t) => `<li><a href="${t}">${esc(TOOLNAMES[t] || t)} →</a></li>`).join('')}</ul></aside>` : ''}
<h2>Bronnen</h2>
<ul class="sources">${post.sources.map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.title)}</a></li>`).join('')}</ul>
</article>
${others.length ? `<h2>Meer op de blog</h2><div class="grid cards two">${others.map((x) => `<a class="card" href="${x.path}"><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p></a>`).join('')}</div>` : ''}`;
  return {
    path: post.path, title: post.seoTitle, ogTitle: post.title, h1: post.title, description: post.description, crumb: post.title,
    parents: [['/blog/', 'Blog']], navPath: '/blog/', og, ogType: 'article', lastmod: post.updated,
    stamp: { checked: post.checked, updated: post.updated }, article: { date: post.date, updated: post.updated },
    body,
    schema: [{
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.description,
      datePublished: post.date, dateModified: post.updated, inLanguage: 'nl-NL', wordCount: post.words,
      author: AUTHOR, publisher: ORG, image: post.image ? [{ '@type': 'ImageObject', url: SITE.domain + IMG(post.image.name, 1200), width: 1200, height: 630, caption: post.image.alt }, `${SITE.domain}/og/${og}.png`] : `${SITE.domain}/og/${og}.png`,
      mainEntityOfPage: { '@type': 'WebPage', '@id': SITE.domain + post.path },
      citation: post.sources.map((s) => s.url),
    }].concat(post.howto ? [{ '@context': 'https://schema.org', '@type': 'HowTo', name: post.howto, inLanguage: 'nl-NL', ...(post.image ? { image: SITE.domain + IMG(post.image.name, 1200) } : {}), step: howtoSteps(post.md, post.howto).map((x, i) => ({ '@type': 'HowToStep', position: i + 1, name: x.name, text: x.text })) }] : []).concat(post.faq.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: post.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: tokens(a, post.slug).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '') } })) }] : []),
  };
}

export function blogIndex(posts) {
  const body = `
<h1>Blog: warmtepomp kiezen</h1>
<p class="lead">Welke warmtepomp past bij jouw huis en wat kost het? Kort uitgelegd, met bronnen.</p>
<div class="postlist">
${posts.map((x) => `<a class="card${x.image ? ' has-img' : ''}" href="${x.path}">${x.image ? thumbHtml(x.image) + '<div>' : ''}<time datetime="${x.date}">${fmtDate(x.date)}</time><h2 style="margin:.2em 0 .3em;font-size:1.3rem">${esc(x.title)}</h2><p>${esc(x.description)}</p><span class="more">Lees verder →</span>${x.image ? '</div>' : ''}</a>`).join('\n')}
</div>
<p>Liever alles naast elkaar? <a href="/vergelijken/">Vergelijk alle merken</a>.</p>
${matchCta()}`;
  const upd = posts.map((x) => x.updated).sort().at(-1);
  return {
    path: '/blog/', title: 'Blog: warmtepomp kiezen | WarmtepompenMatch', h1: 'Blog', ogTitle: 'Blog: warmtepomp kiezen',
    description: 'Artikelen over het kiezen van een warmtepomp: kosten, subsidie, merken en wat past bij jouw huis. Met bronnen.',
    crumb: 'Blog', og: 'blog', body, lastmod: upd, stamp: { updated: upd },
    schema: [{ '@context': 'https://schema.org', '@type': 'Blog', name: 'WarmtepompenMatch blog', url: SITE.domain + '/blog/', inLanguage: 'nl-NL', publisher: ORG,
      blogPost: posts.map((x) => ({ '@type': 'BlogPosting', headline: x.title, url: SITE.domain + x.path, datePublished: x.date, dateModified: x.updated })) }],
  };
}

export function latestHtml(posts, n = 3) {
  if (!posts.length) return '';
  return `<h2>Nieuw op de blog</h2><ul class="postlist">${posts.slice(0, n).map((x) => `<li><a href="${x.path}">${esc(x.title)}</a><span class="sub"><time datetime="${x.date}">${fmtDate(x.date)}</time> · ${readMin(x.words)} min lezen</span></li>`).join('')}</ul><p><a href="/blog/">Alle artikelen →</a></p>`;
}

const rfc822 = (iso) => new Date(iso + 'T08:00:00+02:00').toUTCString();
export function feed(posts) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>WarmtepompenMatch blog</title>
<link>${SITE.domain}/blog/</link>
<description>Warmtepomp kiezen, met bronnen.</description>
<language>nl-nl</language>
<atom:link href="${SITE.domain}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${posts[0] ? `<lastBuildDate>${rfc822(posts[0].updated)}</lastBuildDate>` : ''}
${posts.map((p) => `<item><title>${esc(p.title)}</title><link>${SITE.domain}${p.path}</link><guid isPermaLink="true">${SITE.domain}${p.path}</guid><pubDate>${rfc822(p.date)}</pubDate><description>${esc(p.description)}</description></item>`).join('\n')}
</channel>
</rss>
`;
}
