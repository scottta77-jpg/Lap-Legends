/**
 * Lap Legends - Shopping Bag Drawer & Cart State
 * Handles adding items, quantity updates, slide-out drawer, and checkout to Amazon storefront.
 */

import { AMAZON_STORE_URL } from './products.js';

class CartStore {
  constructor() {
    this.storageKey = 'lap_legends_cart_v1';
    this.items = this.loadCart();
    this.listeners = new Set();
  }

  loadCart() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
    this.notify();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.getState());
    return () => this.listeners.delete(callback);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  getState() {
    const totalCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      items: this.items,
      totalCount,
      subtotal: subtotal.toFixed(2),
      formattedSubtotal: `£${subtotal.toFixed(2)} GBP`
    };
  }

  addItem(product, styleId = null, quantity = 1) {
    const chosenStyle = product.styles.find(s => s.id === styleId) || product.styles[0];
    const key = `${product.id}_${chosenStyle.id}`;
    
    const existing = this.items.find(i => i.key === key);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        key,
        id: product.id,
        title: product.title,
        shortTitle: product.shortTitle,
        price: product.price,
        formattedPrice: product.formattedPrice,
        styleId: chosenStyle.id,
        styleLabel: chosenStyle.label,
        image: chosenStyle.image,
        format: product.format,
        quantity,
        amazonUrl: product.amazonUrl || AMAZON_STORE_URL
      });
    }

    this.saveCart();
  }

  updateQuantity(key, delta) {
    const item = this.items.find(i => i.key === key);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.items = this.items.filter(i => i.key !== key);
    }
    this.saveCart();
  }

  removeItem(key) {
    this.items = this.items.filter(i => i.key !== key);
    this.saveCart();
  }

  clear() {
    this.items = [];
    this.saveCart();
  }
}

export const cart = new CartStore();

export class CartDrawerUI {
  constructor(options = {}) {
    this.drawerEl = options.drawerEl || document.getElementById('cartDrawer');
    this.triggerBtns = options.triggerBtns || document.querySelectorAll('.js-cart-trigger');
    this.closeBtn = options.closeBtn || document.getElementById('cartCloseBtn');
    this.itemsContainer = options.itemsContainer || document.getElementById('cartItemsList');
    this.countBadges = document.querySelectorAll('.js-cart-count');
    this.subtotalEl = document.getElementById('cartSubtotalAmount');
    this.checkoutBtn = document.getElementById('cartCheckoutBtn');
    this.emptyStateEl = document.getElementById('cartEmptyState');
    this.footerEl = document.getElementById('cartFooter');

    this.isOpen = false;
    this.init();
  }

  init() {
    this.bindEvents();
    cart.subscribe(this.render.bind(this));
  }

  bindEvents() {
    this.triggerBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.drawerEl) {
      this.drawerEl.addEventListener('click', (e) => {
        if (e.target === this.drawerEl) {
          this.close();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    if (this.checkoutBtn) {
      this.checkoutBtn.addEventListener('click', () => {
        window.open(AMAZON_STORE_URL, '_blank', 'noopener,noreferrer');
      });
    }
  }

  open() {
    if (!this.drawerEl) return;
    this.isOpen = true;
    this.drawerEl.classList.add('is-open');
    this.drawerEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-open');
  }

  close() {
    if (!this.drawerEl) return;
    this.isOpen = false;
    this.drawerEl.classList.remove('is-open');
    this.drawerEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-open');
  }

  render(state) {
    // Update count badges across header and buttons
    this.countBadges.forEach(badge => {
      badge.textContent = state.totalCount;
      badge.style.display = state.totalCount > 0 ? 'inline-flex' : 'none';
    });

    if (this.subtotalEl) {
      this.subtotalEl.textContent = state.formattedSubtotal;
    }

    if (!this.itemsContainer) return;

    if (state.items.length === 0) {
      if (this.emptyStateEl) this.emptyStateEl.style.display = 'flex';
      if (this.footerEl) this.footerEl.style.display = 'none';
      this.itemsContainer.innerHTML = '';
      return;
    }

    if (this.emptyStateEl) this.emptyStateEl.style.display = 'none';
    if (this.footerEl) this.footerEl.style.display = 'block';

    this.itemsContainer.innerHTML = state.items.map(item => `
      <div class="cart-item" data-key="${item.key}">
        <div class="cart-item-thumb">
          <img src="${item.image}" alt="${item.title}" />
        </div>
        <div class="cart-item-details">
          <div class="cart-item-top">
            <h4 class="cart-item-title">${item.title}</h4>
            <button class="cart-item-remove js-remove-item" data-key="${item.key}" aria-label="Remove item">&times;</button>
          </div>
          <div class="cart-item-meta">
            <span class="cart-item-style">STYLE: ${item.styleLabel}</span>
            <span class="cart-item-format">${item.format}</span>
          </div>
          <div class="cart-item-bottom">
            <div class="cart-item-qty-stepper">
              <button class="qty-btn js-qty-minus" data-key="${item.key}" aria-label="Decrease quantity">−</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn js-qty-plus" data-key="${item.key}" aria-label="Increase quantity">+</button>
            </div>
            <span class="cart-item-price">£${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        </div>
      </div>
    `).join('');

    // Bind item actions
    this.itemsContainer.querySelectorAll('.js-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        cart.removeItem(btn.dataset.key);
      });
    });

    this.itemsContainer.querySelectorAll('.js-qty-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        cart.updateQuantity(btn.dataset.key, -1);
      });
    });

    this.itemsContainer.querySelectorAll('.js-qty-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        cart.updateQuantity(btn.dataset.key, 1);
      });
    });
  }
}
