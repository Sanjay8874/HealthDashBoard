// Simple Google Apps Script Web App backend routing. Uses a single endpoint with action + data.
function doPost(e){
  try{
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var data = payload.data || {};
    switch(action){
      case 'getDashboard': return jsonResponse(getDashboard(data.date));
      case 'getDailyData': return jsonResponse(getDailyData(data.date));
      case 'addFood': return jsonResponse(addFood(data));
      case 'updateFood': return jsonResponse(updateFood(data.id, data.data));
      case 'deleteFood': return jsonResponse(deleteFood(data.id));
      case 'addWeight': return jsonResponse(addWeight(data));
      case 'getFoodLibrary': return jsonResponse(getFoodLibrary());
      case 'getSettings': return jsonResponse(getSettings());
      default: return jsonResponse({error: 'Unknown action: '+action});
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

function getDashboard(date){
  // date expected as YYYY-MM-DD (string)
  var ss = openSheet();
  var foodSheet = ss.getSheetByName(CONFIG.SHEETS.FOOD);
  var weightSheet = ss.getSheetByName(CONFIG.SHEETS.WEIGHT);
  var goalsSheet = ss.getSheetByName(CONFIG.SHEETS.GOALS);
  var out = {};
  // Summarize food calories & protein for date
  if(foodSheet){
    var vals = foodSheet.getDataRange().getValues();
    var headers = vals[0];
    var rows = vals.slice(1);
    var calories = 0, protein = 0, steps = 0, water = 0;
    rows.forEach(function(r){
      var rowDate = r[1] ? formatDate(r[1]) : '';
      if(rowDate == date){
        calories += Number(r[6])||0; // Calories col assumed 6 (index start 0) adjust if template differs
        protein += Number(r[7])||0;
      }
    });
    out.calories = calories; out.protein = protein;
  }
  // Weight: latest entry for date or previous  
  if(weightSheet){
    var vals = weightSheet.getDataRange().getValues();
    var rows = vals.slice(1).reverse();
    var cur=null, prev=null;
    for(var i=0;i<rows.length;i++){
      var r = rows[i];
      var rowDate = r[1] ? formatDate(r[1]) : '';
      if(!cur && rowDate==date){cur = Number(r[2])||null}
      if(!prev && rowDate!=date){prev = Number(r[2])||null}
      if(cur && prev) break;
    }
    out.weight = cur; out.weightChange = (cur!=null && prev!=null)?(Number((cur-prev).toFixed(1))):null;
  }
  // Goals: read minimal goals (steps, water)
  if(goalsSheet){
    var vals = goalsSheet.getDataRange().getValues();
    var rows = vals.slice(1);
    var goals = {};
    rows.forEach(function(r){
      var name = r[1]; var target = r[2]; var unit = r[3];
      if(name && target){
        goals[name.toLowerCase()] = target;
      }
    });
    out.goals = goals;
  }
  return {ok:true, data:out};
}

function getDailyData(date){
  var ss = openSheet();
  var food = getSheetRows(ss, CONFIG.SHEETS.FOOD);
  var outFood = food.filter(function(r){return formatDate(r.Date)==date});
  return {ok:true, data:{food:outFood}};
}

function addFood(data){
  // Validate required fields
  if(!data || !data.date || !data.food) return {error:'Missing required fields'};
  var ss = openSheet();
  var sheet = ss.getSheetByName(CONFIG.SHEETS.FOOD);
  if(!sheet) return {error:'Food sheet not found'};
  // Columns: ID | Date | Meal | Food | Quantity | Unit | Calories | Protein | Carbs | Fat | Notes
  var id = Utilities.getUuid();
  var row = [id, data.date, data.meal||'', data.food||'', data.quantity||'', data.unit||'', data.calories||0, data.protein||0, data.carbs||0, data.fat||0, data.notes||''];
  sheet.appendRow(row);
  return {ok:true, id:id};
}

function addWeight(data){
  if(!data || !data.date || !data.weight) return {error:'Missing date or weight'};
  var ss = openSheet();
  var sheet = ss.getSheetByName(CONFIG.SHEETS.WEIGHT);
  if(!sheet) return {error:'Weight sheet not found'};
  var id = Utilities.getUuid();
  var row = [id, data.date, data.weight, data.bodyFat||'', data.notes||''];
  // If a weight exists for date, update instead of append (simple duplicate handling)
  var vals = sheet.getDataRange().getValues();
  var rows = vals.slice(1);
  for(var i=0;i<rows.length;i++){
    if(formatDate(rows[i][1])==data.date){
      sheet.getRange(i+2,3).setValue(data.weight);
      return {ok:true, updated:true};
    }
  }
  sheet.appendRow(row);
  return {ok:true, id:id};
}

function getFoodLibrary(){
  var ss = openSheet();
  var lib = getSheetRows(ss, CONFIG.SHEETS.FOODLIB);
  return {ok:true, data:lib};
}

function getSettings(){
  var ss = openSheet();
  var rows = getSheetRows(ss, CONFIG.SHEETS.SETTINGS);
  var out = {};
  rows.forEach(function(r){ if(r.Key) out[r.Key] = r.Value; });
  return {ok:true, data:out};
}

/* helpers */
function getSheetRows(ss, sheetName){
  var sheet = ss.getSheetByName(sheetName);
  if(!sheet) return [];
  var vals = sheet.getDataRange().getValues();
  if(vals.length<2) return [];
  var headers = vals[0];
  var rows = vals.slice(1).map(function(r){
    var obj={};
    headers.forEach(function(h,i){obj[h]=r[i]});
    return obj;
  });
  return rows;
}

function formatDate(v){
  // Accept Date object or string; return YYYY-MM-DD string in local timezone if Date provided.
  if(!v) return '';
  if(Object.prototype.toString.call(v)==='[object Date]'){
    var d = v;
    var y = d.getFullYear(); var m = d.getMonth()+1; var day = d.getDate();
    return y+'-'+(m<10?'0'+m:m)+'-'+(day<10?'0'+day:day);
  }
  if(typeof v==='string') return v;
  return String(v);
}
