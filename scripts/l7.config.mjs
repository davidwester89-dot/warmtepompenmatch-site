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
};
export const ALLOW_NAME = [];
export const BEKEND_ORPHAN = []; // SC 30-10 besluit 2: geserveerd = publiek, geen allowlist; build-only modules uit de output (zie build.mjs)
// Hub-audit: bestaande bevindingen op origin/main (30-10). Haal een regel weg zodra de hub is gefixt; dan bewaakt de test hem.
export const BEKEND_HUB = [
  { pad: '/gidsen/', reden: 'gidsenoverzicht: lastmod 2026-10-17, kind /warmtepomp-geluid/ 2026-10-30 (30-10, inhoudsfix niet in deze commit; SC/MM beslist)' },
  { pad: '/merken/', reden: 'merkenoverzicht 2026-10-29, /merken/daikin/ en /merken/quatt/ 2026-10-30 (30-10, inhoudsfix niet in deze commit; SC/MM beslist)' },
];
