import { gsap } from 'gsap';

/**
 * Lando Norris Text Hover & Interactive Micro-Animation Engine
 * Replicates the staggered character roll, text-shadow twin reveal,
 * magnetic pill button dynamics, and lime highlight wipes from landonorris.com.
 */

export function initTextHoverEffects() {
  // 1. Setup All Text Links with the Staggered Character Roll
  const targetSelectors = [
    '[data-anim="text-hover"]',
    '.footer-links-layout a',
    '.footer-links-col a',
    '.links-legal-items a',
    '.text-legal-link',
    '.footer-center a',
    '.footer-link',
    '.header-nav-link',
    '.nav-item',
    '.nav-menu-link-w'
  ];

  const links = document.querySelectorAll(targetSelectors.join(', '));

  links.forEach((link) => {
    // Avoid double-init
    if (link.dataset.hoverInitialized === 'true') return;
    link.dataset.hoverInitialized = 'true';

    // Ensure the link has data-anim="text-hover"
    link.setAttribute('data-anim', 'text-hover');

    // Find or create .text-clip-w wrapper
    let clipWrap = link.querySelector('.text-clip-w');
    let textTarget = link.querySelector('.btn-text, .text-nav-link');

    if (!clipWrap) {
      clipWrap = document.createElement('div');
      clipWrap.className = 'text-clip-w';

      if (textTarget) {
        textTarget.parentNode.insertBefore(clipWrap, textTarget);
        clipWrap.appendChild(textTarget);
      } else {
        const textSpan = document.createElement('div');
        textSpan.className = 'btn-text';
        textSpan.textContent = link.textContent.trim();
        link.textContent = '';
        clipWrap.appendChild(textSpan);
        link.appendChild(clipWrap);
        textTarget = textSpan;
      }
    } else if (!textTarget) {
      textTarget = clipWrap.querySelector('.btn-text, .text-nav-link');
      if (!textTarget) {
        textTarget = document.createElement('div');
        textTarget.className = 'btn-text';
        textTarget.textContent = clipWrap.textContent.trim();
        clipWrap.textContent = '';
        clipWrap.appendChild(textTarget);
      }
    }

    // Split text target into individual .char spans while preserving spaces
    const rawText = textTarget.textContent.trim();
    if (!rawText) return;

    // Preserve original for accessibility
    textTarget.setAttribute('aria-label', rawText);
    textTarget.innerHTML = '';

    const charSpans = [];
    const letters = rawText.split('');

    letters.forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.style.setProperty('--char-index', index);
      span.setAttribute('aria-hidden', 'true');

      if (char === ' ') {
        span.innerHTML = '&nbsp;';
        span.classList.add('char-space');
      } else {
        span.textContent = char;
      }

      textTarget.appendChild(span);
      charSpans.push(span);
    });

    // Ensure text-shadow twin styling
    textTarget.style.textShadow = '0 1.15em currentColor';
    textTarget.style.lineHeight = '1';
    textTarget.style.display = 'inline-flex';
    clipWrap.style.overflow = 'hidden';
    clipWrap.style.display = 'inline-block';
    clipWrap.style.verticalAlign = 'top';
    clipWrap.style.lineHeight = '1';

    // Mouseenter: Stagger roll up by -1.15em
    link.addEventListener('mouseenter', () => {
      gsap.to(charSpans, {
        y: '-1.15em',
        duration: 0.52,
        stagger: {
          each: 0.022,
          from: 'start'
        },
        ease: 'power3.out',
        overwrite: true
      });
    });

    // Mouseleave: Stagger roll back down to 0
    link.addEventListener('mouseleave', () => {
      gsap.to(charSpans, {
        y: '0em',
        duration: 0.52,
        stagger: {
          each: 0.02,
          from: 'start'
        },
        ease: 'power3.out',
        overwrite: true
      });
    });
  });

  // 2. Interactive Pill Buttons ("BUSINESS ENQUIRIES ↗" & "STORE" Pills)
  const pillButtons = document.querySelectorAll('.btn-w.is-footer-btn, .ll-store-pill-btn, .btn-lime');

  pillButtons.forEach((btn) => {
    if (btn.dataset.pillInitialized === 'true') return;
    btn.dataset.pillInitialized = 'true';

    const arrowIcon = btn.querySelector('.btn-arrow-icon, svg');

    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, {
        scale: 1.05,
        duration: 0.35,
        ease: 'back.out(1.8)',
        overwrite: 'auto'
      });

      if (arrowIcon) {
        gsap.to(arrowIcon, {
          x: 3,
          y: -3,
          duration: 0.28,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      if (arrowIcon) {
        gsap.to(arrowIcon, {
          x: 0,
          y: 0,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    });
  });

  // 3. Highlight Wipe Effect for Headline Accents (data-anim-high)
  const highElements = document.querySelectorAll('[data-anim-high]');
  highElements.forEach((el) => {
    if (el.dataset.highInit === 'true') return;
    el.dataset.highInit = 'true';

    el.addEventListener('mouseenter', () => {
      gsap.fromTo(
        el,
        { filter: 'brightness(1)' },
        { filter: 'brightness(1.25) drop-shadow(0 0 12px rgba(210, 255, 0, 0.6))', duration: 0.3, yoyo: true, repeat: 1 }
      );
    });
  });
}
