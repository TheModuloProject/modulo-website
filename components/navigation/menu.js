export function initMenu() {
  const dialog = document.querySelector('#mobile-menu');
  const toggle = document.querySelector('.menu-toggle');
  const close = dialog.querySelector('.menu-close');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1001px)');
  let closing = false;

  function restore() {
    dialog.classList.remove('is-closing');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    closing = false;
  }

  async function closeMenu(immediate = false) {
    if (!dialog.open || closing) return;
    closing = true;
    if (!immediate && !reduced.matches) {
      dialog.classList.add('is-closing');
      await Promise.allSettled(dialog.getAnimations().map(animation => animation.finished));
    }
    dialog.close();
    restore();
    if (!desktop.matches) toggle.focus({ preventScroll: true });
  }

  toggle.addEventListener('click', () => {
    if (dialog.open) { closeMenu(); return; }
    dialog.showModal();
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    close.focus({ preventScroll: true });
  });
  // Native modal inertness protects the background; explicit wrapping also
  // keeps Shift+Tab from escaping to browser chrome on mobile Chromium.
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('a[href], button:not(:disabled), [tabindex="0"]')]
      .filter(element => element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  close.addEventListener('click', () => closeMenu());
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
  dialog.addEventListener('close', restore);
  dialog.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu(true)));
  desktop.addEventListener('change', event => { if (event.matches) closeMenu(true); });
}
