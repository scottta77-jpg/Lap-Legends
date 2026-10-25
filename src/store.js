/**
 * Lap Legends - Store & Product Detail Page (PDP) Controller
 * Manages separate page views (Landing Page vs Store Homepage vs PDP),
 * catalog filtering, style switching, accordions, gallery carousels, and routing.
 */

import { PRODUCTS, getProductById, getProductsByCategory, AMAZON_STORE_URL } from './products.js';
import { cart } from './cart.js';
import { sound } from './audio.js';

export class StoreManager {
  constructor(options = {}) {
    this.cartDrawer = options.cartDrawer;
    this.heroStage = options.heroStage || null;
    this.activeFilter = 'all';
    this.currentProduct = null;
    this.selectedStyleId = null;
    this.selectedQuantity = 1;
    this.currentGalleryIndex = 0;

    this.landingViewEl = document.getElementById('landingView');
    this.storeWrapperEl = document.getElementById('storeViewsWrapper');
    this.homeViewEl = document.getElementById('storeHomeView');
    this.pdpViewEl = document.getElementById('storePdpView');
    this.catalogGridEl = document.getElementById('catalogGrid');
    this.filterBtns = document.querySelectorAll('.js-filter-tab');

    this.init();
  }

  setHeroStage(stage) {
    this.heroStage = stage;
  }

  init() {
    this.renderCatalog();
    this.bindEvents();
    this.handleRoute();
  }

  bindEvents() {
    // Hash change router (multi-page state switching)
    window.addEventListener('hashchange', () => this.handleRoute());

    // Catalog filter buttons
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        this.activeFilter = btn.dataset.category || 'all';
        this.renderCatalog();
      });
    });

    // Category banner cards
    document.querySelectorAll('.js-cat-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = card.dataset.category;
        this.navigateToCatalog(cat);
      });
    });

    // Delegated product link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('.js-open-product');
      if (link) {
        e.preventDefault();
        const id = link.dataset.productId;
        this.navigateToProduct(id);
      }
    });

    // Quick add to bag button clicks in catalog
    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('.js-quick-add');
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = addBtn.dataset.productId;
        const prod = getProductById(id);
        if (prod) {
          cart.addItem(prod, prod.defaultStyle, 1);
          sound.playDriverSwitch();
          if (this.cartDrawer) this.cartDrawer.open();
        }
      }
    });
  }

  handleRoute() {
    const hash = window.location.hash || '';

    // Route 1: Landing Page (Default: /, #, #/, #landing)
    if (!hash || hash === '#' || hash === '#/' || hash === '#landing') {
      this.showLandingView();
    }
    // Route 3: Individual Product Detail Page (#product/:id)
    else if (hash.startsWith('#product/')) {
      const id = hash.replace('#product/', '').trim();
      this.showProductDetail(id);
    }
    // Route 2: Store Homepage (#store, #home, #shop...)
    else {
      this.showStoreHomeView();
      if (hash.startsWith('#shop')) {
        const query = hash.replace(/^#shop\??/, '');
        const params = new URLSearchParams(query);
        const cat = params.get('category') || 'all';
        this.setFilter(cat);
        const grid = document.getElementById('shopCatalogSection');
        if (grid) {
          setTimeout(() => grid.scrollIntoView({ behavior: 'smooth' }), 60);
        }
      }
    }
  }

  navigateToProduct(productId) {
    window.location.hash = `#product/${productId}`;
  }

  navigateToCatalog(category = 'all') {
    window.location.hash = `#shop?category=${category}`;
  }

  navigateToStore() {
    window.location.hash = '#store';
  }

  navigateToLanding() {
    window.location.hash = '#landing';
  }

  setFilter(category) {
    this.activeFilter = category;
    this.filterBtns.forEach(b => {
      b.classList.toggle('is-active', (b.dataset.category || 'all') === category);
    });
    this.renderCatalog();
  }

  showLandingView() {
    document.body.classList.add('page-is-landing');
    document.body.classList.remove('page-is-store', 'page-is-pdp');

    if (this.landingViewEl) this.landingViewEl.style.display = 'block';
    if (this.storeWrapperEl) this.storeWrapperEl.style.display = 'none';

    if (this.heroStage) {
      this.heroStage.resume();
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  showStoreHomeView() {
    document.body.classList.remove('page-is-landing', 'page-is-pdp');
    document.body.classList.add('page-is-store');

    if (this.landingViewEl) this.landingViewEl.style.display = 'none';
    if (this.storeWrapperEl) this.storeWrapperEl.style.display = 'block';
    if (this.homeViewEl) this.homeViewEl.style.display = 'block';
    if (this.pdpViewEl) this.pdpViewEl.style.display = 'none';

    if (this.heroStage) {
      this.heroStage.pause();
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  showProductDetail(productId) {
    const product = getProductById(productId) || PRODUCTS[0];
    this.currentProduct = product;
    this.selectedStyleId = product.defaultStyle;
    this.selectedQuantity = 1;
    this.currentGalleryIndex = 0;

    document.body.classList.remove('page-is-landing');
    document.body.classList.add('page-is-pdp');

    if (this.landingViewEl) this.landingViewEl.style.display = 'none';
    if (this.storeWrapperEl) this.storeWrapperEl.style.display = 'block';
    if (this.homeViewEl) this.homeViewEl.style.display = 'none';
    if (this.pdpViewEl) this.pdpViewEl.style.display = 'block';

    if (this.heroStage) {
      this.heroStage.pause();
    }

    this.renderProductPage(product);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  renderCatalog() {
    if (!this.catalogGridEl) return;

    const filtered = getProductsByCategory(this.activeFilter);

    this.catalogGridEl.innerHTML = filtered.map(product => {
      const defaultImg = product.styles.find(s => s.id === product.defaultStyle)?.image || product.styles[0].image;

      return `
        <article class="catalog-product-card" data-product-id="${product.id}">
          <a href="#product/${product.id}" class="card-visual-link js-open-product" data-product-id="${product.id}" aria-label="View ${product.title}">
            <div class="card-frame-box">
              <img src="${defaultImg}" alt="${product.title}" class="card-print-img" loading="lazy" />
              <div class="card-overlay-badge">
                <span>VIEW PRINT</span>
              </div>
            </div>
          </a>
          <div class="card-info-box">
            <h3 class="card-title">
              <a href="#product/${product.id}" class="js-open-product" data-product-id="${product.id}">
                ${product.title}
              </a>
            </h3>
            <div class="card-price-row">
              <span class="card-price">£${product.price.toFixed(2)} GBP</span>
              <button class="quick-add-btn js-quick-add" data-product-id="${product.id}" aria-label="Quick add ${product.title} to bag">
                + BAG
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  renderProductPage(product) {
    if (!this.pdpViewEl) return;

    const activeStyle = product.styles.find(s => s.id === this.selectedStyleId) || product.styles[0];

    // Related products (excluding current)
    const relatedProducts = PRODUCTS.filter(p => p.id !== product.id).slice(0, 4);

    this.pdpViewEl.innerHTML = `
      <div class="pdp-wrapper">
        <!-- Top Breadcrumbs -->
        <nav class="pdp-breadcrumbs" aria-label="Breadcrumbs">
          <a href="#store" class="breadcrumb-link">HOME</a>
          <span class="breadcrumb-sep">/</span>
          <a href="#shop" class="breadcrumb-link">SHOP</a>
          <span class="breadcrumb-sep">/</span>
          <a href="#shop?category=${product.category}" class="breadcrumb-link">${product.categoryLabel || 'DRIVER PRINTS'}</a>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">${product.title}</span>
        </nav>

        <!-- Main Product Section (Mockup Image 1 Reference) -->
        <div class="pdp-main-grid">
          <!-- Left Column: Specs, Selector, and Direct Amazon Purchase -->
          <div class="pdp-info-col">
            <span class="pdp-category-eyebrow">${product.categoryLabel || 'DRIVER PRINTS'}</span>
            <h1 class="pdp-title">${product.title}</h1>
            <div class="pdp-price-wrap">
              <span class="pdp-price">£${product.price.toFixed(2)} GBP</span>
            </div>

            <p class="pdp-description">${product.description}</p>

            <!-- Style Selector Buttons -->
            <div class="pdp-style-selector">
              <span class="pdp-section-label">SELECT STYLE</span>
              <div class="style-options-group" role="radiogroup" aria-label="Select print style">
                ${product.styles.map(style => `
                  <button type="button"
                    class="style-option-btn ${style.id === this.selectedStyleId ? 'is-active' : ''}"
                    data-style-id="${style.id}"
                    role="radio"
                    aria-checked="${style.id === this.selectedStyleId ? 'true' : 'false'}">
                    ${style.label}
                  </button>
                `).join('')}
              </div>
              <div class="pdp-style-caption" id="pdpStyleCaption">${activeStyle.caption || ''}</div>
            </div>

            <!-- Format Spec -->
            <div class="pdp-format-row">
              <span class="format-label">FORMAT:</span>
              <span class="format-value">${product.format}</span>
            </div>

            <!-- Actions Block -->
            <div class="pdp-actions-block">
              <div class="pdp-qty-and-cta">
                <div class="qty-select-wrap">
                  <select id="pdpQtySelect" class="pdp-qty-select" aria-label="Select quantity">
                    <option value="1" ${this.selectedQuantity === 1 ? 'selected' : ''}>QTY: 1</option>
                    <option value="2" ${this.selectedQuantity === 2 ? 'selected' : ''}>QTY: 2</option>
                    <option value="3" ${this.selectedQuantity === 3 ? 'selected' : ''}>QTY: 3</option>
                    <option value="4" ${this.selectedQuantity === 4 ? 'selected' : ''}>QTY: 4</option>
                    <option value="5" ${this.selectedQuantity === 5 ? 'selected' : ''}>QTY: 5</option>
                  </select>
                  <span class="qty-select-arrow" aria-hidden="true">▾</span>
                </div>

                <!-- Primary CTA: Direct Amazon Store Link -->
                <a href="${product.amazonUrl || AMAZON_STORE_URL}"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="pdp-amazon-btn"
                   id="pdpAmazonBtn"
                   aria-label="Buy ${product.title} on Amazon">
                  <span>BUY NOW ON AMAZON</span>
                  <svg class="pdp-btn-arrow" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </a>
              </div>

              <!-- Secondary CTA: Add to Bag Drawer -->
              <button type="button" class="pdp-bag-btn" id="pdpAddToBagBtn" aria-label="Add ${product.title} to bag">
                ADD TO BAG
              </button>

              <p class="pdp-signature-note">${product.signature || 'Reproduced digital signature.'}</p>
            </div>
          </div>

          <!-- Right Column: Massive Framed Product Display -->
          <div class="pdp-gallery-col">
            <div class="pdp-framed-showcase">
              <div class="showcase-main-frame">
                <img src="${activeStyle.image}"
                     alt="${product.title} - ${activeStyle.label} Style in Black Frame"
                     class="showcase-img"
                     id="showcaseMainImg" />
              </div>

              <div class="showcase-controls">
                <span class="showcase-counter" id="showcaseCounter">01 / 0${product.gallery.length}</span>
                <button class="showcase-next-btn" id="showcaseNextBtn" aria-label="Next image">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Dark Olive Feature Banner & Accordions Section (Mockup Image 1 Reference) -->
        <section class="pdp-feature-banner">
          <div class="pdp-feature-inner">
            <div class="pdp-feature-statement">
              <h2>
                The drivers you follow. The moments you remember.<br>
                <span>Framed for your space.</span>
              </h2>
            </div>

            <!-- Expandable Information Accordions -->
            <div class="pdp-accordions-group">
              <!-- Accordion 1: Product Details (Open by Default) -->
              <details class="pdp-accordion-item" open>
                <summary class="pdp-accordion-trigger">
                  <span>PRODUCT DETAILS</span>
                  <span class="accordion-arrow">▾</span>
                </summary>
                <div class="pdp-accordion-content">
                  <ul class="pdp-details-list">
                    ${product.details.map(item => `<li>${item}</li>`).join('')}
                  </ul>
                </div>
              </details>

              <!-- Accordion 2: Dimensions -->
              <details class="pdp-accordion-item">
                <summary class="pdp-accordion-trigger">
                  <span>DIMENSIONS</span>
                  <span class="accordion-arrow">▾</span>
                </summary>
                <div class="pdp-accordion-content">
                  <div class="pdp-specs-grid">
                    <div><strong>Print Size:</strong> ${product.dimensions.print}</div>
                    <div><strong>Frame Outer:</strong> ${product.dimensions.frame}</div>
                    <div><strong>Depth:</strong> ${product.dimensions.depth || '18 mm solid wood'}</div>
                    <div><strong>Glazing:</strong> ${product.dimensions.glazing || 'Optical-grade styrene'}</div>
                  </div>
                </div>
              </details>

              <!-- Accordion 3: Care Guide -->
              <details class="pdp-accordion-item">
                <summary class="pdp-accordion-trigger">
                  <span>CARE GUIDE</span>
                  <span class="accordion-arrow">▾</span>
                </summary>
                <div class="pdp-accordion-content">
                  <p>${product.care || 'Wipe frame gently with a clean, dry microfibre cloth. Avoid household spray detergents directly on glazing. Hang away from direct prolonged harsh sunlight.'}</p>
                </div>
              </details>

              <!-- Accordion 4: Delivery & Returns -->
              <details class="pdp-accordion-item">
                <summary class="pdp-accordion-trigger">
                  <span>DELIVERY & RETURNS</span>
                  <span class="accordion-arrow">▾</span>
                </summary>
                <div class="pdp-accordion-content">
                  <p><strong>UK Tracked Shipping:</strong> FREE on all framed prints (2-3 working days via Royal Mail Tracked 24/48).</p>
                  <p><strong>Amazon Prime Fulfillment:</strong> Next-day delivery available via the direct Amazon button.</p>
                  <p><strong>Hassle-Free Returns:</strong> 30-day money-back guarantee if returned in original protective packaging.</p>
                </div>
              </details>
            </div>
          </div>
        </section>

        <!-- "YOU MIGHT ALSO LIKE" Related Products Section (Mockup Image 1 Reference) -->
        <section class="pdp-related-section">
          <div class="section-container">
            <h2 class="related-heading">YOU MIGHT ALSO LIKE</h2>
            <div class="related-products-grid">
              ${relatedProducts.map(rel => `
                <article class="related-card">
                  <a href="#product/${rel.id}" class="related-card-link js-open-product" data-product-id="${rel.id}">
                    <div class="related-frame-box">
                      <img src="${rel.styles[0].image}" alt="${rel.title}" class="related-img" loading="lazy" />
                    </div>
                    <div class="related-meta">
                      <h3 class="related-title">${rel.title}</h3>
                      <span class="related-price">£${rel.price.toFixed(2)} GBP</span>
                    </div>
                  </a>
                </article>
              `).join('')}
            </div>
          </div>
        </section>
      </div>

      <!-- Shared Store Footer -->
      <footer class="site-global-footer">
        <div class="footer-top-row">
          <div class="footer-col brand-col">
            <a href="#store" class="footer-brand-link">
              <img src="/assets/logo_transparent.png" alt="Lap Legends" class="footer-logo-img" />
            </a>
            <p class="footer-tagline">Motorsport, made personal. Premium framed driver portraits, circuit topography and race calendars.</p>
          </div>
          <div class="footer-col links-col">
            <h4 class="footer-col-title">LAP LEGENDS</h4>
            <a href="#shop">SHOP</a>
            <a href="#about" class="js-open-story">OUR STORY</a>
            <a href="#contact" class="js-open-story">CONTACT</a>
            <a href="#landing">INTERACTIVE HERO ⚡</a>
          </div>
          <div class="footer-col links-col">
            <h4 class="footer-col-title">SUPPORT</h4>
            <a href="#delivery" class="js-open-delivery">DELIVERY</a>
            <a href="#returns" class="js-open-delivery">RETURNS</a>
            <a href="#faqs" class="js-open-support">FAQS</a>
          </div>
          <div class="footer-col newsletter-col">
            <h4 class="footer-col-title">STAY IN THE LOOP</h4>
            <p class="newsletter-sub">Receive new driver drop alerts and circuit release updates.</p>
            <form class="newsletter-form" onsubmit="event.preventDefault(); alert('Thank you for subscribing to Lap Legends updates!');">
              <input type="email" placeholder="YOUR EMAIL ADDRESS" required class="newsletter-input" aria-label="Your email address" />
              <button type="submit" class="newsletter-submit" aria-label="Subscribe">→</button>
            </form>
          </div>
        </div>
        <div class="footer-bottom-row">
          <p class="copyright">© 2024 LAP LEGENDS. ALL RIGHTS RESERVED.</p>
          <div class="footer-socials">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">IG</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X">X</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">YT</a>
          </div>
        </div>
      </footer>
    `;

    this.bindPdpEvents(product);
  }

  bindPdpEvents(product) {
    const styleBtns = this.pdpViewEl.querySelectorAll('.style-option-btn');
    const mainImg = this.pdpViewEl.querySelector('#showcaseMainImg');
    const styleCaption = this.pdpViewEl.querySelector('#pdpStyleCaption');
    const qtySelect = this.pdpViewEl.querySelector('#pdpQtySelect');
    const addToBagBtn = this.pdpViewEl.querySelector('#pdpAddToBagBtn');
    const nextBtn = this.pdpViewEl.querySelector('#showcaseNextBtn');
    const counterEl = this.pdpViewEl.querySelector('#showcaseCounter');

    // Style switcher
    styleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        styleBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        this.selectedStyleId = btn.dataset.styleId;

        const foundStyle = product.styles.find(s => s.id === this.selectedStyleId) || product.styles[0];
        if (mainImg) {
          mainImg.style.opacity = '0';
          setTimeout(() => {
            mainImg.src = foundStyle.image;
            mainImg.style.opacity = '1';
          }, 150);
        }
        if (styleCaption) {
          styleCaption.textContent = foundStyle.caption || '';
        }
        sound.playDriverSwitch();
      });
    });

    // Quantity selector
    if (qtySelect) {
      qtySelect.addEventListener('change', (e) => {
        this.selectedQuantity = parseInt(e.target.value, 10) || 1;
      });
    }

    // Add to bag
    if (addToBagBtn) {
      addToBagBtn.addEventListener('click', () => {
        cart.addItem(product, this.selectedStyleId, this.selectedQuantity);
        sound.playDriverSwitch();
        if (this.cartDrawer) {
          this.cartDrawer.open();
        }
      });
    }

    // Gallery carousel next button
    if (nextBtn && counterEl) {
      nextBtn.addEventListener('click', () => {
        this.currentGalleryIndex = (this.currentGalleryIndex + 1) % product.gallery.length;
        const nextImgUrl = product.gallery[this.currentGalleryIndex];
        if (mainImg) {
          mainImg.style.opacity = '0';
          setTimeout(() => {
            mainImg.src = nextImgUrl;
            mainImg.style.opacity = '1';
          }, 150);
        }
        counterEl.textContent = `0${this.currentGalleryIndex + 1} / 0${product.gallery.length}`;
        sound.playRevealWhoosh(0.3);
      });
    }
  }
}
