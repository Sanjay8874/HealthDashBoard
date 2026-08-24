// Study UI: add/edit/delete study sessions, show totals
(function(){
  const $ = s=>document.querySelector(s);
  const sheet = 'Study';

  function today(){ return (new Date()).toISOString().slice(0,10); }

  async function loadStudy(){
    $('#study-list').innerHTML='Loading...';
    try{
      const res = await Api.getSheet(sheet);
      const rows = res.data || [];
      // Sort descending
      rows.sort((a,b)=> new Date(b.Date)-new Date(a.Date));
      if(!rows.length){ $('#study-list').innerHTML='<div class="card">No study sessions</div>'; $('#study-summary').textContent='Weekly: 0 • Monthly: 0'; return; }
      // summary
      const now = new Date(); const weekAgo = new Date(); weekAgo.setDate(now.getDate()-6);
      const monthAgo = new Date(); monthAgo.setMonth(now.getMonth()-1);
      let wsum=0, msum=0;
      rows.forEach(r=>{ const d=new Date(String(r.Date)); const mins=Number(r.Minutes)||0; if(d>=weekAgo) wsum+=mins; if(d>=monthAgo) msum+=mins; });
      $('#study-summary').textContent = `Weekly: ${Math.floor(wsum/60)}h ${wsum%60}m • Monthly: ${Math.floor(msum/60)}h ${msum%60}m`;

      const container = document.createElement('div');
      rows.forEach(r=>{ const el=document.createElement('div'); el.className='card'; el.innerHTML = `<div style='display:flex;justify-content:space-between'><div><strong>${r.Subject||'Study'}</strong><div style='color:var(--muted)'>${r.Date} • ${r.Minutes||0} minutes • ${r.Topic||''}</div></div><div><button class='btn small edit-s' data-id='${r.ID}'>Edit</button> <button class='btn small danger del-s' data-id='${r.ID}'>Delete</button></div></div>`; container.appendChild(el); });
      $('#study-list').innerHTML=''; $('#study-list').appendChild(container);
      Array.from(document.querySelectorAll('.edit-s')).forEach(b=>b.addEventListener('click', onEdit));
      Array.from(document.querySelectorAll('.del-s')).forEach(b=>b.addEventListener('click', onDelete));
    }catch(e){console.error(e); $('#study-list').innerHTML='Failed to load';}
  }

  function reset(){ $('#study-id').value=''; $('#study-date').value=''; $('#study-subject').value=''; $('#study-minutes').value=''; $('#study-topic').value=''; $('#study-notes').value=''; }

  async function onSubmit(ev){
    ev.preventDefault();
    const payload={ Date: $('#study-date').value||today(), Subject: $('#study-subject').value, Minutes: Number($('#study-minutes').value)||0, Topic: $('#study-topic').value, Notes: $('#study-notes').value };
    const id = $('#study-id').value;
    try{
      if(id) await Api.updateStudy(id, payload); else await Api.addStudy(payload);
      showToast('Saved'); reset(); await loadStudy(); await window.loadDashboard && window.loadDashboard();
    }catch(e){console.error(e); showToast('Failed');}
  }

  async function onEdit(ev){ const id=ev.currentTarget.dataset.id; const res=await Api.getSheet(sheet); const item=(res.data||[]).find(x=>String(x.ID)===String(id)); if(!item) return; $('#study-id').value=item.ID; $('#study-date').value=item.Date; $('#study-subject').value=item.Subject; $('#study-minutes').value=item.Minutes; $('#study-topic').value=item.Topic; $('#study-notes').value=item.Notes; }
  async function onDelete(ev){ if(!confirm('Delete study session?')) return; const id=ev.currentTarget.dataset.id; try{ await Api.deleteStudy(id); showToast('Deleted'); await loadStudy(); await window.loadDashboard && window.loadDashboard(); }catch(e){console.error(e); showToast('Failed');} }

  document.addEventListener('DOMContentLoaded', ()=>{ document.getElementById('study-form').addEventListener('submit', onSubmit); document.getElementById('reset-study').addEventListener('click', (e)=>{e.preventDefault(); reset();}); loadStudy(); });
})();
