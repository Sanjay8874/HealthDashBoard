// Simple SPA controller and UI glue for core flows. Keep UI code separated from API logic.
(function(){
  // DOM helpers
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  function showToast(msg, timeout=2000){
    const t = $('#toast'); t.textContent = msg; t.style.display='block';
    setTimeout(()=>t.style.display='none', timeout);
  }

  function setActiveSection(name){
    $$('.page').forEach(p=>p.classList.remove('active'));
    const el = document.getElementById(name);
    if(el) el.classList.add('active');
  }

  function formatDateLocal(d){
    const pad=(n)=>n<10? '0'+n:n;
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }
n  async function loadDashboard(){
    const today = formatDateLocal(new Date());
    $('#today-date').textContent = new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
    try{
      const res = await Api.getDashboard(today);
      // very small rendering for v1
      const cards = $('#cards'); cards.innerHTML='';
      const data = res.data || {};
      const items = [
        {title:'Weight', value:data.weight||'—', sub:data.weightChange?`${data.weightChange>0?'+':''}${data.weightChange} kg`:''},
        {title:'Calories', value:`${data.calories||0} kcal`, sub:`${data.protein||0} g protein`},
        {title:'Steps', value:`${data.steps||0}`, sub:`Goal ${data.goals?data.goals.steps:'—'}`},
        {title:'Water', value:`${(data.water||0)} L`, sub:''}
      ];
      items.forEach(it=>{const c=document.createElement('div');c.className='card';c.innerHTML=`<strong>${it.title}</strong><div style="font-size:18px;margin-top:6px">${it.value}</div><div style="color:var(--muted)">${it.sub||''}</div>`;cards.appendChild(c)});
    }catch(e){console.error(e);showToast('Unable to load dashboard');}
  }

  async function init(){
    // apply saved settings
    const s = LocalSettings.load();
    if(s.appName) $('#app-name').textContent = s.appName;
    if(s.apiUrl) {CONFIG.API_URL = s.apiUrl; $('#setting-api-url').value = s.apiUrl}
    $('#setting-app-name').value = s.appName || APP_CONFIG.appName;
n    // navigation
    $$('.bottom-nav button').forEach(btn=>btn.addEventListener('click',e=>setActiveSection(btn.dataset.section)));
    $('#open-settings').addEventListener('click',()=>setActiveSection('settings'));
n    // load dashboard on start
    await loadDashboard();
n    // food add handler is handled by js/food.js which manages add/update flows. Call window.refreshFoodList() after changes to reload the food list and dashboard.
n    // weight save handler
    $('#save-weight').addEventListener('click', async (ev)=>{
      ev.preventDefault();
      const payload={date:$('#weight-date').value, weight:parseFloat($('#weight-value').value)};
      if(!payload.date || !payload.weight){showToast('Enter date and weight');return}
      try{ await Api.addWeight(payload); showToast('Weight saved'); await loadDashboard(); }
      catch(e){console.error(e); showToast('Failed to save weight');}
    });
n    // settings save handler (local only)
    $('#save-settings').addEventListener('click',()=>{
      const appName = $('#setting-app-name').value || APP_CONFIG.appName;
      const apiUrl = $('#setting-api-url').value || CONFIG.API_URL;
      LocalSettings.save({appName,apiUrl});
      CONFIG.API_URL = apiUrl; $('#app-name').textContent = appName; showToast('Settings saved');
    });
  }

  // expose some helpers for other modules
  window.loadDashboard = loadDashboard;
  window.showToast = showToast;
  // expose some helpers for other modules
  window.loadDashboard = loadDashboard;
  window.showToast = showToast;
  document.addEventListener('DOMContentLoaded',init);
})();
