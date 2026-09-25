import GlideNavigation from './glide-navigation.js';

const instances = new WeakMap();

export { GlideNavigation };

export function init(container = document) {
  const roots = [];
  if (container instanceof Element && container.matches('[data-reeris-glide]')) roots.push(container);
  roots.push(...container.querySelectorAll?.('[data-reeris-glide]') || []);

  for (const element of roots) {
    if (!instances.has(element)) instances.set(element, new GlideNavigation(element));
  }
  return roots.map(element => instances.get(element));
}

export function destroy(container = document) {
  const roots = [];
  if (container instanceof Element && container.matches('[data-reeris-glide]')) roots.push(container);
  roots.push(...container.querySelectorAll?.('[data-reeris-glide]') || []);

  for (const element of roots) {
    instances.get(element)?.destroy();
    instances.delete(element);
  }
}

export function getInstance(element) {
  return instances.get(element) || null;
}

function autoInit() {
  init(document);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoInit, { once: true });
  else queueMicrotask(autoInit);
}
