export function initReveals() {
  const root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('[data-reveal]').forEach((element, index) => {
    element.style.setProperty('--reveal-delay', `${Math.min(index * 85, 425)}ms`);
  });
  root.classList.add('motion-ready');
  // One entrance, no endless loops and no animation restart on a theme change.
  setTimeout(() => root.classList.remove('motion-ready'), 1500);
}

export function initScrollReveals() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('scroll-reveal-ready');
      entry.target.classList.add('scroll-revealed');
      entry.target.addEventListener('animationend', () => entry.target.classList.remove('scroll-revealed'), { once: true });
      observer.unobserve(entry.target);
    });
  }, { threshold: .08, rootMargin: '0px 0px 80px 0px' });
  document.querySelectorAll('[data-scroll-reveal]').forEach(element => {
    // Above-fold content is always immediately present.
    if (element.getBoundingClientRect().top > innerHeight) element.classList.add('scroll-reveal-ready');
    observer.observe(element);
  });
  reduced.addEventListener('change', event => {
    if (event.matches) { observer.disconnect(); document.querySelectorAll('.scroll-reveal-ready').forEach(element => element.classList.remove('scroll-reveal-ready')); }
  });
}

export function initHeadingTyping() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const headings = [...document.querySelectorAll('[data-type-heading]')]
    .filter(heading => heading.dataset.typeHeading === 'load' || 'IntersectionObserver' in window);
  if (reduced.matches || !headings.length) return;
  const timers = new Map();

  function finish(heading) {
    clearTimeout(timers.get(heading));
    timers.delete(heading);
    heading.classList.remove('typing-ready', 'is-typing');
    heading.dataset.typeState = 'complete';
  }

  for (const heading of headings) {
    // Keep the complete heading available to assistive technology while the
    // visible letters reveal in place, preserving line breaks and word wraps.
    const readable = heading.cloneNode(true);
    readable.querySelectorAll('svg').forEach(svg => svg.remove());
    readable.querySelectorAll('br').forEach(lineBreak => lineBreak.replaceWith(' '));
    heading.setAttribute('aria-label', readable.textContent.replace(/\s+/g, ' ').trim());
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT, {
      acceptNode: node => node.parentElement.closest('svg') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const characters = [];
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      for (const character of Array.from(node.nodeValue)) {
        const span = document.createElement('span');
        span.className = 'typing-character';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = character;
        fragment.append(span);
        characters.push(span);
      }
      node.replaceWith(fragment);
    }
    const duration = Math.min(characters.length * 28, 1300);
    characters.forEach((character, index) => {
      character.style.setProperty('--character-delay', `${index * duration / characters.length}ms`);
    });
    heading.style.setProperty('--marker-delay', `${duration + 100}ms`);
    heading.dataset.typingDuration = String(duration);
    heading.dataset.typeState = 'ready';
    heading.classList.add('typing-ready');
  }

  function start(heading) {
    heading.classList.add('is-typing');
    heading.dataset.typeState = 'typing';
    const markerDuration = heading.querySelector('.headline-scribble') ? 750 : 0;
    timers.set(heading, setTimeout(() => finish(heading), Number(heading.dataset.typingDuration) + markerDuration + 50));
  }

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const heading = entry.target;
      start(heading);
      observer.unobserve(heading);
    }
  }, { threshold: .25, rootMargin: '0px 0px -8% 0px' }) : null;
  headings.forEach(heading => {
    if (heading.dataset.typeHeading === 'load') start(heading);
    else observer?.observe(heading);
  });
  reduced.addEventListener('change', event => {
    if (!event.matches) return;
    observer?.disconnect();
    headings.forEach(finish);
  });
}
