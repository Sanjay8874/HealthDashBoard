// Simple analytics UI glue
(function(){
  const $ = sel => document.querySelector(sel);
  async function loadAnalytics(){
    const range = $('#analytics-range').value;
    $('#analytics-output').textContent = 'Loading…';
    try{
      const res = await Api.getAnalytics(range);
      const d = res.data || {};
      $('#analytics-output').innerHTML = `<div>Average Calories: <strong>${d.averageCalories||0}</strong></div><div>Average Protein: <strong>${d.averageProtein||0} g</strong></div><div>Food entries: <strong>${(d.entries&&d.entries.food)||0}</strong></div>`;
    }catch(e){
      console.error(e); $('#analytics-output').textContent = 'Unable to load analytics';
    }
  }
  document.addEventListener('DOMContentLoaded',()=>{
    $('#analytics-range').addEventListener('change', loadAnalytics);
    loadAnalytics();
  });
})();
