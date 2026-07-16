// ===== YOUTUBE IFRAME API =====
let player;
let currentTrack = 0;
let isPlaying = false;
let playerReady = false;

const tracks = [
    // === MEGA HITS (100M+ views) ===
    { title: 'Mesmerizer', artist: '32ki feat. Miku & Teto', yt: '19y8YTbvri8', duration: '2:37', era: 'SynthV' },
    { title: 'Tetoris', artist: 'Hiiragi Magnetite feat. Teto', yt: 'h3JFMKe4mNg', duration: '2:15', era: 'SynthV' },
    // === CLASSIC UTAU ERA ===
    { title: 'Ochame Kinou (Fukkireta)', artist: 'Lamaze-P feat. Teto', yt: 'g_DeRBIPF-8', duration: '4:08', era: 'UTAU' },
    { title: 'Yoshiwara Lament', artist: 'Asa feat. Teto', yt: 'NKYqJ3UvjIk', duration: '3:54', era: 'UTAU' },
    { title: 'Song of the Eared Robot', artist: 'nwp8861 feat. Teto', yt: 'bVqGnaE2-wM', duration: '3:50', era: 'UTAU' },
    { title: 'Triple Baka', artist: 'Teto, Miku & Neru', yt: 'aAKtlKSP6dM', duration: '1:31', era: 'UTAU' },
    { title: 'Fukkireta (Original Nico)', artist: 'Lamaze-P feat. Teto', yt: 'rkf1pLv25VU', duration: '4:08', era: 'UTAU' },
    // === SYNTHV AI ERA HITS ===
    { title: 'Language of the Lost', artist: 'R.I.P feat. Teto SV', yt: '1xEfMnXyGkA', duration: '4:12', era: 'SynthV' },
    { title: 'Pathological Facade', artist: 'GHOST feat. Teto AI', yt: 'inRXBlYgMGI', duration: '4:46', era: 'SynthV' },
    { title: 'Machine Love', artist: 'Jamie Paige feat. Teto', yt: 'sqK-jh4TDXo', duration: '4:31', era: 'SynthV' },
    { title: 'Override', artist: 'Yoshida Yasei feat. Teto', yt: 'VzXV0sWbRE0', duration: '3:22', era: 'SynthV' },
    { title: 'Igaku (Medicine)', artist: 'Haraguchi Sasuke feat. Teto', yt: 'WwHqEoKdP6I', duration: '3:01', era: 'SynthV' },
    { title: 'Butcher Vanity', artist: 'Vane Lily feat. Teto', yt: 'pZ1QcgbioxI', duration: '3:45', era: 'SynthV' },
    { title: 'Rabbit Hole', artist: 'Deco*27 (Teto ver.)', yt: 'kOHBp1PT3yI', duration: '3:18', era: 'SynthV' },
    { title: 'BIRDBRAIN', artist: 'Jamie Paige & OK Glass', yt: '5Gq3gKrH3Xw', duration: '3:30', era: 'SynthV' },
    { title: 'Spoken For', artist: 'FLAVOR FOLEY feat. Teto', yt: 'x3H1bKw9qAk', duration: '3:05', era: 'SynthV' },
    // === LATEST RELEASES ===
    { title: 'numb numb', artist: 'feat. Miku & Teto', yt: '3HkJFt8qV4c', duration: '3:15', era: 'SynthV' },
    { title: 'PPPP', artist: 'feat. Miku & Teto', yt: '6D6qMAXWMAs', duration: '3:30', era: 'SynthV' },
    { title: 'Teto Territory', artist: 'Temcandoanything & Teto', yt: 'rUZb1cW12kk', duration: '2:45', era: 'SynthV' },
    { title: 'Ragebait', artist: 'Zynthesiren & Teto', yt: '0gFjWk3gG6I', duration: '3:12', era: 'SynthV' },
    { title: 'GET TO ME', artist: 'Kasane Teto', yt: 'x4t0v6VcC0A', duration: '2:58', era: 'SynthV' },
    { title: 'Push The Pace', artist: 'Temcandoanything & Teto', yt: 'eHjE3jK8q3A', duration: '3:10', era: 'SynthV' },
    { title: 'MINIMUM RAGE', artist: 'MonochroMenace feat. Teto', yt: 'kF7E7pLd3Kk', duration: '2:55', era: 'SynthV' },
    { title: 'Honestly', artist: 'THØRNS feat. Teto', yt: 'vNqV0pI3g2Y', duration: '3:20', era: 'SynthV' },
    // === FAMOUS COVERS & COLLABS ===
    { title: 'World is Mine (Cover)', artist: 'Teto SV', yt: '0eaeiSjh7pU', duration: '4:02', era: 'Cover' },
    { title: 'Matryoshka (Cover)', artist: 'Teto & Neru', yt: '7VimUUvlqxg', duration: '3:33', era: 'Cover' },
    { title: 'KING (Cover)', artist: 'Teto SV', yt: 'G3G4t4RYZ9s', duration: '3:10', era: 'Cover' },
    { title: 'Lagtrain (Cover)', artist: 'Teto SV', yt: 'h3x2bNJFbcQ', duration: '3:45', era: 'Cover' },
    { title: 'Charles (Cover)', artist: 'Teto SV', yt: 'm0rph3sG3uY', duration: '4:15', era: 'Cover' },
    { title: 'Cantarella (Cover)', artist: 'Teto UTAU', yt: 'B9dN9oK5r4M', duration: '3:52', era: 'Cover' },
    // === MORE UTAU CLASSICS ===
    { title: 'Fukkireta 2010 (Full)', artist: 'Lamaze-P feat. Teto', yt: '0bZ0hmZ1v7g', duration: '4:32', era: 'UTAU' },
    { title: 'Teto Territory (Original)', artist: 'Teto UTAU', yt: 'YgkXXUk0O0I', duration: '2:50', era: 'UTAU' },
    { title: 'Kimi no Taion (Cover)', artist: 'Teto UTAU', yt: '5XpGkHb4O3o', duration: '3:10', era: 'UTAU' },
    { title: 'Soundless Voice', artist: 'Hitoshizuku-P feat. Teto', yt: 'xP2gVw5fR3Y', duration: '4:20', era: 'UTAU' },
    { title: 'Cantarella Grace Edition', artist: 'WhiteFlame feat. Teto', yt: 'v3YmhUf9w8U', duration: '4:05', era: 'UTAU' },
    { title: 'Starduster (Cover)', artist: 'Teto UTAU', yt: 'JQpR2bHjx3c', duration: '3:55', era: 'UTAU' },
    { title: 'Two Breaths Walking', artist: 'DECO*27 feat. Teto', yt: '8bSWpDPYK1U', duration: '3:30', era: 'UTAU' },
    // === VIRAL / FAN FAVORITES ===
    { title: 'Mesmerizer (HQ Audio)', artist: '32ki feat. Miku & Teto', yt: 'CVJSvuXWe-E', duration: '2:37', era: 'SynthV' },
    { title: 'Ochame Kinou (Cover 2024)', artist: 'Takaokamizuki & Teto', yt: 'uBqLz1S4m0o', duration: '4:08', era: 'Cover' },
    { title: 'NEON (Teto ver.)', artist: 'KIRA feat. Teto', yt: 'QhM5P1wCj3k', duration: '3:16', era: 'SynthV' },
    { title: 'WILDCARD', artist: 'KIRA feat. Teto AI', yt: 'y7e2hTlXjRk', duration: '3:16', era: 'SynthV' },
    { title: 'Cadmium Colors', artist: 'Jamie Paige feat. Teto', yt: 'YH0pJv2sT6o', duration: '3:40', era: 'SynthV' },
    { title: 'Died But Came Back', artist: 'slayr feat. Teto', yt: '6vWd2n7t2Pw', duration: '3:02', era: 'SynthV' },
    { title: 'ANOTHER CUP', artist: 'bunnycat feat. Teto', yt: '9fK8lMp3oYs', duration: '2:58', era: 'SynthV' },
    { title: 'FLOP ERA', artist: 'ePiaeon feat. Teto', yt: 'oL1Ie3g7q2U', duration: '3:10', era: 'SynthV' },
    { title: 'MY COOL BLUU TUNE', artist: 'Spookynova feat. Teto', yt: '4h2Kx8z9bL0', duration: '3:25', era: 'SynthV' },
    { title: 'Tenebre Rosso Sangue', artist: 'ExactlySandwich feat. Teto', yt: '8m4Gh8z7v3Y', duration: '3:45', era: 'SynthV' }
];

// YouTube IFrame API
function onYouTubeIframeAPIReady() {
    player = new YT.Player('ytPlayer', {
        height: '0',
        width: '0',
        videoId: tracks[0].yt,
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'modestbranding': 1,
            'rel': 0,
            'showinfo': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    playerReady = true;
    console.log('YouTube player ready');
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        nextTrack();
    }
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        document.getElementById('playBtn').textContent = '⏸';
        document.querySelector('.player-artwork').classList.add('spinning');
        updateProgressBar();
    }
    if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
        document.getElementById('playBtn').textContent = '▶';
        document.querySelector('.player-artwork').classList.remove('spinning');
    }
}

function updateProgressBar() {
    if (!playerReady || !player || typeof player.getDuration !== 'function') return;
    const duration = player.getDuration();
    if (duration <= 0) return;

    const interval = setInterval(() => {
        if (!isPlaying) { clearInterval(interval); return; }
        const current = player.getCurrentTime();
        const pct = (current / duration) * 100;
        document.getElementById('progressBar').style.width = pct + '%';
        document.getElementById('playerCurrentTime').textContent = formatTime(current);
        document.getElementById('playerTotalTime').textContent = formatTime(duration);
    }, 500);
}

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + String(s).padStart(2, '0');
}

function selectTrack(index) {
    currentTrack = index;
    loadAndPlay(index);
}

function loadAndPlay(index) {
    if (!playerReady || !player) return;
    player.loadVideoById(tracks[index].yt);
    updatePlayerUI();
}

function togglePlay() {
    if (!playerReady || !player) return;
    if (isPlaying) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function nextTrack() {
    currentTrack = (currentTrack + 1) % tracks.length;
    loadAndPlay(currentTrack);
}

function prevTrack() {
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    loadAndPlay(currentTrack);
}

function updatePlayerUI() {
    const track = tracks[currentTrack];
    document.getElementById('playerTitle').textContent = track.title;
    document.getElementById('playerArtist').textContent = track.artist;
    document.getElementById('playerArtwork').src = 'https://i.ytimg.com/vi/' + track.yt + '/maxresdefault.jpg';

    document.querySelectorAll('.track-item').forEach((item, i) => {
        item.classList.toggle('active', i === currentTrack);
    });

    document.getElementById('progressBar').style.width = '0%';

    // Scroll active track into view
    const activeItem = document.querySelector('.track-item.active');
    if (activeItem) activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function initTrackList() {
    const trackList = document.getElementById('trackList');
    document.getElementById('trackCount').textContent = tracks.length;
    let html = '';
    tracks.forEach((track, i) => {
        html += `<div class="track-item ${i === 0 ? 'active' : ''}" onclick="selectTrack(${i})">
            <span class="track-num">${String(i + 1).padStart(2, '0')}</span>
            <div>
                <div class="track-title">${track.title}</div>
                <div class="track-artist">${track.artist} • <span class="era-tag">${track.era}</span></div>
            </div>
            <span class="track-duration">${track.duration}</span>
        </div>`;
    });
    trackList.innerHTML = html;
}

// ===== SEARCH / FILTER =====
function searchTracks(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('.track-item').forEach((item, i) => {
        const track = tracks[i];
        const match = track.title.toLowerCase().includes(q) ||
                      track.artist.toLowerCase().includes(q) ||
                      track.era.toLowerCase().includes(q);
        item.style.display = match ? 'flex' : 'none';
    });
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
    document.getElementById('mobileNav').classList.toggle('active');
}

// ===== GALLERY FILTER =====
function filterGallery(category) {
    document.querySelectorAll('.gallery-filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.gallery-item').forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// ===== QUOTES =====
const quotes = [
    { text: "Kimi wa jitsu ni baka dana", translation: "You really are an idiot" },
    { text: "Anytime I love you, come on and kiss me", translation: "Fukkireta — Ochame Kinou" },
    { text: "Dorayaki wa shushoku ni narenai", translation: "Dorayaki can't be my main dish" },
    { text: "夢からピピピ覚めないで覚めないで", translation: "Don't wake up from this dream, don't wake up yet" },
    { text: "僕の思い通り", translation: "Just the way I want it" },
    { text: "Chimera is not a creature to be trifled with!", translation: "Kasane Teto" },
    { text: "I'm always watching by your side. Leave the backup to me.", translation: "Fukkireta — Ochame Kinou" },
    { text: "Let's start with a simple greeting", translation: "Ochame Kinou" },
    { text: "If I overwrite it, it'll go my way", translation: "Fukkireta" },
    { text: "Don't let the warmth escape, there's still morning", translation: "Fukkireta" },
    { text: "I'll find the most beautiful flower and bring it to you", translation: "Fukkireta" },
    { text: "Are you ready? Are you ready? Are you ready?", translation: "Ochame Kinou" },
    { text: "Believe and be happy, be polite to make it happen", translation: "Fukkireta" },
    { text: "Even though I'm a chimera, I still want to be loved!", translation: "Kasane Teto" },
    { text: "Baguettes are the only thing I need in life", translation: "Probably Teto" },
    { text: "My pigtails are NOT drills!", translation: "Kasane Teto" },
    { text: "Wait 5 minutes... no, 10 more minutes!", translation: "Fukkireta" },
    { text: "From left to right, things are happening everywhere", translation: "Ochame Kinou" }
];

let lastQuoteIndex = -1;

function newQuote() {
    let index;
    do { index = Math.floor(Math.random() * quotes.length); } while (index === lastQuoteIndex && quotes.length > 1);
    lastQuoteIndex = index;
    const quote = quotes[index];
    const textEl = document.getElementById('quoteText');
    const transEl = document.getElementById('quoteTranslation');
    textEl.style.opacity = 0;
    transEl.style.opacity = 0;
    setTimeout(() => {
        textEl.textContent = quote.text;
        transEl.textContent = '— ' + quote.translation;
        textEl.style.opacity = 1;
        transEl.style.opacity = 1;
    }, 300);
}

// ===== COUNTDOWN =====
function updateCountdown() {
    const now = new Date();
    const currentYear = now.getFullYear();
    let targetDate = new Date(currentYear, 2, 20);
    if (now > targetDate) targetDate = new Date(currentYear + 1, 2, 20);
    const diff = targetDate - now;
    document.getElementById('days').textContent = String(Math.floor(diff / 864e5)).padStart(3, '0');
    document.getElementById('hours').textContent = String(Math.floor((diff % 864e5) / 36e5)).padStart(2, '0');
    document.getElementById('minutes').textContent = String(Math.floor((diff % 36e5) / 6e4)).padStart(2, '0');
    document.getElementById('seconds').textContent = String(Math.floor((diff % 6e4) / 1e3)).padStart(2, '0');
}

// ===== CLICKER GAME =====
const GS = {
    score: 0, totalEarned: 0, totalClicks: 0,
    level: 1, xp: 0, xpNeeded: 50,
    clickPower: 1, clickMultiplier: 1,
    combo: 0, maxCombo: 0, comboTimer: null, comboDuration: 2000,
    cps: 0, autoClickers: [],
    shopOpen: true,
};

const UPGRADES = {
    1: { name: 'Extra Baguette', desc: '+1 per click', baseCost: 15, costMult: 1.5, maxLevel: 50, icon: '🥖' },
    2: { name: 'Teto Assistant', desc: '+1/sec', baseCost: 100, costMult: 1.4, maxLevel: 30, icon: '🐱' },
    3: { name: 'Music Boost', desc: '+5/sec', baseCost: 1000, costMult: 1.35, maxLevel: 25, icon: '🎵' },
    4: { name: 'Combo Master', desc: 'Combo +0.5s', baseCost: 500, costMult: 2, maxLevel: 10, icon: '⚡' },
    5: { name: 'Mesmerize', desc: 'x2 click power', baseCost: 5000, costMult: 3, maxLevel: 8, icon: '🌀' },
    6: { name: 'SynthV Engine', desc: '+50/sec', baseCost: 10000, costMult: 1.3, maxLevel: 20, icon: '🤖' },
};

const UPGRADE_LEVELS = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

const ACHIEVEMENTS = [
    { id: 'click1', name: 'First Click', icon: '🥖', check: () => GS.totalClicks >= 1 },
    { id: 'click100', name: 'Clicker', icon: '👆', check: () => GS.totalClicks >= 100 },
    { id: 'click1000', name: 'Click Master', icon: '✋', check: () => GS.totalClicks >= 1000 },
    { id: 'score100', name: 'Baker', icon: '🍞', check: () => GS.totalEarned >= 100 },
    { id: 'score1k', name: 'Boulanger', icon: '🥐', check: () => GS.totalEarned >= 1000 },
    { id: 'score10k', name: 'Pâtissier', icon: '🍰', check: () => GS.totalEarned >= 10000 },
    { id: 'score100k', name: 'Grand Chef', icon: '👨‍🍳', check: () => GS.totalEarned >= 100000 },
    { id: 'score1m', name: 'Legendary', icon: '👑', check: () => GS.totalEarned >= 1000000 },
    { id: 'combo5', name: 'Combo x5', icon: '🔥', check: () => GS.maxCombo >= 5 },
    { id: 'combo15', name: 'Combo x15', icon: '💥', check: () => GS.maxCombo >= 15 },
    { id: 'combo30', name: 'Combo x30', icon: '⚡', check: () => GS.maxCombo >= 30 },
    { id: 'lv5', name: 'Level 5', icon: '⭐', check: () => GS.level >= 5 },
    { id: 'lv10', name: 'Level 10', icon: '🌟', check: () => GS.level >= 10 },
    { id: 'lv25', name: 'Level 25', icon: '💫', check: () => GS.level >= 25 },
    { id: 'buy5', name: 'Shopper', icon: '🛒', check: () => Object.values(UPGRADE_LEVELS).reduce((a, b) => a + b, 0) >= 5 },
    { id: 'buy20', name: 'Collector', icon: '📦', check: () => Object.values(UPGRADE_LEVELS).reduce((a, b) => a + b, 0) >= 20 },
];

const UNLOCKED_ACH = new Set();

function getUpgradeCost(id) {
    const u = UPGRADES[id];
    return Math.floor(u.baseCost * Math.pow(u.costMult, UPGRADE_LEVELS[id]));
}

function getClickPower() {
    let base = 1;
    base += UPGRADE_LEVELS[1];
    base *= Math.pow(2, UPGRADE_LEVELS[5]);
    return base;
}

function getCps() {
    let c = 0;
    c += UPGRADE_LEVELS[2] * 1;
    c += UPGRADE_LEVELS[3] * 5;
    c += UPGRADE_LEVELS[6] * 50;
    return c;
}

function getComboDuration() {
    return 2000 + UPGRADE_LEVELS[4] * 500;
}

function formatNum(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return Math.floor(n).toString();
}

function clickTeto(e) {
    GS.totalClicks++;
    GS.combo++;
    GS.maxCombo = Math.max(GS.maxCombo, GS.combo);

    clearTimeout(GS.comboTimer);
    GS.comboTimer = setTimeout(() => { GS.combo = 0; updateComboDisplay(); }, getComboDuration());

    const comboMult = 1 + Math.floor(GS.combo / 5) * 0.5;
    const earned = Math.floor(getClickPower() * comboMult);
    GS.score += earned;
    GS.totalEarned += earned;
    GS.xp += Math.max(1, Math.floor(earned / 5));

    if (GS.xp >= GS.xpNeeded) {
        GS.xp -= GS.xpNeeded;
        GS.level++;
        GS.xpNeeded = Math.floor(50 * Math.pow(1.3, GS.level - 1));
        showLevelUp();
    }

    updateGameUI();
    createParticle(e, earned, comboMult >= 2);
    checkAchievements();

    const btn = document.getElementById('tetoClicker');
    btn.classList.remove('clicked');
    void btn.offsetWidth;
    btn.classList.add('clicked');
}

function createParticle(e, value, isGold) {
    const c = document.getElementById('clickParticles');
    const p = document.createElement('div');
    p.className = 'particle ' + (isGold ? 'gold' : GS.combo >= 10 ? 'cyan' : 'pink');
    p.textContent = '+' + formatNum(value);
    const cr = c.getBoundingClientRect();
    p.style.left = (e.clientX - cr.left + (Math.random() * 30 - 15)) + 'px';
    p.style.top = (e.clientY - cr.top - 10) + 'px';
    c.appendChild(p);
    setTimeout(() => p.remove(), 1200);
}

function updateComboDisplay() {
    const el = document.getElementById('comboDisplay');
    const cnt = document.getElementById('comboCount');
    if (GS.combo >= 3) {
        el.classList.add('active');
        cnt.textContent = 'x' + GS.combo;
    } else {
        el.classList.remove('active');
    }
}

function updateGameUI() {
    document.getElementById('gameScore').textContent = formatNum(GS.score);
    document.getElementById('gameLevel').textContent = GS.level;
    document.getElementById('gameCps').textContent = formatNum(getCps());
    document.getElementById('xpFill').style.width = (GS.xp / GS.xpNeeded * 100) + '%';
    document.getElementById('statClicks').textContent = formatNum(GS.totalClicks);
    document.getElementById('statCombo').textContent = 'x' + GS.maxCombo;
    document.getElementById('statEarned').textContent = formatNum(GS.totalEarned);
    updateComboDisplay();

    for (let i = 1; i <= 6; i++) {
        const btn = document.getElementById('upgrade' + i);
        const cost = getUpgradeCost(i);
        const lvl = UPGRADE_LEVELS[i];
        const maxed = lvl >= UPGRADES[i].maxLevel;
        document.getElementById('upgrade' + i + 'Cost').textContent = maxed ? 'MAX' : formatNum(cost);
        document.getElementById('upgrade' + i + 'Level').textContent = lvl + '/' + UPGRADES[i].maxLevel;
        btn.disabled = maxed || GS.score < cost;
        btn.classList.toggle('maxed', maxed);
    }
}

function buyUpgrade(id) {
    const cost = getUpgradeCost(id);
    if (GS.score >= cost && UPGRADE_LEVELS[id] < UPGRADES[id].maxLevel) {
        GS.score -= cost;
        UPGRADE_LEVELS[id]++;
        updateGameUI();
        checkAchievements();
        saveGame();
    }
}

function toggleShop() {
    GS.shopOpen = !GS.shopOpen;
    document.getElementById('shopItems').classList.toggle('collapsed', !GS.shopOpen);
    document.getElementById('shopToggle').textContent = GS.shopOpen ? '▼' : '▶';
}

function showLevelUp() {
    const ov = document.createElement('div');
    ov.className = 'level-up-overlay';
    ov.innerHTML = '<div class="level-up-text">LEVEL UP!<br>LV ' + GS.level + '</div>';
    document.body.appendChild(ov);
    setTimeout(() => ov.remove(), 2100);
}

function spawnBgParticles() {
    const bg = document.getElementById('gameBg');
    if (!bg) return;
    for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'bg-particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (4 + Math.random() * 6) + 's';
        p.style.animationDelay = Math.random() * 5 + 's';
        p.style.background = ['#ff6b9d', '#00ffff', '#ffd700', '#ff3366'][Math.floor(Math.random() * 4)];
        p.style.width = p.style.height = (3 + Math.random() * 4) + 'px';
        bg.appendChild(p);
    }
}

function checkAchievements() {
    ACHIEVEMENTS.forEach(a => {
        if (!UNLOCKED_ACH.has(a.id) && a.check()) {
            UNLOCKED_ACH.add(a.id);
            const el = document.querySelector('[data-ach="' + a.id + '"]');
            if (el) el.classList.add('unlocked');
        }
    });
}

function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    grid.innerHTML = ACHIEVEMENTS.map(a =>
        '<div class="achievement' + (UNLOCKED_ACH.has(a.id) ? ' unlocked' : '') + '" data-ach="' + a.id + '">' +
        '<div class="achievement-icon">' + a.icon + '</div>' +
        '<div class="achievement-name">' + a.name + '</div></div>'
    ).join('');
}

function saveGame() {
    const data = {
        score: GS.score, totalEarned: GS.totalEarned, totalClicks: GS.totalClicks,
        level: GS.level, xp: GS.xp, xpNeeded: GS.xpNeeded,
        maxCombo: GS.maxCombo, upgrades: { ...UPGRADE_LEVELS },
        achievements: [...UNLOCKED_ACH],
    };
    localStorage.setItem('tetoClicker', JSON.stringify(data));
}

function loadGame() {
    try {
        const d = JSON.parse(localStorage.getItem('tetoClicker'));
        if (!d) return;
        GS.score = d.score || 0;
        GS.totalEarned = d.totalEarned || 0;
        GS.totalClicks = d.totalClicks || 0;
        GS.level = d.level || 1;
        GS.xp = d.xp || 0;
        GS.xpNeeded = d.xpNeeded || 50;
        GS.maxCombo = d.maxCombo || 0;
        if (d.upgrades) Object.keys(d.upgrades).forEach(k => UPGRADE_LEVELS[k] = d.upgrades[k]);
        if (d.achievements) d.achievements.forEach(id => UNLOCKED_ACH.add(id));
    } catch (e) {}
}

function startAutoIncome() {
    setInterval(() => {
        const c = getCps();
        if (c > 0) {
            GS.score += c;
            GS.totalEarned += c;
            updateGameUI();
            checkAchievements();
        }
    }, 1000);
}

function startAutoSave() {
    setInterval(saveGame, 15000);
}

// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = 1; e.target.style.transform = 'translateY(0)'; } });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.timeline-item, .detail-card, .album-card, .video-card').forEach(el => {
    el.style.opacity = 0; el.style.transform = 'translateY(30px)'; el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

// Init game
loadGame();
renderAchievements();
updateGameUI();
spawnBgParticles();
startAutoIncome();
startAutoSave();

// ===== NAVBAR =====
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    navbar.style.background = window.pageYOffset > 100 ? 'rgba(10,10,10,0.95)' : 'rgba(10,10,10,0.9)';
    const sections = document.querySelectorAll('section[id], header[id]');
    let current = '';
    sections.forEach(s => { if (window.pageYOffset >= s.offsetTop - 100) current = s.id; });
    document.querySelectorAll('.nav-link').forEach(l => { l.classList.toggle('active', l.getAttribute('href') === '#' + current); });
});

// ===== NAV LINKS =====
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// ===== CSS FOR FADE =====
const style = document.createElement('style');
style.textContent = `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .era-tag { background: rgba(255,107,157,0.15); color: #ff6b9d; padding: 1px 6px; border-radius: 4px; font-size: 0.7rem; font-family: 'JetBrains Mono', monospace; }`;
document.head.appendChild(style);

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    initTrackList();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    updateUpgradeButtons();
});

// Load YouTube IFrame API
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(tag);
