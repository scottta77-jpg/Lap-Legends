/**
 * Puffer Jacket Showcase Landing Page Controller
 * Automatic slide cycling with manual controls (chevrons, preview thumbnail, keyboard)
 * Note: Scroll trigger removed per user request for a smooth, stable experience.
 */

export const PUFFER_SLIDES = [
  {
    id: 0,
    name: 'Orange Puffer Jacket',
    bgColor: '#e86c13',
    bgGradient: 'linear-gradient(135deg, #c64011 41%, #e6632f 100%)',
    imgSrc: '/assets/puffer/Jacket-1.png',
    price: '$149',
    originalPrice: '$199',
    headline: 'Stand out<br>Without trying',
    description: "It’s not just about staying warm. It’s about stepping outside and instantly feeling confident, comfortable, and completely yourself. Designed to elevate even the simplest outfit, this jacket wraps you in lightweight warmth.",
    tagline: 'Confidence,<br>wrapped in warmth'
  },
  {
    id: 1,
    name: 'Matte Black Puffer Jacket',
    bgColor: '#2a2a2a',
    bgGradient: 'linear-gradient(135deg, #181818 41%, #353535 100%)',
    imgSrc: '/assets/puffer/Jacket-3.png',
    price: '$149',
    originalPrice: '$199',
    headline: 'Stand out<br>Without trying',
    description: "It’s not just about staying warm. It’s about stepping outside and instantly feeling confident, comfortable, and completely yourself. Designed to elevate even the simplest outfit, this jacket wraps you in lightweight warmth.",
    tagline: 'Confidence,<br>wrapped in warmth'
  },
  {
    id: 2,
    name: 'Silver Gray Puffer Jacket',
    bgColor: '#bac3c9',
    bgGradient: 'linear-gradient(135deg, #7e8b95 41%, #bac3c9 100%)',
    imgSrc: '/assets/puffer/Jacket-2.png',
    price: '$149',
    originalPrice: '$199',
    headline: 'Stand out<br>Without trying',
    description: "It’s not just about staying warm. It’s about stepping outside and instantly feeling confident, comfortable, and completely yourself. Designed to elevate even the simplest outfit, this jacket wraps you in lightweight warmth.",
    tagline: 'Confidence,<br>wrapped in warmth'
  },
  {
    id: 3,
    name: 'Crimson Red Puffer Jacket',
    bgColor: '#b30000',
    bgGradient: 'linear-gradient(135deg, #820000 41%, #c41010 100%)',
    imgSrc: '/assets/puffer/Jacket-4.png',
    price: '$149',
    originalPrice: '$199',
    headline: 'Stand out<br>Without trying',
    description: "It’s not just about staying warm. It’s about stepping outside and instantly feeling confident, comfortable, and completely yourself. Designed to elevate even the simplest outfit, this jacket wraps you in lightweight warmth.",
    tagline: 'Confidence,<br>wrapped in warmth'
  }
];

export class PufferLandingStage {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('landingView');
    this.currentIndex = 0;
    this.isTransitioning = false;
    this.selectedSize = '36';
    this.autoPlayInterval = options.autoPlayInterval || 4200; // Auto-cycle every 4.2 seconds
    this.autoPlayTimer = null;
    this.isPaused = false;

    this.init();
  }

  init() {
    this.bgContainerA = document.getElementById('pufferBgLayerA');
    this.bgContainerB = document.getElementById('pufferBgLayerB');
    this.jackets = document.querySelectorAll('.puffer-jacket-item');
    this.prevBtn = document.querySelector('.js-puffer-prev');
    this.nextBtn = document.querySelector('.js-puffer-next');
    this.sizeBtns = document.querySelectorAll('.puffer-size-btn');

    // Initial background
    if (this.bgContainerA) {
      this.bgContainerA.style.background = PUFFER_SLIDES[0].bgGradient;
      this.bgContainerA.style.opacity = '1';
    }
    if (this.bgContainerB) {
      this.bgContainerB.style.opacity = '0';
    }

    this.updateJacketStates(0);
    this.bindEvents();
    this.startAutoPlay();
  }

  updateJacketStates(targetIndex) {
    const total = PUFFER_SLIDES.length;
    const nextPreviewIndex = (targetIndex + 1) % total;

    this.jackets.forEach((jacket, i) => {
      jacket.classList.remove('state-main', 'state-preview', 'state-past', 'state-future');

      if (i === targetIndex) {
        jacket.classList.add('state-main');
      } else if (i === nextPreviewIndex) {
        jacket.classList.add('state-preview');
      } else if (i < targetIndex) {
        jacket.classList.add('state-past');
      } else {
        jacket.classList.add('state-future');
      }
    });

    // Cross-fade background gradient
    const slide = PUFFER_SLIDES[targetIndex];
    if (this.bgContainerA && this.bgContainerB) {
      const isAEven = targetIndex % 2 === 0;
      if (isAEven) {
        this.bgContainerA.style.background = slide.bgGradient;
        this.bgContainerA.style.opacity = '1';
        this.bgContainerB.style.opacity = '0';
      } else {
        this.bgContainerB.style.background = slide.bgGradient;
        this.bgContainerB.style.opacity = '1';
        this.bgContainerA.style.opacity = '0';
      }
    }

    this.currentIndex = targetIndex;
  }

  goToSlide(newIndex, resetAutoPlay = true) {
    if (this.isTransitioning) return;
    const total = PUFFER_SLIDES.length;
    // Circular wrap
    const normalizedIndex = (newIndex % total + total) % total;
    if (normalizedIndex === this.currentIndex) return;

    this.isTransitioning = true;
    this.updateJacketStates(normalizedIndex);

    if (resetAutoPlay) {
      this.restartAutoPlay();
    }

    setTimeout(() => {
      this.isTransitioning = false;
    }, 850);
  }

  nextSlide(resetAutoPlay = true) {
    this.goToSlide(this.currentIndex + 1, resetAutoPlay);
  }

  prevSlide(resetAutoPlay = true) {
    this.goToSlide(this.currentIndex - 1, resetAutoPlay);
  }

  startAutoPlay() {
    this.stopAutoPlay();
    if (this.isPaused) return;

    this.autoPlayTimer = setInterval(() => {
      // Check if landing view is currently visible
      const landingEl = document.getElementById('landingView');
      if (landingEl && landingEl.style.display !== 'none' && !document.hidden && !this.isPaused) {
        this.nextSlide(false);
      }
    }, this.autoPlayInterval);
  }

  stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  restartAutoPlay() {
    this.startAutoPlay();
  }

  pause() {
    this.isPaused = true;
    this.stopAutoPlay();
  }

  resume() {
    this.isPaused = false;
    this.startAutoPlay();
  }

  bindEvents() {
    // Chevron Arrows
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.prevSlide(true);
      });
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.nextSlide(true);
      });
    }

    // Clicking the preview thumbnail at bottom right
    this.jackets.forEach((jacket, index) => {
      jacket.addEventListener('click', (e) => {
        if (jacket.classList.contains('state-preview')) {
          e.preventDefault();
          this.goToSlide(index, true);
        }
      });
    });

    // Size Selector Buttons
    this.sizeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.sizeBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        this.selectedSize = btn.dataset.size || btn.textContent.trim();
      });
    });

    // Pause autoplay when user hovers over the active hero jacket, resume on leave
    if (this.container) {
      this.container.addEventListener('mouseenter', () => {
        // Optional subtle pause on hover if desired, or keep cycling
      });
    }

    // Tab visibility handling
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopAutoPlay();
      } else {
        const landingEl = document.getElementById('landingView');
        if (landingEl && landingEl.style.display !== 'none' && !this.isPaused) {
          this.startAutoPlay();
        }
      }
    });

    // Keyboard navigation (Arrow keys)
    window.addEventListener('keydown', (e) => {
      const landingEl = document.getElementById('landingView');
      if (!landingEl || landingEl.style.display === 'none') return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.nextSlide(true);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.prevSlide(true);
      }
    });
  }
}
