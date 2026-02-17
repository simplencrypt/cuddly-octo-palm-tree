const state = {
  user: null
};

const elements = {
  authSection: document.getElementById("authSection"),
  dashboardSection: document.getElementById("dashboardSection"),
  signupForm: document.getElementById("signupForm"),
  loginForm: document.getElementById("loginForm"),
  transferForm: document.getElementById("transferForm"),
  tabs: document.querySelectorAll(".tab"),
  profileName: document.getElementById("profileName"),
  profileEmail: document.getElementById("profileEmail"),
  profileAge: document.getElementById("profileAge"),
  profileGender: document.getElementById("profileGender"),
  balance: document.getElementById("balance"),
  accountNumber: document.getElementById("accountNumber"),
  transactionList: document.getElementById("transactionList"),
  logoutBtn: document.getElementById("logoutBtn"),
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
  }, 3200);
}

function switchTab(tabName) {
  elements.tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });

  elements.signupForm.classList.toggle("hidden", tabName !== "signup");
  elements.signupForm.classList.toggle("active", tabName === "signup");
  elements.loginForm.classList.toggle("hidden", tabName !== "login");
  elements.loginForm.classList.toggle("active", tabName === "login");
}

function renderDashboard() {
  if (!state.user) {
    return;
  }

  elements.profileName.textContent = state.user.name;
  elements.profileEmail.textContent = state.user.email;
  elements.profileAge.textContent = state.user.age;
  elements.profileGender.textContent = state.user.gender;
  elements.balance.textContent = formatCurrency(state.user.balance);
  elements.accountNumber.textContent = state.user.accountNumber;

  elements.transactionList.innerHTML = "";
  state.user.transactions
    .slice()
    .reverse()
    .forEach((txn) => {
      const item = document.createElement("li");
      const sign = txn.type === "credit" ? "+" : "-";
      const cls = txn.type === "credit" ? "txn-credit" : "txn-debit";

      item.innerHTML = `
        <span>${txn.label}<br /><small>${txn.date}</small></span>
        <span class="${cls}">${sign}${formatCurrency(txn.amount)}</span>
      `;

      elements.transactionList.appendChild(item);
    });
}

function setLoggedIn(isLoggedIn) {
  elements.authSection.classList.toggle("hidden", isLoggedIn);
  elements.dashboardSection.classList.toggle("hidden", !isLoggedIn);
  if (isLoggedIn) {
    renderDashboard();
  }
}

function backendHelpMessage() {
  return "Cannot connect to backend. Run `npm install` and `npm start`, then open http://localhost:8000.";
}

async function api(path, method, payload) {
  let response;

  try {
    response = await fetch(path, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch (_error) {
    throw new Error(backendHelpMessage());
  }

  let data = {};

  try {
    data = await response.json();
  } catch (_error) {
    if (!response.ok) {
      throw new Error("Server returned an invalid response. Please restart the backend server.");
    }
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    switchTab(tab.dataset.tab);
  });
});

elements.signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    name: document.getElementById("signupName").value.trim(),
    age: Number(document.getElementById("signupAge").value),
    gender: document.getElementById("signupGender").value,
    email: document.getElementById("signupEmail").value.trim(),
    password: document.getElementById("signupPassword").value
  };

  try {
    const data = await api("/api/signup", "POST", payload);
    showToast(data.message);
    elements.signupForm.reset();
    switchTab("login");
  } catch (error) {
    showToast(error.message);
  }
});

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    email: document.getElementById("loginEmail").value.trim(),
    password: document.getElementById("loginPassword").value
  };

  try {
    const data = await api("/api/login", "POST", payload);
    state.user = data.profile;
    setLoggedIn(true);
    showToast(`Welcome ${state.user.name}!`);
    elements.loginForm.reset();
  } catch (error) {
    showToast(error.message);
  }
});

elements.transferForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!state.user) {
    return;
  }

  const payload = {
    userId: state.user.id,
    recipient: document.getElementById("recipient").value.trim(),
    amount: Number(document.getElementById("transferAmount").value)
  };

  try {
    const data = await api("/api/transfer", "POST", payload);
    state.user.balance = data.balance;
    state.user.transactions = data.transactions;
    elements.transferForm.reset();
    renderDashboard();
    showToast(data.message);
  } catch (error) {
    showToast(error.message);
  }
});

elements.logoutBtn.addEventListener("click", () => {
  state.user = null;
  setLoggedIn(false);
  switchTab("login");
  showToast("Logged out.");
});

if (window.location.protocol === "file:") {
  showToast("Please run with backend: `npm start`, then open http://localhost:8000");
}
