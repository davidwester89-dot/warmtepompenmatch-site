# WarmtepompenMatch.nl

Onafhankelijke keuzehulp en vergelijker voor warmtepompen: keuzehulp, 8 merkpagina's met een vaste checklist van 10 punten, vergelijkingen, gidsen (kosten, terugverdientijd, ISDE 2026, hybride of all-electric, geluid, geschiktheid) en een rekenhulp voor de terugverdientijd.

- Statische build zonder framework: `npm run build` → `dist/`
- Tests: `npm test` (logica, site, SEO, leads)
- Lokaal: `npm run serve` (poort 8083)
- Controle layout/tapdoelen: `node scripts/check-layout.mjs http://localhost:8083`
- Screenshots: `node scripts/screenshots.mjs http://localhost:8083`

Varianten:
- Testversie: `BASE=/warmtepompenmatch-site` → noindex, robots `Disallow: /`, geen CNAME.
- Live (pas na akkoord): `BASE=` en `GO_LIVE=1` → CNAME warmtepompenmatch.nl, indexeerbaar.

Regels: alle bedragen en checklistpunten met bron (naam + link). Partners tellen nooit mee in score, volgorde of advies. Offertemodule staat uit zolang `LEADPARTNERS` leeg is; partnerlinks zijn leeg tot een goedgekeurd partnerprogramma.
