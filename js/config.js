// Application and runtime configuration. Edit only this file in the frontend.
const APP_CONFIG = {
  appName: "My Daily Tracker",
  version: "1.0.0"
};

// Only change API_URL to point to your deployed Google Apps Script Web App URL.
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbxJax83eDfGrz0Aj6z1uqF8wpNL7HibINwxUpnkIT5q0zspAbhNwDmM7ati6YZd9lA6/exec", // e.g. https://script.google.com/macros/s/AKfycb.../exec
  DATE_FORMAT: "YYYY-MM-DD"
};

// Small helper to persist frontend settings (local only)
const LocalSettings = {
  load(){
    try{const s=localStorage.getItem('mdt_settings');return s?JSON.parse(s):{appName:APP_CONFIG.appName,apiUrl:CONFIG.API_URL}}
    catch(e){console.error(e);return {appName:APP_CONFIG.appName,apiUrl:CONFIG.API_URL}}
  },
  save(o){localStorage.setItem('mdt_settings',JSON.stringify(o))}
};