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

  // Exported functions
  return {
    // Dashboard
    getDashboard(date){return call('getDashboard',{date})},
    getDailyData(date){return call('getDailyData',{date})},

    // Food
    addFood(data){return call('addFood',data)},
    updateFood(id,data){return call('updateFood',{id,data})},
    deleteFood(id){return call('deleteFood',{id})},
    getFoodLibrary(){return call('getFoodLibrary',{})},
    addFoodLibraryItem(data){return call('addFoodLibraryItem',data)},
    updateFoodLibraryItem(id,data){return call('updateFoodLibraryItem',{id,data})},
    deleteFoodLibraryItem(id){return call('deleteFoodLibraryItem',{id})},

    // Weight
    addWeight(data){return call('addWeight',data)},
    updateWeight(id,data){return call('updateWeight',{id,data})},
    deleteWeight(id){return call('deleteWeight',{id})},

    // Workout
    addWorkout(data){return call('addWorkout',data)},
    updateWorkout(id,data){return call('updateWorkout',{id,data})},
    deleteWorkout(id){return call('deleteWorkout',{id})},

    // Study
    addStudy(data){return call('addStudy',data)},
    updateStudy(id,data){return call('updateStudy',{id,data})},
    deleteStudy(id){return call('deleteStudy',{id})},

    // Water
    addWater(data){return call('addWater',data)},
    updateWater(id,data){return call('updateWater',{id,data})},

    // Sleep
    addSleep(data){return call('addSleep',data)},
    updateSleep(id,data){return call('updateSleep',{id,data})},

    // Habits
    getHabits(){return call('getHabits',{})},
    updateHabit(id,data){return call('updateHabit',{id,data})},

    // Goals
    getGoals(){return call('getGoals',{})},
    addGoal(data){return call('addGoal',data)},
    updateGoal(id,data){return call('updateGoal',{id,data})},
    deleteGoal(id){return call('deleteGoal',{id})},

    // Notes
    addNote(data){return call('addNote',data)},
    updateNote(id,data){return call('updateNote',{id,data})},
    deleteNote(id){return call('deleteNote',{id})},

    // Analytics & export
    getAnalytics(range){return call('getAnalytics',{range})},
    exportCSV(sheet){return call('exportCSV',{sheet})},

    // Settings
    getSettings(){return call('getSettings',{})}
  };
})();
