// Kleine markdown-omzetter zonder afhankelijkheden, genoeg voor blogartikelen.
// Ondersteunt: frontmatter, ## en ### koppen, alinea's, - en 1. lijsten, > kaders,
// eenvoudige tabellen met |, **vet**, *cursief* en [links](https://...).

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function parseFrontmatter(src) {
  const m = src.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error('Frontmatter (tussen --- regels) ontbreekt');
  const meta = {};
  let lastKey = null;
  for (const line of m[1].split('\n')) {
    if (!line.trim()) continue;
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && lastKey) { (meta[lastKey] = Array.isArray(meta[lastKey]) ? meta[lastKey] : []).push(item[1].trim()); continue; }
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!kv) throw new Error('Onbekende frontmatter-regel: ' + line);
    lastKey = kv[1];
    meta[kv[1]] = kv[2].trim().replace(/^"(.*)"$/, '$1');
  }
  return { meta, body: m[2] };
}

export function inline(s) {
  let out = esc(s);
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, href) => {
    const ext = /^https?:/.test(href);
    return `<a href="${href}"${ext ? ' rel="noopener"' : ''}>${t}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  return out;
}

export function markdown(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let i = 0;
  const isBlockStart = (l) => /^(#{2,3}\s|[-*]\s|\d+\.\s|>\s?|\|)/.test(l);
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = l.match(/^(#{2,3})\s+(.*)$/))) {
      const lvl = m[1].length;
      const id = m[2].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      html.push(`<h${lvl} id="${id}">${inline(m[2])}</h${lvl}>`); i++; continue;
    }
    if (/^[-*]\s/.test(l) || /^\d+\.\s/.test(l)) {
      const ordered = /^\d+\.\s/.test(l);
      const items = [];
      while (i < lines.length && (ordered ? /^\d+\.\s/ : /^[-*]\s/).test(lines[i])) {
        let t = lines[i].replace(/^([-*]|\d+\.)\s+/, ''); i++;
        while (i < lines.length && /^\s{2,}\S/.test(lines[i])) { t += ' ' + lines[i].trim(); i++; }
        items.push(`<li>${inline(t)}</li>`);
      }
      html.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`); continue;
    }
    if (/^>/.test(l)) {
      const buf = [];
      while (i < lines.length && /^>/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      html.push(`<blockquote>${buf.join('\n').split(/\n\s*\n/).map((p) => `<p>${inline(p.replace(/\n/g, ' '))}</p>`).join('')}</blockquote>`); continue;
    }
    if (/^\|/.test(l)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(rows[1] && /^\|[\s:-]+\|/.test(rows[1]) ? 2 : 1).map(cells);
      html.push(`<div class="table-wrap"><table class="data"><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    const buf = [l]; i++;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) { buf.push(lines[i]); i++; }
    html.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  return html.join('\n');
}

export function wordCount(md) {
  return md.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[#>*|`-]/g, ' ').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** Lees een blogbestand (content/blog/JJJJ-MM-DD-slug.md) en geef een post-object terug. */
export function parsePost(filename, src) {
  const fm = filename.match(/^(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)\.md$/);
  if (!fm) throw new Error(`Bestandsnaam moet JJJJ-MM-DD-slug.md zijn: ${filename}`);
  const { meta, body } = parseFrontmatter(src);
  for (const k of ['title', 'description', 'date', 'updated']) if (!meta[k]) throw new Error(`${filename}: '${k}' ontbreekt in de frontmatter`);
  const sources = (meta.sources || []).map((s) => { const [t, u] = s.split(/\s+\|\s+/); return { title: t, url: u }; });
  const tools = String(meta.tools || '').split(',').map((s) => s.trim()).filter(Boolean);
  return {
    file: filename, slug: fm[2], path: `/blog/${fm[2]}/`,
    title: meta.title, seoTitle: meta.seo_title || meta.title, description: meta.description,
    date: meta.date, updated: meta.updated, checked: meta.checked || null, tools, sources,
    // Optionele afbeelding: src/assets/img/blog/<image>-1200.webp en -600.webp (1200×630 en 600×315).
    image: meta.image ? { name: meta.image, alt: meta.image_alt || '', caption: meta.image_caption || '' } : null, md: body, html: markdown(body), words: wordCount(body),
  };
}
