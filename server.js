const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 8000;
const DATA_FILE = path.join(__dirname, "users.json");

app.use(express.json());
app.use(express.static(__dirname));

function readUsers() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }

  try {
    const content = fs.readFileSync(DATA_FILE, "utf8");
    return content ? JSON.parse(content) : [];
  } catch (error) {
    console.error("Failed reading users.json", error);
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

async function sendConfirmationEmail({ toEmail, name }) {
  const transporter = createTransporter();

  if (!transporter) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.");
  }

  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `CampusBank <${from}>`,
    to: toEmail,
    subject: "CampusBank signup confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>Welcome to CampusBank, ${name}!</h2>
        <p>Your account has been created successfully.</p>
        <p>You can now login and use your dashboard.</p>
        <p>Regards,<br/>CampusBank Team</p>
      </div>
    `
  });
}

app.post("/api/signup", async (req, res) => {
  const { name, age, gender, email, password } = req.body;

  if (!name || !age || !gender || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (!Number.isInteger(Number(age)) || Number(age) < 16) {
    return res.status(400).json({ message: "Please enter a valid age (16+)." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const users = readUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    return res.status(409).json({ message: "Email already registered. Please login." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: crypto.randomUUID(),
    name: String(name).trim(),
    age: Number(age),
    gender: String(gender).trim(),
    email: normalizedEmail,
    passwordHash,
    balance: 25000,
    accountNumber: `XXXXXX${Math.floor(1000 + Math.random() * 9000)}`,
    transactions: [
      { type: "credit", label: "Welcome Bonus", amount: 1500, date: new Date().toISOString().slice(0, 10) }
    ]
  };

  users.push(newUser);
  writeUsers(users);

  try {
    await sendConfirmationEmail({ toEmail: normalizedEmail, name: newUser.name });
  } catch (error) {
    console.error("Email send failed:", error.message);
    return res.status(500).json({
      message: "Signup created, but confirmation email failed. Check SMTP configuration."
    });
  }

  return res.status(201).json({ message: "Signup successful. Confirmation email sent." });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const users = readUsers();
  const user = users.find((item) => item.email === String(email).trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const matched = await bcrypt.compare(password, user.passwordHash);

  if (!matched) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  return res.json({
    message: "Login successful.",
    profile: {
      id: user.id,
      name: user.name,
      age: user.age,
      gender: user.gender,
      email: user.email,
      balance: user.balance,
      accountNumber: user.accountNumber,
      transactions: user.transactions
    }
  });
});

app.post("/api/transfer", (req, res) => {
  const { userId, recipient, amount } = req.body;

  if (!userId || !recipient || !amount) {
    return res.status(400).json({ message: "userId, recipient, and amount are required." });
  }

  const transferAmount = Number(amount);

  if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
    return res.status(400).json({ message: "Transfer amount must be greater than zero." });
  }

  const users = readUsers();
  const user = users.find((item) => item.id === userId);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (transferAmount > user.balance) {
    return res.status(400).json({ message: "Insufficient balance." });
  }

  user.balance -= transferAmount;
  user.transactions.push({
    type: "debit",
    label: `Transfer to ${String(recipient).trim()}`,
    amount: transferAmount,
    date: new Date().toISOString().slice(0, 10)
  });

  writeUsers(users);

  return res.json({
    message: "Transfer successful.",
    balance: user.balance,
    transactions: user.transactions
  });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`CampusBank running on http://localhost:${PORT}`);
});
