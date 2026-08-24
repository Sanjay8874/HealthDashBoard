// Workout UI: add/edit/delete simple workouts with optional exercises
(function(){
  const $ = s=>document.querySelector(s);
  const $$ = s=>Array.from(document.querySelectorAll(s));
  const sheetName = 'Workout';

  async function loadWorkouts(){
    $('#workout-list').innerHTML='Loading...';
    try{
      const res = await Api.getSheet(sheetName);
      const rows = res.data || [];
      rows.sort((a,b)=> (a.Date<b.Date)?1:-1);
      if(!rows.length){ $('#workout-list').innerHTML='<div class="card">No workouts recorded</div>'; return; }
      const container = document.createElement('div');
      rows.forEach(r=>{
        const card = document.createElement('div'); card.className='card';
        const status = (String(r.Status||'').toLowerCase()==='completed')? '✓' : '⏳';
        card.innerHTML = `<div style='display:flex;justify-content:space-between'><div><strong>${r.Type||'Workout'}</strong> <div style='color:var(--muted)'>${r.Date} • ${r.Duration||''} min</div><div style='margin-top:6px'>${r.Notes||''}</div></div><div style='text-align:right'>${status}<div style='margin-top:8px'><button class='btn small edit-w' data-id='${r.ID}'>Edit</button> <button class='btn small danger delete-w' data-id='${r.ID}'>Delete</button></div></div></div>`;
        container.appendChild(card);
      });
      $('#workout-list').innerHTML=''; $('#workout-list').appendChild(container);
      $$('.edit-w').forEach(b=>b.addEventListener('click', onEdit));
      $$('.delete-w').forEach(b=>b.addEventListener('click', onDelete));
    }catch(e){console.error(e); $('#workout-list').innerHTML='Failed to load';}
  }

  function resetForm(){ $('#workout-id').value=''; $('#workout-date').value=''; $('#workout-type').value='Gym'; $('#workout-duration').value=''; $('#workout-notes').value=''; $('#workout-status').value='Planned'; $('#exercises').innerHTML=''; $('#add-workout').textContent='Add'; }

  async function onSubmit(ev){
    ev.preventDefault();
    const payload = {
      Date: $('#workout-date').value || (new Date()).toISOString().slice(0,10),
      Type: $('#workout-type').value,
      Duration: $('#workout-duration').value || '',
      Status: $('#workout-status').value,
      Notes: $('#workout-notes').value
    };
    const id = $('#workout-id').value;
    try{
      if(id){ await Api.updateWorkout(id,payload); showToast('Workout updated'); }
      else { await Api.addWorkout(payload); showToast('Workout added'); }
      resetForm(); await loadWorkouts(); await window.loadDashboard && window.loadDashboard();
    }catch(e){console.error(e); showToast('Failed to save');}
  }

  async function onEdit(ev){
    const id = ev.currentTarget.dataset.id;
    try{
      const res = await Api.getSheet(sheetName);
      const item = (res.data||[]).find(x=>String(x.ID)===String(id)); if(!item) return;
      $('#workout-id').value = item.ID;
      $('#workout-date').value = item.Date || (new Date()).toISOString().slice(0,10);
      $('#workout-type').value = item.Type || 'Gym';
      $('#workout-duration').value = item.Duration || '';
      $('#workout-notes').value = item.Notes || '';
      $('#workout-status').value = item.Status || 'Planned';
      $('#add-workout').textContent='Update';
      window.scrollTo(0,0);
    }catch(e){console.error(e)}
  }

  async function onDelete(ev){
    const id = ev.currentTarget.dataset.id; if(!confirm('Delete this workout?')) return;
    try{ await Api.deleteWorkout(id); showToast('Deleted'); await loadWorkouts(); await window.loadDashboard && window.loadDashboard(); }catch(e){console.error(e); showToast('Failed to delete');}
  }

  document.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('workout-form').addEventListener('submit', onSubmit);
    document.getElementById('reset-workout').addEventListener('click', (e)=>{ e.preventDefault(); resetForm(); });
    loadWorkouts();
  });

})();
