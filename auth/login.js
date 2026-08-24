// =======================================
// LOGIN MODULE FOR COLLECT
// =======================================

export function initLogin(onSuccess) {

    const API = "https://collect-backend-tg58.onrender.com";

    // Attach event listeners to login UI
    const loginBtn = document.getElementById("loginBtn");
    const createBtn = document.getElementById("createBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    // Make sure buttons exist before attaching
    if (loginBtn) loginBtn.onclick = login;
    if (createBtn) createBtn.onclick = createAccount;
    if (logoutBtn) logoutBtn.onclick = logout;

    // --------------------------------------
    // Log Out
    // --------------------------------------
    function logout() {
        localStorage.removeItem("userCode");
        alert("Logged out");
        location.reload();
    }

    // --------------------------------------
    // Create New Account
    // --------------------------------------
    async function createAccount() {
        const res = await fetch(`${API}/createUser`, { method: "POST" });
        const data = await res.json();

        const userId = data.userId;

        document.getElementById("loginCode").value = userId;

        const password = prompt("Set a password for your new account:");

        await fetch(`${API}/setPassword`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, password })
        });

        localStorage.setItem("userCode", userId);
        alert("Your account code is: " + userId);

        const newUser = await loadUserFromServer(userId);

        // Hand off to Collect
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

        // ⭐ Daily login tokens
        const tokenRes = await fetch(`${API}/awardTokens`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, amount: 5 })
        });

        const tokenData = await tokenRes.json();

        if (tokenData.ok) {
            alert("Daily Tokens Awarded!");
        }

        const updatedUser = await loadUserFromServer(userId);

        alert("Log In Successful");

        // Hand off to Collect
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
