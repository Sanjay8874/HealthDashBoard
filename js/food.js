// Food UI: list today's foods, food library, add/edit/delete entries
(function(){
  const $ = sel => document.querySelector(sel);
  const todayStr = ()=>{
    const d=new Date(); const pad=(n)=>n<10?('0'+n):n; return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  };

  async function loadFoodList(){
    const date = todayStr();
    $('#food-list').innerHTML = 'Loading...';
    try{
      const res = await Api.getDailyData(date);
      const list = res.data.food || [];
      if(!list.length) { $('#food-list').innerHTML = '<div class="card">No food entries for today</div>'; return; }
      const container = document.createElement('div');
      list.forEach(function(item){
        const row = document.createElement('div'); row.className='card';
        row.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div><strong>${item.Meal}</strong> — ${item.Food} <small style='color:var(--muted)'>${item.Quantity}${item.Unit||''}</small><div style='color:var(--muted)'>${item.Calories} kcal • ${item.Protein||0} g protein</div></div><div><button class='btn small edit-food' data-id='${item.ID}'>Edit</button> <button class='btn small danger delete-food' data-id='${item.ID}'>Delete</button></div></div>`;
        container.appendChild(row);
      });
      $('#food-list').innerHTML=''; $('#food-list').appendChild(container);

      // attach handlers
      $$('.edit-food').forEach(btn=>btn.addEventListener('click', onEditFood));
      $$('.delete-food').forEach(btn=>btn.addEventListener('click', onDeleteFood));
    }catch(e){console.error(e); $('#food-list').innerHTML='Unable to load';}
  }

  async function loadFoodLibrary(){
    const libWrapId = 'food-lib-wrap';
    let wrap = document.getElementById(libWrapId);
    if(!wrap){ wrap = document.createElement('div'); wrap.id = libWrapId; wrap.className='card'; document.getElementById('food').insertBefore(wrap, document.getElementById('food-list')) }
    wrap.innerHTML = '<strong>Food Library</strong><div id="food-lib">Loading…</div>';
    try{
      const res = await Api.getFoodLibrary();
      const items = res.data || [];
      if(!items.length){ document.getElementById('food-lib').innerHTML = '<div style="color:var(--muted)">No items</div>'; return; }
      const ul = document.createElement('div');
      items.forEach(function(it){
        const el = document.createElement('div'); el.style.padding='6px 0';
        el.innerHTML = `<div style="display:flex;justify-content:space-between"><div><strong>${it.Name}</strong> <small style='color:var(--muted)'>${it.CaloriesPer100g || ''} kcal/100g</small></div><div><button class='btn small use-food' data-id='${it.ID}'>Use</button> <button class='btn small edit-lib' data-id='${it.ID}'>Edit</button></div></div>`;
        ul.appendChild(el);
      });
      document.getElementById('food-lib').innerHTML=''; document.getElementById('food-lib').appendChild(ul);
      $$('.use-food').forEach(b=>b.addEventListener('click', onUseLibraryItem));
      // TODO: edit-lib handlers
    }catch(e){console.error(e); document.getElementById('food-lib').innerHTML='Failed to load';}
  }

  function $$(sel){ return Array.from(document.querySelectorAll(sel)); }

  async function onUseLibraryItem(ev){
    const id = ev.currentTarget.dataset.id;
    try{
      const res = await Api.getFoodLibrary();
      const item = (res.data||[]).find(x=>String(x.ID)===String(id));
      if(!item) return;
      // Populate form: default unit and quantity 100
      $('#food-name').value = item.Name || '';
      $('#food-qty').value = 100;
      $('#food-unit').value = 'g';
      $('#food-cals').value = item.CaloriesPer100g || 0;
    }catch(e){console.error(e);}
  }

  async function onEditFood(ev){
    const id = ev.currentTarget.dataset.id;
    try{
      const res = await Api.getDailyData(todayStr());
      const item = (res.data.food||[]).find(x=>String(x.ID)===String(id));
      if(!item) return;
      $('#food-id').value = item.ID;
      $('#food-meal').value = item.Meal||'Lunch';
      $('#food-name').value = item.Food||'';
      $('#food-qty').value = item.Quantity||'';
      $('#food-unit').value = item.Unit||'g';
      $('#food-cals').value = item.Calories||0;
      $('#add-food').textContent = 'Update';
    }catch(e){console.error(e);}
  }

  async function onDeleteFood(ev){
    const id = ev.currentTarget.dataset.id;
    if(!confirm('Delete this food entry?')) return;
    try{
      await Api.deleteFood(id);
      window.refreshFoodList && window.refreshFoodList();
    }catch(e){console.error(e); alert('Failed to delete');}
  }

  async function submitFoodForm(ev){
    ev.preventDefault();
    const id = $('#food-id').value;
    const payload = {
      Date: todayStr(),
      date: todayStr(),
      meal: $('#food-meal').value,
      food: $('#food-name').value,
      quantity: parseFloat($('#food-qty').value)||0,
      unit: $('#food-unit').value,
      calories: parseFloat($('#food-cals').value)||0
    };
    try{
      if(id){
        await Api.updateFood(id,{Date: payload.Date, Meal: payload.meal, Food: payload.food, Quantity: payload.quantity, Unit: payload.unit, Calories: payload.calories});
        $('#add-food').textContent='Add';
      } else {
        await Api.addFood(payload);
      }
      $('#food-id').value=''; $('#food-name').value=''; $('#food-qty').value=''; $('#food-cals').value='';
      window.refreshFoodList && window.refreshFoodList();
      window.loadDashboard && window.loadDashboard();
    }catch(e){console.error(e); alert('Failed to save');}
  }

  // Expose a refresh function for app.js
  window.refreshFoodList = async function(){ await loadFoodList(); await loadFoodLibrary(); await window.loadDashboard && window.loadDashboard(); };

  document.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('food-form').addEventListener('submit', submitFoodForm);
    // also handle add-food click
    document.getElementById('add-food').addEventListener('click', (e)=>{ e.preventDefault(); submitFoodForm(e); });
    loadFoodList(); loadFoodLibrary();
  });
})();
