// l7check.mjs — L7-datumcheck, dist-brede naamgrep en repo-root-404 voor de match-sites (SEO-specialist, voorstel 4-11-2026).
// Zonder dependencies (Node >= 20). Gebruik vanuit een test (zie test/l7-naamgrep.test.js) of als CLI:
//   PUSH_DATE=2026-11-12 L7_BASE=956a419 node scripts/l7check.mjs     (alle drie de checks, config: l7.config.mjs ernaast)
//   L7_TIP=<hash>: controleer een commit i.p.v. de werkmap (review van een hash zonder checkout).
//
// L7 (geleerde-lessen.md): een pagina met een zichtbare bodywijziging krijgt de pushdatum in JSON-LD dateModified, de zichtbare
// 'bijgewerkt'-regel en de sitemap-lastmod. Werkwijze:
//   1. Bouw de basis (L7_BASE, standaard merge-base met origin/main) en de werkmap (incl. niet-gecommitte wijzigingen) elk in een
//      eigen tijdelijke map, met BUILD_DATE=PUSH_DATE (PUSH_DATE standaard: vandaag in Europe/Amsterdam).
//   2. Per pagina: tekst + linkdoelen van <main> (of <body> zonder de eerste <header> en de laatste <footer>), zonder <style>,
//      <script>, commentaar, logo-<img>'s en datumvelden (<time>, ISO-, d-m-jjjj- en uitgeschreven datums). Verschil = bodywijziging.
//      Header/nav/footer buiten <main> tellen niet (SC-regel: footer en nav zijn geen bodywijziging).
//   3. Client-side uitslagen: verandert een lokaal script dat de pagina laadt (transitief via import), zonder commentaar en
//      zonder logo-regels, dan telt de pagina ook als gewijzigd (keuzehulp/match-data). Consent/GA-scripts tellen niet.
//   4. Hubs: een pagina die naar een gewijzigde pagina linkt en daarvan een 'ouder' is (pad-prefix, bv. /blog/ → /blog/x/) of in
//      cfg.hubs staat, moet de nieuwste datum van zijn kinderen dragen (bij een gewijzigd kind dus de pushdatum).
//   4b. Is alleen een datumveld verschoven (lastmod/dateModified/zichtbaar), dan moeten alle velden mee naar de pushdatum.
//   4c. Op elke pagina: geen datum na PUSH_DATE, en datePublished van een bestaande pagina schuift niet naar later (SC-voorstel 30-10).
//   5. Voor elke gewijzigde pagina en hub: dateModified (alle waarden), article:modified_time (als aanwezig), de eerste zichtbare
//      'bijgewerkt'/'updated'-regel en de sitemap-lastmod moeten gelijk zijn aan de verwachte datum. Een ontbrekend veld is fout,
//      tenzij het in cfg.exempt staat (alleen ontbrekende velden; een aanwezig veld moet altijd kloppen). dateModified is alleen
//      verplicht als de JSON-LD van de pagina datePublished heeft (template met datums). L7_STRICT=1: alles verplicht, geen
//      uitzonderingen (lijst van templategaten voor SC).
import { execFileSync, execSync } from 'node:child_process';
import { mkdtempSync, rmSync, readdirSync, readFileSync, statSync, existsSync, mkdirSync, copyFileSync, symlinkSync } from 'node:fs';
import { join, dirname, relative, posix } from 'node:path';
import { tmpdir } from 'node:os';

export const amsterdamToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(new Date());
// BEKEND-items (BEKEND_HUB, BEKEND_L7): { pad, reden, alleen?: RegExp op de hele melding, tot?: 'JJJJ-MM-DD' }.
// Met 'tot' vervalt de uitzondering automatisch ná die kalenderdag (Europe/Amsterdam; L7_VANDAAG alleen voor tests), dan is de
// melding weer een fout (besluit A, SC 30-10). BEKEND_L7 is apart van BEKEND_HUB: een bekende hub maskeert de L7-check niet.
export const vandaag = () => process.env.L7_VANDAAG || amsterdamToday();
export const bekendActief = (b, dag = vandaag()) => !b.tot || dag <= b.tot;
export const isBekend = (regel, lijst = [], dag = vandaag()) => lijst.some((b) => bekendActief(b, dag)
  && (regel.startsWith(b.pad + ':') || regel.startsWith(b.pad + ' (')) && (!b.alleen || b.alleen.test(regel)));

const git = (root, args, opts = {}) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();

export function resolveBase(root) {
  const env = process.env.L7_BASE;
  try {
    if (env) return { base: git(root, ['rev-parse', '--verify', env + '^{commit}']), how: `L7_BASE=${env}` };
    const mb = git(root, ['merge-base', 'HEAD', 'origin/main']);
    return { base: mb, how: 'merge-base HEAD origin/main' };
  } catch (e) {
    return { base: null, how: `basis niet gevonden (${env ? 'L7_BASE=' + env : 'origin/main'}): ${String(e.stderr || e.message).split('\n')[0]}` };
  }
}

// Werkmap (tracked + untracked, zonder ignored) of een commit naar een tijdelijke map.
export function materialize(root, ref, dir) {
  mkdirSync(dir, { recursive: true });
  if (ref === 'WORKTREE') {
    const files = git(root, ['ls-files', '-z', '-co', '--exclude-standard'], { maxBuffer: 1 << 28 }).split('\0').filter(Boolean);
    for (const f of files) {
      const src = join(root, f);
      if (!existsSync(src) || statSync(src).isDirectory()) continue;
      mkdirSync(dirname(join(dir, f)), { recursive: true });
      copyFileSync(src, join(dir, f));
    }
  } else {
    execSync(`git archive --format=tar ${ref} | tar -x -C "${dir}"`, { cwd: root, stdio: ['ignore', 'ignore', 'pipe'], maxBuffer: 1 << 28 });
  }
  if (existsSync(join(root, 'node_modules')) && !existsSync(join(dir, 'node_modules'))) symlinkSync(join(root, 'node_modules'), join(dir, 'node_modules'));
}

export function walk(d, base = d) {
  const out = [];
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) out.push(...walk(p, base)); else if (e.isFile()) out.push(relative(base, p).split('\\').join('/'));
  }
  return out;
}

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', shy: '', euro: '€', hellip: '…', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', times: '×' };
export const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
  e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENT[e.toLowerCase()] ?? m));

const NL_M = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const EN_M = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const MON = `(?:${[...NL_M, ...EN_M].join('|')}|jan|feb|mrt|apr|jun|jul|aug|sep|sept|okt|oct|nov|dec)\\.?`;
const DATE_RES = [
  /\b\d{4}-\d{2}-\d{2}(?:T[\d:.+Z-]*)?\b/g,
  /\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b/g,
  new RegExp(`\\b\\d{1,2}\\s+${MON}(?:\\s+\\d{4})?`, 'gi'),
  new RegExp(`\\b${MON}\\s+\\d{1,2}(?:st|nd|rd|th)?,?(?:\\s+\\d{4})?`, 'gi'),
];
export const stripDates = (s) => DATE_RES.reduce((t, re) => t.replace(re, '‹datum›'), s);

const p2 = (n) => String(n).padStart(2, '0');
export function parseDate(s) {
  if (!s) return null;
  s = decode(s).replace(/\s+/g, ' ').trim();
  let m = s.match(/(\d{4})-(\d{2})-(\d{2})/); if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b/); if (m) return `${m[3]}-${p2(m[2])}-${p2(m[1])}`;
  m = s.match(/\b(\d{1,2})\s+([a-z]+)\.?\s+(\d{4})/i);
  if (m) { const i = Math.max(NL_M.indexOf(m[2].toLowerCase()), EN_M.indexOf(m[2].toLowerCase())); if (i >= 0) return `${m[3]}-${p2(i + 1)}-${p2(m[1])}`; }
  m = s.match(/\b([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i);
  if (m) { const i = EN_M.indexOf(m[1].toLowerCase()); if (i >= 0) return `${m[3]}-${p2(i + 1)}-${p2(m[2])}`; }
  return null;
}

export function mainHtml(html) {
  const m = html.match(/<main\b[^>]*>([\s\S]*)<\/main>/i);
  if (m) return m[1];
  let b = (html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i) || [, html])[1];
  b = b.replace(/<header\b[\s\S]*?<\/header>/i, '');
  const i = b.toLowerCase().lastIndexOf('<footer');
  return i >= 0 ? b.slice(0, i) : b;
}

export const isLogoImg = (tag) => /logo/i.test(tag);
// Zichtbare inhoud als vergelijkbare tekst: tekst + linkdoelen + niet-logo-afbeeldingen, zonder datums.
// Datums: <time> en datums direct na een paginadatum-label (bijgewerkt/gecontroleerd/gepubliceerd/…) tellen niet. Een datum in
// lopende tekst (actie-einddatum, 'per 1 januari 2027', deadline) is inhoud en telt wel (SC 30-10, mutatie a2).
export const PAGE_DATE_LABEL = /((?:laatst\s+)?(?:bijgewerkt|ge[uü]pdatet|updated|laatste update|update|gecontroleerd|checked|nagekeken|gepubliceerd|published|geplaatst|bekeken|geraadpleegd|last updated)\b(?:\s+(?:op|on))?\s*:?\s*)/gi;
// Alleen de eerste datum direct na het label (hooguit 3 tekens ertussen), niet een volgende datum in de zin.
export function stripPageDates(s) {
  const cut = [];
  for (const m of s.matchAll(PAGE_DATE_LABEL)) {
    const at = m.index + m[0].length, rest = s.slice(at, at + 60);
    const hit = DATE_RES.map((re) => new RegExp(re.source, re.flags.replace('g', '')).exec(rest)).filter((x) => x && x.index <= 3).sort((x, y) => y[0].length - x[0].length)[0];
    if (hit) cut.push([at + hit.index, at + hit.index + hit[0].length]);
  }
  let out = '', pos = 0;
  for (const [a, b] of cut) { if (a < pos) continue; out += s.slice(pos, a) + '‹datum›'; pos = b; }
  return out + s.slice(pos);
}
// cfg.stripBlocks: [RegExp] op de ruwe html van <main>, voor automatisch gegenereerde teaserlijsten (alleen met SC-OK).
export function bodyFingerprint(html, cfg = {}) {
  let b = (cfg.stripBlocks || []).reduce((t, re) => t.replace(re, ' ‹teaser› '), mainHtml(html))
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<time\b[^>]*>[\s\S]*?<\/time>/gi, ' ‹datum› ')
    .replace(/<(span|div|figure)\b[^>]*class="[^"]*(?:wordmark|logo)[^"]*"[^>]*>[^<]*<\/\1>/gi, ' ') // logo-of-woordmerkvervanger
    .replace(/<(img|source)\b[^>]*>/gi, (t) => isLogoImg(t) ? ' ' : ` [img ${(t.match(/\ssrc="([^"]*)"/i) || [, ''])[1]} ${(t.match(/\salt="([^"]*)"/i) || [, ''])[1]}] `)
    .replace(/<a\b[^>]*?\shref="([^"]*)"[^>]*>/gi, ' [→$1] ')
    .replace(/<[^>]+>/g, ' ');
  return stripPageDates(decode(b).replace(/\s+/g, ' ')).replace(/\s+/g, ' ').trim();
}

// Logo's tellen niet: alleen de logo-tokens zelf (import van een logomodule, ${logo…(…)}-interpolatie, logo-property) gaan eruit,
// niet de hele regel. Een regel met logo én prijs/tekst blijft dus meetellen (SC 30-10, mutatie c2).
export const jsFingerprint = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .split('\n').map((l) => l.replace(/(^|[^:'"`\\])\/\/.*$/, '$1'))
  .map((l) => l.replace(/^\s*import\b[^;]*['"][^'"]*logo[^'"]*['"]\s*;?\s*$/i, ' ')
    .replace(/\$\{\s*logo\w*\((?:[^(){}]|\{[^{}]*\}|\([^()]*\))*\)\s*\}/gi, '')
    .replace(/\b(\w*logo\w*)\s*:\s*(?:'[^']*'|"[^"]*"|`[^`]*`|[\w.$]+)\s*,?/gi, ''))
  .join('\n').replace(/\s+/g, ' ').trim();

// Lokale scripts van een pagina, transitief via import/export-from/import().
export function scriptDeps(outDir, html, pageFile) {
  const seen = new Set();
  const start = [...html.matchAll(/<script\b[^>]*\ssrc="([^"]+)"/gi)].map((m) => m[1]);
  const inline = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join('\n');
  const resolve = (spec, fromFile) => {
    if (/^(https?:)?\/\//.test(spec) || spec.startsWith('data:')) return null;
    const clean = spec.split(/[?#]/)[0];
    return clean.startsWith('/') ? clean.slice(1) : posix.normalize(posix.join(posix.dirname(fromFile), clean));
  };
  const IMP = /(?:import|export)\s[^'"`;]*?from\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|import\s+['"]([^'"]+)['"]/g;
  const queue = start.map((s) => resolve(s, pageFile)).filter(Boolean);
  for (const m of inline.matchAll(IMP)) { const r = resolve(m[1] || m[2] || m[3], pageFile); if (r) queue.push(r); }
  while (queue.length) {
    const f = queue.shift();
    if (seen.has(f) || !existsSync(join(outDir, f))) continue;
    seen.add(f);
    if (!/\.(m?js|cjs)$/.test(f)) continue;
    const src = readFileSync(join(outDir, f), 'utf8');
    for (const m of src.matchAll(IMP)) { const r = resolve(m[1] || m[2] || m[3], f); if (r) queue.push(r); }
  }
  return [...seen];
}

export const fileToPath = (f) => '/' + f.replace(/(^|\/)index\.html$/, '$1');

export function readSitemap(outDir, sitemapFile = 'sitemap.xml') {
  const map = new Map();
  const p = join(outDir, sitemapFile);
  if (!existsSync(p)) return map;
  for (const m of readFileSync(p, 'utf8').matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = (m[1].match(/<loc>\s*([^<\s]+)\s*<\/loc>/) || [])[1];
    const lm = (m[1].match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/) || [])[1];
    if (loc) map.set(new URL(decode(loc)).pathname, lm ? lm.slice(0, 10) : null);
  }
  return map;
}

export function dateFields(html) {
  // Alleen de eigen dateModified van de pagina: topniveau (of @graph-item), niet die van geneste items (ItemList, blogPost[]).
  const ld = [];
  let ldPub = false;
  for (const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let j; try { j = JSON.parse(m[1]); } catch { for (const d of m[1].matchAll(/"dateModified"\s*:\s*"([^"]+)"/g)) ld.push(d[1].slice(0, 10)); continue; }
    const tops = (Array.isArray(j) ? j : [j]).flatMap((o) => (o && Array.isArray(o['@graph']) ? o['@graph'] : [o]));
    for (const o of tops) {
      if (o && typeof o.dateModified === 'string') ld.push(o.dateModified.slice(0, 10));
      if (o && typeof o.datePublished === 'string') ldPub = true;
    }
  }
  const og = [...html.matchAll(/<meta\b[^>]*property=["'](?:article:modified_time|og:updated_time)["'][^>]*content=["']([^"']+)["']/gi)].map((m) => m[1].slice(0, 10));
  const body = (html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i) || [, html])[1]
    .replace(/<!--[\s\S]*?-->/g, ' ').replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/gi, ' ');
  const LBL = /(bijgewerkt|ge[uü]pdatet|updated|laatste update|update)\b(?:\s+(?:op|on))?\s*:?\s*/gi;
  let visible = null, visibleLabel = null;
  for (const m of body.matchAll(LBL)) {
    const rest = body.slice(m.index + m[0].length, m.index + m[0].length + 200);
    const t = rest.match(/^(?:<(?!time)[^>]+>\s*)*<time\b[^>]*datetime=["']([^"']+)["']/i);
    const d = t ? t[1].slice(0, 10) : parseDate(rest.replace(/<[^>]+>/g, ' ').slice(0, 40).replace(/^\s*(?:op|on)\s/i, ''));
    if (d) { visible = d; visibleLabel = m[1]; break; }
  }
  const checked = [...body.matchAll(/(?:gecontroleerd|checked|nagekeken)\b(?:\s+(?:op|on))?\s*:?\s*(?:<(?!time)[^>]+>\s*)*(?:<time\b[^>]*datetime=["']([^"']+)["']|([^<]{0,40}))/gi)]
    .map((m) => (m[1] ? m[1].slice(0, 10) : parseDate(m[2]))).filter(Boolean);
  let published = null;
  const P = body.match(/(gepubliceerd|published|geplaatst)\b(?:\s+(?:op|on))?\s*:?\s*(?:<(?!time)[^>]+>\s*)*(?:<time\b[^>]*datetime=["']([^"']+)["']|([^<]{0,40}))/i);
  if (P) published = P[2] ? P[2].slice(0, 10) : parseDate(P[3]);
  return { ld: [...new Set(ld)], ldPub, og: [...new Set(og)], visible, visibleLabel, published, checked };
}

// Eigen datePublished van de pagina (topniveau of @graph-item), zoals dateFields voor dateModified.
export function ownPublished(html) {
  const out = [];
  for (const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let j; try { j = JSON.parse(m[1]); } catch { continue; }
    for (const o of (Array.isArray(j) ? j : [j]).flatMap((o) => (o && Array.isArray(o['@graph']) ? o['@graph'] : [o]))) if (o && typeof o.datePublished === 'string') out.push(o.datePublished.slice(0, 10));
  }
  return [...new Set(out)].sort();
}

const pageMeta = (html) => ({
  noindex: /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html),
  redirect: /<meta\b[^>]*http-equiv=["']refresh["']/i.test(html),
});

export const DEFAULT_JS_IGNORE = /(^|\/)(consent|gtag|ga|ga4|analytics|cookie|intern[-_]?traffic|video|menu|nav|logos?)[^/]*\.m?js$/i;

// cfg: { build(dir, env) -> outDir (absolute), sitemap?, hubs?: [{hub, children: RegExp}], notHub?: [pad], exempt?: {path: [velden]},
//        jsIgnore?: RegExp, ignorePages?: RegExp, env?: {}, stripBlocks?: [RegExp], requireDateModified?: [pad] }
// requireDateModified: pagina's zonder datePublished waar dateModified tóch verplicht is (keuzehulp zonder zichtbare datum, SC 30-10).
export function runL7(root, cfg) {
  const pushDate = process.env.PUSH_DATE || amsterdamToday();
  const strict = process.env.L7_STRICT === '1'; // alles verplicht, geen uitzonderingen: toont alle templategaten (voor SC)
  const { base, how } = resolveBase(root);
  if (!base) return { skipped: how, pushDate };
  const tmp = mkdtempSync(join(tmpdir(), 'l7-'));
  try {
    const env = { ...process.env, BUILD_DATE: pushDate, ...(cfg.env || {}) };
    const bDir = join(tmp, 'basis'), tDir = join(tmp, 'tip');
    const tipRef = process.env.L7_TIP ? git(root, ['rev-parse', '--verify', process.env.L7_TIP + '^{commit}']) : 'WORKTREE';
    materialize(root, base, bDir); materialize(root, tipRef, tDir);
    const bOut = cfg.build(bDir, env), tOut = cfg.build(tDir, env);
    const ign = cfg.ignorePages || /^(404\.html|google[0-9a-f]+\.html)$/;
    const htmlOf = (out) => new Map(walk(out).filter((f) => f.endsWith('.html') && !ign.test(f)).map((f) => [f, readFileSync(join(out, f), 'utf8')]));
    const bPages = htmlOf(bOut), tPages = htmlOf(tOut);
    const bMap = readSitemap(bOut, cfg.sitemap), tMap = readSitemap(tOut, cfg.sitemap);
    const jsIgnore = cfg.jsIgnore || DEFAULT_JS_IGNORE;
    const jsCache = new Map();
    const jsChanged = (f) => {
      if (jsCache.has(f)) return jsCache.get(f);
      const a = existsSync(join(bOut, f)) ? jsFingerprint(readFileSync(join(bOut, f), 'utf8')) : null;
      const b = existsSync(join(tOut, f)) ? jsFingerprint(readFileSync(join(tOut, f), 'utf8')) : null;
      jsCache.set(f, a !== b); return a !== b;
    };
    const changed = new Map(); // path -> reden
    const info = new Map();
    for (const [f, html] of tPages) {
      const meta = pageMeta(html);
      if (meta.noindex || meta.redirect) continue;
      const path = fileToPath(f);
      info.set(path, { f, html });
      const old = bPages.get(f);
      if (old === undefined) { changed.set(path, 'nieuwe pagina'); continue; }
      if (bodyFingerprint(old, cfg) !== bodyFingerprint(html, cfg)) { changed.set(path, 'bodywijziging'); continue; }
      // Alleen een datum verschoven (bv. lastmod of dateModified mee, zichtbare regel niet: SC G2): dan moeten alle velden mee.
      const da = dateFields(old), db = dateFields(html);
      // Alleen vooruit telt: een datum die naar een oudere waarde wordt gecorrigeerd (bv. lastmod = controledatum) is geen update.
      const maxOf = (d, lm) => [...d.ld, ...d.og, d.visible, lm].filter(Boolean).sort().at(-1) || '';
      if (maxOf(db, tMap.get(path)) > maxOf(da, bMap.get(path)) || (db.visible && !da.visible)) {
        // Conventie (SC, KM-aanbieders/VM-bronnen): zonder bodywijziging en zonder 'bijgewerkt'-regel mag lastmod de zichtbare
        // controledatum volgen ('Gecontroleerd op <datum>'). Dat is geen update.
        const lm = tMap.get(path);
        if (!db.visible && !db.ld.length && lm && db.checked.includes(lm)) continue;
        changed.set(path, 'datum verschoven'); continue;
      }
      const deps = scriptDeps(tOut, html, f).filter((d) => /\.(m?js|cjs|json)$/.test(d) && !jsIgnore.test(d));
      // Optioneel per site: cfg.clientOutput[path] = { covers: RegExp, run(outDir) -> string }. Dan telt voor de gedekte
      // databestanden (bv. tools.js/match.js) alleen of de echte uitslag verandert (alle antwoordcombinaties), niet de bytes.
      const co = (cfg.clientOutput || {})[path];
      let cj = deps.filter((d) => !(co && co.covers.test(d))).filter(jsChanged);
      if (co && deps.some((d) => co.covers.test(d) && jsChanged(d)) && co.run(bOut) !== co.run(tOut)) cj = [...cj, 'uitslag ' + co.covers.source];
      if (cj.length) changed.set(path, 'client-side data: ' + cj.join(', '));
    }
    // hubs
    const hubs = new Map(); // hub -> [kinderen]
    const linksOf = (html) => new Set([...mainHtml(html).matchAll(/<a\b[^>]*?\shref="([^"#?]+)/gi)].map((m) => { try { return new URL(m[1], 'https://x.nl/').pathname; } catch { return m[1]; } }));
    for (const [path, { html }] of info) {
      const cfgHub = (cfg.hubs || []).find((h) => h.hub === path);
      const links = linksOf(html);
      if (!cfgHub && (cfg.notHub || []).includes(path)) continue; // bv. taalhome /en/: geen hub, maar de homepage
      const kids = [...links].filter((l) => l !== path && info.has(l) && (cfgHub ? cfgHub.children.test(l) : (path !== '/' && l.startsWith(path))));
      if (kids.some((k) => changed.has(k))) hubs.set(path, kids);
    }
    const failures = [];
    const report = [];
    const check = (path, expected, reden) => {
      const { html } = info.get(path);
      const d = dateFields(html);
      const lastmod = tMap.get(path);
      const ex = new Set((cfg.exempt || {})[path] || []);
      const fout = [];
      // dateModified is verplicht als de template datums in JSON-LD heeft (datePublished) of met L7_STRICT=1; anders n.v.t.
      if (!d.ld.length) { if ((strict || d.ldPub || (cfg.requireDateModified || []).includes(path)) && !(ex.has('dateModified') && !strict)) fout.push('geen JSON-LD dateModified'); } else for (const v of d.ld) if (v !== expected) fout.push(`dateModified ${v}`);
      for (const v of d.og) if (v !== expected) fout.push(`article:modified_time ${v}`);
      let vis = d.visible;
      let visLbl = '';
      if (!vis && reden === 'nieuwe pagina' && d.published) { vis = d.published; visLbl = ' (gepubliceerd)'; }
      // Template zonder 'bijgewerkt'-regel maar met zichtbare controledatum (KM-aanbieders, WPM/TAM-gidsen): die geldt als zichtbare datum.
      if (!vis && d.checked.length && (strict || !ex.has('zichtbaar'))) { vis = [...d.checked].sort().at(-1); visLbl = ' (gecontroleerd)'; }
      if (!vis) { if (strict || !ex.has('zichtbaar')) fout.push("geen zichtbare 'bijgewerkt'-regel"); } else if (vis !== expected) fout.push(`zichtbaar ${vis}${visLbl}`);
      if (lastmod === undefined) { if (strict || !ex.has('lastmod')) fout.push('niet in sitemap'); } else if (lastmod !== expected) fout.push(`lastmod ${lastmod}`);
      report.push(`${path} [${reden}] verwacht ${expected}: dateModified=${d.ld.join('/') || (d.ldPub ? '-' : 'n.v.t.')} zichtbaar=${vis ? vis + visLbl : '-'} lastmod=${lastmod || '-'}${fout.length ? '  FOUT' : ''}`);
      if (fout.length) failures.push(`${path} (${reden}; verwacht ${expected}): ${fout.join(', ')}`);
    };
    for (const [path, reden] of changed) check(path, pushDate, reden);
    // Geen datum na de pushdatum; datePublished van een bestaande pagina verandert niet.
    for (const [path, { f, html }] of info) {
      const d = dateFields(html), lm = tMap.get(path);
      const toekomst = [...d.ld, ...d.og, d.visible, lm].filter((x) => x && x > pushDate);
      if (toekomst.length) failures.push(`${path}: datum na de pushdatum ${pushDate}: ${[...new Set(toekomst)].join(', ')}`);
      const old = bPages.get(f);
      if (old !== undefined) {
        const pub = (h) => ownPublished(h).join(',');
        if (pub(old) && pub(html) && pub(html) > pub(old)) failures.push(`${path}: datePublished naar later verschoven ${pub(old)} → ${pub(html)}`); // terugzetten naar de echte publicatiedag mag
      }
    }
    for (const [hub, kids] of hubs) {
      if (changed.has(hub)) continue; // al gecontroleerd op de pushdatum (= max, want een kind is gewijzigd)
      const dates = kids.map((k) => (changed.has(k) ? pushDate : tMap.get(k) || dateFields(info.get(k).html).visible)).filter(Boolean).sort();
      check(hub, dates.at(-1), `hub van ${kids.filter((k) => changed.has(k)).join(', ')}`);
    }
    for (const [hub, kids] of hubs) if (changed.has(hub)) {
      const max = kids.map((k) => (changed.has(k) ? pushDate : tMap.get(k))).filter(Boolean).sort().at(-1);
      if (max && max > pushDate) failures.push(`${hub}: hub, maar kind heeft nieuwere datum ${max}`);
    }
    return { pushDate, base, tip: tipRef, how, changed: [...changed], hubs: [...hubs.keys()], failures, report };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

// --- A2. Statische hub-audit op één build (ook zonder diff): een hub draagt de nieuwste datum van zijn kinderen -------------
// Hub = pagina die naar kinderen onder zijn eigen pad linkt (/blog/ → /blog/x/), of cfg.hubs. Fout als de zichtbare regel of
// lastmod van de hub ouder is dan de nieuwste lastmod/zichtbare datum van een kind waarnaar hij linkt.
export function hubAudit(outDir, cfg = {}) {
  const ign = cfg.ignorePages || /^(404\.html|google[0-9a-f]+\.html)$/;
  const map = readSitemap(outDir, cfg.sitemap);
  const info = new Map();
  for (const f of walk(outDir).filter((x) => x.endsWith('.html') && !ign.test(x))) {
    const html = readFileSync(join(outDir, f), 'utf8');
    if (pageMeta(html).noindex || pageMeta(html).redirect) continue;
    info.set(fileToPath(f), html);
  }
  const datum = (p) => [map.get(p), dateFields(info.get(p)).visible].filter(Boolean).sort().at(-1);
  const out = [];
  for (const [path, html] of info) {
    const cfgHub = (cfg.hubs || []).find((h) => h.hub === path);
    const links = new Set([...mainHtml(html).matchAll(/<a\b[^>]*?\shref="([^"#?]+)/gi)].map((m) => { try { return new URL(m[1], 'https://x.nl/').pathname; } catch { return m[1]; } }));
    if (!cfgHub && (cfg.notHub || []).includes(path)) continue;
    const kids = [...links].filter((l) => l !== path && info.has(l) && (cfgHub ? cfgHub.children.test(l) : (path !== '/' && l.startsWith(path))));
    if (!kids.length) continue;
    const max = kids.map(datum).filter(Boolean).sort().at(-1);
    const d = dateFields(html), lm = map.get(path);
    const fout = [];
    if (d.visible && d.visible < max) fout.push(`zichtbaar ${d.visible}`);
    if (lm && lm < max) fout.push(`lastmod ${lm}`);
    if (fout.length) out.push(`${path}: hub ouder dan nieuwste kind ${max} (${kids.filter((k) => datum(k) === max).join(', ')}): ${fout.join(', ')}`);
  }
  return out;
}

// --- B. Naamgrep over ALLE geserveerde bestanden ---------------------------------------------------------------------------
// Case-insensitive 'dave', 'wester', 'gmail'. Toegestaan (smal, per site): ALLOW_NAME = [{file: RegExp, match: RegExp, reden}];
// match wordt getest op de treffer plus precies 1 teken ervoor en erna (dus 'Gmail' als productnaam, niet 'x@gmail.com');
// optioneel ctx: RegExp op 80 tekens rond de treffer (exacte string, bv. de volledige Moza-URL met ?ref=DAVIDWEST).
export const NAME_RE = /dave|wester|gmail|davidwest|david[\s_-]+west/gi; // + davidwest (zoals NAME_RE in sitecheck.py)
export function nameGrep(outDir, allow = []) {
  const hits = [];
  for (const f of walk(outDir)) {
    const buf = readFileSync(join(outDir, f));
    const s = buf.toString('latin1');
    for (const m of s.matchAll(NAME_RE)) {
      const ctx = s.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40).replace(/[^\x20-\x7e]+/g, ' ');
      const tight = s.slice(Math.max(0, m.index - 1), m.index + m[0].length + 1); // treffer + 1 teken eromheen
      const wide = s.slice(Math.max(0, m.index - 80), m.index + m[0].length + 80);
      if (allow.some((a) => a.file.test(f) && a.match.test(tight) && (!a.ctx || a.ctx.test(wide)))) continue;
      hits.push(`${f}: …${ctx}…`);
    }
  }
  return hits;
}

// --- B. Repo-root-404: alleen geserveerde bestanden in de output -----------------------------------------------------------
export const REPO_ONLY = /^(package(-lock)?\.json|README(\.md)?|LICENSE(\.md|\.txt)?|AUTEURS\.md|build\.mjs|\.gitignore|\.github\/.*|node_modules\/.*|scripts\/.*|tests?\/.*|src\/.*|content\/.*|.*\.py|.*\.patch|.*\.md|js\/lib\/logo-rechten\.js|logo-bronnen\.md)$/i;
// Geserveerde JS die door geen enkele pagina (transitief) geladen wordt = build-only module die in de output lekt.
export function repoRoot404(outDir, { allowOrphans = [] } = {}) {
  const files = walk(outDir);
  const fout = files.filter((f) => REPO_ONLY.test(f)).map((f) => `${f}: repo-/buildbestand in de output`);
  const used = new Set();
  for (const f of files.filter((x) => x.endsWith('.html'))) for (const d of scriptDeps(outDir, readFileSync(join(outDir, f), 'utf8'), f)) used.add(d);
  // Dynamisch geladen (bv. sc.src = "/assets/vendor/x.js" of import('./x.js') in een geladen script) telt ook als gebruikt.
  for (let n = -1; n !== used.size;) {
    n = used.size;
    const bronnen = [...used].filter((u) => /\.(m?js|cjs)$/.test(u) && existsSync(join(outDir, u))).map((u) => readFileSync(join(outDir, u), 'utf8'));
    for (const f of files.filter((x) => /\.(m?js|cjs)$/.test(x) && !used.has(x))) {
      const naam = f.split('/').pop().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (bronnen.some((b) => new RegExp(`["'\`](?:\\.{0,2}/)*(?:[\\w./-]*/)?${naam}(?:\\?[^"'\`]*)?["'\`]`).test(b) && b.includes(f.split('/').pop()))) used.add(f);
    }
  }
  for (const f of files.filter((x) => /\.(m?js|cjs)$/.test(x))) if (!used.has(f) && !allowOrphans.some((r) => r.test(f))) fout.push(`${f}: geen pagina laadt dit script (build-only?)`);
  return fout;
}

// CLI: node scripts/l7check.mjs  (exit 0 = groen, 1 = bevindingen). Gebruikt l7.config.mjs uit dezelfde map.
if (import.meta.url === `file://${process.argv[1]}`) {
  const here = dirname(process.argv[1]);
  const { CFG, ALLOW_NAME = [], BEKEND_ORPHAN = [], BEKEND_HUB = [], BEKEND_L7 = [] } = await import(join(here, 'l7.config.mjs'));
  const root = git(here, ['rev-parse', '--show-toplevel']);
  const r = runL7(root, CFG);
  console.log(r.skipped ? `L7 overgeslagen: ${r.skipped}` : `L7 basis ${r.base.slice(0, 7)} (${r.how}) tip ${r.tip === 'WORKTREE' ? 'werkmap' : r.tip.slice(0, 7)} pushdatum ${r.pushDate}`);
  for (const l of r.report || []) console.log('  ' + l);
  for (const f of (r.failures || []).filter((f) => isBekend(f, BEKEND_L7))) console.log('BEKEND L7 | ' + f);
  const fout = [...(r.failures || []).filter((f) => !isBekend(f, BEKEND_L7)).map((f) => 'L7 | ' + f)];
  const tmp = mkdtempSync(join(tmpdir(), 'naamgrep-'));
  try {
    materialize(root, process.env.L7_TIP || 'WORKTREE', tmp);
    const env = { ...process.env }; if (process.env.PUSH_DATE) env.BUILD_DATE = process.env.PUSH_DATE;
    const out = CFG.build(tmp, env);
    fout.push(...hubAudit(out, CFG).filter((h) => !isBekend(h, BEKEND_HUB)).map((f) => 'hub-audit | ' + f));
    for (const h of hubAudit(out, CFG).filter((h) => isBekend(h, BEKEND_HUB))) console.log('BEKEND hub-audit | ' + h);
    fout.push(...nameGrep(out, ALLOW_NAME).map((f) => 'naamgrep | ' + f));
    fout.push(...repoRoot404(out, { allowOrphans: BEKEND_ORPHAN.map((b) => b.re) }).map((f) => 'repo-root-404 | ' + f));
  } finally { rmSync(tmp, { recursive: true, force: true }); }
  console.log(fout.length ? fout.join('\n') : 'OK: L7, hub-audit, naamgrep en repo-root-404 groen');
  process.exit(fout.length ? 1 : 0);
}
