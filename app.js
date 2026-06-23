const ADMIN_PASSWORD = "demorols1721";

/* =========================
   GLOBAL HELPERS
========================= */
function $(id) {
  return document.getElementById(id);
}

function showMessage(elementId, text, type = "") {
  const el = $(elementId);
  if (!el) return;
  el.textContent = text;
  el.className = `message ${type}`.trim();
}

function showLoading(text = "Please wait...") {
  const overlay = $("loadingOverlay");
  if (!overlay) return;
  const p = overlay.querySelector("p");
  if (p) p.textContent = text;
  overlay.classList.remove("hidden");
}

function hideLoading() {
  const overlay = $("loadingOverlay");
  if (!overlay) return;
  overlay.classList.add("hidden");
}

/* =========================
   STORAGE INITIALIZATION
========================= */
function getDefaultVotes() {
  return {
    president: {
      "Adeolu Thomas": 0,
      "Seun Babatunde": 0
    },
    vicePresident: {
      "Kemi Jaja": 0,
      "Bola Kunmbi": 0
    },
    secretary: {
      "Bode Idowu": 0,
      "Johnson Dada": 0
    }
  };
}

function initializeStorage() {
  if (!localStorage.getItem("votes")) {
    localStorage.setItem("votes", JSON.stringify(getDefaultVotes()));
  }

  if (!localStorage.getItem("usedPasswords")) {
    localStorage.setItem("usedPasswords", JSON.stringify([]));
  }
}

initializeStorage();

/* =========================
   PASSWORD SET (ONLY INDEX PAGE NEEDS IT)
========================= */
const voterPasswordSet =
  typeof voterPasswords !== "undefined"
    ? new Set(voterPasswords.map(p => String(p).trim()))
    : null;

/* =========================
   NAVIGATION
========================= */
function goToAdmin() {
  window.location.href = "admin-login.html";
}

function logoutAdmin() {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "admin-login.html";
}

/* =========================
   INDEX / VOTER LOGIN
========================= */
(function initVoterLogin() {
  const form = $("voterLoginForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const enteredPassword = $("voterPassword").value.trim();
    const loginBtn = $("loginBtn");

    if (!enteredPassword) {
      showMessage("loginMessage", "Please enter your voting password.", "error");
      return;
    }

    if (!voterPasswordSet) {
      showMessage("loginMessage", "Password list not loaded.", "error");
      return;
    }

    if (!voterPasswordSet.has(enteredPassword)) {
      showMessage("loginMessage", "Invalid voting password.", "error");
      return;
    }

    const usedPasswords = JSON.parse(localStorage.getItem("usedPasswords")) || [];

    if (usedPasswords.includes(enteredPassword)) {
      showMessage("loginMessage", "This password has already been used.", "error");
      return;
    }

    // save voter session
    sessionStorage.setItem("currentVoterPassword", enteredPassword);

    loginBtn.disabled = true;
    showLoading("Opening voting page...");

    setTimeout(() => {
      window.location.replace("vote.html");
    }, 200);
  });
})();

/* =========================
   VOTE PAGE ACCESS CONTROL
========================= */
(function protectVotePage() {
  const voteForm = $("voteForm");
  if (!voteForm) return;

  const currentPassword = sessionStorage.getItem("currentVoterPassword");
  if (!currentPassword) {
    window.location.replace("index.html");
    return;
  }
})();

/* =========================
   VOTE SUBMISSION
========================= */
(function initVoteSubmission() {
  const voteForm = $("voteForm");
  if (!voteForm) return;

  voteForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const currentPassword = sessionStorage.getItem("currentVoterPassword");
    if (!currentPassword) {
      alert("Unauthorized access. Please log in again.");
      window.location.replace("index.html");
      return;
    }

    const usedPasswords = JSON.parse(localStorage.getItem("usedPasswords")) || [];
    if (usedPasswords.includes(currentPassword)) {
      alert("This password has already been used.");
      sessionStorage.removeItem("currentVoterPassword");
      window.location.replace("index.html");
      return;
    }

    const president = document.querySelector('input[name="president"]:checked');
    const vicePresident = document.querySelector('input[name="vicePresident"]:checked');
    const secretary = document.querySelector('input[name="secretary"]:checked');

    if (!president || !vicePresident || !secretary) {
      showMessage("voteMessage", "Please select one candidate for each position.", "error");
      return;
    }

    const votes = JSON.parse(localStorage.getItem("votes")) || getDefaultVotes();

    votes.president[president.value]++;
    votes.vicePresident[vicePresident.value]++;
    votes.secretary[secretary.value]++;

    usedPasswords.push(currentPassword);

    localStorage.setItem("votes", JSON.stringify(votes));
    localStorage.setItem("usedPasswords", JSON.stringify(usedPasswords));

    sessionStorage.removeItem("currentVoterPassword");

    showMessage("voteMessage", "Vote submitted successfully.", "success");
    showLoading("Submitting your vote...");

    setTimeout(() => {
      alert("Thank you. Your vote has been recorded successfully.");
      window.location.replace("index.html");
    }, 800);
  });
})();

/* =========================
   ADMIN LOGIN
========================= */
(function initAdminLogin() {
  const form = $("adminLoginForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const entered = $("adminPassword").value.trim();

    if (entered === ADMIN_PASSWORD) {
      localStorage.setItem("adminLoggedIn", "true");
      window.location.replace("admin-dashboard.html");
    } else {
      showMessage("adminLoginMessage", "Incorrect admin password.", "error");
    }
  });
})();

/* =========================
   DASHBOARD
========================= */
function setBarWidth(elementId, value, total) {
  const el = $(elementId);
  if (!el) return;

  let percent = 0;
  if (total > 0) {
    percent = (value / total) * 100;
  }
  el.style.width = `${percent}%`;
}

(function loadDashboard() {
  if (!$("totalVotesCast")) return;

  const isAdminLoggedIn = localStorage.getItem("adminLoggedIn");
  if (isAdminLoggedIn !== "true") {
    window.location.replace("admin-login.html");
    return;
  }

  const votes = JSON.parse(localStorage.getItem("votes")) || getDefaultVotes();
  const usedPasswords = JSON.parse(localStorage.getItem("usedPasswords")) || [];

  const pAdeolu = votes.president["Adeolu Thomas"];
  const pSeun = votes.president["Seun Babatunde"];

  const vpKemi = votes.vicePresident["Kemi Jaja"];
  const vpBola = votes.vicePresident["Bola Kunmbi"];

  const sBode = votes.secretary["Bode Idowu"];
  const sJohnson = votes.secretary["Johnson Dada"];

  $("presidentAdeolu").textContent = pAdeolu;
  $("presidentSeun").textContent = pSeun;
  $("vpKemi").textContent = vpKemi;
  $("vpBola").textContent = vpBola;
  $("secBode").textContent = sBode;
  $("secJohnson").textContent = sJohnson;

  const totalVotesCast = usedPasswords.length;
  $("totalVotesCast").textContent = totalVotesCast;
  $("usedPasswordsCount").textContent = usedPasswords.length;

  const presidentTotal = pAdeolu + pSeun;
  const vpTotal = vpKemi + vpBola;
  const secretaryTotal = sBode + sJohnson;

  setBarWidth("presidentAdeoluBar", pAdeolu, presidentTotal);
  setBarWidth("presidentSeunBar", pSeun, presidentTotal);

  setBarWidth("vpKemiBar", vpKemi, vpTotal);
  setBarWidth("vpBolaBar", vpBola, vpTotal);

  setBarWidth("secBodeBar", sBode, secretaryTotal);
  setBarWidth("secJohnsonBar", sJohnson, secretaryTotal);
})();

/* =========================
   RESET ELECTION
========================= */
function resetElection() {
  const proceed = confirm("Are you sure you want to reset all votes and used passwords?");
  if (!proceed) return;

  localStorage.setItem("votes", JSON.stringify(getDefaultVotes()));
  localStorage.setItem("usedPasswords", JSON.stringify([]));

  alert("Election data has been reset.");
  window.location.reload();
}