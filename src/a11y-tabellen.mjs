// Scrollbare tabellen bereikbaar met het toetsenbord (axe scrollable-region-focusable; audit 20-10-2026).
// Elke <div class="table-wrap"> (of "tbl") krijgt tabindex="0", role="region" en een label uit de caption of de kolomkoppen.
// Een lege kopcel krijgt verborgen tekst (axe empty-table-header, Lighthouse td-has-header).
const tekst = (h) => h.replace(/<img[^>]*alt="([^"]*)"[^>]*>/g, ' $1 ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

export function a11yTabellen(html, { srClass = 'sr-only', leeg = 'Onderdeel' } = {}) {
  return html.replace(/<div class="(table-wrap|tbl)">(\s*<table[^>]*>)([\s\S]*?<\/table>)/g, (m, cls, open, rest) => {
    const cap = rest.match(/<caption[^>]*>([\s\S]*?)<\/caption>/);
    const thead = rest.match(/<thead>[\s\S]*?<\/thead>/)?.[0] || '';
    const koppen = [...thead.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((x) => tekst(x[1])).filter(Boolean);
    const label = cap ? tekst(cap[1]) : koppen.length ? `Tabel: ${koppen.join(', ')}` : 'Tabel';
    const body = rest.replace(/<th( scope="col")?><\/th>/g, (t, sc) => `<th${sc || ''}><span class="${srClass}">${leeg}</span></th>`);
    return `<div class="${cls}" tabindex="0" role="region" aria-label="${label.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">${open}${body}`;
  });
}
