// Logo's in tabelcellen (Dave 30-10): staat in een tabelcel precies de naam van een aanbieder, dan komt het
// logo van die aanbieder erboven, in een vast vak (zelfde maat voor iedereen, partner of niet).
// Alleen beeld: tekst, volgorde, links en rel-attributen blijven exact zoals ze waren.
// Werkt op de gebouwde html, dus ook op tabellen uit markdown (blogs, gidsen).

const ESC = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const tekst = (h) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;|&#160;/g, ' ').replace(/\s+/g, ' ').trim();

/** merken: [{ namen: ['Shopify', ...], src: '/logos/shopify.svg', merk: 'Shopify' }]. maat: [breedte, hoogte].
 *  productrijen: ook de eerste cel van een rij die begint met "<merk> " (bv. "Sessy 5 kWh"), max. 60 tekens. */
export function maakLogoCellen(merken, { maat = [80, 24], cls = 'cel-logo', productrijen = false } = {}) {
  const index = new Map();
  for (const m of merken) for (const n of m.namen) index.set(n, m);
  const img = (m) => `<span class="${cls}"><img src="${ESC(m.src)}" alt="${ESC(m.merk)} logo" width="${maat[0]}" height="${maat[1]}" loading="lazy" decoding="async"></span>`;
  return function logoCellen(html) {
    const prefix = (t) => { if (!productrijen || t.length > 60) return null; for (const [n, m] of index) if (t.startsWith(n + ' ')) return m; return null; };
    return html.replace(/<table\b[\s\S]*?<\/table>/g, (tbl) => tbl.replace(/<tr\b[\s\S]*?<\/tr>/g, (rij) => {
      let eerste = true;
      return rij.replace(/<(th|td)\b([^>]*)>([\s\S]*?)<\/\1>/g, (cel, tag, attr, inner) => {
        const isEerste = eerste; eerste = false;
        if (/<img\b|class="[^"]*\b(rowlogo|thlogo|cel-logo|wordmark)\b/.test(inner)) return cel;
        const t = tekst(inner);
        const m = index.get(t) || (isEerste && !/scope="col"/.test(attr) ? prefix(t) : null);
        return m ? `<${tag}${attr}>${img(m)}${inner}</${tag}>` : cel;
      });
    }));
  };
}
