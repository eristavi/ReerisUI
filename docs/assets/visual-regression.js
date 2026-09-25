const params = new URLSearchParams(location.search);
const root = document.documentElement;
const theme = params.get('theme') || 'system';
const density = params.get('density') || 'default';
const direction = params.get('dir') || 'ltr';
const radius = params.get('radius') || 'default';
const elevation = params.get('elevation') || 'default';
const motion = params.get('motion') || 'none';

if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
else delete root.dataset.theme;
root.dataset.density = density;
root.dataset.radius = radius;
root.dataset.elevation = elevation;
root.dataset.motion = motion;
root.dir = direction;

const output = document.querySelector('[data-visual-settings]');
if (output) output.textContent = `theme=${theme} · density=${density} · dir=${direction} · radius=${radius} · elevation=${elevation}`;
