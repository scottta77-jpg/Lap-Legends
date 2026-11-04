import { gsap } from 'gsap';

/**
 * Lando Norris Text Hover & Interactive Micro-Animation Engine
 * Replicates the staggered character roll, text-shadow twin reveal,
 * magnetic pill button dynamics, and lime highlight wipes from landonorris.com.
 */

const textTargets = [
  'a[href]', 'button', '[data-anim="text-hover"]',
  '.footer-links-layout .text-link-w', '.footer-links-col .text-eyebrow',
  '.footer-statement-layout .statement-row', '.pdp-store-footer .footer-heading',
  '.footer-link', '.header-nav-link', '.nav-item', '.nav-menu-link-w'
].join(', ');
const excludedText = [
  'svg', 'script', 'style', 'input', 'textarea', 'select',
  '.arrow', '.btn-arrow-icon', '.pdp-btn-arrow', '.text-hover-accessible', '[aria-hidden="true"]',
  // Keep product names and prices static, including those inside card links.
  '.product-card-title', '.product-card-price', '.collection-card-title', '.collection-price-val',
  '.chassis-title', '.chassis-price', '.pdp-title', '.pdp-price', '.cart-item-title', '.cart-item-price'
].join(', ');
const rollStates = new WeakMap();
let rollEventsBound = false;

function rollTarget(node) {
  const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
  const target = element?.closest(textTargets);
  return target?.matches('.brand-link, .ll-brand-block') ? null : target;
}

function updateRollDistances(state) {
  state.words.forEach(({ clip, chars }) => {
    const style = getComputedStyle(clip);
    const fontSize = parseFloat(style.fontSize);
    const distance = Math.max(parseFloat(style.height) || parseFloat(style.lineHeight) || fontSize * 1.2, fontSize);
    clip.style.setProperty('--text-roll-distance', `${distance}px`);
    chars.forEach(char => state.distances.set(char, distance));
  });
}

function prepareTextRoll(target) {
  if (!target || target.matches('.brand-link, .ll-brand-block')) return null;
  const previous = rollStates.get(target);
  if (previous && previous.labels.every(label => target.contains(label)) && previous.chars.every(char => target.contains(char))) return previous;

  // A button or category label may have been replaced after a filter or cart update.
  if (previous) {
    gsap.killTweensOf(previous.chars);
    previous.labels.forEach(label => {
      if (target.contains(label)) label.replaceWith(document.createTextNode(label.textContent));
    });
    target.querySelectorAll(':scope > .text-hover-accessible').forEach(label => label.remove());
    rollStates.delete(target);
  }

  const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (/\p{L}|\p{N}/u.test(node.textContent) && !node.parentElement.closest(excludedText) && rollTarget(node) === target) nodes.push(node);
  }
  if (!nodes.length) return null; // Leave icon-only controls and quantity symbols intact.

  const rawText = nodes.map(node => node.textContent.trim()).join(' ').replace(/\s+/g, ' ');
  if (!target.hasAttribute('aria-label') || target.getAttribute('aria-label') === target.dataset.textHoverLabel) {
    target.setAttribute('aria-label', rawText);
    target.dataset.textHoverLabel = rawText;
  }
  const state = { labels: [], words: [], chars: [], distances: new Map() };
  nodes.forEach(node => {
    // Keep one label in each original text-node position, preserving flex gaps and icons.
    const label = document.createElement('span');
    label.className = 'text-hover-label';
    label.setAttribute('aria-hidden', 'true');
    node.textContent.split(/(\s+)/u).forEach(word => {
      if (!/\p{L}|\p{N}/u.test(word)) {
        label.appendChild(document.createTextNode(word));
        return;
      }
      const clip = document.createElement('span');
      clip.className = 'text-clip-w text-roll-word';
      const line = document.createElement('span');
      line.className = 'text-roll-line';
      const chars = Array.from(word, letter => {
        const char = document.createElement('span');
        char.className = 'char';
        char.textContent = letter;
        char.setAttribute('aria-hidden', 'true');
        line.appendChild(char);
        state.chars.push(char);
        return char;
      });
      clip.appendChild(line);
      label.appendChild(clip);
      state.words.push({ clip, chars });
    });
    node.replaceWith(label);
    state.labels.push(label);
  });

  if (!target.matches('a, button, h1, h2, h3, h4, h5, h6')) {
    const accessibleText = document.createElement('span');
    accessibleText.className = 'text-hover-accessible';
    accessibleText.textContent = rawText;
    target.appendChild(accessibleText);
  }
  target.dataset.hoverInitialized = 'true';
  target.dataset.anim = 'text-hover';
  rollStates.set(target, state);
  updateRollDistances(state);
  return state;
}

function animateTextRoll(target, entering) {
  const state = prepareTextRoll(target);
  if (!state) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(state.chars, { y: 0 });
    return;
  }
  if (entering) updateRollDistances(state);
  gsap.to(state.chars, {
    y: entering ? (_, char) => -state.distances.get(char) : 0,
    duration: 0.52,
    stagger: { each: entering ? 0.022 : 0.02, from: 'start' },
    ease: 'power3.out',
    overwrite: true
  });
}

function bindTextRollEvents() {
  if (rollEventsBound) return;
  rollEventsBound = true;
  // Delegation also covers newly rendered cards, menus and changed button labels.
  ['mouseover', 'mouseout', 'focusin', 'focusout'].forEach(type => {
    document.addEventListener(type, event => {
      const target = rollTarget(event.target);
      if (!target || (event.relatedTarget instanceof Node && target.contains(event.relatedTarget))) return;
      animateTextRoll(target, type === 'mouseover' || type === 'focusin');
    });
  });
}

export function initTextHoverEffects(root = document) {
  bindTextRollEvents();
  if (root.matches?.(textTargets)) prepareTextRoll(root);
  root.querySelectorAll(textTargets).forEach(prepareTextRoll);

  // 2. Interactive Pill Buttons ("BUSINESS ENQUIRIES ↗" & "STORE" Pills)
  const pillButtons = root.querySelectorAll('.btn-w.is-footer-btn, .ll-store-pill-btn, .btn-lime');

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
  const highElements = root.querySelectorAll('[data-anim-high]');
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
