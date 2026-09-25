const ITEM_SELECTOR = '.nav-link, .tab, [data-reeris-glide-item]';
const ACTIVE_SELECTOR = '[aria-current="page"], [aria-selected="true"], .active';

/**
 * Optional moving-indicator enhancement for Reeris navigation.
 * CSS remains fully usable when this module is absent.
 */
export class GlideNavigation {
  constructor(element, options = {}) {
    if (!(element instanceof Element)) throw new TypeError('GlideNavigation requires a DOM Element.');

    this.element = element;
    this.options = {
      itemSelector: options.itemSelector || element.dataset.reerisGlideItems || ITEM_SELECTOR,
      activeSelector: options.activeSelector || ACTIVE_SELECTOR,
      followFocus: options.followFocus !== false
    };

    this._abort = new AbortController();
    this._resizeObserver = null;
    this._activeItem = null;

    this.refresh();
    this._bind();
    this.element.dataset.reerisGlideReady = '';
  }

  _items() {
    return [...this.element.querySelectorAll(this.options.itemSelector)]
      .filter(item => !item.closest('[aria-hidden="true"]'));
  }

  _findActive() {
    return this._items().find(item => item.matches(this.options.activeSelector)) || null;
  }

  _bind() {
    const signal = this._abort.signal;

    this.element.addEventListener('pointerover', event => {
      if (event.pointerType === 'touch') return;
      const item = event.target.closest(this.options.itemSelector);
      if (item && this.element.contains(item)) this.moveTo(item);
    }, { signal });

    this.element.addEventListener('pointerleave', () => this.restore(), { signal });

    if (this.options.followFocus) {
      this.element.addEventListener('focusin', event => {
        const item = event.target.closest(this.options.itemSelector);
        if (item && this.element.contains(item)) this.moveTo(item);
      }, { signal });
      this.element.addEventListener('focusout', event => {
        if (!this.element.contains(event.relatedTarget)) this.restore();
      }, { signal });
    }

    this.element.addEventListener('scroll', () => this.restore(false), { signal, passive: true });

    if ('ResizeObserver' in globalThis) {
      this._resizeObserver = new ResizeObserver(() => this.restore(false));
      this._resizeObserver.observe(this.element);
      for (const item of this._items()) this._resizeObserver.observe(item);
    } else {
      globalThis.addEventListener?.('resize', () => this.restore(false), { signal });
    }
  }

  moveTo(item, animate = true) {
    if (!item || !this.element.contains(item)) return;

    const rootRect = this.element.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const x = itemRect.left - rootRect.left + this.element.scrollLeft;
    const y = itemRect.top - rootRect.top + this.element.scrollTop;

    if (!animate) this.element.dataset.reerisGlideInstant = '';

    this.element.style.setProperty('--_reeris-glide-x', `${x}px`);
    this.element.style.setProperty('--_reeris-glide-y', `${y}px`);
    this.element.style.setProperty('--_reeris-glide-width', `${itemRect.width}px`);
    this.element.style.setProperty('--_reeris-glide-height', `${itemRect.height}px`);
    this.element.style.setProperty('--_reeris-glide-opacity', '1');

    if (!animate) {
      requestAnimationFrame(() => delete this.element.dataset.reerisGlideInstant);
    }
  }

  restore(animate = true) {
    this._activeItem = this._findActive();
    if (this._activeItem) this.moveTo(this._activeItem, animate);
    else this.element.style.setProperty('--_reeris-glide-opacity', '0');
  }

  refresh() {
    this._activeItem = this._findActive();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver.observe(this.element);
      for (const item of this._items()) this._resizeObserver.observe(item);
    }
    this.restore(false);
    return this;
  }

  destroy() {
    this._abort.abort();
    this._resizeObserver?.disconnect();
    delete this.element.dataset.reerisGlideReady;
    delete this.element.dataset.reerisGlideInstant;
    for (const name of ['--_reeris-glide-x','--_reeris-glide-y','--_reeris-glide-width','--_reeris-glide-height','--_reeris-glide-opacity']) {
      this.element.style.removeProperty(name);
    }
  }
}

export default GlideNavigation;
