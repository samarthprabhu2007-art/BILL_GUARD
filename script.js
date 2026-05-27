// =============================================
//  HELPER UTILITIES
// =============================================

function showToast(msg, isError = false) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.className = "toast show" + (isError ? " error-toast" : "");
  setTimeout(() => { toast.className = "toast"; }, 3000);
}

function isValidEmail(email) {
  // Must have @, a domain part, and a dot in domain
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function showFieldError(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("show", show);
}

function setInputError(id, hasError) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("error", hasError);
}

function showAlert(msg, type) {
  const box = document.getElementById("alert-box");
  if (!box) return;
  box.textContent = msg;
  box.className = "alert show " + type;
  setTimeout(() => { box.className = "alert"; }, 4000);
}


// =============================================
//  AUTH — TAB SWITCHING
// =============================================

function showTab(tab) {
  document.getElementById("login-form").style.display  = tab === "login"  ? "block" : "none";
  document.getElementById("signup-form").style.display = tab === "signup" ? "block" : "none";
  document.getElementById("tab-login").classList.toggle("active",  tab === "login");
  document.getElementById("tab-signup").classList.toggle("active", tab === "signup");
  document.getElementById("alert-box").className = "alert"; // hide alert on tab switch
}


// =============================================
//  AUTH — SIGNUP
// =============================================

function handleSignup() {
  const name    = document.getElementById("signup-name").value.trim();
  const email   = document.getElementById("signup-email").value.trim();
  const pass    = document.getElementById("signup-pass").value;
  const confirm = document.getElementById("signup-confirm").value;

  let valid = true;

  // Name validation
  const nameErr = name.length < 2;
  setInputError("signup-name", nameErr);
  showFieldError("err-signup-name", nameErr);
  if (nameErr) valid = false;

  // Email validation
  const emailErr = !isValidEmail(email);
  setInputError("signup-email", emailErr);
  showFieldError("err-signup-email", emailErr);
  if (emailErr) valid = false;

  // Password length
  const passErr = pass.length < 6;
  setInputError("signup-pass", passErr);
  showFieldError("err-signup-pass", passErr);
  if (passErr) valid = false;

  // Confirm match
  const confirmErr = pass !== confirm;
  setInputError("signup-confirm", confirmErr);
  showFieldError("err-signup-confirm", confirmErr);
  if (confirmErr) valid = false;

  if (!valid) return;

  // Check if account already exists
  const users = JSON.parse(localStorage.getItem("subtrackr_users") || "{}");
  if (users[email.toLowerCase()]) {
    showAlert("An account with this email already exists. Please login.", "error");
    return;
  }

  // Save user to local storage (so login still works as before)
  users[email.toLowerCase()] = { name, email, password: pass };
  localStorage.setItem("subtrackr_users", JSON.stringify(users));

  // ALSO save to MongoDB via our new Vercel API
  fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email })
  }).catch(e => console.error("MongoDB error:", e));

  showAlert("Account created! You can now login.", "success");
  setTimeout(() => showTab("login"), 1500);
}


// =============================================
//  AUTH — LOGIN
// =============================================

function handleLogin() {
  const email = document.getElementById("login-email").value.trim();
  const pass  = document.getElementById("login-pass").value;

  let valid = true;

  const emailErr = !isValidEmail(email);
  setInputError("login-email", emailErr);
  showFieldError("err-login-email", emailErr);
  if (emailErr) valid = false;

  const passErr = pass.length === 0;
  setInputError("login-pass", passErr);
  showFieldError("err-login-pass", passErr);
  if (passErr) valid = false;

  if (!valid) return;

  const users = JSON.parse(localStorage.getItem("subtrackr_users") || "{}");
  const user  = users[email.toLowerCase()];

  if (!user) {
    showAlert("No account found with this email. Please sign up.", "error");
    return;
  }

  if (user.password !== pass) {
    showAlert("Wrong password. Please try again.", "error");
    setInputError("login-pass", true);
    return;
  }

  // Save session
  localStorage.setItem("subtrackr_session", JSON.stringify({ email: email.toLowerCase(), name: user.name }));
  window.location.href = "index.html";
}


// =============================================
//  DASHBOARD — INIT
// =============================================

function getSession() {
  return JSON.parse(localStorage.getItem("subtrackr_session") || "null");
}

function logout() {
  localStorage.removeItem("subtrackr_session");
  window.location.href = "login.html";
}

function getSubKey(email) {
  return "subtrackr_subs_" + email;
}

function loadSubs(email) {
  return JSON.parse(localStorage.getItem(getSubKey(email)) || "[]");
}

function saveSubs(email, subs) {
  localStorage.setItem(getSubKey(email), JSON.stringify(subs));
}

// Cycle display labels
const CYCLE_LABELS = {
  "one-time":   "🔂 One Time",
  "monthly":    "📅 Monthly",
  "per-15":     "⏱️ Every 15 Days",
  "per-6months":"📆 Every 6 Months"
};

// Given a start date + cycle, compute the next upcoming due date
function getNextDueDate(startDateStr, cycle) {
  const today = new Date(); today.setHours(0,0,0,0);
  let due = new Date(startDateStr);

  if (cycle === "one-time") return due; // no recurrence

  // Advance due date until it's today or in the future
  while (due < today) {
    if (cycle === "monthly")    due.setMonth(due.getMonth() + 1);
    if (cycle === "per-15")     due.setDate(due.getDate() + 15);
    if (cycle === "per-6months") due.setMonth(due.getMonth() + 6);
  }
  return due;
}

function getStatus(startDateStr, cycle) {
  const today = new Date(); today.setHours(0,0,0,0);
  const due   = getNextDueDate(startDateStr, cycle);
  const diff  = Math.floor((due - today) / (1000 * 60 * 60 * 24));

  if (cycle === "one-time" && diff < 0) return { label: "Done",     cls: "overdue"  };
  if (diff < 0)                          return { label: "Overdue",  cls: "overdue"  };
  if (diff <= 7)                         return { label: "Due Soon", cls: "due-soon" };
  return { label: "Active", cls: "active" };
}

// Show/hide date label based on cycle selection
function handleCycleChange() {
  const cycle = document.getElementById("sub-cycle").value;
  const dateLabel = document.querySelector("label[for='sub-date']") ||
                    document.getElementById("sub-date").previousElementSibling;
  const dateInput = document.getElementById("sub-date");
  if (cycle === "one-time") {
    dateInput.setAttribute("placeholder", "Date of payment");
  } else {
    dateInput.setAttribute("placeholder", "First payment date");
  }
}

function renderTable(subs) {
  const tbody    = document.getElementById("sub-tbody");
  const table    = document.getElementById("sub-table");
  const emptyMsg = document.getElementById("empty-msg");

  if (!tbody) return;
  tbody.innerHTML = "";

  if (subs.length === 0) {
    table.style.display = "none";
    emptyMsg.style.display = "block";
    return;
  }

  table.style.display = "table";
  emptyMsg.style.display = "none";

  subs.forEach((sub, i) => {
    const cycle  = sub.cycle || "monthly";
    const status = getStatus(sub.date, cycle);
    const nextDue = getNextDueDate(sub.date, cycle);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${sub.name}</strong></td>
      <td>${sub.category}</td>
      <td style="font-family:'DM Mono',monospace;">₹${Number(sub.amount).toLocaleString()}</td>
      <td>${CYCLE_LABELS[cycle] || cycle}</td>
      <td>${nextDue.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</td>
      <td><span class="badge ${status.cls}">${status.label}</span></td>
      <td><button class="del-btn" onclick="deleteSubscription(${i})">✕ Remove</button></td>
    `;
    tbody.appendChild(row);
  });
}

function updateSummary(subs) {
  const total   = subs.reduce((s, x) => s + Number(x.amount), 0);
  const dueSoon = subs.filter(x => ["Due Soon","Overdue"].includes(getStatus(x.date, x.cycle || "monthly").label)).length;
  document.getElementById("total-amount").textContent   = "₹" + total.toLocaleString();
  document.getElementById("total-subs").textContent     = subs.length;
  document.getElementById("due-soon-count").textContent = dueSoon;
}

function initDashboard() {
  const session = getSession();
  if (!session) { window.location.href = "login.html"; return; }

  document.getElementById("nav-username").textContent = "👋 " + session.name;

  const subs = loadSubs(session.email);
  renderTable(subs);
  updateSummary(subs);
}


// =============================================
//  DASHBOARD — ADD SUBSCRIPTION
// =============================================

function addSubscription() {
  const name     = document.getElementById("sub-name").value.trim();
  const amount   = document.getElementById("sub-amount").value;
  const date     = document.getElementById("sub-date").value;
  const category = document.getElementById("sub-category").value;
  const cycle    = document.getElementById("sub-cycle").value;

  let valid = true;

  const nameErr = name.length === 0;
  setInputError("sub-name", nameErr);
  showFieldError("err-name", nameErr);
  if (nameErr) valid = false;

  const amountErr = !amount || Number(amount) <= 0;
  setInputError("sub-amount", amountErr);
  showFieldError("err-amount", amountErr);
  if (amountErr) valid = false;

  const cycleErr = cycle === "";
  setInputError("sub-cycle", cycleErr);
  showFieldError("err-cycle", cycleErr);
  if (cycleErr) valid = false;

  const dateErr = date === "";
  setInputError("sub-date", dateErr);
  showFieldError("err-date", dateErr);
  if (dateErr) valid = false;

  const catErr = category === "";
  setInputError("sub-category", catErr);
  showFieldError("err-category", catErr);
  if (catErr) valid = false;

  if (!valid) return;

  const session = getSession();
  const subs    = loadSubs(session.email);

  subs.push({ name, amount: Number(amount), date, category, cycle });
  saveSubs(session.email, subs);

  // Reset form
  document.getElementById("sub-name").value     = "";
  document.getElementById("sub-amount").value   = "";
  document.getElementById("sub-date").value     = "";
  document.getElementById("sub-category").value = "";
  document.getElementById("sub-cycle").value    = "";

  renderTable(subs);
  updateSummary(subs);
  showToast("✅ " + name + " added successfully!");
}


// =============================================
//  DASHBOARD — DELETE SUBSCRIPTION
// =============================================

function deleteSubscription(index) {
  const session = getSession();
  const subs    = loadSubs(session.email);
  const removed = subs.splice(index, 1)[0];
  saveSubs(session.email, subs);
  renderTable(subs);
  updateSummary(subs);
  showToast("🗑️ " + removed.name + " removed.", true);
}


// =============================================
//  AUTO-INIT
// =============================================

window.addEventListener("DOMContentLoaded", () => {
  // Only init dashboard if on index.html
  if (document.getElementById("sub-tbody")) {
    initDashboard();
  }
});