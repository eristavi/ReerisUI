// Apply a saved documentation preference before the stylesheet renders.
try {
  const theme = localStorage.getItem('reeris-docs-theme');
  if (theme === 'light' || theme === 'dark' || theme === 'glass') document.documentElement.dataset.theme = theme;
} catch {
  // Storage may be disabled; the system color scheme remains the default.
}
