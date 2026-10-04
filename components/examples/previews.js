export function initExamples() {
  document.querySelector('[data-space-toggle]')?.addEventListener('click',event=>{
    const preview=event.currentTarget.closest('.project-art');
    const alternate=preview.classList.toggle('is-alternate');
    event.currentTarget.textContent=alternate?'Restore perspective':'Change perspective';
    event.currentTarget.setAttribute('aria-pressed',String(alternate));
  });
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    const preview=button.closest('.project-art');
    preview.querySelectorAll('[data-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    const rows=[...preview.querySelectorAll('[data-day]')];
    rows.forEach(row=>row.hidden=button.dataset.filter==='today'&&row.dataset.day!=='today');
    preview.querySelector('[data-filter-output]').textContent=`${rows.filter(row=>!row.hidden).length} tasks in view`;
  }));
}
