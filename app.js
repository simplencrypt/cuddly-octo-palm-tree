const demoUser = {
  studentId: "STU2026",
  password: "bank123",
  name: "Aarav Sharma",
  accountNumber: "XXXXXX8751",
  balance: 25000,
  transactions: [
    { type: "credit", label: "Scholarship Credit", amount: 5000, date: "2026-01-05" },
    { type: "debit", label: "Hostel Fee", amount: 8000, date: "2026-01-11" },
    { type: "debit", label: "Cafeteria", amount: 340, date: "2026-01-14" }
  ]
};

const state = {
  loggedIn: false,
  profile: structuredClone(demoUser)
};

const elements = {
  authSection: document.getElementById("authSection"),
  dashboardSection: document.getElementById("dashboardSection"),
  loginForm: document.getElementById("loginForm"),
  transferForm: document.getElementById("transferForm"),
  billForm: document.getElementById("billForm"),
  logoutBtn: document.getElementById("logoutBtn"),
  balance: document.getElementById("balance"),
  accountNumber: document.getElementById("accountNumber"),
  transactionList: document.getElementById("transactionList"),
  toast: document.getElementById("toast")
};

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    elements.toast.classList.add("hidden");
  }, 2000);
}

function renderDashboard() {
  elements.balance.textContent = formatCurrency(state.profile.balance);
  elements.accountNumber.textContent = state.profile.accountNumber;

  elements.transactionList.innerHTML = "";
  state.profile.transactions
    .slice()
    .reverse()
    .forEach((txn) => {
      const item = document.createElement("li");
      const amountClass = txn.type === "credit" ? "txn-credit" : "txn-debit";
      const symbol = txn.type === "credit" ? "+" : "-";
      item.innerHTML = `
        <span>${txn.label}<br /><small class="muted">${txn.date}</small></span>
        <span class="${amountClass}">${symbol}${formatCurrency(txn.amount)}</span>
      `;
      elements.transactionList.appendChild(item);
    });
}

function setLoggedIn(loggedIn) {
  state.loggedIn = loggedIn;
  elements.authSection.classList.toggle("hidden", loggedIn);
  elements.dashboardSection.classList.toggle("hidden", !loggedIn);
  if (loggedIn) {
    renderDashboard();
  }
}

function addTransaction(type, label, amount) {
  state.profile.transactions.push({
    type,
    label,
    amount,
    date: new Date().toISOString().slice(0, 10)
  });
}

elements.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const studentId = document.getElementById("studentId").value.trim();
  const password = document.getElementById("password").value.trim();

  if (studentId === demoUser.studentId && password === demoUser.password) {
    setLoggedIn(true);
    showToast(`Welcome ${demoUser.name}!`);
  } else {
    showToast("Invalid credentials. Please try demo login.");
  }
});

elements.transferForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const recipient = document.getElementById("recipient").value.trim();
  const amount = Number(document.getElementById("transferAmount").value);

  if (!recipient || amount <= 0) {
    showToast("Enter valid transfer details.");
    return;
  }

  if (amount > state.profile.balance) {
    showToast("Insufficient balance.");
    return;
  }

  state.profile.balance -= amount;
  addTransaction("debit", `Transfer to ${recipient}`, amount);
  elements.transferForm.reset();
  renderDashboard();
  showToast("Transfer successful.");
});

elements.billForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const billType = document.getElementById("billType").value;
  const amount = Number(document.getElementById("billAmount").value);

  if (!billType || amount <= 0) {
    showToast("Enter valid bill payment details.");
    return;
  }

  if (amount > state.profile.balance) {
    showToast("Insufficient balance.");
    return;
  }

  state.profile.balance -= amount;
  addTransaction("debit", `${billType} Bill Paid`, amount);
  elements.billForm.reset();
  renderDashboard();
  showToast(`${billType} bill paid.`);
});

elements.logoutBtn.addEventListener("click", () => {
  state.profile = structuredClone(demoUser);
  elements.loginForm.reset();
  setLoggedIn(false);
  showToast("Logged out.");
});
