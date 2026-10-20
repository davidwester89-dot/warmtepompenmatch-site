// Escape sluit het mobiele menu (details.menu) en zet de focus terug op de menuknop.
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  for (const d of document.querySelectorAll('details.menu[open]')) {
    d.open = false;
    d.querySelector('summary')?.focus();
  }
});
