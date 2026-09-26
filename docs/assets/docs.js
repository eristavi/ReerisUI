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

const directorySearch = document.querySelector('[data-docs-directory-search]');
if (directorySearch) {
  const sections = [...document.querySelectorAll('[data-docs-directory-section]')];
  const empty = document.querySelector('[data-docs-directory-empty]');
  directorySearch.addEventListener('input', () => {
    const query = directorySearch.value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const section of sections) {
      let sectionVisible = 0;
      for (const card of section.querySelectorAll('[data-docs-directory-card]')) {
        card.hidden = Boolean(query) && !card.textContent.toLocaleLowerCase().includes(query);
        if (!card.hidden) sectionVisible++;
      }
      section.hidden = sectionVisible === 0;
      visible += sectionVisible;
    }
    empty.hidden = visible !== 0;
  });
}
