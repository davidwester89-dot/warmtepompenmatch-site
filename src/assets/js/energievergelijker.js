// Daisycon Energievergelijker: script pas na expliciete keuze op deze pagina.
// Los van de cookiemelding voor statistieken (wm-consent).
import { shouldLoadWidget, saveEnergyConsent, loadWidgetScript } from './lib/energievergelijker.js';

const root = document.querySelector('[data-energy-tool]');
if (root) {
  let store;
  try { store = window.localStorage; } catch { store = { getItem: () => null, setItem() {} }; }

  const ph = root.querySelector('.energy-ph');
  const slot = root.querySelector('.dc-energy-tool');

  function show() {
    loadWidgetScript(document);
    if (ph) ph.hidden = true;
    if (slot) slot.hidden = false;
    root.dataset.energyLoaded = '1';
  }

  if (shouldLoadWidget(store)) show();
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-energy-accept]');
    if (!b) return;
    saveEnergyConsent(store, 'granted');
    show();
  });
}
