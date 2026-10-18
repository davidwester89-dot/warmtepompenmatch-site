import { execSync } from 'node:child_process';
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
export const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
export const read = (p) => readFileSync(p, 'utf8');
export const buildLive = () => execSync('node build.mjs', { env: { ...process.env, BASE: '', PREVIEW: '', GO_LIVE: '1', LEADS_PREVIEW: '' } });
export const buildPreview = () => execSync('node build.mjs', { env: { ...process.env, BASE: '/warmtepompenmatch-site', GO_LIVE: '', LEADS_PREVIEW: '' } });
export const htmlFiles = () => walk('dist').filter((f) => f.endsWith('.html') && !/\/google[0-9a-f]+\.html$/.test(f));
export const DOMAIN = 'https://warmtepompenmatch.nl';
