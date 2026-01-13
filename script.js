// --- DATA CONFIG ---
const NBA_COLORS = {
    "Atlanta Hawks": "#E03A3E", "Boston Celtics": "#007A33", "Brooklyn Nets": "#000000", "Charlotte Hornets": "#1D1160",
    "Chicago Bulls": "#CE1141", "Cleveland Cavaliers": "#860038", "Dallas Mavericks": "#00538C", "Denver Nuggets": "#FEC524",
    "Detroit Pistons": "#C8102E", "Golden State Warriors": "#1D428A", "Houston Rockets": "#CE1141", "Indiana Pacers": "#FDBB30",
    "LA Clippers": "#C8102E", "Los Angeles Lakers": "#552583", "Memphis Grizzlies": "#5D76A9", "Miami Heat": "#98002E",
    "Milwaukee Bucks": "#00471B", "Minnesota Timberwolves": "#0C2340", "New Orleans Pelicans": "#0C2340", "New York Knicks": "#F58426",
    "Oklahoma City Thunder": "#007AC1", "Orlando Magic": "#0077C0", "Philadelphia 76ers": "#006BB6", "Phoenix Suns": "#1D1160",
    "Portland Trail Blazers": "#E03A3E", "Sacramento Kings": "#5A2D81", "San Antonio Spurs": "#C4CED4", "Toronto Raptors": "#CE1141",
    "Utah Jazz": "#002B5C", "Washington Wizards": "#002B5C",
    // Defaults/Classic mapping heuristics
    "Seattle SuperSonics": "#00653A", "New Jersey Nets": "#002A60", "Vancouver Grizzlies": "#00B2A9"
};

function getTeamColor(name) {
    if (NBA_COLORS[name]) return NBA_COLORS[name];
    // Check for substring matches for classic teams
    for (const [key, val] of Object.entries(NBA_COLORS)) {
        if (name.includes(key)) return val;
        // Handle "Lakers", "Bulls" etc alone
        const franchise = key.split(' ').pop();
        if (name.includes(franchise)) return val;
    }
    return '#C6A45F'; // Fallback Gold
}

const CURRENT_TEAMS = [
    "Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets", "Chicago Bulls",
    "Cleveland Cavaliers", "Dallas Mavericks", "Denver Nuggets", "Detroit Pistons", "Golden State Warriors",
    "Houston Rockets", "Indiana Pacers", "LA Clippers", "Los Angeles Lakers", "Memphis Grizzlies",
    "Miami Heat", "Milwaukee Bucks", "Minnesota Timberwolves", "New Orleans Pelicans", "New York Knicks",
    "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns", "Portland Trail Blazers",
    "Sacramento Kings", "San Antonio Spurs", "Toronto Raptors", "Utah Jazz", "Washington Wizards"
];

const CLASSIC_TEAMS = [
    "1964-65 Los Angeles Lakers", "1970-71 Los Angeles Lakers", "1970-71 Milwaukee Bucks", "1971-72 New York Knicks",
    "1976-77 Philadelphia 76ers", "1984-85 Milwaukee Bucks", "1985-86 Atlanta Hawks", "1985-86 Boston Celtics",
    "1985-86 Chicago Bulls", "1986-87 Los Angeles Lakers", "1988-89 Chicago Bulls", "1988-89 Detroit Pistons",
    "1989-90 Cleveland Cavaliers", "1990-91 Chicago Bulls", "1990-91 Golden State Warriors", "1990-91 Los Angeles Lakers",
    "1990-91 Portland Trail Blazers", "1992-93 Charlotte Hornets", "1992-93 Chicago Bulls", "1993-94 Denver Nuggets",
    "1993-94 Houston Rockets", "1994-95 New York Knicks", "1994-95 Orlando Magic", "1995-96 Chicago Bulls",
    "1995-96 Seattle SuperSonics", "1996-97 Miami Heat", "1997-98 Chicago Bulls", "1997-98 Los Angeles Lakers",
    "1997-98 San Antonio Spurs", "1997-98 Utah Jazz", "1998-99 New York Knicks", "1999-00 Portland Trail Blazers",
    "1999-00 Toronto Raptors", "2000-01 Los Angeles Lakers", "2000-01 Philadelphia 76ers", "2001-02 New Jersey Nets",
    "2001-02 Sacramento Kings", "2002-03 Dallas Mavericks", "2002-03 Phoenix Suns", "2003-04 Detroit Pistons",
    "2003-04 Los Angeles Lakers", "2003-04 Minnesota Timberwolves", "2004-05 Phoenix Suns", "2004-05 San Antonio Spurs",
    "2005-06 Memphis Grizzlies", "2005-06 Miami Heat", "2006-07 Cleveland Cavaliers", "2006-07 Golden State Warriors",
    "2006-07 Washington Wizards", "2007-08 Boston Celtics", "2007-08 Denver Nuggets", "2007-08 Houston Rockets",
    "2009-10 Portland Trail Blazers", "2010-11 Chicago Bulls", "2010-11 Dallas Mavericks", "2011-12 New York Knicks",
    "2011-12 Oklahoma City Thunder", "2012-13 Memphis Grizzlies", "2012-13 Miami Heat", "2013-14 Indiana Pacers",
    "2013-14 Los Angeles Clippers", "2013-14 San Antonio Spurs", "2015-16 Cleveland Cavaliers", "2015-16 Golden State Warriors",
    "2016-17 Golden State Warriors", "2018-19 Toronto Raptors"
];

// --- STATE MANAGEMENT ---
const state = {
    teams: [], // { id, members: [], assignedTeams: [], spinsLeft: 3, selectedTeam: null }
    activeTeamIndex: 0,
    isClassic: false,
    wheelItems: [],
    leaderboard: JSON.parse(localStorage.getItem('2k_leaderboard')) || {},
    isSpinning: false,
    currentRotation: 0
};

// --- DOM ELEMENTS ---
const elements = {
    views: {
        setup: document.getElementById('setup'),
        game: document.getElementById('game'),
        leaderboard: document.getElementById('leaderboard')
    },
    nav: document.querySelectorAll('.nav-btn'),
    setup: {
        input: document.getElementById('player-input'),
        inc: document.getElementById('inc-teams'),
        dec: document.getElementById('dec-teams'),
        count: document.getElementById('team-count'),
        start: document.getElementById('start-btn'),
        toggle: document.getElementById('wheel-toggle')
    },
    game: {
        container: document.getElementById('teams-container'),
        wheelCanvas: document.getElementById('wheel-canvas'),
        spinBtn: document.getElementById('spin-btn'),
        suicideBtn: document.getElementById('suicide-btn'),
        endTurnBtn: document.getElementById('end-turn-btn'),
        statusInfo: document.getElementById('spins-remaining'),
        statusHeader: document.getElementById('current-spinning-team'),
        resetBtn: document.getElementById('reset-btn')
    },
    leaderboard: {
        body: document.getElementById('leaderboard-body'),
        resetBtn: document.getElementById('reset-lb-btn'),
        addInput: document.getElementById('new-player-name'),
        addBtn: document.getElementById('add-player-btn')
    },
    modal: {
        winner: document.getElementById('winner-select'),
        loser: document.getElementById('loser-select'),
        cancel: document.getElementById('cancel-result'),
        confirm: document.getElementById('confirm-result')
    },
    confirmModal: {
        overlay: document.getElementById('confirm-modal'),
        title: document.getElementById('confirm-title'),
        message: document.getElementById('confirm-message'),
        cancel: document.getElementById('confirm-cancel'),
        ok: document.getElementById('confirm-ok'),
        activeCallback: null
    }
};

// --- INITIALIZATION ---
function init() {
    setupEventListeners();
    renderLeaderboard();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function setupEventListeners() {
    // Nav
    elements.nav.forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.target));
    });

    // Setup
    elements.setup.inc.addEventListener('click', () => updateTeamCount(1));
    elements.setup.dec.addEventListener('click', () => updateTeamCount(-1));
    elements.setup.start.addEventListener('click', startDraft);

    // Game
    elements.game.spinBtn.addEventListener('click', spinWheel);
    elements.game.suicideBtn.addEventListener('click', activateSuicideSpin);
    elements.game.endTurnBtn.addEventListener('click', forceNextTurn);
    elements.game.resetBtn.addEventListener('click', resetCurrentGameTurn);

    // Modal
    elements.modal.cancel.addEventListener('click', () => elements.modal.overlay.classList.add('hidden'));
    elements.modal.confirm.addEventListener('click', confirmGameResult);

    // Team Selection Delegation
    elements.game.container.addEventListener('click', handleTeamSelection);

    // Leaderboard
    elements.leaderboard.resetBtn.addEventListener('click', resetLeaderboard);
    elements.leaderboard.addBtn.addEventListener('click', addPlayer);

    // Confirm Modal - close on cancel
    elements.confirmModal.cancel.addEventListener('click', () => {
        elements.confirmModal.overlay.classList.add('hidden');
        elements.confirmModal.activeCallback = null;
    });
    // Confirm Modal - Execute callback on OK
    elements.confirmModal.ok.addEventListener('click', () => {
        if (elements.confirmModal.activeCallback) elements.confirmModal.activeCallback();
        elements.confirmModal.overlay.classList.add('hidden');
    });

    // Delegation for dynamic delete buttons AND stat buttons
    elements.leaderboard.body.addEventListener('click', handleLeaderboardClick);
}

// --- UTILS ---
function showConfirm(title, message, onConfirm) {
    elements.confirmModal.title.innerText = title;
    elements.confirmModal.message.innerText = message;
    elements.confirmModal.activeCallback = onConfirm;
    elements.confirmModal.overlay.classList.remove('hidden');
}

// --- VIEW LOGIC ---
function switchView(viewName) {
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    elements.views[viewName].classList.add('active');
    document.querySelector(`.nav-btn[data-target="${viewName}"]`).classList.add('active');

    if (viewName === 'leaderboard') renderLeaderboard();
    if (viewName === 'game') {
        // slight delay to ensure display:block is applied so clientWidth works
        setTimeout(() => {
            resizeCanvas();
            renderAppGame();
        }, 50);
    }
}

function updateTeamCount(change) {
    let count = parseInt(elements.setup.count.innerText);
    count += change;
    if (count < 2) count = 2;
    if (count > 10) count = 10;
    elements.setup.count.innerText = count;
}

// --- DRAFT LOGIC ---
function startDraft() {
    const rawText = elements.setup.input.value.trim();
    if (!rawText) return alert("Please enter some player names!");

    const names = rawText.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    const teamCount = parseInt(elements.setup.count.innerText);

    if (names.length < teamCount) return alert(`Need at least ${teamCount} players for ${teamCount} teams.`);

    for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [names[i], names[j]] = [names[j], names[i]];
    }

    // Auto-Register new players to leaderboard
    registerPlayers(names);

    // Distribute
    state.teams = Array.from({ length: teamCount }, (_, i) => ({
        id: i + 1,
        members: [],
        assignedTeams: [],
        spinsLeft: 3,
        canSuicide: false,
        selectedTeam: null
    }));

    names.forEach((name, index) => {
        state.teams[index % teamCount].members.push(name);
    });

    // Wheel Setup
    state.isClassic = elements.setup.toggle.checked;
    state.wheelItems = state.isClassic ? [...CLASSIC_TEAMS] : [...CURRENT_TEAMS];
    if (state.isClassic) {
        // Shuffle Classic Teams explicitly so the wheel isn't alphabetical every time (though spin is random, visual variety helps)
        state.wheelItems.sort(() => Math.random() - 0.5);
    }

    state.activeTeamIndex = 0;
    state.currentRotation = 0;

    state.activeTeamIndex = 0;
    state.currentRotation = 0;

    switchView('game');
}

// --- RENDER GAME ---
function renderAppGame() {
    const container = elements.game.container;
    container.innerHTML = '';

    state.teams.forEach((team, index) => {
        const isActive = index === state.activeTeamIndex;
        const div = document.createElement('div');
        div.className = `team-card ${isActive ? 'active-turn' : ''}`;
        div.dataset.index = index;

        let optionsHtml = team.assignedTeams.map(t =>
            `<div class="assigned-team-item ${team.selectedTeam === t ? 'selected' : ''}" data-team="${t}">
                ${t} ${team.selectedTeam === t ? '✅' : ''}
             </div>`
        ).join('');

        div.innerHTML = `
            <div class="team-header">
                <span>TEAM ${team.id}</span>
                <span>${isActive ? 'My Turn' : ''}</span>
            </div>
            <div class="team-members">${team.members.join(', ')}</div>
            <div class="assigned-teams">
                ${optionsHtml || '<i>No teams spun yet...</i>'}
            </div>
        `;
        container.appendChild(div);
    });

    updateWheelStatus();
    drawWheel();
}

function handleTeamSelection(e) {
    const item = e.target.closest('.assigned-team-item');
    if (!item) return;

    const card = item.closest('.team-card');
    const index = parseInt(card.dataset.index);
    const teamName = item.dataset.team;

    state.teams[index].selectedTeam = teamName;
    renderAppGame();
}



function updateWheelStatus() {
    const team = state.teams[state.activeTeamIndex];
    if (!team) return; // Should not happen

    elements.game.statusHeader.innerText = `TEAM ${team.id}'s SPIN`;

    if (team.spinsLeft > 0) {
        elements.game.statusInfo.innerText = `${team.spinsLeft} Spins Remaining`;
        elements.game.spinBtn.disabled = state.isSpinning;
        elements.game.suicideBtn.classList.add('hidden');
        elements.game.endTurnBtn.classList.add('hidden');
    } else {
        if (team.assignedTeams.length < 4) {
            elements.game.statusInfo.innerText = "Out of spins! Suicide Spin or Finish?";
            elements.game.spinBtn.disabled = true;
            elements.game.suicideBtn.classList.remove('hidden');
            elements.game.endTurnBtn.classList.remove('hidden');
        } else {
            elements.game.statusInfo.innerText = "Draft Complete for this team.";
            elements.game.spinBtn.disabled = true;
            elements.game.suicideBtn.classList.add('hidden');
            elements.game.endTurnBtn.classList.remove('hidden');
        }
    }
}

// --- WHEEL LOGIC ---
const ctx = elements.game.wheelCanvas.getContext('2d');
const COLORS = ['#FF0055', '#007AFF', '#00FFAA', '#FFD700', '#FFFFFF', '#8800CC'];

function resizeCanvas() {
    const container = document.querySelector('.wheel-panel');
    const size = Math.min(600, container.clientWidth - 40);
    const dpr = window.devicePixelRatio || 1;

    // Set actual size in memory (scaled to account for extra pixel density)
    elements.game.wheelCanvas.width = size * dpr;
    elements.game.wheelCanvas.height = size * dpr;

    // Normalize coordinate system to use css pixels
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform first!
    ctx.scale(dpr, dpr);

    // Set visible size
    elements.game.wheelCanvas.style.width = size + 'px';
    elements.game.wheelCanvas.style.height = size + 'px';

    drawWheel();
}

function drawWheel() {
    // Canvas dimensions are now scaled, but logic uses CSS pixels due to ctx.scale
    const w = parseFloat(elements.game.wheelCanvas.style.width);
    const h = parseFloat(elements.game.wheelCanvas.style.height);
    const cx = w / 2;
    const cy = h / 2;
    const radius = w / 2 - 10;
    const len = state.wheelItems.length;
    const arc = (2 * Math.PI) / len;

    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(state.currentRotation);

    for (let i = 0; i < len; i++) {
        const item = state.wheelItems[i];
        ctx.beginPath();

        ctx.fillStyle = getTeamColor(item);

        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, i * arc, (i + 1) * arc);
        ctx.lineTo(0, 0);
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.rotate(i * arc + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#FFF";
        ctx.font = "bold 14px Teko"; // 2K Font
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 4;
        ctx.fillText(item.substring(0, 20) + (item.length > 20 ? '..' : ''), radius - 20, 5);
        ctx.restore();
    }
    ctx.restore();

    // Center Pin for aesthetics
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // Outer Ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
}

function spinWheel() {
    if (state.isSpinning) return;
    state.isSpinning = true;
    elements.game.spinBtn.disabled = true;

    // Random duration 3s - 5s
    const duration = 3000 + Math.random() * 2000;
    const startObj = { val: state.currentRotation };
    // Always spin at least 5 times
    const finalRot = state.currentRotation + (10 * Math.PI) + (Math.random() * 2 * Math.PI);

    let startTime = null;

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);

        // Ease out quint
        const ease = 1 - Math.pow(1 - progress, 5);
        state.currentRotation = startObj.val + (finalRot - startObj.val) * ease;

        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            finishSpin();
        }
    }
    requestAnimationFrame(animate);
}

function finishSpin() {
    state.isSpinning = false;

    // Normalize rotation
    const twoPI = 2 * Math.PI;
    const rot = state.currentRotation % twoPI;
    const len = state.wheelItems.length;
    const arc = twoPI / len;

    // Calculate index. 
    // Pointer is at TOP (3PI/2 or -PI/2 in canvas coord, but we drew standard arc from 0)
    // Actually pointer is at TOP (270 deg).
    // If we rotate wheel by R, the item at 270 is determined by:
    // Angle of item i is (i * arc) to ((i+1) * arc)
    // Effectively we need to find i such that item angle + rot touches pointer.

    // Correct Math for Pointer at Top (270 deg / 1.5 PI)
    // Wheel rotates Clockwise.
    // The angle of a segment i is [i*arc, (i+1)*arc]
    // The position of segment i after rotation R is [i*arc + R, (i+1)*arc + R]
    // We want the segment that overlaps 1.5 PI (270deg).
    // i*arc + R <= 1.5PI <= (i+1)*arc + R
    // i*arc <= 1.5PI - R
    // i <= (1.5PI - R) / arc
    // Since angles are cyclic, we normalize (1.5PI - R) to [0, 2PI].

    let normalizedAngle = (1.5 * Math.PI - (rot % twoPI));
    if (normalizedAngle < 0) normalizedAngle += twoPI;

    const index = Math.floor(normalizedAngle / arc) % len;

    const wonTeam = state.wheelItems[index];

    const activeTeam = state.teams[state.activeTeamIndex];
    activeTeam.assignedTeams.push(wonTeam);
    activeTeam.spinsLeft--;

    // Advance turn if out of spins (and not suicide)
    if (activeTeam.spinsLeft === 0) {
        // Wait a sec then maybe move turn? 
        // Logic: if users want suicide spin, they click it. If not, they wait. 
        // We shouldn't auto-advance if suicide is an option. 
        // But normal flow is 3 spins -> next.
        // User said "3 spins and then a final suicide spin IF THEY CHOOSE to spin a 4th time."
        // So we pause here.
    }

    renderAppGame();

    // Auto-advance logic optimization:
    // If they just finished spin 3, we don't auto advance, we simply show "Suicide Button".
    // If they don't want it, there needs to be a "Done/Next" button? 
    // Or we just expect them to click next team? 
    // Let's add a manual "Next Team" logic or auto-advance if they pick one?
    // Let's check spin count. If 0, we can rely on user clicking suicide OR we validly move to next team?
    // Actually, to keep it simple: If spins == 0, we automatically move activeTeamIndex IF there is another team pending.
    // BUT we need to give moment for Suicide Spin.
    // Solution: Show "Suicide" button and a "Pass/Next Team" button.

    setTimeout(() => {
        if (activeTeam.spinsLeft === 0) {
            // Check if we should move on
            if (activeTeam.assignedTeams.length < 4) {
                // Option for suicide presented.
            } else {
                nextTurn();
            }
        }
    }, 1000);
}

function activateSuicideSpin() {
    const activeTeam = state.teams[state.activeTeamIndex];
    activeTeam.spinsLeft = 0; // Ensure 0
    activeTeam.canSuicide = true; // Flag
    // We treat it as 1 extra spin
    activeTeam.spinsLeft = 1; // Grant one more spin
    // Hide buttons
    elements.game.suicideBtn.classList.add('hidden');
    elements.game.endTurnBtn.classList.add('hidden');
    spinWheel();
}

function forceNextTurn() {
    nextTurn();
}

function nextTurn() {
    if (state.activeTeamIndex < state.teams.length - 1) {
        state.activeTeamIndex++;
        renderAppGame();
    } else {
        // All done
        elements.game.statusHeader.innerText = "DRAFT COMPLETE!";
        elements.game.statusInfo.innerText = "Select your teams below to record results.";
        state.activeTeamIndex = -1; // No active
        elements.game.spinBtn.disabled = true;
        renderAppGame();
    }
}

// --- RESULTS LOGIC ---
function openResultModal() {
    const modal = elements.modal;
    modal.winner.innerHTML = '';
    modal.loser.innerHTML = '';

    // Only showing teams that have a "selectedTeam"
    state.teams.forEach((t, i) => {
        if (!t.selectedTeam) return;
        const optW = new Option(`Team ${t.id}: ${t.members.join(', ')} (${t.selectedTeam})`, i);
        const optL = new Option(`Team ${t.id}: ${t.members.join(', ')} (${t.selectedTeam})`, i);
        modal.winner.add(optW);
        modal.loser.add(optL);
    });

    modal.overlay.classList.remove('hidden');
}

function confirmGameResult() {
    const wIndex = elements.modal.winner.value;
    const lIndex = elements.modal.loser.value;

    if (wIndex === lIndex) return alert("Winner and Loser cannot be the same team!");

    const winningTeam = state.teams[wIndex];
    const losingTeam = state.teams[lIndex];

    updateStats(winningTeam.members, 'w');
    updateStats(losingTeam.members, 'l');

    saveLeaderboard();
    renderLeaderboard();
    elements.modal.overlay.classList.add('hidden');
    alert("Game Recorded!");
}

function updateStats(playerNames, type) {
    playerNames.forEach(name => {
        if (!state.leaderboard[name]) {
            state.leaderboard[name] = { w: 0, l: 0 };
        }
        state.leaderboard[name][type]++;
    });
}

function saveLeaderboard() {
    localStorage.setItem('2k_leaderboard', JSON.stringify(state.leaderboard));
}

function renderLeaderboard() {
    const tbody = elements.leaderboard.body;
    tbody.innerHTML = '';

    const entries = Object.entries(state.leaderboard).map(([name, stats]) => {
        return {
            name,
            w: stats.w,
            l: stats.l,
            pct: (stats.w + stats.l) === 0 ? 0 : (stats.w / (stats.w + stats.l))
        };
    });

    // Sort: Wins desc, then PCT desc
    entries.sort((a, b) => {
        if (b.w !== a.w) return b.w - a.w;
        return b.pct - a.pct;
    });

    // Identify players actively in the current game to highlight or enable quick edit
    const currentDraftPlayers = new Set();
    state.teams.forEach(t => t.members.forEach(m => currentDraftPlayers.add(m)));

    entries.forEach((entry, i) => {
        const isPlaying = currentDraftPlayers.has(entry.name);
        const tr = document.createElement('tr');
        if (isPlaying) tr.style.background = "rgba(198, 164, 95, 0.15)";

        tr.innerHTML = `
            <td>#${i + 1}</td>
            <td>${entry.name}</td>
            <td>
                <div class="stat-control">
                    <button class="stat-btn" data-action="dec-win" data-name="${entry.name}">-</button>
                    <span class="stat-value">${entry.w}</span>
                    <button class="stat-btn" data-action="inc-win" data-name="${entry.name}">+</button>
                </div>
            </td>
            <td>
                <div class="stat-control">
                    <button class="stat-btn" data-action="dec-loss" data-name="${entry.name}">-</button>
                    <span class="stat-value">${entry.l}</span>
                    <button class="stat-btn" data-action="inc-loss" data-name="${entry.name}">+</button>
                </div>
            </td>
            <td>${(entry.pct * 100).toFixed(1)}%</td>
            <td>
                <button class="btn sm-btn danger-btn delete-player-btn" data-action="delete" data-name="${entry.name}">X</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function registerPlayers(names) {
    let changed = false;
    names.forEach(name => {
        if (!state.leaderboard[name]) {
            state.leaderboard[name] = { w: 0, l: 0 };
            changed = true;
        }
    });
    if (changed) saveLeaderboard();
}

function addPlayer() {
    const name = elements.leaderboard.addInput.value.trim();
    if (!name) return alert("Enter a player name");

    if (state.leaderboard[name]) return alert("Player already exists!");

    registerPlayers([name]);
    elements.leaderboard.addInput.value = '';
    renderLeaderboard();
}

function resetLeaderboard() {
    showConfirm("RESET STATS", "Are you sure you want to reset all stats? This cannot be undone.", () => {
        state.leaderboard = {};
        saveLeaderboard();
        renderLeaderboard();
    });
}

function handleLeaderboardClick(e) {
    // Check for button actions
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.dataset.action;
    const name = btn.dataset.name;

    if (!action || !name) return;

    if (action === 'delete') {
        showConfirm("REMOVE PLAYER", `Remove ${name} from leaderboard?`, () => {
            delete state.leaderboard[name];
            saveLeaderboard();
            renderLeaderboard();
        });
    } else if (action === 'inc-win') {
        adjustStat(name, 'w', 1);
    } else if (action === 'dec-win') {
        adjustStat(name, 'w', -1);
    } else if (action === 'inc-loss') {
        adjustStat(name, 'l', 1);
    } else if (action === 'dec-loss') {
        adjustStat(name, 'l', -1);
    }
}

function resetCurrentGameTurn() {
    // Only reset the CURRENT active team's data
    const activeTeam = state.teams[state.activeTeamIndex];
    if (!activeTeam) return;

    // Reset just this team
    activeTeam.assignedTeams = [];
    activeTeam.spinsLeft = 3;
    activeTeam.canSuicide = false;
    activeTeam.selectedTeam = null;

    // Reset visual state
    state.isSpinning = false;
    elements.game.spinBtn.disabled = false;
    elements.game.suicideBtn.classList.add('hidden');
    elements.game.endTurnBtn.classList.add('hidden');

    renderAppGame();
}

// Global scope for onclick handlers - NO LONGER NEEDED, using delegation
function adjustStat(name, type, amount) {
    if (!state.leaderboard[name]) return;
    state.leaderboard[name][type] += amount;
    if (state.leaderboard[name][type] < 0) state.leaderboard[name][type] = 0;
    saveLeaderboard();
    renderLeaderboard();
}

// Run
init();
