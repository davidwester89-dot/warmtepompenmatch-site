// Siteconfig voor scripts/l7check.mjs (L7-datumcheck, naamgrep, repo-root-404). Wijzigingen in exempt/BEKEND_* alleen met SC-OK.
import { execSync, execFileSync } from 'node:child_process';
import { join } from 'node:path';
export const CFG = {
  // Geen datumlift door alleen een gewijzigd kind; bij eigen body geldt de gewone L7-plicht.
  // /vergelijken/ erbij (17-11, neutrale merkknoppen op de vs-pagina's): hub zonder eigen bodywijziging, niet liften (stijlbesluit 10-11, zoals TM). Vraagt SC-OK.
  bodyOnlyHubs: ["/blog/", "/gidsen/", "/merken/", "/vergelijken/"],
  build: (dir, env) => { execSync('node build.mjs', { cwd: dir, env, stdio: 'ignore' }); return join(dir, 'dist'); },
  hubs: [{ hub: '/gidsen/', children: /^\/[^/]+\/$/ }],
  // E-CTA-1 (plan MM 17-11, Dave via GB2): de CTA-blokken A/C (src/e-cta.mjs) tellen niet als bodywijziging; geen datum-lift. Vraagt SC-OK.
  // Remeha → Groenpand (SEO-review 484cf28): zichtbare knoptekst + partnerzin telt wél als bodywijziging; geen stripCta, echte datumlift 26-11.
  stripCta: [
    /<aside class="ecta[^"]*"[^>]*data-ecta="[AC]"[^>]*>[\s\S]*?<\/aside>/g,
  ],
  // Alleen ONTBREKENDE velden die de template van deze pagina niet heeft. Een aanwezig veld moet altijd kloppen.
  exempt: {
    '/warmtepomp-keuzehulp/': ['zichtbaar'], // keuzehulp zonder enige zichtbare datum: lastmod + dateModified verplicht (SC 30-10, besluit 3)
  },
  requireDateModified: ['/warmtepomp-keuzehulp/'], // WebApplication-JSON-LD moet dateModified (= lastmod) krijgen
  // Automatisch gegenereerde teaser 'Meer op de blog' onder elke post (src/blog.mjs) telt niet als bodywijziging van die post (L7: geen datum bij alleen een nieuwe teaser). Vraagt SC-OK.
  stripBlocks: [/<h2>Meer op de blog<\/h2><div class="grid cards two">[\s\S]*?<\/div>/],
};
export const ALLOW_NAME = [];
export const BEKEND_ORPHAN = []; // SC 30-10 besluit 2: geserveerd = publiek, geen allowlist; build-only modules uit de output (zie build.mjs)
// Hub-audit: bestaande bevindingen op origin/main (30-10). Haal een regel weg zodra de hub is gefixt; dan bewaakt de test hem.
export const BEKEND_HUB = []; // /gidsen/ gefixt 03-11 (zichtbare bijgewerkt-regel + lastmod), hub-audit bewaakt hem weer
export const BEKEND_L7 = [];
