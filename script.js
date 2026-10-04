import { initTheme } from './components/navigation/theme.js';
import { initMenu } from './components/navigation/menu.js';
import { initReveals, initScrollReveals, initHeadingTyping } from './components/motion/reveal.js';

initTheme();
initMenu();
initReveals();
initScrollReveals();
initHeadingTyping();
const system=document.querySelector('[data-modulo]');
if(system){
  const observer=new IntersectionObserver(async entries=>{
    if(!entries[0].isIntersecting) return;
    observer.disconnect();
    const {initModulo}=await import('./components/modulo/system.js');
    initModulo(system);
  },{rootMargin:'180px'});
  observer.observe(system);
}
const form=document.querySelector('[data-project-form]');
if(form) import('./components/contact/form.js').then(({initProjectForm})=>initProjectForm(form));
if(document.querySelector('[data-example]')) import('./components/examples/previews.js').then(({initExamples})=>initExamples());
