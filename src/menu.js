import { DRIVERS, CONFIG } from './drivers.js';

export class MenuDrawer {
  constructor(options) {
    this.triggerBtn = options.triggerBtn;
    this.drawerEl = options.drawerEl;
    this.closeBtn = options.closeBtn;
    this.onSelectDriver = options.onSelectDriver || (() => {});
    this.isOpen = false;

    this.init();
  }

  init() {
    this.renderDriversList();
    this.bindEvents();
  }

  renderDriversList() {
    const listEl = this.drawerEl.querySelector('.menu-drivers-list');
    if (!listEl) return;

    listEl.innerHTML = DRIVERS.map((driver) => `
      <button class="menu-driver-card" data-driver-index="${driver.index}" aria-label="Select ${driver.name}">
        <div class="menu-driver-thumb-wrap">
          <img src="${driver.thumbnail}" alt="${driver.name}" class="menu-driver-thumb" />
        </div>
        <div class="menu-driver-info">
          <span class="menu-driver-number">#${driver.number}</span>
          <h3 class="menu-driver-name">${driver.name}</h3>
          <p class="menu-driver-team">${driver.team}</p>
        </div>
        <div class="menu-driver-arrow">→</div>
      </button>
    `).join('');

    listEl.querySelectorAll('.menu-driver-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.driverIndex, 10);
        this.onSelectDriver(idx);
        this.close();
      });
    });
  }

  bindEvents() {
    if (this.triggerBtn) {
      this.triggerBtn.addEventListener('click', () => this.toggle());
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Backdrop click
    this.drawerEl.addEventListener('click', (e) => {
      if (e.target === this.drawerEl) {
        this.close();
      }
    });

    // Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.drawerEl.classList.add('is-open');
    this.drawerEl.setAttribute('aria-hidden', 'false');
    this.triggerBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-locked');

    // Focus close button or first focusable item
    if (this.closeBtn) {
      this.closeBtn.focus();
    }
  }

  close() {
    this.isOpen = false;
    this.drawerEl.classList.remove('is-open');
    this.drawerEl.setAttribute('aria-hidden', 'true');
    this.triggerBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-locked');

    if (this.triggerBtn) {
      this.triggerBtn.focus();
    }
  }

  updateActiveDriver(index) {
    const cards = this.drawerEl.querySelectorAll('.menu-driver-card');
    cards.forEach((card, i) => {
      if (i === index) {
        card.classList.add('is-active');
      } else {
        card.classList.remove('is-active');
      }
    });
  }
}
