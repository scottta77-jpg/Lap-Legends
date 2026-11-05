import { gsap } from 'gsap';
import './page-transition.css';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function waitForImage(image) {
  if (image.complete) return Promise.resolve();
  return new Promise(resolve => {
    const finish = () => {
      clearTimeout(timeout);
      image.removeEventListener('load', finish);
      image.removeEventListener('error', finish);
      resolve();
    };
    const timeout = setTimeout(finish, 650);
    image.addEventListener('load', finish, { once: true });
    image.addEventListener('error', finish, { once: true });
  });
}

export class PageTransition {
  constructor() {
    this.active = false;
    this.pending = null;
    this.motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.overlay = document.createElement('div');
    this.overlay.className = 'page-transition';
    this.overlay.dataset.state = 'idle';
    this.overlay.setAttribute('aria-hidden', 'true');
    this.overlay.innerHTML = `
      <svg class="page-transition-seed" viewBox="0 0 100 100" aria-hidden="true">
        <path d="M21 8h22L30 67h25l-5 24H3zM62 8h22L71 67h27l-5 24H44z" />
      </svg>
      <div class="page-transition-field">
        <div class="page-transition-brand">
          <img src="/assets/logo_transparent.png" alt="" width="164" height="51" />
          <span class="page-transition-line"></span>
          <span class="page-transition-destination"></span>
        </div>
      </div>`;
    document.body.appendChild(this.overlay);
    this.seed = this.overlay.querySelector('.page-transition-seed');
    this.field = this.overlay.querySelector('.page-transition-field');
    this.brand = this.overlay.querySelector('.page-transition-brand');
    this.line = this.overlay.querySelector('.page-transition-line');
    this.destination = this.overlay.querySelector('.page-transition-destination');
    this.overlay.addEventListener('wheel', event => event.preventDefault(), { passive: false });
    this.overlay.addEventListener('touchmove', event => event.preventDefault(), { passive: false });
    document.addEventListener('keydown', event => {
      if (this.active && [' ', 'PageDown', 'PageUp', 'Home', 'End', 'ArrowDown', 'ArrowUp', 'Tab'].includes(event.key)) event.preventDefault();
    });
    this.motion.addEventListener('change', () => {
      if (this.motion.matches && this.active) {
        this.skip = true;
        this.timeline?.progress(1);
      }
    });
  }

  navigate(request) {
    if (!this.active && this.motion.matches) {
      const view = request.render();
      this.focusHeading(view);
      return Promise.resolve();
    }
    this.pending = request;
    if (this.active) return this.task;
    this.active = true;
    this.skip = false;
    this.task = this.run();
    return this.task;
  }

  animate(build) {
    return new Promise(resolve => {
      this.timeline = gsap.timeline({ onComplete: resolve, onInterrupt: resolve });
      build(this.timeline);
    });
  }

  async run() {
    let view;
    let request;
    this.inertStates = [...document.querySelectorAll('#landingView, #storeViewsWrapper')].map(element => [element, element.inert]);
    document.dispatchEvent(new Event('lap:transition-start'));
    document.activeElement?.blur?.();
    this.inertStates.forEach(([element]) => { element.inert = true; });
    this.overlay.classList.add('is-active');
    this.overlay.dataset.state = 'covering';
    this.destination.textContent = this.pending.label;
    gsap.set(this.seed, { autoAlpha: 1, xPercent: -50, yPercent: -50, scale: 0.1, rotation: -12 });
    gsap.set(this.field, { autoAlpha: 0, yPercent: 0, borderRadius: 0 });
    gsap.set(this.brand, { autoAlpha: 0, y: 12 });
    gsap.set(this.line, { scaleX: 0 });
    // Background tabs and interrupted animations must never leave navigation locked.
    const safety = setTimeout(() => {
      this.skip = true;
      this.timeline?.progress(1);
    }, 5000);

    try {
      await this.animate(timeline => {
        timeline.to(this.seed, { scale: 1, rotation: 0, duration: 0.19, ease: 'power2.out' });
        timeline.to(this.seed, { scale: Math.max(innerWidth, innerHeight) / 8 + 20, duration: 0.52, ease: 'power4.in' });
        timeline.set(this.field, { autoAlpha: 1 });
        timeline.set(this.seed, { autoAlpha: 0 });
        timeline.to(this.brand, { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power2.out' });
      });

      // Only the most recent requested route is rendered while the screen is covered.
      do {
        request = this.pending;
        this.pending = null;
        this.destination.textContent = request.label;
        view = request.render();
        this.overlay.dataset.state = 'covered';
        if (!this.skip) {
          const images = [...view.querySelectorAll('img')].filter(image => {
            const rect = image.getBoundingClientRect();
            return rect.width && rect.height && rect.top < innerHeight && rect.bottom > 0;
          });
          gsap.fromTo(this.line, { scaleX: 0 }, { scaleX: 1, duration: 0.32, ease: 'power2.inOut' });
          await Promise.all([wait(280), ...images.map(waitForImage)]);
        }
      } while (this.pending);

      if (!this.skip) {
        this.overlay.dataset.state = 'revealing';
        this.entranceTargets = this.getEntranceTargets(view);
        gsap.set(this.entranceTargets, { y: 32 });
        await this.animate(timeline => {
          timeline.to(this.brand, { autoAlpha: 0, y: -12, duration: 0.2, ease: 'power2.in' });
          timeline.to(this.field, { yPercent: -105, borderBottomLeftRadius: '48% 16%', borderBottomRightRadius: '48% 16%', duration: 0.72, ease: 'power4.inOut' }, 0.05);
          timeline.to(this.entranceTargets, { y: 0, duration: 0.75, stagger: 0.055, ease: 'power3.out' }, 0.18);
        });
      }
    } catch (error) {
      console.error('Page transition could not finish:', error);
      const latest = this.pending || request;
      this.pending = null;
      if (latest) view = latest.render();
    } finally {
      clearTimeout(safety);
      gsap.killTweensOf([this.seed, this.field, this.brand, this.line, ...(this.entranceTargets || [])]);
      if (this.entranceTargets?.length) gsap.set(this.entranceTargets, { clearProps: 'transform' });
      this.entranceTargets = [];
      this.overlay.classList.remove('is-active');
      this.overlay.dataset.state = 'idle';
      this.inertStates.forEach(([element, inert]) => { element.inert = inert; });
      this.active = false;
      if (this.pending) {
        const next = this.pending;
        this.pending = null;
        this.navigate(next);
      } else this.focusHeading(view);
    }
  }

  getEntranceTargets(view) {
    if (view.id === 'landingView') return [...view.querySelectorAll('.ll-col-center')];
    if (view.id === 'storePdpView') return [...view.querySelectorAll('.pdp-breadcrumbs, .pdp-info-col, .pdp-gallery-col')];
    if (document.body.classList.contains('page-is-catalog')) return [...view.querySelectorAll('.fan-favourites-header, .home-catalog-filters, #catalogGrid .product-card')].slice(0, 6);
    return [...view.querySelectorAll('.home-hero-copy > *, .home-collection-tag, .home-hero-categories')];
  }

  focusHeading(view) {
    const heading = view?.querySelector(document.body.classList.contains('page-is-catalog') ? '#homeCatalogTitle' : 'h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }
}
