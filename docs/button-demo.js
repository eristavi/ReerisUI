const themeButton = document.querySelector('#toggle-theme');
const rtlButton = document.querySelector('#toggle-rtl');

themeButton?.addEventListener('click', () => {
  document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
});

rtlButton?.addEventListener('click', () => {
  document.documentElement.dir = document.documentElement.dir === 'rtl' ? 'ltr' : 'rtl';
});
