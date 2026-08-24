// Water UI: quick add buttons and manual entry
(function(){
  const $ = s=>document.querySelector(s);
  const sheet = 'Water';
  function today(){ return (new Date()).toISOString().slice(0,10); }

  async function addMl(ml){
    const payload = { Date: today(), Milliliters: Number(ml)||0, Notes: '' };
    try{ await Api.addWater(payload); showToast('Added'); await loadWater(); await window.loadDashboard && window.loadDashboard(); }
    catch(e){console.error(e); showToast('Failed');}
  }

  async function loadWater(){
    $('#water-list').innerHTML='Loading...';
    try{
      const res = await Api.getSheet(sheet);
      const rows = (res.data||[]).filter(r=>String(r.Date)===today());
      const total = rows.reduce((s,r)=>s+(Number(r.Milliliters)||0),0);
      $('#water-list').innerHTML = `<div class='card'>Today: ${(total/1000).toFixed(2)} L</div>`;
    }catch(e){console.error(e); $('#water-list').innerHTML='Failed to load';}
  }

  async function onSave(ev){ ev.preventDefault(); const payload={ Date: $('#water-date').value||today(), Milliliters: Number($('#water-ml').value)||0, Notes: '' }; try{ await Api.addWater(payload); showToast('Saved'); $('#water-ml').value=''; await loadWater(); await window.loadDashboard && window.loadDashboard(); }catch(e){console.error(e); showToast('Failed'); } }

  document.addEventListener('DOMContentLoaded', ()=>{
    $('#water-add-250').addEventListener('click', ()=>addMl(250));
    $('#water-add-500').addEventListener('click', ()=>addMl(500));
    $('#water-add-1000').addEventListener('click', ()=>addMl(1000));
    $('#water-form').addEventListener('submit', onSave);
    loadWater();
  });
})();
