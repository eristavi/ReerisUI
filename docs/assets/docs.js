for (const input of document.querySelectorAll('[data-docs-filter]')) {
  const name = input.dataset.docsFilter;
  const table = document.querySelector(`[data-docs-table="${CSS.escape(name)}"]`);
  if (!table) continue;
  const rows = [...table.querySelectorAll('[data-docs-row]')];
  const filter = () => {
    const query = input.value.trim().toLocaleLowerCase();
    for (const row of rows) row.hidden = Boolean(query) && !row.textContent.toLocaleLowerCase().includes(query);
  };
  input.addEventListener('input', filter);
}
