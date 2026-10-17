// Bevestigingspagina: één keer per sessie het GA4-event generate_lead (zonder persoonsgegevens).
import { LEADS } from './lib/leads.config.js';
import { CATEGORIEEN } from './lib/leads.js';
import { track } from './consent.js';
const q = new URLSearchParams(location.search);
const m = q.get('m'), p = q.get('p');
if (m in CATEGORIEEN && p in LEADS) {
  document.getElementById('b-lead').textContent = `Bedankt. ${LEADS[p].type === 'voorbeeld' ? 'Onze offertepartner' : LEADS[p].naam} heeft je aanvraag voor ${CATEGORIEEN[m].naam.toLowerCase()} ontvangen.`;
  let s; try { s = sessionStorage; } catch { s = null; }
  const key = `wpm-lead-${m}-${p}`;
  if (!s || !s.getItem(key)) { track('generate_lead', { maatregel: m, partner: p, lead_source: 'offerte_module' }); try { s && s.setItem(key, '1'); } catch { /* geen opslag */ } }
}
history.replaceState(null, '', location.pathname);
