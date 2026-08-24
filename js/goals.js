// Goals UI: add/edit/delete goals
(function(){
  const $ = s=>document.querySelector(s);
  const sheet='Goals';
  async function loadGoals(){
    $('#goals-list').innerHTML='Loading...';
    try{
      const res = await Api.getSheet(sheet);
      const rows = res.data||[];
      if(!rows.length){ $('#goals-list').innerHTML='<div class="card">No goals</div>'; return; }
      const container=document.createElement('div');
      rows.forEach(g=>{ const el=document.createElement('div'); el.className='card'; el.innerHTML = `<div style='display:flex;justify-content:space-between'><div><strong>${g.GoalName}</strong><div style='color:var(--muted)'>${g.Target} ${g.Unit||''}</div></div><div><button class='btn small edit-g' data-id='${g.ID}'>Edit</button> <button class='btn small del-g' data-id='${g.ID}'>Delete</button></div></div>`; container.appendChild(el); });
      $('#goals-list').innerHTML=''; $('#goals-list').appendChild(container);
      Array.from(document.querySelectorAll('.edit-g')).forEach(b=>b.addEventListener('click', onEdit));
      Array.from(document.querySelectorAll('.del-g')).forEach(b=>b.addEventListener('click', onDelete));
    }catch(e){console.error(e); $('#goals-list').innerHTML='Failed to load';}
  }
  function reset(){ $('#goal-id').value=''; $('#goal-name').value=''; $('#goal-target').value=''; $('#goal-unit').value=''; $('#goal-active').checked=true; }
  async function onSubmit(ev){ ev.preventDefault(); const payload={ GoalName: $('#goal-name').value, Target: $('#goal-target').value, Unit: $('#goal-unit').value, Active: $('#goal-active').checked? 'TRUE':'FALSE' }; const id=$('#goal-id').value; try{ if(id) await Api.updateGoal(id,payload); else await Api.addGoal(payload); showToast('Saved'); reset(); await loadGoals(); await window.loadDashboard && window.loadDashboard(); }catch(e){console.error(e); showToast('Failed');} }
  async function onEdit(ev){ const id=ev.currentTarget.dataset.id; const res = await Api.getSheet(sheet); const item=(res.data||[]).find(x=>String(x.ID)===String(id)); if(!item) return; $('#goal-id').value=item.ID; $('#goal-name').value=item.GoalName||''; $('#goal-target').value=item.Target||''; $('#goal-unit').value=item.Unit||''; $('#goal-active').checked = String(item.Active||'TRUE')==='TRUE'; }
  async function onDelete(ev){ if(!confirm('Delete goal?')) return; const id=ev.currentTarget.dataset.id; try{ await Api.deleteGoal(id); showToast('Deleted'); await loadGoals(); await window.loadDashboard && window.loadDashboard(); }catch(e){console.error(e); showToast('Failed');} }
  document.addEventListener('DOMContentLoaded', ()=>{ document.getElementById('goal-form').addEventListener('submit', onSubmit); loadGoals(); });
})();
