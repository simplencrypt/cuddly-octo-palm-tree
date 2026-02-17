# CampusBank - Modern Online Banking System

CampusBank is a college-project banking app with a **real signup + login backend** and modern UI.

## What's New

- Full-stack app (frontend + Node.js backend)
- Sign up form captures:
  - Name
  - Age
  - Gender
  - Email
  - Password
- Real login using stored credentials
- Modern glassmorphism UI
- Bill-pay module removed (as requested)
- Quick transfer + transaction history retained

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js + Express
- Password hashing: bcryptjs
- Storage: local `users.json`

## 1) Setup

From project root:

```bash
npm install
```

## 2) Run the app

```bash
npm start
```

## Important

Do **not** run this app with `python3 -m http.server` for signup/login.
Those features call backend APIs (`/api/signup`, `/api/login`, `/api/transfer`) and require the Node server.
If you see **"Failed to fetch"**, it usually means the backend is not running.


Open:

- `http://localhost:8000`

## 3) Test flow (end-to-end)

1. Go to **Sign Up** tab
2. Fill name, age, gender, email, password
3. Submit signup
4. Switch to **Login** tab and login with same credentials
5. Test transfer flow from dashboard

## Scripts

- `npm start` - run server
- `npm run check` - JS syntax checks

## Project Files

- `index.html` - UI structure
- `styles.css` - modern glassmorphism styling
- `app.js` - frontend auth/dashboard logic
- `server.js` - backend APIs for signup/login/transfer
- `users.json` - generated local user storage
