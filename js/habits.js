// Habits UI: create/edit/delete, mark complete for today
(function(){
  const $ = s=>document.querySelector(s);
  const sheet='Habits';
  const logSheet='HabitLog';
  function today(){ return (new Date()).toISOString().slice(0,10); }

  async function loadHabits(){
    $('#habit-list').innerHTML='Loading...';
    try{
      const res = await Api.getSheet(sheet);
      const rows = res.data||[];
      if(!rows.length){ $('#habit-list').innerHTML='<div class="card">No habits yet</div>'; return; }
      const logRes = await Api.getSheet(logSheet);
      const logs = logRes.data||[];
      const container = document.createElement('div');
      rows.forEach(h=>{
        const completed = logs.some(l=>String(l.HabitID)===String(h.ID) && String(l.Date)===today());
        const card = document.createElement('div'); card.className='card';
        card.innerHTML = `<div style='display:flex;justify-content:space-between'><div><strong>${h.Name}</strong><div style='color:var(--muted)'>Target: ${h.TargetFrequency||'-'}</div></div><div><div>${completed?'<span style="color:green">✓ Done</span>':'<button class="btn small mark-h" data-id="'+h.ID+'">Mark</button>'}</div><div style='margin-top:8px'><button class='btn small edit-h' data-id='${h.ID}'>Edit</button> <button class='btn small danger del-h' data-id='${h.ID}'>Delete</button></div></div></div>`;
        container.appendChild(card);
      });
      $('#habit-list').innerHTML=''; $('#habit-list').appendChild(container);
      Array.from(document.querySelectorAll('.mark-h')).forEach(b=>b.addEventListener('click', markHabit));
      Array.from(document.querySelectorAll('.edit-h')).forEach(b=>b.addEventListener('click', editHabit));
      Array.from(document.querySelectorAll('.del-h')).forEach(b=>b.addEventListener('click', delHabit));
    }catch(e){console.error(e); $('#habit-list').innerHTML='Failed to load';}
  }

  async function addHabit(ev){ ev.preventDefault(); const payload={ Name: $('#habit-name').value, TargetFrequency: $('#habit-target').value || '', Active: $('#habit-active').checked? 'TRUE':'FALSE' }; try{ await Api.addRow ? await Api.addRow('Habits',payload) : await Api.addGoal(payload); /* fallback if addRow not exposed*/ showToast('Added'); $('#habit-name').value=''; $('#habit-target').value=''; await loadHabits(); }catch(e){console.error(e); showToast('Failed');} }

  async function markHabit(ev){ const id=ev.currentTarget.dataset.id; try{ await Api.addRow ? await Api.addRow('HabitLog',{ID: Math.random().toString(36).slice(2), HabitID: id, Date: today(), Done: 'TRUE'}) : await Api.addGoal({}); showToast('Marked'); await loadHabits(); }catch(e){console.error(e); showToast('Failed');} }
  async function editHabit(ev){ const id=ev.currentTarget.dataset.id; const res = await Api.getSheet(sheet); const item=(res.data||[]).find(x=>String(x.ID)===String(id)); if(!item) return; $('#habit-name').value=item.Name||''; $('#habit-target').value=item.TargetFrequency||''; $('#habit-active').checked = String(item.Active||'TRUE')==='TRUE'; }
  async function delHabit(ev){ if(!confirm('Delete habit?')) return; const id=ev.currentTarget.dataset.id; try{ await Api.deleteHabit(id); showToast('Deleted'); await loadHabits(); }catch(e){console.error(e); showToast('Failed');} }

  document.addEventListener('DOMContentLoaded', ()=>{ document.getElementById('habit-form').addEventListener('submit', addHabit); loadHabits(); });
})();
