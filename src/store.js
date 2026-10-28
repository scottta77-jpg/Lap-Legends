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

    // Collection section filter pills (Circuit Art and Driver Art)
    document.querySelectorAll('.collection-pills-row').forEach(row => {
      const pills = row.querySelectorAll('.collection-pill');
      const section = row.closest('.collection-section');
      const cards = section ? section.querySelectorAll('.collection-card') : [];

      pills.forEach(pill => {
        pill.addEventListener('click', () => {
          pills.forEach(p => p.classList.remove('is-active'));
          pill.classList.add('is-active');
          const filter = pill.dataset.filter || 'all';

          cards.forEach(card => {
            const cardCat = card.dataset.category || '';
            if (filter === 'all' || cardCat === filter) {
              card.classList.remove('is-hidden');
            } else {
              card.classList.add('is-hidden');
            }
          });
        });
      });
    });
  }

  handleRoute() {
    const rawHash = window.location.hash || '';
    const hash = rawHash.split('?')[0];

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
      if (hash.startsWith('#shop') || rawHash.includes('category=')) {
        const query = rawHash.includes('?') ? rawHash.split('?')[1] : '';
        const params = new URLSearchParams(query);
        const cat = params.get('category') || 'all';
        this.setFilter(cat);
        const grid = document.getElementById('shopCatalogSection');
        if (grid) {
          setTimeout(() => grid.scrollIntoView({ behavior: 'smooth' }), 60);
        }
      } else {
        this.activeFilter = 'all';
        this.renderCatalog();
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
    if (window.driverStage) {
      window.driverStage.resume();
    }
    if (window.pufferStage) {
      window.pufferStage.resume();
    }
    const bgVideo = document.querySelector('.hero-bg-video');
    if (bgVideo && bgVideo.paused && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      bgVideo.play().catch(() => {});
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
    if (window.driverStage) {
      window.driverStage.pause();
    }
    if (window.pufferStage) {
      window.pufferStage.pause();
    }
    const bgVideo = document.querySelector('.hero-bg-video');
    if (bgVideo && !bgVideo.paused) {
      bgVideo.pause();
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
    if (window.driverStage) {
      window.driverStage.pause();
    }
    if (window.pufferStage) {
      window.pufferStage.pause();
    }
    const bgVideo = document.querySelector('.hero-bg-video');
    if (bgVideo && !bgVideo.paused) {
      bgVideo.pause();
    }

    this.renderProductPage(product);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  renderCatalog() {
    if (!this.catalogGridEl) return;

    const rawHash = window.location.hash || '';
    const hash = rawHash.split('?')[0];
    const isStoreHome = !hash || hash === '#store' || hash === '#home';
    const titleEl = document.querySelector('.fan-favourites-title');
    const viewAllEl = document.querySelector('.fan-favourites-view-all');

    let filtered = getProductsByCategory(this.activeFilter);

    if (isStoreHome && this.activeFilter === 'all') {
      const fanFavouriteIds = ['lando-norris', 'lewis-hamilton', 'silverstone', 'race-calendar'];
      filtered = fanFavouriteIds.map(id => getProductById(id)).filter(Boolean);
      if (titleEl) titleEl.textContent = 'FAN FAVOURITES';
      if (viewAllEl) {
        viewAllEl.textContent = 'VIEW ALL →';
        viewAllEl.href = '#shop';
      }
    } else {
      if (titleEl) {
        if (this.activeFilter === 'drivers') titleEl.textContent = 'DRIVER PRINTS';
        else if (this.activeFilter === 'circuits') titleEl.textContent = 'CIRCUIT ART';
        else if (this.activeFilter === 'calendars') titleEl.textContent = 'RACE CALENDARS';
        else titleEl.textContent = 'ALL PRINTS';
      }
      if (viewAllEl) {
        viewAllEl.textContent = 'FAN FAVOURITES →';
        viewAllEl.href = '#store';
      }
    }

    this.catalogGridEl.innerHTML = filtered.map(product => {
      const defaultImg = product.styles.find(s => s.id === product.defaultStyle)?.image || product.styles[0].image;
      const displayImg = product.homeFrame || defaultImg;

      return `
        <article class="product-card" data-product-id="${product.id}">
          <a href="#product/${product.id}" class="product-card-link js-open-product" data-product-id="${product.id}" aria-label="View ${product.title}">
            <div class="product-card-media">
              <img src="${displayImg}" alt="${product.title}" class="product-card-img" loading="lazy" />
              <button type="button" class="product-card-quick-add js-quick-add" data-product-id="${product.id}" aria-label="Add ${product.shortTitle || product.title} to bag">
                + BAG
              </button>
            </div>
            <div class="product-card-info">
              <h3 class="product-card-title">${product.shortTitle || product.title}</h3>
              <span class="product-card-price">£${product.price.toFixed(2)}</span>
            </div>
          </a>
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
          <span class="breadcrumb-current">${product.shortTitle || product.title}</span>
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
                  <div class="pdp-dimension-box" id="pdpDimensionBox" title="Click to view full dimension markings in showcase">
                    <img src="/assets/products/frame_spec.png" alt="Black Frame Dimensions (22.5cm x 32.5cm)" class="pdp-dimension-img" id="pdpDimensionThumb" />
                    <div class="pdp-dimension-info">
                      <strong>Black Wooden Profile (22.5 × 32.5 cm)</strong>
                      <span>Includes rear fold-out easel support and dual wall mounting brackets for vertical or horizontal placement.</span>
                      <span class="pdp-dimension-action">CLICK TO VIEW IN SHOWCASE ↗</span>
                    </div>
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
            <div class="fan-favourites-header">
              <h2 class="fan-favourites-title">YOU MIGHT ALSO LIKE</h2>
            </div>
            <div class="fan-favourites-grid">
              ${relatedProducts.map(rel => `
                <article class="product-card" data-product-id="${rel.id}">
                  <a href="#product/${rel.id}" class="product-card-link js-open-product" data-product-id="${rel.id}" aria-label="View ${rel.title}">
                    <div class="product-card-media">
                      <img src="${rel.homeFrame || rel.styles[0].image}" alt="${rel.title}" class="product-card-img" loading="lazy" />
                      <button type="button" class="product-card-quick-add js-quick-add" data-product-id="${rel.id}" aria-label="Add ${rel.shortTitle || rel.title} to bag">
                        + BAG
                      </button>
                    </div>
                    <div class="product-card-info">
                      <h3 class="product-card-title">${rel.shortTitle || rel.title}</h3>
                      <span class="product-card-price">£${rel.price.toFixed(2)}</span>
                    </div>
                  </a>
                </article>
              `).join('')}
            </div>
          </div>
        </section>

        <!-- =========================================================================
             LANDO NORRIS STORE PRODUCT DETAIL PAGE (PDP) FOOTER
             (Exact replica from landonorris.store/products/the-worker-jacket)
             ========================================================================= -->
        <footer id="shopify-section-radiant-footer" class="shopify-section radiant-footer pdp-store-footer">
          <div class="radiant-footer-inner">
            <!-- Top Area -->
            <div class="top-area">
              <div class="footer-flex flex f-grid--xl">

                <!-- Column 1: LAP LEGENDS -->
                <div class="footer-col footer-col--brand">
                  <h4 class="footer-heading">LAP LEGENDS</h4>
                  <ul class="footer-links-list">
                    <li><a href="#about" class="footer-pdp-link js-open-story">About Us</a></li>
                    <li><a href="#store" class="footer-pdp-link">Store Home</a></li>
                    <li><a href="#shop" class="footer-pdp-link">Framed Prints</a></li>
                    <li><a href="#circuitArtSection" class="footer-pdp-link">Circuit Collection</a></li>
                    <li><a href="#landing" class="footer-pdp-link">Interactive Showcase ⚡</a></li>
                  </ul>
                </div>

                <!-- Column 2: SUPPORT -->
                <div class="footer-col footer-col--support">
                  <h4 class="footer-heading">SUPPORT</h4>
                  <ul class="footer-links-list">
                    <li><a href="#support" class="footer-pdp-link js-open-support">FAQ's</a></li>
                    <li><a href="#support" class="footer-pdp-link js-open-support">Manage Pre-orders</a></li>
                    <li><a href="#support" class="footer-pdp-link js-open-support">Delivery Info (Free UK Tracked)</a></li>
                    <li><a href="#support" class="footer-pdp-link js-open-support">Returns & Refunds (30-Day)</a></li>
                    <li><a href="#support" class="footer-pdp-link js-open-support">Privacy Policy</a></li>
                    <li><a href="mailto:support@laplegends.com" class="footer-pdp-link">Withdraw Orders - EU</a></li>
                  </ul>
                </div>

                <!-- Column 3: SOCIAL -->
                <div class="footer-col footer-col--social">
                  <h4 class="footer-heading">SOCIAL</h4>
                  <div class="footer-socials-grid">
                    <a href="https://www.instagram.com/lando" target="_blank" rel="noopener noreferrer" class="social-icon-link" aria-label="Instagram">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                      <span>Instagram</span>
                    </a>
                    <a href="https://www.tiktok.com/@landonorris" target="_blank" rel="noopener noreferrer" class="social-icon-link" aria-label="TikTok">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.48 6.27 6.27 0 0 0 1.94-4.52V8.92a8.28 8.28 0 0 0 4.83 1.54V7.01a4.85 4.85 0 0 1-1-.32z"/>
                      </svg>
                      <span>TikTok</span>
                    </a>
                    <a href="https://www.youtube.com/@LandoNorris" target="_blank" rel="noopener noreferrer" class="social-icon-link" aria-label="YouTube">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span>YouTube</span>
                    </a>
                    <a href="https://www.twitch.tv/landonorris" target="_blank" rel="noopener noreferrer" class="social-icon-link" aria-label="Twitch">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                      </svg>
                      <span>Twitch</span>
                    </a>
                    <a href="https://twitter.com/landonorris" target="_blank" rel="noopener noreferrer" class="social-icon-link" aria-label="X Twitter">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span>X (Twitter)</span>
                    </a>
                  </div>
                </div>

                <!-- Column 4: JOIN THE PADDOCK -->
                <div class="footer-col footer-col--newsletter">
                  <h4 class="footer-heading">JOIN THE PADDOCK</h4>
                  <p class="newsletter-sub">Unlock exclusive access to new driver drops, limited releases and paddock events.</p>
                  <form class="pdp-newsletter-form" id="pdpNewsletterForm" onsubmit="event.preventDefault(); this.querySelector('.newsletter-submit-btn').textContent = '✓ JOINED!'; this.querySelector('input').disabled = true;">
                    <div class="newsletter-input-group">
                      <input type="email" required placeholder="YOUR EMAIL ADDRESS" class="newsletter-email-input" aria-label="Email address" />
                      <button type="submit" class="newsletter-submit-btn">SIGN UP</button>
                    </div>
                  </form>
                </div>

              </div>
            </div>

            <!-- Bottom Area -->
            <div class="bottom-area">
              <div class="bottom-flex">
                <div class="bottom-left">
                  <span class="pdp-footer-copyright">© 2026 LAP LEGENDS. ALL RIGHTS RESERVED.</span>
                  <a href="mailto:business@landonorris.com" class="pdp-business-link">BUSINESS ENQUIRIES ↗</a>
                </div>
                <div class="bottom-right">
                  <div class="payment-methods-row" aria-label="Payment methods">
                    <span class="pay-badge">VISA</span>
                    <span class="pay-badge">MC</span>
                    <span class="pay-badge">AMEX</span>
                    <span class="pay-badge">PAY</span>
                    <span class="pay-badge">GPAY</span>
                    <span class="pay-badge">PAYPAL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
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
        if (styleCaption) {
          if (nextImgUrl.includes('frame_spec')) {
            styleCaption.textContent = 'Black Frame Specifications & Dimension Markings (22.5cm × 32.5cm)';
          } else {
            const activeStyle = product.styles.find(s => s.id === this.selectedStyleId) || product.styles[0];
            styleCaption.textContent = activeStyle.caption || '';
          }
        }
        counterEl.textContent = `0${this.currentGalleryIndex + 1} / 0${product.gallery.length}`;
        sound.playRevealWhoosh(0.3);
      });
    }

    // Click on dimension preview box to switch showcase directly to the frame dimensions
    const dimBox = this.pdpViewEl.querySelector('#pdpDimensionBox');
    if (dimBox && mainImg) {
      dimBox.addEventListener('click', () => {
        const frameIndex = product.gallery.findIndex(img => img.includes('frame_spec'));
        if (frameIndex !== -1) {
          this.currentGalleryIndex = frameIndex;
          if (counterEl) {
            counterEl.textContent = `0${frameIndex + 1} / 0${product.gallery.length}`;
          }
        }
        mainImg.style.opacity = '0';
        setTimeout(() => {
          mainImg.src = '/assets/products/frame_spec.png';
          mainImg.style.opacity = '1';
        }, 150);
        if (styleCaption) {
          styleCaption.textContent = 'Black Frame Specifications & Dimension Markings (22.5cm × 32.5cm)';
        }
        // If on mobile or scrolled down, smoothly scroll to showcase
        const showcase = this.pdpViewEl.querySelector('.pdp-framed-showcase');
        if (showcase && window.innerWidth < 900) {
          showcase.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        sound.playRevealWhoosh(0.3);
      });
    }
  }
}
