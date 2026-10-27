/**
 * Lap Legends F1 Driver Hero Showcase Controller
 * Faithfully matches AI AGENCY reference mockups with monumental driver framing
 * and smooth hero slide change animation.
 */

export const DRIVER_SLIDES = [
  {
    id: 0,
    key: 'norris',
    brandWordmark: 'LAP<br />LEGENDS',
    monogramImg: '/assets/hero/monogram_ll.png',
    monogramAlt: 'LL',
    team: 'MCLAREN F1',
    era: 'SINCE 2019',
    nextRace: 'MIAMI GP',
    theme: 'theme-cream',
    bgGradient: 'radial-gradient(ellipse at 50% 40%, #ffffff 0%, #f7f4ed 50%, #eee8dc 100%)',
    trackImg: '/assets/circuit_transparent.png',
    trackAlt: 'Miami GP Circuit',
    wreathImg: '/assets/hero/wreath_globe.png'
  },
  {
    id: 1,
    key: 'hamilton',
    brandWordmark: 'LANDO<br />NORRIS', // Matches reference image 1
    monogramImg: '/assets/hero/monogram_ln.png',
    monogramAlt: 'LN',
    team: 'MCLAREN F1',
    era: 'SINCE 2019',
    nextRace: 'AUSTIN GP',
    theme: 'theme-black',
    bgGradient: 'radial-gradient(ellipse at 50% 45%, #14151b 0%, #090a0d 60%, #030405 100%)',
    trackImg: '/assets/hero/track_austin.png',
    trackAlt: 'Austin GP Circuit',
    wreathImg: '/assets/hero/wreath_helmet.png'
  },
  {
    id: 2,
    key: 'antonelli',
    brandWordmark: 'LANDO<br />NORRIS', // Matches reference image 3
    monogramImg: '/assets/hero/monogram_ln.png',
    monogramAlt: 'LN',
    team: 'MCLAREN F1',
    era: 'SINCE 2019',
    nextRace: 'AUSTIN GP',
    theme: 'theme-red',
    bgGradient: 'radial-gradient(ellipse at 50% 45%, #b20a0a 0%, #820404 50%, #460101 100%)',
    trackImg: '/assets/hero/track_austin.png',
    trackAlt: 'Austin GP Circuit',
    wreathImg: '/assets/hero/wreath_helmet.png'
  }
];

export class DriverLandingStage {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('landingView');
    this.currentIndex = 0;
    this.isTransitioning = false;
    this.autoPlayInterval = options.autoPlayInterval || 4500; // 4.5s per slide
    this.autoPlayTimer = null;
    this.isPaused = false;

    this.init();
  }

  init() {
    this.bgContainerA = document.getElementById('llBgLayerA');
    this.bgContainerB = document.getElementById('llBgLayerB');
    this.drivers = Array.from(document.querySelectorAll('.ll-driver-item'));

    // Dynamic UI Elements
    this.brandWordmark = document.getElementById('llBrandWordmark');
    this.monogramImg = document.getElementById('llMonogramImg');
    this.raceCard = document.getElementById('llRaceCard');
    this.raceTitle = document.getElementById('llRaceTitle');
    this.raceTrackImg = document.getElementById('llRaceTrackImg');
    this.raceWreathImg = document.getElementById('llRaceWreathImg');
    this.raceTeamTitle = document.getElementById('llRaceTeamTitle');
    this.raceTeamSub = document.getElementById('llRaceTeamSub');
    this.heroCtaBtn = document.getElementById('llHeroCtaBtn');

    // Initial Background Layer setup
    if (this.bgContainerA) {
      this.bgContainerA.style.background = DRIVER_SLIDES[0].bgGradient;
      this.bgContainerA.style.opacity = '1';
    }
    if (this.bgContainerB) {
      this.bgContainerB.style.opacity = '0';
    }

    if (this.container) {
      this.container.classList.remove('theme-cream', 'theme-black', 'theme-red');
      this.container.classList.add(DRIVER_SLIDES[0].theme);
    }

    // Set initial driver states
    this.updateDriverStates(0, 1);
    this.updateDetails(0);

    this.bindEvents();
    this.startAutoPlay();
  }

  updateDriverStates(targetIndex, direction = 1) {
    const total = DRIVER_SLIDES.length;
    const prevSlideIndex = (targetIndex - 1 + total) % total;
    const nextSlideIndex = (targetIndex + 1) % total;

    this.drivers.forEach((driverEl, i) => {
      driverEl.classList.remove('state-main', 'state-past', 'state-future');
      if (i === targetIndex) {
        driverEl.classList.add('state-main');
      } else if (direction >= 0) {
        if (i === prevSlideIndex) {
          driverEl.classList.add('state-past');
        } else {
          driverEl.classList.add('state-future');
        }
      } else {
        if (i === nextSlideIndex) {
          driverEl.classList.add('state-future');
        } else {
          driverEl.classList.add('state-past');
        }
      }
    });
  }

  goToSlide(targetIndex, direction = 1) {
    const total = DRIVER_SLIDES.length;
    targetIndex = (targetIndex + total) % total;

    if (this.isTransitioning || targetIndex === this.currentIndex) return;
    this.isTransitioning = true;

    this.currentIndex = targetIndex;

    // Rotate driver slide states
    this.updateDriverStates(targetIndex, direction);

    // Crossfade dual backgrounds
    this.updateBackground(targetIndex);

    // Update UI details
    this.updateDetails(targetIndex);

    setTimeout(() => {
      this.isTransitioning = false;
    }, 960);
  }

  nextSlide() {
    this.goToSlide(this.currentIndex + 1, 1);
  }

  prevSlide() {
    this.goToSlide(this.currentIndex - 1, -1);
  }

  updateBackground(targetIndex) {
    const slide = DRIVER_SLIDES[targetIndex];
    if (!this.bgContainerA || !this.bgContainerB) return;

    // Toggle between Layer A and Layer B for seamless crossfade
    const useLayerA = targetIndex % 2 === 0;
    if (useLayerA) {
      this.bgContainerA.style.background = slide.bgGradient;
      this.bgContainerA.style.opacity = '1';
      this.bgContainerB.style.opacity = '0';
    } else {
      this.bgContainerB.style.background = slide.bgGradient;
      this.bgContainerB.style.opacity = '1';
      this.bgContainerA.style.opacity = '0';
    }

    if (this.container) {
      this.container.classList.remove('theme-cream', 'theme-black', 'theme-red');
      this.container.classList.add(slide.theme);
    }
  }

  updateDetails(targetIndex) {
    const slide = DRIVER_SLIDES[targetIndex];

    // Subtle micro-fade for header and race card
    if (this.brandWordmark) {
      this.brandWordmark.style.opacity = '0';
      setTimeout(() => {
        this.brandWordmark.innerHTML = slide.brandWordmark;
        this.brandWordmark.style.opacity = '1';
      }, 180);
    }

    if (this.monogramImg) {
      this.monogramImg.style.opacity = '0';
      this.monogramImg.style.transform = 'scale(0.85)';
      setTimeout(() => {
        this.monogramImg.src = slide.monogramImg;
        this.monogramImg.alt = slide.monogramAlt;
        this.monogramImg.style.opacity = '1';
        this.monogramImg.style.transform = 'scale(1)';
      }, 180);
    }

    if (this.raceCard) {
      this.raceCard.style.opacity = '0.4';
      this.raceCard.style.transform = 'translateY(4px)';

      setTimeout(() => {
        if (this.raceTitle) this.raceTitle.textContent = slide.nextRace;
        if (this.raceTrackImg) {
          this.raceTrackImg.src = slide.trackImg;
          this.raceTrackImg.alt = slide.trackAlt;
        }
        if (this.raceWreathImg) {
          this.raceWreathImg.src = slide.wreathImg;
        }
        if (this.raceTeamTitle) this.raceTeamTitle.textContent = slide.team;
        if (this.raceTeamSub) this.raceTeamSub.textContent = slide.era;

        this.raceCard.style.opacity = '1';
        this.raceCard.style.transform = 'translateY(0)';
      }, 200);
    }
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => {
      if (!this.isPaused && !this.isTransitioning) {
        this.nextSlide();
      }
    }, this.autoPlayInterval);
  }

  stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  bindEvents() {
    // Keyboard Left / Right navigation
    window.addEventListener('keydown', (e) => {
      if (document.body.classList.contains('page-is-store')) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        this.nextSlide();
        this.startAutoPlay(); // Reset timer cadence
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prevSlide();
        this.startAutoPlay();
      }
    });

    // Pause on CTA button hover for smooth reading
    if (this.heroCtaBtn) {
      this.heroCtaBtn.addEventListener('mouseenter', () => this.pause());
      this.heroCtaBtn.addEventListener('mouseleave', () => this.resume());
    }

    // Clicking background advances slide smoothly
    if (this.container) {
      this.container.addEventListener('click', (e) => {
        // Do not advance if user clicked a link or button
        if (e.target.closest('a') || e.target.closest('button')) return;
        this.nextSlide();
        this.startAutoPlay();
      });
    }

    // Touch swipe support for mobile
    let touchStartX = 0;
    this.container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diffX = touchEndX - touchStartX;
      if (Math.abs(diffX) > 50) {
        if (diffX < 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
        this.startAutoPlay();
      }
    }, { passive: true });
  }

  destroy() {
    this.stopAutoPlay();
  }
}
