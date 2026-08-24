// Your backend base URL
const API = "https://collect-backend-tg58.onrender.com";

// =======================================
// LOGIN WRAPPER FOR COLLECT
// =======================================

// Load login module (your login.js must export initLogin)
import { initLogin } from "./auth/login.js";

// Check if user is already logged in
const storedCode = localStorage.getItem("userCode");

if (!storedCode) {

    document.getElementById("mainContent").style.display = "none";

    initLogin(async (user) => {

        localStorage.setItem("userCode", user.userId);

        document.getElementById("mainContent").style.display = "block";

        // Hide entire overlay
        document.getElementById("loginContainer").style.display = "none";


        await loadUser();
        await loadWeeklyChallenge();
    });

} else {

    document.getElementById("mainContent").style.display = "block";

    // Hide entire overlay on auto-login
    document.getElementById("loginContainer").style.display = "none";

    loadUser();
    loadWeeklyChallenge();
}


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

const buses = [
{ id: 121, name: "Bayside Bus", cost: 5, img: "buses/bayside_bus.png" },
{ id: 122, name: "Cactus Bus", cost: 10, img: "buses/cactus_bus.png" },
{ id: 123, name: "Cruise Ship Bus", cost: 10, img: "buses/cruise_ship_bus.png" },
{ id: 124, name: "Great Lakes Bus", cost: 15, img: "buses/great_lakes_bus.png" },
{ id: 125, name: "Luna Bus", cost: 15, img: "buses/luna_bus.png" },
{ id: 126, name: "Polar Bus", cost: 10, img: "buses/polar_bus.png" },
{ id: 127, name: "Pyramid Bus", cost: 10, img: "buses/pyramid_bus.png" },
{ id: 128, name: "Rocky Mountain Bus", cost: 5, img: "buses/rocky_mountain_bus.png" },
{ id: 129, name: "Seaside Bus", cost: 5, img: "buses/seaside_bus.png" },
{ id: 130, name: "Skyline Bus", cost: 5, img: "buses/skyline_bus.png" },
];

const mystery = [
    {
        id: 200,
        name: "Slugger Chew",
        img: "mystery/mystery_item.png",
        unlockedImg: "mystery/slugger_chew.png"
    },
    {
        id: 201,
        name: "Slugger Juice",
        img: "mystery/mystery_item.png",
        unlockedImg: "mystery/slugger_juice.png"
    },
    {
        id: 202,
        name: "Slugger Seeds",
        img: "mystery/mystery_item.png",
        unlockedImg: "mystery/slugger_seeds.png"
    },
    {
        id: 203,
        name: "Slugger Spray",
        img: "mystery/mystery_item.png",
        unlockedImg: "mystery/slugger_spray.png"
    }

];


const chest = {
    id: 999,
    name: "Legendary Bat",
    img: "mystery/mystery_chest.png",        // locked
    unlockedImg: "mystery/legendary_bat.png" // unlocked
};



let currentUser = null;
let pendingRedeemId = null;
let pendingRedeemCost = null;


// --------------------------------------
// Load User (SAFE VERSION)
// --------------------------------------
async function loadUser() {
    const userId = localStorage.getItem("userCode");

    if (!userId) {
        console.error("No userCode found in localStorage.");
        return;
    }

    const res = await fetch(`${API}/loadUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
    });

    const data = await res.json();

    // ❌ If backend returned an error, stop immediately
    if (!data || data.error) {
        console.error("loadUser() failed:", data);
        return;
    }

    // ✔ Safe to use now
    currentUser = data;
    currentUser.userId = userId;

    // Update UI
    document.getElementById("tokenBalance").textContent = `Tokens: 🔶${currentUser.tokens}`;
    document.getElementById("userCode").textContent = "User Code: " + userId;

    const badge = getCollectorBadge(currentUser.collectibles.length);
    document.getElementById("collectorBadge").textContent = "Level: " + badge;

    const levelNumber = badgeToLevel(badge);
    buildLevelMeter(levelNumber);

    checkMysteryUnlocks();

    // Save updated user safely
    await fetch(`${API}/saveUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentUser)
    });

    // Build UI grids
    buildCharacterGrid();
    buildStadiumGrid();
    buildBusGrid();
    buildMysteryGrid();
    buildMysteryChest();
}




// --------------------------------------
// Collector Badges
// --------------------------------------
function getCollectorBadge(count) {
    if (count >= 20) return "Hall of Fame";
    if (count >= 15) return "Pro";
    if (count >= 10) return "Amateur";
    if (count >= 5) return "Rookie";
    return "Prospect";
}

function badgeToLevel(badge) {
    switch (badge) {
        case "Prospect": return 1;
        case "Rookie": return 2;
        case "Amateur": return 3;
        case "Pro": return 4;
        case "Hall of Fame": return 5;
        default: return 1;
    }
}


// --------------------------------------
// Level Battery Meter
// --------------------------------------
function buildLevelMeter(level) {
    const meter = document.getElementById("levelMeter");
    meter.innerHTML = "";

    for (let i = 1; i <= 5; i++) {
        const seg = document.createElement("div");
        seg.className = "level-segment";
        if (level >= i) seg.classList.add("filled");
        meter.appendChild(seg);
    }
}


// --------------------------------------
// Weekly Challenge Stat Labels
// --------------------------------------
const statLabels = {
    BA: "Batting Average",
    OBP: "On Base Percentage",
    SLG: "Slugging Percentage",
    Kpct: "Strikeout Percentage",
    BBpct: "Walk Percentage"
};

// --------------------------------------
// Load Weekly Challenge
// --------------------------------------
async function loadWeeklyChallenge() {
    const res = await fetch(`${API}/getWeeklyChallenge`);
    const wc = await res.json();

    // Build readable text
    const readableStat = statLabels[wc.stat] || wc.stat;

    document.getElementById("weeklyText").textContent =
        `Find ${wc.player}'s ${wc.season} ${readableStat} in the Batter Analyzer.`;
}

// --------------------------------------
// Submit Hunt (SAFE VERSION)
// --------------------------------------
async function submitHunt() {
    const answer = document.getElementById("huntAnswer").value.trim();
    const userId = localStorage.getItem("userCode");

    // ⭐ Prevent running without login
    if (!userId) {
        document.getElementById("huntResult").textContent = "Please log in first.";
        return;
    }

    // ⭐ Prevent empty answers
    if (!answer) {
        document.getElementById("huntResult").textContent = "Please enter an answer.";
        return;
    }

    const res = await fetch(`${API}/weeklyHunt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, answer })
    });

    const data = await res.json();

    // ⭐ Show backend message
    document.getElementById("huntResult").textContent = data.message || "No response.";

    // ⭐ Refresh tokens ONLY if correct
    if (data.ok) {
        await loadUser();   // refresh tokenBalance, badge, grids
    }
}

// --------------------------------------
// Build Mystery Grid
// --------------------------------------
function buildMysteryGrid() {
    const grid = document.getElementById("mysteryGrid");
    grid.innerHTML = "";

    mystery.forEach(item => {
        const unlocked = currentUser.mystery?.includes(item.id);

        const card = document.createElement("div");
        card.className = "mystery-card";
        card.classList.add(unlocked ? "unlocked" : "locked");

        card.innerHTML = `
            <img src="${unlocked ? item.unlockedImg : item.img}">
            ${unlocked ? `<h4>${item.name}</h4>` : ""}
        `;

        grid.appendChild(card);
    });
}

// --------------------------------------
// Mystery Unlock Logic (Patched for Modal)
// --------------------------------------
function checkMysteryUnlocks() {
    const unlocked = currentUser.mystery || [];

    const charCount = currentUser.collectibles.filter(id => id >= 101 && id <= 110).length;
    const stadiumCount = currentUser.collectibles.filter(id => id >= 111 && id <= 120).length;
    const busCount = currentUser.collectibles.filter(id => id >= 121 && id <= 130).length;

    const fullCharacters = charCount === 10;
    const fullStadiums = stadiumCount === 10;
    const fullBuses = busCount === 10;

    // Unlock Slugger Chew (200)
    if (charCount >= 5 && !unlocked.includes(200)) {
        unlocked.push(200);
        mysteryUnlockedPrompt("Slugger Chew", 200);
    }

    // Unlock Slugger Juice (201)
    if (busCount >= 5 && !unlocked.includes(201)) {
        unlocked.push(201);
        mysteryUnlockedPrompt("Slugger Juice", 201);
    }

    // Unlock Slugger Seeds (202)
    if (stadiumCount >= 5 && !unlocked.includes(202)) {
        unlocked.push(202);
        mysteryUnlockedPrompt("Slugger Seeds", 202);
    }

    // Unlock Slugger Spray (203)
    if ((fullCharacters || fullStadiums || fullBuses) && !unlocked.includes(203)) {
        unlocked.push(203);
        mysteryUnlockedPrompt("Slugger Spray", 203);
    }

    // --------------------------------------
    // Unlock Mystery Chest (separate slot)
    // --------------------------------------
    const allComplete = fullCharacters && fullStadiums && fullBuses;

    if (allComplete && !currentUser.mysteryChest?.unlocked) {
        currentUser.mysteryChest = { unlocked: true, id: 999 };
        mysteryUnlockedPrompt("Legendary Bat", 999);

        // ⭐ Update chest UI immediately
        buildMysteryChest();
    }

    currentUser.mystery = unlocked;

    // ⭐ ALWAYS refresh both UI sections after unlocks
    buildMysteryGrid();
    buildMysteryChest();
}



// --------------------------------------
// Build Mystery Chest
// --------------------------------------
function buildMysteryChest() {
    const chest = currentUser.mysteryChest;

    const container = document.getElementById("mysteryChestContent");

    if (!chest || !chest.unlocked) {
        container.innerHTML = `<img src="mystery/mystery_chest.png" alt="Mystery Chest Locked">`;
    } else {
        container.innerHTML = `<img src="mystery/legendary_bat.png" alt="Legendary Bat">`;
    }
}



// --------------------------------------
// New Modal-Based Unlock Prompt
// --------------------------------------
function mysteryUnlockedPrompt(name, id) {
    let item = mystery.find(m => m.id === id);

    // Chest fallback
    if (!item && id === 999) {
        item = chest;
    }

    const imageUrl = item ? item.unlockedImg : "mystery/mystery_item.png";
    showMysteryModal(name, imageUrl);
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
            <p>Cost: 🔶${char.cost} </p>
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
            <p>Cost: 🔶${stadium.cost}</p>
            ${owned ? "" : `<button onclick="openModal(${stadium.id}, ${stadium.cost}, '${stadium.name}')">Redeem</button>`}
        `;

        grid.appendChild(card);
    });
}

// --------------------------------------
// Build Bus Grid
// --------------------------------------
function buildBusGrid() {
    const grid = document.getElementById("busGrid");
    grid.innerHTML = "";

    buses.forEach(bus => {
        const owned = currentUser.collectibles.includes(bus.id);

        const card = document.createElement("div");
        card.className = "card";
        if (owned) card.classList.add("owned");

        card.innerHTML = `
            <img src="${bus.img}">
            <h3>${bus.name}</h3>
            <p>Cost: 🔶${bus.cost}</p>
            ${owned ? "" : `<button onclick="openModal(${bus.id}, ${bus.cost}, '${bus.name}')">Redeem</button>`}
        `;

        grid.appendChild(card);
    });
}

// --------------------------------------
// Open Redeem Modal
// --------------------------------------
function openModal(id, cost, name) {
    const userId = localStorage.getItem("userCode");
    if (!userId) {
        alert("Please log in first.");
        return;
    }

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
    if (!userId) {
        alert("Please log in first.");
        return;
    }

    const res = await fetch(`${API}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId,
            collectibleId: pendingRedeemId,
            cost: pendingRedeemCost
        })
    });

    const data = await res.json();

    if (data.ok) {
        closeModal();
        await loadUser();
    } else {
        alert(data.reason);
    }
});

// --------------------------------------
// Mystery Modal
// --------------------------------------
function showMysteryModal(name, imageUrl) {
    document.getElementById("mysteryName").textContent = name;
    document.getElementById("mysteryImage").src = imageUrl;
    document.getElementById("mysteryModal").classList.remove("hidden");
}

function closeMysteryModal() {
    document.getElementById("mysteryModal").classList.add("hidden");
}

// --------------------------------------
// Expose globally for inline HTML
// --------------------------------------
window.openModal = openModal;
window.closeModal = closeModal;
window.showMysteryModal = showMysteryModal;
window.closeMysteryModal = closeMysteryModal;




// --------------------------------------
// Init
// --------------------------------------
loadUser();
loadWeeklyChallenge();
