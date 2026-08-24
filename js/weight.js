// Weight UI and simple chart (canvas sparkline)
(function(){
  const $ = sel => document.querySelector(sel);
  function parseDate(s){ return new Date(String(s)); }
  function formatShort(d){ return (d.getMonth()+1)+'/'+d.getDate(); }

  async function loadWeightList(){
    $('#weight-list').innerHTML='Loading…';
    try{
      const res = await Api.getWeightHistory();
      const rows = res.data || [];
      if(!rows.length){ $('#weight-list').innerHTML='<div class="card">No weight records</div>'; return; }
      // Sort by date asc
      rows.sort((a,b)=> new Date(a.Date) - new Date(b.Date));
      const startWeight = Number(rows[0].Weight)||0;
      const currentWeight = Number(rows[rows.length-1].Weight)||0;
      const totalChange = Number((currentWeight - startWeight).toFixed(1));

      const summary = document.createElement('div'); summary.className='card';
      summary.innerHTML = `<div><strong>Current</strong> ${currentWeight} kg</div><div style='color:var(--muted)'>Change: ${totalChange>0?'+':''}${totalChange} kg</div>`;

      const list = document.createElement('div');
      list.className='card';
      const canvas = document.createElement('canvas'); canvas.width=300; canvas.height=80; canvas.style.width='100%';
      list.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      // draw sparkline
      const values = rows.map(r=>Number(r.Weight)||0);
      drawSparkline(ctx, values, canvas.width, canvas.height);

      // table of recent
      const table = document.createElement('div'); table.className='card';
      rows.slice().reverse().slice(0,10).forEach(function(r){ table.innerHTML += `<div style='display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f6fb'><div>${r.Date}</div><div>${r.Weight} kg</div></div>`; });

      $('#weight-list').innerHTML=''; $('#weight-list').appendChild(summary); $('#weight-list').appendChild(list); $('#weight-list').appendChild(table);
    }catch(e){console.error(e); $('#weight-list').innerHTML='Failed to load';}
  }

  function drawSparkline(ctx, arr, w, h){
    if(!arr || !arr.length) return;
    const min = Math.min.apply(null, arr); const max = Math.max.apply(null, arr);
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = '#4f46e5'; ctx.lineWidth=2; ctx.beginPath();
    arr.forEach((v,i)=>{
      const x = (i/(arr.length-1))*(w-10)+5; const y = h - ( (v-min)/(Math.max(1,max-min)) )*(h-10)-5;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();
  }

  document.addEventListener('DOMContentLoaded',()=>{ loadWeightList(); });
  window.loadWeightList = loadWeightList;
})();
