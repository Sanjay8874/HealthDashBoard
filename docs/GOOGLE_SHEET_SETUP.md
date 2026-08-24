# Google Sheet Template — Setup Guide

This document explains how to create the Google Sheet used as the datastore for the tracker.

1. Create a new Google Sheet in your Google Drive.
2. Rename the first tab to `Daily` (optional).
3. Create the following tabs and add the header row exactly as shown (first row):

- Food (sheet name: `Food`)
  ID | Date | Meal | Food | Quantity | Unit | Calories | Protein | Carbs | Fat | Notes

- FoodLibrary (sheet name: `FoodLibrary`)
  ID | Name | CaloriesPer100g | ProteinPer100g | CarbsPer100g | FatPer100g | Notes

- Weight (sheet name: `Weight`)
  ID | Date | Weight | BodyFat | Notes

- Workout (sheet name: `Workout`)
  ID | Date | Type | DurationMinutes | Notes

- Study (sheet name: `Study`)
  ID | Date | Subject | Minutes | Topic | Notes

- Water (sheet name: `Water`)
  ID | Date | Milliliters | Notes

- Sleep (sheet name: `Sleep`)
  ID | Date | Minutes | Quality | Notes

- Habits (sheet name: `Habits`)
  ID | Name | TargetFrequency | Active | Notes

- Goals (sheet name: `Goals`)
  ID | GoalName | Target | Unit | Frequency | Active

- Notes (sheet name: `Notes`)
  ID | Date | Note

- Settings (sheet name: `Settings`)
  Key | Value

4. Copy the Apps Script code from `google-apps-script/Code.gs` and `google-apps-script/Config.gs` into a new Apps Script project bound to or standalone for this spreadsheet.
5. In `Config.gs` replace `YOUR_SPREADSHEET_ID_HERE` with your sheet ID (the long id from the sheet URL).
6. Deploy the Apps Script as a Web App:
   - Publish -> Deploy as web app (or Deploy -> New deployment -> Web app)
   - Execute as: Me
   - Who has access: Anyone (or Anyone with Google account) — choose appropriately.
   - Copy the Web App URL.
7. Open `js/config.js` in the frontend and set `CONFIG.API_URL` to the Web App URL.
8. Push the frontend to GitHub and enable GitHub Pages (see README).

Notes:
- Keep your Google Sheet private. The frontend talks only to Apps Script which has access to the sheet.- To change to a different spreadsheet later, create/copy the tabs and only update SPREADSHEET_ID in Config.gs and redeploy the Apps Script.
