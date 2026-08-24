// Lightweight API wrapper for the Google Apps Script backend. Uses a single POST endpoint with action + data.
const Api = (function(){
  async function call(action, payload){
    if(!CONFIG.API_URL || CONFIG.API_URL.includes('YOUR_APPS_SCRIPT')){
      throw new Error('API_URL is not configured. Place your Apps Script web app URL in js/config.js or Settings.');
    }
    const body = {action, data: payload||{}};
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    if(!res.ok) throw new Error('Server returned '+res.status);
    const json = await res.json();
    if(json.error) throw new Error(json.error);
    return json;
  }

  // Exported functions (minimal set for v1)
  return {
    getDashboard(date){return call('getDashboard',{date})},
    getDailyData(date){return call('getDailyData',{date})},
    addFood(data){return call('addFood',{data})},
    updateFood(id,data){return call('updateFood',{id,data})},
    deleteFood(id){return call('deleteFood',{id})},
    addWeight(data){return call('addWeight',{data})},
    getFoodLibrary(){return call('getFoodLibrary',{})},
    getSettings(){return call('getSettings',{})}
  };
})();
