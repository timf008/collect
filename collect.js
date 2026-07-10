// --------------------------------------
// Character List (20 total)
// --------------------------------------
const characters = [
    { id: 101, name: "Little Slugger", cost: 5, img: "characters/slugger.png" },
    { id: 102, name: "Strikeout King", cost: 10, img: "characters/strikeout_king.png" },
    { id: 103, name: "Fastball Fred", cost: 5, img: "characters/fastball_fred.png" },
    { id: 104, name: "Curveball Carl", cost: 5, img: "characters/curveball_carl.png" },
    { id: 105, name: "Home Run Hank", cost: 10, img: "characters/home_run_hank.png" },
    { id: 106, name: "Rookie Rocket", cost: 10, img: "characters/rookie_rocket.png" },
    { id: 107, name: "Rock Star", cost: 15, img: "characters/rock_star.png" },
    { id: 108, name: "Triple Threat Timmy", cost: 15, img: "characters/triple_threat_timmy.png" },
    { id: 109, name: "Dugout Duo", cost: 5, img: "characters/dugout_duo.png" },
    { id: 110, name: "Night Swinger", cost: 10, img: "characters/night_swinger.png" },
];

const stadiums = [
    { id: 111, name: "Luna Ballpark", cost: 15, img: "stadiums/luna_ballpark.png" },
    { id: 112, name: "Pyramid Park", cost: 10, img: "stadiums/pyramid_park.png" },
    { id: 113, name: "Seaside Stadium", cost: 5, img: "stadiums/seaside_stadium.png" },
    { id: 114, name: "Skyline Field", cost: 5, img: "stadiums/skyline_field.png" },
    { id: 115, name: "Cruise Ship Complex", cost: 10, img: "stadiums/cruise_ship_complex.png" },
    { id: 116, name: "Polar Park", cost: 10, img: "stadiums/polar_park.png" },
    { id: 117, name: "Cactus Coliseum", cost: 10, img: "stadiums/cactus_coliseum.png" },
    { id: 118, name: "Great Lakes Gardens", cost: 15, img: "stadiums/great_lakes_gardens.png" },
    { id: 119, name: "Rocky Mountain Field", cost: 5, img: "stadiums/rocky_mountain_field.png" },
    { id: 120, name: "Bayside Ballpark", cost: 5, img: "stadiums/bayside_ballpark.png" },
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

const badge = getCollectorBadge(currentUser.collectibles.length);
    document.getElementById("collectorBadge").textContent = "Badge: " + badge;

    buildCharacterGrid();
    buildStadiumGrid();
}

// --------------------------------------
// Collector Badges
// --------------------------------------
function getCollectorBadge(count) {
    if (count >= 15) return "Pro Collector";
    if (count >= 10) return "Amateur Collector";
    if (count >= 5) return "Rookie Collector";
    return "Prospect Collector";
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
// Build Stadium Grid
// --------------------------------------
function buildStadiumGrid() {
    const grid = document.getElementById("stadiumGrid");
    grid.innerHTML = "";

    stadiums.forEach(stadium => {
        const owned = currentUser.collectibles.includes(stadium.id);

        const card = document.createElement("div");
        card.className = "card";
        if (owned) card.classList.add("owned");

        card.innerHTML = `
            <img src="${stadium.img}">
            <h3>${stadium.name}</h3>
            <p>Cost: ${stadium.cost} Tokens</p>
            ${owned ? "" : `<button onclick="openModal(${stadium.id}, ${stadium.cost}, '${stadium.name}')">Redeem</button>`}
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
