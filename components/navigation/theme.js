const STORAGE_KEY = 'modulo-theme';
const DURATION = 760;

export function initTheme() {
  const root = document.documentElement;
  const toggles = [...document.querySelectorAll('.theme-toggle')];
  const system = matchMedia('(prefers-color-scheme: dark)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let explicitPreference;
  let busy = false;
  try { explicitPreference = localStorage.getItem(STORAGE_KEY); } catch { /* Private browsing. */ }

  function apply(theme, persist = false) {
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#08090D' : '#F3F2EE';
    for (const toggle of toggles) {
      toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      toggle.setAttribute('aria-pressed', String(theme === 'dark'));
      toggle.querySelector('.theme-mode').textContent = theme;
    }
    if (persist) {
      explicitPreference = theme;
      try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* The theme still works without storage. */ }
    }
  }

  async function toggleTheme(event) {
    if (busy) return;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (reduced.matches) { apply(next, true); return; }
    busy = true;
    root.classList.add('theme-changing');
    event.currentTarget.setAttribute('aria-busy', 'true');
    const button = event.currentTarget;
    const bounds = button.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 2;

    try {
      if (typeof document.startViewTransition === 'function') {
        const transition = document.startViewTransition(() => apply(next, true));
        try {
          await transition.ready;
          const animation = root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: DURATION, easing: 'cubic-bezier(.65, 0, .2, 1)', pseudoElement: '::view-transition-new(root)', fill: 'both' }
          );
          const cancelForReducedMotion = () => { if (reduced.matches) animation.finish(); };
          reduced.addEventListener('change', cancelForReducedMotion);
          try { await animation.finished; } finally { reduced.removeEventListener('change', cancelForReducedMotion); }
        } catch {
          // Hidden documents or interrupted snapshots still resolve to the selected theme.
          await transition.updateCallbackDone;
        }
        await transition.finished;
      } else {
        root.classList.add('theme-fallback');
        // Establish transition styles before changing the theme's custom properties.
        getComputedStyle(root).backgroundColor;
        apply(next, true);
        await new Promise(resolve => setTimeout(resolve, DURATION));
      }
    } catch {
      apply(next, true);
    } finally {
      root.classList.remove('theme-changing', 'theme-fallback');
      button.removeAttribute('aria-busy');
      busy = false;
    }
  }

  apply(root.dataset.theme);
  toggles.forEach(toggle => toggle.addEventListener('click', toggleTheme));
  system.addEventListener('change', event => {
    if (explicitPreference !== 'light' && explicitPreference !== 'dark') apply(event.matches ? 'dark' : 'light');
  });
  window.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY) return;
    explicitPreference = event.newValue;
    apply(event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : system.matches ? 'dark' : 'light');
  });
}
