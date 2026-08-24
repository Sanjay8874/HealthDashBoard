# My Daily Tracker

Lightweight personal life & fitness tracker using Google Sheets and Google Apps Script as the backend and a static frontend hosted on GitHub Pages.

## Architecture

GitHub Pages (Frontend)
  ↓
Frontend (HTML/CSS/JS)
  ↓
Google Apps Script (Web App)
  ↓
Google Sheets (Data storage)

## Features (v1)
- Mobile-first responsive dashboard
- Food tracking and Food Library
- Weight tracking
- Basic Workout/Study/Water/Notes schema
- Apps Script backend with a single POST endpoint
- Easy configuration: change only Apps Script SPREADSHEET_ID and the frontend API URL

## Quickstart
1. Create a Google Sheet following `docs/GOOGLE_SHEET_SETUP.md`.
2. Copy Apps Script files in `google-apps-script/` into a new Apps Script project and set `CONFIG.SPREADSHEET_ID`.
3. Deploy the Apps Script as a Web App. Copy the Web App URL.
4. Edit `js/config.js` and set `CONFIG.API_URL` to the Web App URL.
5. Push this repository to GitHub and enable GitHub Pages (publish from `main` branch, root).
6. Open your GitHub Pages URL on mobile or desktop.

## Folder structure
- index.html — single-page frontend
- css/style.css — styles
- js/ — frontend logic (config, api, app)
- google-apps-script/ — Apps Script backend code and Config
- docs/ — setup docs

## Changing the Google Sheet (easy)
- Create a new Google Sheet and copy tabs/headers.- Update `CONFIG.SPREADSHEET_ID` in `google-apps-script/Config.gs` and redeploy the Apps Script. No frontend rebuild required.

## Deployment to GitHub Pages
1. Create a new GitHub repository and push the project.2. In repository Settings -> Pages, select Branch: `main` and folder: `/ (root)` then Save.3. Your site will be available at `https://USERNAME.github.io/REPO_NAME/`.

## Security & Privacy
- Do NOT store your spreadsheet ID in the frontend. The frontend only needs the Apps Script Web App URL.- Keep the Google Sheet private; control who can access the Apps Script deployment.
## Development Notes
This project is intentionally lightweight and designed for easy extension. See docs for step-by-step setup and templates.

---
Project generated scaffold — fill in your Apps Script Web App URL in `js/config.js` and your Spreadsheet ID in `google-apps-script/Config.gs`.