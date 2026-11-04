export function initHomepage() {
  const menu = document.getElementById('homeNavigation');
  const trigger = document.getElementById('homeMenuToggle');
  const header = document.querySelector('.home-header');
  const homeHeaderSlot = document.querySelector('#storeHomeView .home-cream');
  const productHeaderSlot = document.getElementById('productNavigation');
  if (!menu || !trigger || !header || !homeHeaderSlot || !productHeaderSlot) return;

  // Move the same header between views so its styles, controls and listeners stay shared.
  const placeHeader = () => {
    const slot = document.body.classList.contains('page-is-pdp') ? productHeaderSlot : homeHeaderSlot;
    if (header.parentElement !== slot) slot.prepend(header);
  };
  placeHeader();

  const closeMenu = () => { if (menu.open) menu.close(); };
  trigger.addEventListener('click', () => {
    menu.showModal();
    trigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-locked');
  });
  menu.addEventListener('close', () => {
    trigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-locked');
  });
  menu.querySelector('[data-home-menu-close]').addEventListener('click', closeMenu);
  menu.addEventListener('click', event => {
    if (event.target === menu || event.target.closest('a, .js-cart-trigger')) closeMenu();
  });
  window.addEventListener('hashchange', () => {
    closeMenu();
    placeHeader();
  });
}
