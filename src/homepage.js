export function initHomepage() {
  const menu = document.getElementById('homeNavigation');
  const trigger = document.getElementById('homeMenuToggle');
  const landingTrigger = document.getElementById('llMenuBtn');
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

  const openMenu = () => {
    menu.showModal();
    trigger.setAttribute('aria-expanded', 'true');
    if (landingTrigger) landingTrigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-locked');
  };
  const closeMenu = () => { if (menu.open) menu.close(); };
  trigger.addEventListener('click', openMenu);
  if (landingTrigger) landingTrigger.addEventListener('click', openMenu);
  menu.addEventListener('close', () => {
    trigger.setAttribute('aria-expanded', 'false');
    if (landingTrigger) landingTrigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-locked');
  });
  menu.querySelector('[data-home-menu-close]').addEventListener('click', closeMenu);
  menu.addEventListener('click', event => {
    if (event.target === menu || event.target.closest('a, .js-cart-trigger')) closeMenu();
  });
  window.addEventListener('hashchange', closeMenu);
  document.addEventListener('lap:transition-start', closeMenu);
  document.addEventListener('lap:route-rendered', placeHeader);
}
