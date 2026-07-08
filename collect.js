// --------------------------------------
// Character List (20 total)
// --------------------------------------
const characters = [
    { id: 101, name: "Little Slugger", cost: 5, img: "characters/slugger.png" },
    { id: 102, name: "Strikeout King", cost: 10, img: "characters/strikeout_king.png" },
    { id: 103, name: "Fastball Fred", cost: 5, img: "characters/fastball_fred.png" },
    { id: 104, name: "Curveball Carl", cost: 5, img: "characters/curveball_carl.png" },
    { id: 105, name: "Home Run Hank", cost: 15, img: "characters/home_run_hank.png" },
    { id: 106, name: "Rookie Rocket", cost: 10, img: "characters/rookie_rocket.png" },
    { id: 107, name: "Rock Star", cost: 10, img: "characters/rock_star.png" },
    { id: 108, name: "Triple Threat Timmy", cost: 15, img: "characters/triple_threat_timmy.png" },
    { id: 109, name: "Dugout Duo", cost: 5, img: "characters/dugout_duo.png" },
    { id: 110, name: "Night Swinger", cost: 10, img: "characters/night_swinger.png" }
];

let currentUser = null;
let pendingRedeemId = null;
let pendingRedeemCost = null;

// Your backend base URL
const API = "https://collect-backend-tg58.onrender.com";

// --------------------------------------
// Load User
// --------------------------------------
async function loadUser() {
    const userId = localStorage.getItem("userCode");

    const res = await fetch(`${API}/loadUser`, {
        method: "POST",
        body: JSON.stringify({ userId }),
        headers: { "Content-Type": "application/json" }
    });

    currentUser = await res.json();

    document.getElementById("tokenBalance").textContent = "Tokens: " + currentUser.tokens;
    document.getElementById("userCode").textContent = "User Code: " + userId;

    buildCharacterGrid();
}

// --------------------------------------
// Build Character Grid
// --------------------------------------
function buildCharacterGrid() {
    const grid = document.getElementById("characterGrid");
    grid.innerHTML = "";

    characters.forEach(char => {
        const owned = currentUser.collectibles.includes(char.id);

        const card = document.createElement("div");
        card.className = "card";
        if (owned) card.classList.add("owned");

        card.innerHTML = `
            <img src="${char.img}">
            <h3>${char.name}</h3>
            <p>Cost: ${char.cost} Tokens</p>
            ${owned ? "" : `<button onclick="openModal(${char.id}, ${char.cost}, '${char.name}')">Redeem</button>`}
        `;

        grid.appendChild(card);
    });
}

// --------------------------------------
// Open Redeem Modal
// --------------------------------------
function openModal(id, cost, name) {
    pendingRedeemId = id;
    pendingRedeemCost = cost;

    document.getElementById("modalTitle").textContent = name;
    document.getElementById("modalCost").textContent = `Cost: ${cost} Tokens`;

    document.getElementById("redeemModal").style.display = "flex";
}

// --------------------------------------
// Close Modal
// --------------------------------------
function closeModal() {
    document.getElementById("redeemModal").style.display = "none";
}

// --------------------------------------
// Confirm Redeem
// --------------------------------------
document.getElementById("confirmRedeem").addEventListener("click", async () => {
    const userId = localStorage.getItem("userCode");

    const res = await fetch(`${API}/redeem`, {
        method: "POST",
        body: JSON.stringify({
            userId,
            collectibleId: pendingRedeemId,
            cost: pendingRedeemCost
        }),
        headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();

    if (data.ok) {
        closeModal();
        loadUser(); // refresh tokens + owned collectibles
    } else {
        alert(data.reason);
    }
});

// --------------------------------------
// Init
// --------------------------------------
loadUser();
