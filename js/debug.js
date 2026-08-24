// Debug banner: shows API URL and allows pinging the backend (for troubleshooting)
(function(){
  const $ = s => document.querySelector(s);
  function createBanner(){
    const b = document.createElement('div');
    b.id = 'debug-banner';
    b.style.position='fixed'; b.style.right='12px'; b.style.bottom='12px'; b.style.background='rgba(0,0,0,0.75)'; b.style.color='#fff'; b.style.padding='8px 10px'; b.style.borderRadius='8px'; b.style.zIndex=9999; b.style.fontSize='13px';
    b.innerHTML = `<div style="display:flex;gap:8px;align-items:center;"><div id='dbg-url' style='max-width:300px;overflow:auto'></div><button id='dbg-ping' class='btn' style='padding:6px 8px'>Ping</button><span id='dbg-status' style='margin-left:8px'></span></div>`;
    document.body.appendChild(b);
    document.getElementById('dbg-url').textContent = (typeof CONFIG!=='undefined' && CONFIG.API_URL)?CONFIG.API_URL:'(API_URL not set)';
    document.getElementById('dbg-ping').addEventListener('click', async ()=>{
      const s = document.getElementById('dbg-status'); s.textContent='…';
      try{
        if(typeof Api === 'undefined') throw new Error('Api not loaded');
        const res = await Api.getSettings();
        s.textContent = res && res.ok? 'OK': JSON.stringify(res);
      }catch(err){ s.textContent = 'Error: '+err.message; console.error(err); }
    });
  }
  document.addEventListener('DOMContentLoaded', createBanner);
})();
