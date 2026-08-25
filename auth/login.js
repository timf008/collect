// =======================================
// LOGIN MODULE FOR COLLECT
// =======================================

export function initLogin(onSuccess) {

    const API = "https://collect-backend-tg58.onrender.com";

    // --------------------------------------
    // Attach events immediately (modules run after DOM is parsed)
    // --------------------------------------
    const loginBtn = document.getElementById("loginBtn");
    const createBtn = document.getElementById("createBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const logoutHeaderBtn = document.getElementById("logoutHeaderBtn");

    loginBtn?.addEventListener("click", login);
    createBtn?.addEventListener("click", createAccount);
    logoutBtn?.addEventListener("click", logout);
    logoutHeaderBtn?.addEventListener("click", logout);

    // --------------------------------------
    // Log Out
    // --------------------------------------
    function logout() {
        localStorage.removeItem("userCode");
        alert("Logged out");

        // Show login UI again
        document.getElementById("loginContainer").style.display = "flex";
        document.getElementById("mainContent").style.display = "none";
    }

    // --------------------------------------
// Create New Account
// --------------------------------------
async function createAccount() {

    const password = prompt("Set a password for your new account:");

    // User clicked Cancel
    if (password === null) {
        return;
    }

    // Require at least 6 characters
    if (password.trim().length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    // Only create the account AFTER we have a valid password
    const res = await fetch(`${API}/createUser`, {
        method: "POST"
    });

    const data = await res.json();
    const userId = data.userId;

    // Set password
    const passwordRes = await fetch(`${API}/setPassword`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId,
            password
        })
    });

    const passwordData = await passwordRes.json();

    if (passwordData.error) {
        alert(passwordData.error);
        return;
    }

    document.getElementById("loginCode").value = userId;

    localStorage.setItem("userCode", userId);

    alert("Your account code is: " + userId);

    const newUser = await loadUserFromServer(userId);

    onSuccess(newUser);
}

    // --------------------------------------
    // Helper - Load User From Server
    // --------------------------------------
    async function loadUserFromServer(userId) {
        const res = await fetch(`${API}/loadUser`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId })
        });

        return await res.json();
    }

    // --------------------------------------
    // Error Helpers
    // --------------------------------------
    function showError(element, message) {
        element.textContent = message;
        element.style.display = "block";
    }

    function clearErrors() {
        document.querySelectorAll(".error").forEach(e => {
            e.style.display = "none";
            e.textContent = "";
        });

        document.querySelectorAll("input").forEach(i => {
            i.classList.remove("invalid");
        });
    }

    // --------------------------------------
    // Log In
    // --------------------------------------
    async function login() {
        clearErrors();

        const codeInput = document.getElementById("loginCode");
        const passInput = document.getElementById("loginPassword");

        const codeError = document.getElementById("codeError");
        const passError = document.getElementById("passwordError");

        const userId = codeInput.value.trim();
        const password = passInput.value.trim();

        let valid = true;

        if (!/^\d{6}$/.test(userId)) {
            codeInput.classList.add("invalid");
            showError(codeError, "Code must be exactly 6 digits.");
            valid = false;
        }

        if (password.length < 6) {
            passInput.classList.add("invalid");
            showError(passError, "Password must be at least 6 characters.");
            valid = false;
        }

        if (!valid) return;

        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, password })
        });

        const data = await res.json();

        if (data.error) {
            passInput.classList.add("invalid");
            showError(passError, data.error);
            return;
        }

        localStorage.setItem("userCode", userId);

        // ⭐ Daily login reward
const tokenRes = await fetch(`${API}/dailyLoginReward`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ userId })
});

const tokenData = await tokenRes.json();

if (tokenData.ok) {
    alert("Daily Login Reward: +15 Tokens!");
}

        const updatedUser = await loadUserFromServer(userId);

        alert("Log In Successful");

        onSuccess(updatedUser);
    }

    // --------------------------------------
    // Analyzer Token Rewards
    // --------------------------------------
    const pitcherLink = document.querySelector('a[href="/pitcher-analyzer"]');
    if (pitcherLink) {
        pitcherLink.addEventListener("click", async (e) => {
            e.preventDefault();

            const userId = localStorage.getItem("userCode");

            const res = await fetch(`${API}/awardPitcherTokens`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });

            const data = await res.json();
            if (data.ok) alert("Pitcher Analyzer Tokens Awarded!");

            window.location.href = "/pitcher-analyzer";
        });
    }

    const batterLink = document.querySelector('a[href="/batter-analyzer"]');
    if (batterLink) {
        batterLink.addEventListener("click", async (e) => {
            e.preventDefault();

            const userId = localStorage.getItem("userCode");

            const res = await fetch(`${API}/awardBatterTokens`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });

            const data = await res.json();
            if (data.ok) alert("Batter Analyzer Tokens Awarded!");

            window.location.href = "/batter-analyzer";
        });
    }
}
