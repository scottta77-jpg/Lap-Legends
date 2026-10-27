import { DRIVERS, CONFIG } from './drivers.js';
import { KimiRevealStage } from './kimi-reveal.js';
import { MenuDrawer } from './menu.js';
import { sound } from './audio.js';
import { CartDrawerUI } from './cart.js';
import { StoreManager } from './store.js';
import { DriverLandingStage } from './driver-landing.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('lapLegendsHero');
  const stageElement = document.getElementById('heroStage');
  const preloader = document.getElementById('preloader');
  const counterEl = document.getElementById('driverCounter');
  const progressBars = document.querySelectorAll('.progress-line-fill');
  const thumbnails = document.querySelectorAll('.thumbnail-btn');
  const hintEl = document.getElementById('revealHint');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const menuDrawerEl = document.getElementById('menuDrawer');
  const menuCloseBtn = document.getElementById('menuCloseBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const reducedMotionToggleBtn = document.getElementById('reducedMotionToggleBtn');
  const drawerShopBtn = document.getElementById('drawerShopBtn');
  const enterStoreBtn = document.getElementById('enterStoreBtn');
  const infoModal = document.getElementById('infoModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  // Mask Reveal toggle (kept fully preserved in codebase so it can be reinstated anytime)
  const ENABLE_MASK_REVEAL = false;

  // Background seamless dual-buffer video crossfader (for mask reveal)
  const videoA = document.getElementById('heroBgVideoA');
  const videoB = document.getElementById('heroBgVideoB');

  if (ENABLE_MASK_REVEAL && videoA && videoB) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      videoA.pause();
      videoB.pause();
    } else {
      const crossfadeDuration = 1.4; // in seconds
      let activeVideo = videoA;
      let nextVideo = videoB;
      let isTransitioning = false;

      videoA.classList.add('is-active');
      videoB.classList.remove('is-active');
      videoA.play().catch(() => {});

      const triggerCrossfade = () => {
        if (isTransitioning) return;
        isTransitioning = true;

        nextVideo.currentTime = 0;
        nextVideo.play().then(() => {
          nextVideo.classList.add('is-active');
          activeVideo.classList.remove('is-active');

          setTimeout(() => {
            activeVideo.pause();
            activeVideo.currentTime = 0;
            const temp = activeVideo;
            activeVideo = nextVideo;
            nextVideo = temp;
            isTransitioning = false;
          }, crossfadeDuration * 1000);
        }).catch((err) => {
          console.warn('Seamless video swap failed:', err);
          isTransitioning = false;
        });
      };

      const checkVideoLoop = () => {
        if (activeVideo && activeVideo.duration && !isTransitioning) {
          const timeLeft = activeVideo.duration - activeVideo.currentTime;
          if (timeLeft <= crossfadeDuration) {
            triggerCrossfade();
          }
        }
        requestAnimationFrame(checkVideoLoop);
      };

      videoA.addEventListener('timeupdate', () => {
        if (activeVideo === videoA && !isTransitioning && videoA.duration) {
          if (videoA.duration - videoA.currentTime <= crossfadeDuration) {
            triggerCrossfade();
          }
        }
      });

      videoB.addEventListener('timeupdate', () => {
        if (activeVideo === videoB && !isTransitioning && videoB.duration) {
          if (videoB.duration - videoB.currentTime <= crossfadeDuration) {
            triggerCrossfade();
          }
        }
      });

      requestAnimationFrame(checkVideoLoop);
    }
  }

  // Initialize Cart Drawer
  const cartDrawer = new CartDrawerUI();

  // Initialize Full Store & PDP Controller
  const storeManager = new StoreManager({ cartDrawer });

  // Sound toggle button
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      const isSoundOn = sound.toggleMute();
      soundToggleBtn.classList.toggle('is-active', isSoundOn);
      soundToggleBtn.setAttribute('aria-pressed', isSoundOn ? 'true' : 'false');
      soundToggleBtn.querySelector('.sound-status').textContent = isSoundOn ? 'ON' : 'OFF';
      if (isSoundOn) {
        sound.playDriverSwitch();
      }
    });
  }

  // UI State updater for active hero driver
  function updateUI(driverIndex) {
    // Update Counter
    if (counterEl) {
      counterEl.textContent = `#12 / KIMI ANTONELLI`;
    }

    // Update Progress Bars
    progressBars.forEach((bar) => {
      bar.style.opacity = '1';
    });

    if (menuDrawer) {
      menuDrawer.updateActiveDriver(driverIndex);
    }
  }

  // Progress Bar tick callback
  function onProgressTick(driverIndex, progress) {
    if (progressBars[0]) {
      progressBars[0].style.transform = `scaleX(${progress})`;
      progressBars[0].style.opacity = '1';
    }
  }

  // Initialize WebGL Hero Stage for Kimi Antonelli Phase 1 Automatic Reveal (only if enabled)
  let heroStage = null;
  if (ENABLE_MASK_REVEAL && container && stageElement) {
    heroStage = new KimiRevealStage({
      container,
      stageElement,
      onProgress: onProgressTick,
    });
    storeManager.setHeroStage(heroStage);
    window.heroStage = heroStage;
  }

  // Always initialize store route
  storeManager.handleRoute();

  // Initialize Menu Drawer (for mask reveal)
  let menuDrawer = null;
  if (ENABLE_MASK_REVEAL && hamburgerBtn && menuDrawerEl) {
    menuDrawer = new MenuDrawer({
      triggerBtn: hamburgerBtn,
      drawerEl: menuDrawerEl,
      closeBtn: menuCloseBtn,
      onSelectDriver: (index) => {
        if (heroStage) {
          heroStage.switchToDriver(index);
        }
      },
    });
  }

  if (drawerShopBtn) {
    drawerShopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      menuDrawer.close();
      window.location.hash = '#store';
    });
  }

  // Enter Store button from Landing Page -> Takes user to Store Homepage
  if (enterStoreBtn) {
    enterStoreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sound.playDriverSwitch();
      window.location.hash = '#store';
    });
  }

  // Initialize Lap Legends Driver Landing Stage (Recreation of AI Agency Hero mockups)
  const driverLandingEl = document.getElementById('landingView');
  let driverStage = null;
  if (driverLandingEl) {
    driverStage = new DriverLandingStage({ container: driverLandingEl });
    window.driverStage = driverStage;
    window.pufferStage = driverStage; // for backward compatibility with store.js
  }

  const llHeroCtaBtn = document.getElementById('llHeroCtaBtn');
  if (llHeroCtaBtn) {
    llHeroCtaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sound.playDriverSwitch();
      window.location.hash = '#store';
    });
  }

  const llMenuBtn = document.getElementById('llMenuBtn');
  if (llMenuBtn && menuDrawer) {
    llMenuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      menuDrawer.open();
    });
  }

  // Thumbnail Click Handling
  thumbnails.forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index, 10);
      if (heroStage) {
        heroStage.switchToDriver(index);
      }
    });
  });

  // Hide interaction hint on first pointer move over hero
  const dismissHint = () => {
    if (hintEl && !hintEl.classList.contains('is-hidden')) {
      hintEl.classList.add('is-hidden');
      sound.playRevealWhoosh(0.7);
    }
  };
  if (stageElement) {
    stageElement.addEventListener('pointerdown', dismissHint, { once: true });
    stageElement.addEventListener('pointermove', dismissHint, { once: true });
  }

  // Keyboard navigation support: Left / Right arrow keys
  window.addEventListener('keydown', (e) => {
    if ((menuDrawer && menuDrawer.isOpen) || (cartDrawer && cartDrawer.isOpen)) return;

    if (e.key === 'ArrowRight' && heroStage) {
      const next = (heroStage.currentIndex + 1) % DRIVERS.length;
      heroStage.switchToDriver(next);
    } else if (e.key === 'ArrowLeft' && heroStage) {
      const prev = (heroStage.currentIndex - 1 + DRIVERS.length) % DRIVERS.length;
      heroStage.switchToDriver(prev);
    }
  });

  // Reduced motion toggle in menu
  if (reducedMotionToggleBtn && heroStage) {
    reducedMotionToggleBtn.addEventListener('click', () => {
      heroStage.reducedMotion = !heroStage.reducedMotion;
      reducedMotionToggleBtn.classList.toggle('is-active', heroStage.reducedMotion);
      reducedMotionToggleBtn.querySelector('.motion-status').textContent = heroStage.reducedMotion ? 'ON' : 'OFF';
    });
  }

  // Search Modal Trigger
  document.querySelectorAll('.js-search-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const term = prompt('Search Lap Legends Prints (e.g. Norris, Hamilton, Silverstone, Monaco):');
      if (term) {
        const query = term.toLowerCase().trim();
        if (query.includes('norris') || query.includes('lando')) {
          storeManager.navigateToProduct('lando-norris');
        } else if (query.includes('hamilton') || query.includes('lewis')) {
          storeManager.navigateToProduct('lewis-hamilton');
        } else if (query.includes('silverstone')) {
          storeManager.navigateToProduct('silverstone');
        } else if (query.includes('piastri') || query.includes('oscar')) {
          storeManager.navigateToProduct('oscar-piastri');
        } else if (query.includes('calendar')) {
          storeManager.navigateToProduct('race-calendar');
        } else if (query.includes('monaco')) {
          storeManager.navigateToProduct('monaco');
        } else if (query.includes('leclerc') || query.includes('charles')) {
          storeManager.navigateToProduct('charles-leclerc');
        } else {
          alert(`No direct match for "${term}". Showing all collections.`);
          storeManager.navigateToCatalog('all');
        }
      }
    });
  });

  // Info / Support Modals
  function openInfoModal(title, htmlContent) {
    if (!infoModal) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = htmlContent;
    infoModal.classList.add('is-open');
    infoModal.setAttribute('aria-hidden', 'false');
    if (typeof infoModal.showModal === 'function') {
      try {
        if (!infoModal.open) infoModal.showModal();
      } catch (e) {}
    }
  }

  function closeInfoModal() {
    if (!infoModal) return;
    infoModal.classList.remove('is-open');
    infoModal.setAttribute('aria-hidden', 'true');
    if (typeof infoModal.close === 'function') {
      try {
        if (infoModal.open) infoModal.close();
      } catch (e) {}
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeInfoModal);
  if (infoModal) {
    infoModal.addEventListener('click', (e) => {
      if (e.target === infoModal) closeInfoModal();
    });
  }

  document.querySelectorAll('.js-open-story').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openInfoModal('OUR STORY — MOTORSPORT. MADE PERSONAL.', `
        <p><strong>Lap Legends</strong> was founded by lifelong motorsport enthusiasts and graphic designers in the United Kingdom. We believe the exhilarating geometry of Formula 1 — the apex curves, telemetry graphics, and iconic helmet liveries — deserves museum-grade framing.</p>
        <p>Every print in our collection is precision-engineered on 250gsm archival silk museum stock with rich pigment inks and framed in bespoke black wooden moulding.</p>
        <p>Each driver print features digitally reproduced official signatures and championship livery details, designed ready to hang on your wall or stand on your desk.</p>
      `);
    });
  });

  document.querySelectorAll('.js-open-contact').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openInfoModal('CONTACT LAP LEGENDS', `
        <p><strong>Customer Care & Enquiries:</strong> support@laplegends.com</p>
        <p><strong>Studio Location:</strong> London, United Kingdom (51.4545° N, 0.0721° W)</p>
        <p><strong>Dispatch Hours:</strong> Monday – Friday, 09:00 – 17:00 GMT</p>
        <p>Have questions about custom driver commissions, sizing or trade orders? Drop our studio an email and our team will get back to you within 24 hours.</p>
      `);
    });
  });

  document.querySelectorAll('.js-open-support').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openInfoModal('CUSTOMER SUPPORT & DELIVERY', `
        <p><strong>Free UK Tracked Delivery:</strong> All framed prints are dispatched within 24 hours via Royal Mail Tracked 48. Typical delivery takes 2 to 3 business days.</p>
        <p><strong>Crush-Proof Reinforced Packaging:</strong> Every frame is wrapped in shock-absorbing foam and shipped in heavy-duty corrugated mailers to guarantee flawless arrival.</p>
        <p><strong>30-Day Guarantee:</strong> If you are not completely thrilled with your print, return it in original condition within 30 days for an instant, full refund.</p>
        <p><strong>Direct Amazon Storefront:</strong> You can also complete your purchase directly with Amazon Prime on our verified Amazon brand store.</p>
      `);
    });
  });

  // Preloader removal once initial assets are ready
  updateUI(CONFIG.defaultDriverIndex);

  setTimeout(() => {
    if (preloader) {
      preloader.classList.add('is-loaded');
      setTimeout(() => preloader.remove(), 600);
    }
  }, 350);
});
