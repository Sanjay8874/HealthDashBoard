// Google Apps Script Web App backend with expanded handlers supporting the tracker actions.
// Keep CONFIG.SPREADSHEET_ID in Config.gs. Only that file should change when switching sheets.

function doPost(e){
  try{
    var payload = JSON.parse(e.postData.contents || '{}');
    var action = payload.action;
    var data = payload.data || {};
    switch(action){
      case 'getDashboard': return jsonResponse(getDashboard(data.date));
      case 'getDailyData': return jsonResponse(getDailyData(data.date));

      // Food
      case 'addFood': return jsonResponse(addFood(data));
      case 'updateFood': return jsonResponse(updateById(CONFIG.SHEETS.FOOD, data.id, data.data));
      case 'deleteFood': return jsonResponse(deleteById(CONFIG.SHEETS.FOOD, data.id));
      case 'getFoodLibrary': return jsonResponse(getFoodLibrary());
      case 'addFoodLibraryItem': return jsonResponse(addRow(CONFIG.SHEETS.FOODLIB, data));
      case 'updateFoodLibraryItem': return jsonResponse(updateById(CONFIG.SHEETS.FOODLIB, data.id, data.data));
      case 'deleteFoodLibraryItem': return jsonResponse(deleteById(CONFIG.SHEETS.FOODLIB, data.id));

      // Weight
      case 'addWeight': return jsonResponse(addWeight(data));
      case 'updateWeight': return jsonResponse(updateById(CONFIG.SHEETS.WEIGHT, data.id, data.data));
      case 'deleteWeight': return jsonResponse(deleteById(CONFIG.SHEETS.WEIGHT, data.id));

      // Workout
      case 'addWorkout': return jsonResponse(addRow(CONFIG.SHEETS.WORKOUT, data));
      case 'updateWorkout': return jsonResponse(updateById(CONFIG.SHEETS.WORKOUT, data.id, data.data));
      case 'deleteWorkout': return jsonResponse(deleteById(CONFIG.SHEETS.WORKOUT, data.id));

      // Study
      case 'addStudy': return jsonResponse(addRow(CONFIG.SHEETS.STUDY, data));
      case 'updateStudy': return jsonResponse(updateById(CONFIG.SHEETS.STUDY, data.id, data.data));
      case 'deleteStudy': return jsonResponse(deleteById(CONFIG.SHEETS.STUDY, data.id));

      // Water
      case 'addWater': return jsonResponse(addRow(CONFIG.SHEETS.WATER, data));
      case 'updateWater': return jsonResponse(updateById(CONFIG.SHEETS.WATER, data.id, data.data));

      // Sleep
      case 'addSleep': return jsonResponse(addRow(CONFIG.SHEETS.SLEEP, data));
      case 'updateSleep': return jsonResponse(updateById(CONFIG.SHEETS.SLEEP, data.id, data.data));

      // Habits
      case 'getHabits': return jsonResponse(getSheetRowsObj(CONFIG.SHEETS.HABITS));
      case 'updateHabit': return jsonResponse(updateById(CONFIG.SHEETS.HABITS, data.id, data.data));

      // Goals
      case 'getGoals': return jsonResponse(getSheetRowsObj(CONFIG.SHEETS.GOALS));
      case 'addGoal': return jsonResponse(addRow(CONFIG.SHEETS.GOALS, data));
      case 'updateGoal': return jsonResponse(updateById(CONFIG.SHEETS.GOALS, data.id, data.data));
      case 'deleteGoal': return jsonResponse(deleteById(CONFIG.SHEETS.GOALS, data.id));

      // Notes
      case 'addNote': return jsonResponse(addRow(CONFIG.SHEETS.NOTES, data));
      case 'updateNote': return jsonResponse(updateById(CONFIG.SHEETS.NOTES, data.id, data.data));
      case 'deleteNote': return jsonResponse(deleteById(CONFIG.SHEETS.NOTES, data.id));

      // Analytics and export
      case 'getAnalytics': return jsonResponse(getAnalytics(data.range || '30d'));
      case 'exportCSV': return exportCSV(data.sheet || CONFIG.SHEETS.FOOD);

      case 'getSettings': return jsonResponse(getSettings());
      case 'getWeightHistory': return jsonResponse({ok:true, data:getSheetRowsObj(CONFIG.SHEETS.WEIGHT)});
      case 'getSheet': return jsonResponse({ok:true, data:getSheetRowsObj(data.sheetName)});

      default:
        return jsonResponse({error: 'Unknown action: '+action});
    }
  }catch(err){
    return jsonResponse({error: err.message});
  }
}

function jsonResponse(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function openSheet(){
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  return ss;
}

/* High-level handlers */
function getDashboard(date){
  date = String(date || '').trim() || formatDate(new Date());
  var ss = openSheet();
  var out = {};

  // Nutrition summary
  var foodRows = getSheetRowsObj(CONFIG.SHEETS.FOOD);
  var dayFood = foodRows.filter(function(r){ return String(r.Date)==date; });
  var totals = {calories:0, protein:0, carbs:0, fat:0};
  dayFood.forEach(function(f){ totals.calories += Number(f.Calories)||0; totals.protein += Number(f.Protein)||0; totals.carbs += Number(f.Carbs)||0; totals.fat += Number(f.Fat)||0; });
  out.calories = totals.calories; out.protein = totals.protein; out.carbs = totals.carbs; out.fat = totals.fat;

  // Weight
  var weights = getSheetRowsObj(CONFIG.SHEETS.WEIGHT).sort(function(a,b){ return String(b.Date) < String(a.Date) ? -1 : 1; });
  var cur = weights.length?Number(weights[0].Weight)||null:null;
  var prev = weights.length>1?Number(weights[1].Weight)||null:null;
  out.weight = cur; out.weightChange = (cur!=null && prev!=null)?Number((cur-prev).toFixed(1)):null;

  // Steps & water from Daily or Goals fallback
  var daily = getSheetRowsObj(CONFIG.SHEETS.DAILY);
  var d = daily.filter(function(x){return String(x.Date)==date;})[0]||{};
  out.steps = Number(d.Steps)||0; out.water = (Number(d.Water)||0)/1000; // assume ml stored

  // Goals
  var goals = {};
  var goalRows = getSheetRowsObj(CONFIG.SHEETS.GOALS);
  goalRows.forEach(function(g){ if(g.GoalName) goals[g.GoalName.toLowerCase()] = g.Target; });
  out.goals = goals;

  return {ok:true, data:out};
}

function getDailyData(date){
  date = String(date || formatDate(new Date()));
  var ss = openSheet();
  var food = getSheetRowsObj(CONFIG.SHEETS.FOOD).filter(function(r){return String(r.Date)==date});
  var weight = getSheetRowsObj(CONFIG.SHEETS.WEIGHT).filter(function(r){return String(r.Date)==date});
  var workouts = getSheetRowsObj(CONFIG.SHEETS.WORKOUT).filter(function(r){return String(r.Date)==date});
  var study = getSheetRowsObj(CONFIG.SHEETS.STUDY).filter(function(r){return String(r.Date)==date});
  var water = getSheetRowsObj(CONFIG.SHEETS.WATER).filter(function(r){return String(r.Date)==date});
  var sleep = getSheetRowsObj(CONFIG.SHEETS.SLEEP).filter(function(r){return String(r.Date)==date});
  var notes = getSheetRowsObj(CONFIG.SHEETS.NOTES).filter(function(r){return String(r.Date)==date});
  return {ok:true, data:{food:food, weight:weight, workouts:workouts, study:study, water:water, sleep:sleep, notes:notes}};
}

/* Generic row operations using sheet header-driven mapping */
function getSheetRowsObj(sheetName){
  var ss = openSheet();
  var sheet = ss.getSheetByName(sheetName);
  if(!sheet) return [];
  var vals = sheet.getDataRange().getValues();
  if(vals.length<2) return [];
  var headers = vals[0];
  var rows = vals.slice(1).map(function(r){
    var obj = {};
    headers.forEach(function(h,i){ obj[h] = r[i]; });
    return obj;
  });
  return rows;
}

function addRow(sheetName, data){
  var ss = openSheet();
  var sheet = ss.getSheetByName(sheetName);
  if(!sheet) return {error: 'Sheet not found: '+sheetName};
  var headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  var id = Utilities.getUuid();
  var row = [];
  headers.forEach(function(h){
    if(h === 'ID') row.push(id);
    else if(data.hasOwnProperty(h)) row.push(data[h]);
    else row.push('');
  });
  sheet.appendRow(row);
  return {ok:true, id:id};
}

function updateById(sheetName, id, updates){
  if(!id) return {error:'Missing id'};
  var ss = openSheet();
  var sheet = ss.getSheetByName(sheetName);
  if(!sheet) return {error:'Sheet not found: '+sheetName};
  var vals = sheet.getDataRange().getValues();
  var headers = vals[0];
  for(var r=1;r<vals.length;r++){
    if(String(vals[r][0]) === String(id)){
      var rowIndex = r+1; // 1-based
      for(var c=1;c<headers.length;c++){
        var colName = headers[c];
        if(updates.hasOwnProperty(colName)){
          sheet.getRange(rowIndex, c+1).setValue(updates[colName]);
        }
      }
      return {ok:true, updated:true};
    }
  }
  return {error:'ID not found'};
}

function deleteById(sheetName, id){
  if(!id) return {error:'Missing id'};
  var ss = openSheet();
  var sheet = ss.getSheetByName(sheetName);
  if(!sheet) return {error:'Sheet not found: '+sheetName};
  var vals = sheet.getDataRange().getValues();
  for(var r=1;r<vals.length;r++){
    if(String(vals[r][0]) === String(id)){
      sheet.deleteRow(r+1);
      return {ok:true, deleted:true};
    }
  }
  return {error:'ID not found'};
}

/* Convenience addWeight with duplicate-date handling */
function addWeight(data){
  if(!data || !data.Date || !data.Weight) return {error:'Missing date or weight'};
  var sheetName = CONFIG.SHEETS.WEIGHT;
  var rows = getSheetRowsObj(sheetName);
  for(var i=0;i<rows.length;i++){
    if(String(rows[i].Date) === String(data.Date)){
      return updateById(sheetName, rows[i].ID, {Weight: data.Weight, BodyFat: data.BodyFat||rows[i].BodyFat || '', Notes: data.Notes||rows[i].Notes||''});
    }
  }
  return addRow(sheetName, data);
}

/* Analytics simple aggregator */
function getAnalytics(range){
  // range examples: '7d','30d','90d','all'
  var days = 30;
  if(range === '7d') days = 7; else if(range==='90d' || range==='3m') days=90; else if(range==='180d') days=180; else if(range==='365d') days=365; else if(range==='all') days = 36500;
  var end = new Date();
  var start = new Date(); start.setDate(end.getDate() - days + 1);
  var food = getSheetRowsObj(CONFIG.SHEETS.FOOD).filter(function(r){ var d=new Date(String(r.Date)); return d>=start && d<=end; });
  var weight = getSheetRowsObj(CONFIG.SHEETS.WEIGHT).filter(function(r){ var d=new Date(String(r.Date)); return d>=start && d<=end; });
  var stepsSum = 0, caloriesSum=0, proteinSum=0, daysCount = {};
  food.forEach(function(f){ caloriesSum += Number(f.Calories)||0; proteinSum += Number(f.Protein)||0; daysCount[String(f.Date)] = 1; });
  var daysTotal = Object.keys(daysCount).length || 1;
  return {ok:true, data:{averageCalories: Math.round(caloriesSum/daysTotal), averageProtein: Math.round(proteinSum/daysTotal), entries: {food: food.length, weight: weight.length}}};
}

/* CSV export: returns text/plain CSV response */
function exportCSV(sheetName){
  var ss = openSheet();
  var sheet = ss.getSheetByName(sheetName);
  if(!sheet) return jsonResponse({error:'Sheet not found'});
  var vals = sheet.getDataRange().getValues();
  var lines = vals.map(function(r){ return r.map(function(c){ return '"'+String(c).replace(/"/g,'""')+'"'; }).join(','); });
  var txt = lines.join('\n');
  return ContentService.createTextOutput(txt).setMimeType(ContentService.MimeType.TEXT);
}

function getFoodLibrary(){
  return {ok:true, data: getSheetRowsObj(CONFIG.SHEETS.FOODLIB)};
}

function getSettings(){
  var rows = getSheetRowsObj(CONFIG.SHEETS.SETTINGS);
  var out = {};
  rows.forEach(function(r){ if(r.Key) out[r.Key] = r.Value; });
  return {ok:true, data:out};
}

/* Utility */
function formatDate(v){
  if(!v) return '';
  if(Object.prototype.toString.call(v)==='[object Date]'){
    var d = v; var y = d.getFullYear(); var m = d.getMonth()+1; var day = d.getDate();
    return y+'-'+(m<10?'0'+m:m)+'-'+(day<10?'0'+day:day);
  }
  return String(v);
}
