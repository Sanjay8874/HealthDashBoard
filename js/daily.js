// Daily detail view: loads all records for a date and renders sections with quick edit links
(function(){
  const $=s=>document.querySelector(s);
  async function render(date){
    date = date || (new Date()).toISOString().slice(0,10);
    document.getElementById('daily-title').textContent = new Date(date).toLocaleDateString();
    $('#daily-detail').innerHTML = 'Loading...';
    try{
      const res = await Api.getDailyData(date);
      const d = res.data || {};
      const parts = [];
      parts.push(`<div class='card'><strong>Weight</strong><div>${(d.weight&&d.weight.length)?d.weight[0].Weight:'—'}</div></div>`);
      // Nutrition
      const food = d.food || [];
      let cals = 0, protein=0, carbs=0, fat=0;
      food.forEach(f=>{ cals+=Number(f.Calories)||0; protein+=Number(f.Protein)||0; carbs+=Number(f.Carbs)||0; fat+=Number(f.Fat)||0; });
      parts.push(`<div class='card'><strong>Nutrition</strong><div>${cals} kcal • ${protein} g protein • ${carbs} g carbs • ${fat} g fat</div></div>`);
      // Workout
      const workouts = d.workouts || [];
      parts.push(`<div class='card'><strong>Workout</strong><div>${workouts.length?workouts.map(w=>w.Type+' — '+(w.Duration||'')+' min').join('<br>'):'—'}</div></div>`);
      // Steps
      parts.push(`<div class='card'><strong>Steps</strong><div>${(d.steps&&d.steps.length)?d.steps[0].Steps:'—'}</div></div>`);
      // Water
      parts.push(`<div class='card'><strong>Water</strong><div>${(d.water&&d.water.length)?(Number(d.water[0].Milliliters||0)/1000).toFixed(2)+' L':'—'}</div></div>`);
      // Study
      const study = d.study || [];
      let studyMinutes=0; study.forEach(s=>studyMinutes+=Number(s.Minutes)||0);
      parts.push(`<div class='card'><strong>Study</strong><div>${Math.floor(studyMinutes/60)}h ${studyMinutes%60}m</div></div>`);
      // Sleep
      parts.push(`<div class='card'><strong>Sleep</strong><div>${(d.sleep&&d.sleep.length)?(Math.round((Number(d.sleep[0].Minutes)||0)/60)+'h'):'—'}</div></div>`);
      // Habits & notes
      parts.push(`<div class='card'><strong>Notes</strong><div>${(d.notes&&d.notes.length)?d.notes.map(n=>n.Note).join('<br>'):'—'}</div></div>`);
      $('#daily-detail').innerHTML = parts.join('');
    }catch(e){console.error(e); $('#daily-detail').innerHTML='Failed to load';}
  }
  window.showDaily = render;
})();
