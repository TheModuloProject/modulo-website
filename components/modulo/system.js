export function initModulo(root) {
  const input = root.querySelector('input');
  const button = root.querySelector('[data-modulo-run]');
  const nodes = [...root.querySelectorAll('.orbit-node')];
  const mover = root.querySelector('.orbit-mover');
  const center = root.querySelector('.system-center');
  const modules = root.querySelector('.system-modules');
  const count = root.querySelector('[data-orbit-count]');
  const title = root.querySelector('title');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame;
  let animations = [];
  let running = false;

  function cancel() {
    cancelAnimationFrame(frame);
    animations.forEach(animation => animation.cancel());
    animations = [];
    running = false;
  }
  function highlight(value) {
    nodes.forEach((node, index) => node.classList.toggle('is-active', index === value % 5));
  }
  function update() {
    cancel();
    const value = Number(input.value);
    root.querySelector('[data-input-value]').textContent = value;
    root.querySelector('[data-input-label]').textContent = value;
    root.querySelector('[data-remainder-value]').textContent = value % 5;
    title.textContent = `${value} steps through a circular system leave a remainder of ${value % 5}`;
    count.textContent = value;
    mover.style.transform = `rotate(${value * 72}deg)`;
    mover.style.opacity = '1';
    center.style.opacity = '1';
    modules.style.opacity = '0';
    highlight(value);
    button.textContent = 'Run the sequence';
  }
  function resolve() {
    running = false;
    button.textContent = 'Run again';
    if (reduced.matches) {
      center.style.opacity = '0';
      mover.style.opacity = '0';
      modules.style.opacity = '1';
      return;
    }
    animations.push(center.animate([{opacity:1},{opacity:0}],{duration:360,fill:'forwards'}));
    animations.push(mover.animate([{opacity:1},{opacity:0}],{duration:360,fill:'forwards'}));
    animations.push(modules.animate([{opacity:0,transform:'translate(120px,120px) scale(1.8)'},{opacity:1,transform:'translate(120px,120px) scale(2)'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'}));
  }
  function run() {
    update();
    const value = Number(input.value);
    if (reduced.matches || document.hidden) { resolve(); return; }
    running = true;
    const duration = Math.min(3200, 1400 + value * 45);
    const start = performance.now();
    function tick(now) {
      const progress = Math.min(1,(now-start)/duration);
      // Constant travel, then a deliberate deceleration into the remainder.
      const eased = 1-Math.pow(1-progress,1.45);
      const steps = value * eased;
      mover.style.transform = `rotate(${steps * 72}deg)`;
      count.textContent = Math.floor(steps);
      highlight(Math.floor(steps));
      if(progress<1) frame=requestAnimationFrame(tick);
      else { count.textContent=value; highlight(value); resolve(); }
    }
    frame=requestAnimationFrame(tick);
  }
  input.addEventListener('input',update);
  button.addEventListener('click',run);
  reduced.addEventListener('change', () => { if (running && reduced.matches) { cancel(); update(); resolve(); } });
  document.addEventListener('visibilitychange', () => { if(document.hidden && running){ cancel(); update(); resolve(); } });
  update();
  let played = false;
  const observer = new IntersectionObserver(entries => {
    const visible=entries[0].isIntersecting;
    if(visible&&!played){played=true;run();}
    else if(!visible&&running){cancel();update();resolve();}
  },{threshold:.35});
  observer.observe(root);
}
