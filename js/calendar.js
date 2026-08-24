// Calendar UI: simple month grid showing days and clickable to open daily view
(function(){
  const $=s=>document.querySelector(s);
  const wrapId='calendar-wrap';
  function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1); }
  function daysInMonth(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0).getDate(); }
  function toYMD(d){ return d.toISOString().slice(0,10); }

  async function render(monthDate){
    const wrap = document.getElementById(wrapId);
    wrap.innerHTML='';
    const month = new Date(monthDate.getFullYear(), monthDate.getMonth(),1);
    const firstWeekDay = new Date(month.getFullYear(), month.getMonth(),1).getDay(); // 0 Sun
    const days = daysInMonth(month);
    const header = document.createElement('div'); header.style.display='flex'; header.style.justifyContent='space-between'; header.style.alignItems='center'; header.style.marginBottom='8px'; header.innerHTML = `<button id='cal-prev' class='btn'>&lt;</button><div><strong>${month.toLocaleString(undefined,{month:'long',year:'numeric'})}</strong></div><button id='cal-next' class='btn'>&gt;</button>`; wrap.appendChild(header);
    const grid = document.createElement('div'); grid.style.display='grid'; grid.style.gridTemplateColumns='repeat(7,1fr)'; grid.style.gap='4px';
    // weekday headers
    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(w=>{ const el=document.createElement('div'); el.style.textAlign='center'; el.style.fontWeight='600'; el.textContent=w; grid.appendChild(el); });
    // blanks
    for(let i=0;i<firstWeekDay;i++){ const el=document.createElement('div'); el.innerHTML=''; grid.appendChild(el);} 
    // days
    const res = await Api.getSheet('Daily');
    const daily = (res.data||[]);
    for(let d=1; d<=days; d++){
      const cur = new Date(month.getFullYear(), month.getMonth(), d);
      const ymd = toYMD(cur);
      const has = daily.some(x=>String(x.Date)===ymd);
      const el = document.createElement('button'); el.className='card'; el.style.textAlign='left'; el.style.padding='8px'; el.style.cursor='pointer'; el.dataset.date=ymd;
      el.innerHTML = `<div style='display:flex;justify-content:space-between'><div>${d}</div><div>${has?'<span style="color:green">●</span>':''}</div></div>`;
      el.addEventListener('click', ()=>openDay(ymd));
      grid.appendChild(el);
    }
    wrap.appendChild(grid);
    document.getElementById('cal-prev').addEventListener('click', ()=>{ month.setMonth(month.getMonth()-1); render(month); });
    document.getElementById('cal-next').addEventListener('click', ()=>{ month.setMonth(month.getMonth()+1); render(month); });
  }

  function openDay(ymd){ // open daily page
    setTimeout(()=>{ document.getElementById('daily-title').textContent = new Date(ymd).toLocaleDateString(); },0);
    // load daily detail
    window.showDaily(ymd);
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById('daily').classList.add('active');
  }

  document.addEventListener('DOMContentLoaded', ()=>{ render(new Date()); });
})();
