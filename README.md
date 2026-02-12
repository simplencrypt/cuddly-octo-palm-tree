# CampusBank - Modern Online Banking System

CampusBank is a college-project banking app with a **real signup + login backend** and **actual confirmation email support** (via SMTP).

## What's New

- Full-stack app (frontend + Node.js backend)
- Sign up form captures:
  - Name
  - Age
  - Gender
  - Email
  - Password
- Real login using stored credentials
- Confirmation email sent right after successful signup
- Modern glassmorphism UI
- Bill-pay module removed (as requested)
- Quick transfer + transaction history retained

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js + Express
- Password hashing: bcryptjs
- Email delivery: Nodemailer (SMTP)
- Storage: local `users.json`

## 1) Setup

From project root:

```bash
npm install
```

## 2) Configure real email sending (required)

Set these environment variables before starting server:

- `SMTP_HOST` (example: `smtp.gmail.com`)
- `SMTP_PORT` (example: `465` for SSL, or `587` for TLS)
- `SMTP_USER` (your email account)
- `SMTP_PASS` (app password or SMTP password)
- `SMTP_SECURE` (`true` for port 465, otherwise `false`)
- `FROM_EMAIL` (optional sender email; defaults to SMTP_USER)

### Example (Linux/macOS)

```bash
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=465
export SMTP_USER=your_email@gmail.com
export SMTP_PASS=your_app_password
export SMTP_SECURE=true
export FROM_EMAIL=your_email@gmail.com
```

> For Gmail, use an **App Password**, not your normal account password.

## 3) Run the app

```bash
npm start
```

Open:

- `http://localhost:8000`

## 4) Test flow (end-to-end)

1. Go to **Sign Up** tab
2. Fill name, age, gender, email, password
3. Submit signup
4. Check inbox of the registered email for confirmation mail
5. Switch to **Login** tab and login with same credentials
6. Test transfer flow from dashboard

## Scripts

- `npm start` - run server
- `npm run check` - JS syntax checks

## Project Files

- `index.html` - UI structure
- `styles.css` - modern glassmorphism styling
- `app.js` - frontend auth/dashboard logic
- `server.js` - backend APIs + SMTP email sending
- `users.json` - generated local user storage
