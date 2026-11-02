// Siteconfig voor scripts/l7check.mjs (L7-datumcheck, naamgrep, repo-root-404). Wijzigingen in exempt/BEKEND_* alleen met SC-OK.
import { execSync, execFileSync } from 'node:child_process';
import { join } from 'node:path';
export const CFG = {
  build: (dir, env) => { execSync('node build.mjs', { cwd: dir, env, stdio: 'ignore' }); return join(dir, 'dist'); },
  hubs: [{ hub: '/gidsen/', children: /^\/[^/]+\/$/ }],
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
// L7-hubregel D (SC 02-11): /gidsen/ krijgt 2026-10-30 = deploy nieuwste kind (30-10 12:51 CET), eigen bodywijziging laatst 26-10;
// de nieuwe zichtbare regel telt voor l7check als bodywijziging, maar de inhoud verandert niet. Smal en met vervaldatum; weg na de push van 3-11.
export const BEKEND_L7 = [
  { pad: '/gidsen/', alleen: /^\/gidsen\/ \(bodywijziging; verwacht \d{4}-\d{2}-\d{2}\): zichtbaar 2026-10-30, lastmod 2026-10-30$/, tot: '2026-11-08', reden: 'hubdatum D = 2026-10-30 (deploy nieuwste kind), geen inhoudswijziging; geen D-regel in deze l7check' },
];
