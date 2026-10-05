export function initStarburstInvitations() {
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('[data-starburst-invitation]').forEach(section => {
  const star = section.querySelector('.invitation-star');
  const pop = section.querySelector('.invitation-star-pop');
  const messages = [...section.querySelectorAll('.invitation-message')];
  const messageStatus = section.querySelector('#invitation-message');
  const copy = section.querySelector('.invitation-copy');
  const copyStatus = section.querySelector('.invitation-copy-status');
  const email = section.querySelector('.invitation-email');
  const sparks = section.querySelector('.invitation-sparks');
  const paths = [...section.querySelectorAll('.invitation-script path,.invitation-orbit path')];
  let index = 0;
  let animation;
  let sparkTimer;
  let copyTimer;
  let observer;

  // Real SVG lengths keep the strokes consistent across browsers and sizes.
  paths.forEach(path => path.style.setProperty('--stroke-length', String(Math.ceil(path.getTotalLength()) + 1)));
  const reveal = () => {
   section.classList.remove('invitation-draw-ready');
   section.classList.add('invitation-drawn');
   observer?.disconnect();
  };
  if (!reduced.matches && 'IntersectionObserver' in window) {
   section.classList.add('invitation-draw-ready');
   observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) reveal();
   }, {threshold: .15});
   observer.observe(section);
  } else reveal();

  star.disabled = false;
  star.addEventListener('click', () => {
   messages[index].hidden = true;
   index = (index + 1) % messages.length;
   messages[index].hidden = false;
   messageStatus.textContent = ["LET'S BUILD IT", 'MAKE IT HAPPEN', 'CREATE SOMETHING GREAT'][index];
   animation?.cancel();
   clearTimeout(sparkTimer);
   sparks.replaceChildren();
   if (reduced.matches) return;
   animation = pop.animate?.([
    {transform:'scale(1) rotate(0deg)'},
    {transform:'scale(1.2) rotate(200deg)',offset:.45},
    {transform:'scale(1) rotate(360deg)'}
   ], {duration:700,easing:'cubic-bezier(.2,.9,.25,1)'});
   for (let i = 0; i < 12; i++) {
    const spark = document.createElement('i');
    spark.style.setProperty('--spark-angle', `${i * 30 + 15}deg`);
    sparks.append(spark);
   }
   sparkTimer = setTimeout(() => sparks.replaceChildren(), 750);
  });

  section.addEventListener('pointermove', event => {
   if (event.pointerType !== 'mouse' || reduced.matches) return;
   const rect = section.getBoundingClientRect();
   section.style.setProperty('--invitation-x', `${((event.clientX - rect.left) / rect.width - .5) * 12}px`);
   section.style.setProperty('--invitation-y', `${((event.clientY - rect.top) / rect.height - .5) * 10}px`);
  });
  section.addEventListener('pointerleave', () => {
   section.style.setProperty('--invitation-x','0px');
   section.style.setProperty('--invitation-y','0px');
  });

  // The email remains a mailto link when copying is unavailable or JavaScript is off.
  if (navigator.clipboard?.writeText) {
   copy.hidden = false;
   copy.addEventListener('click', async () => {
    try {
     await navigator.clipboard.writeText(email.href.slice('mailto:'.length));
     copyStatus.textContent = 'Email address copied.';
    } catch {
     copyStatus.textContent = 'Use the email link to contact us: hello@themoduloproject.com';
    }
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copyStatus.textContent = ''; }, 4000);
   });
  }
  reduced.addEventListener('change', event => {
   if (!event.matches) return;
   reveal();
   animation?.cancel();
   clearTimeout(sparkTimer);
   sparks.replaceChildren();
   section.style.setProperty('--invitation-x','0px');
   section.style.setProperty('--invitation-y','0px');
  });
 });
}
