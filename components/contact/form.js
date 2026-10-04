export function initProjectForm(form) {
  form.querySelector('[data-form-fields]').disabled=false;
  const preview=form.querySelector('[data-draft-preview]');
  const text=form.querySelector('[data-draft-text]');
  const link=form.querySelector('[data-draft-link]');
  const status=form.querySelector('[data-copy-status]');
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(!form.reportValidity()) return;
    const fields=new FormData(form);
    const draft=[`Hello Modulo,`,``,`I'd like to discuss a ${String(fields.get('type')).toLowerCase()} project.`,``,...['name','company','email','type','budget','timeline'].map(key=>`${({name:'Name',company:'Company',email:'Email',type:'Project type',budget:'Budget',timeline:'Timeline'})[key]}: ${String(fields.get(key)||'Not specified').trim()}`),``,`What we're building:`,String(fields.get('brief')).trim()].join('\n');
    text.value=draft;
    link.href=`mailto:hello@themoduloproject.com?subject=${encodeURIComponent(`Project enquiry — ${fields.get('type')}`)}&body=${encodeURIComponent(draft)}`;
    preview.hidden=false;
    status.textContent='';
    link.focus({preventScroll:true});
    preview.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  });
  form.querySelector('[data-draft-copy]').addEventListener('click',async()=>{
    try { await navigator.clipboard.writeText(text.value); status.textContent='Enquiry copied. Paste it into an email when you’re ready.'; }
    catch { text.focus(); text.select(); status.textContent='Select and copy the enquiry above.'; }
  });
}
