// Filters en sortering op /vergelijken/. Alleen tonen of verbergen; de volgorde komt uit de data (score, dan naam).
const form = document.getElementById('filters');
const tbody = document.querySelector('#matrix tbody');
const rows = [...tbody.rows];
const count = document.getElementById('f-count');
const empty = document.getElementById('f-empty');
const sort = document.getElementById('f-sort');

function apply() {
  const need = [...form.querySelectorAll('input[name=need]:checked')].map((i) => i.value);
  let n = 0;
  for (const r of rows) {
    const ok = need.every((k) => r.dataset[k] === 'ja' || r.dataset[k] === 'deels');
    r.hidden = !ok; if (ok) n++;
  }
  count.textContent = `${n} van ${rows.length} merken`;
  empty.hidden = n > 0;
}
function order() {
  const naam = (a, b) => a.dataset.naam.localeCompare(b.dataset.naam, 'nl');
  const by = sort.value === 'naam' ? naam : (a, b) => b.dataset.score - a.dataset.score || naam(a, b);
  [...rows].sort(by).forEach((r) => tbody.appendChild(r));
}
form.addEventListener('change', apply);
form.addEventListener('submit', (e) => e.preventDefault());
sort.addEventListener('change', order);
apply();
