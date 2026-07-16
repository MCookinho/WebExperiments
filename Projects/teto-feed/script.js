// ===== MOBILE MENU =====
function toggleMobileMenu() {
    document.getElementById('mobileNav').classList.toggle('active');
}

// ===== NAV ACTIVE STATE =====
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// ===== MUSIC PLAYER =====
const tracks = [
    {
        title: 'Mesmerizer',
        artist: '32ki feat. Miku & Teto',
        artwork: 'https://i.ytimg.com/vi/19y8YTbvri8/maxresdefault.jpg',
        duration: '3:54',
        url: 'https://open.spotify.com/track/2XnLJYqVpXbJnYqIqJbZ5k'
    },
    {
        title: 'Ochame Kinou (Fukkireta)',
        artist: 'Lamaze-P feat. Kasane Teto',
        artwork: 'https://i.ytimg.com/vi/g_DeRBIPF-8/maxresdefault.jpg',
        duration: '4:08',
        url: 'https://open.spotify.com/track/5vNRhkKd0yEAg8suGBpjeY'
    },
    {
        title: 'PPPP',
        artist: 'feat. Miku & Teto',
        artwork: 'https://i.ytimg.com/vi/19y8YTbvri8/maxresdefault.jpg',
        duration: '3:30',
        url: 'https://open.spotify.com/artist/4JX0GdKx8EduY2Ck7qac4H'
    },
    {
        title: 'Teto Territory',
        artist: 'Temcandoanything & Teto',
        artwork: 'https://i.ytimg.com/vi/19y8YTbvri8/maxresdefault.jpg',
        duration: '2:45',
        url: 'https://open.spotify.com/artist/4JX0GdKx8EduY2Ck7qac4H'
    },
    {
        title: 'Ragebait',
        artist: 'Zynthesiren & Teto',
        artwork: 'https://i.ytimg.com/vi/19y8YTbvri8/maxresdefault.jpg',
        duration: '3:12',
        url: 'https://open.spotify.com/artist/4JX0GdKx8EduY2Ck7qac4H'
    },
    {
        title: 'GET TO ME',
        artist: 'Kasane Teto',
        artwork: 'https://i.ytimg.com/vi/19y8YTbvri8/maxresdefault.jpg',
        duration: '2:58',
        url: 'https://open.spotify.com/artist/4JX0GdKx8EduY2Ck7qac4H'
    },
    {
        title: 'Yoshihara Lament',
        artist: 'Kasane Teto',
        artwork: 'https://i.ytimg.com/vi/rkf1pLv25VU/maxresdefault.jpg',
        duration: '4:32',
        url: 'https://www.youtube.com/results?search_query=kasane+teto+yoshihara+lament'
    },
    {
        title: 'numb numb',
        artist: 'feat. Miku & Teto',
        artwork: 'https://i.ytimg.com/vi/19y8YTbvri8/maxresdefault.jpg',
        duration: '3:15',
        url: 'https://open.spotify.com/artist/4JX0GdKx8EduY2Ck7qac4H'
    }
];

let currentTrack = 0;
let isPlaying = false;
let progressInterval;

function initTrackList() {
    const trackList = document.getElementById('trackList');
    trackList.innerHTML = tracks.map((track, i) => `
        <div class="track-item ${i === 0 ? 'active' : ''}" onclick="selectTrack(${i})">
            <span class="track-num">${String(i + 1).padStart(2, '0')}</span>
            <div>
                <div class="track-title">${track.title}</div>
                <div class="track-artist">${track.artist}</div>
            </div>
            <span class="track-duration">${track.duration}</span>
        </div>
    `).join('');
}

function selectTrack(index) {
    currentTrack = index;
    updatePlayer();
    if (isPlaying) startProgress();
}

function updatePlayer() {
    const track = tracks[currentTrack];
    document.getElementById('playerTitle').textContent = track.title;
    document.getElementById('playerArtist').textContent = track.artist;
    document.getElementById('playerArtwork').src = track.artwork;

    document.querySelectorAll('.track-item').forEach((item, i) => {
        item.classList.toggle('active', i === currentTrack);
    });

    document.getElementById('progressBar').style.width = '0%';
}

function togglePlay() {
    isPlaying = !isPlaying;
    const btn = document.getElementById('playBtn');
    const artwork = document.querySelector('.player-artwork');

    if (isPlaying) {
        btn.textContent = '⏸';
        artwork.classList.add('spinning');
        startProgress();
    } else {
        btn.textContent = '▶';
        artwork.classList.remove('spinning');
        clearInterval(progressInterval);
    }
}

function startProgress() {
    clearInterval(progressInterval);
    let width = 0;
    progressInterval = setInterval(() => {
        width += 0.5;
        if (width >= 100) {
            width = 0;
            nextTrack();
        }
        document.getElementById('progressBar').style.width = width + '%';
    }, 100);
}

function nextTrack() {
    currentTrack = (currentTrack + 1) % tracks.length;
    updatePlayer();
}

function prevTrack() {
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    updatePlayer();
}

// ===== GALLERY FILTER =====
function filterGallery(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    document.querySelectorAll('.gallery-item').forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
            item.style.animation = 'fadeIn 0.5s forwards';
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
    do {
        index = Math.floor(Math.random() * quotes.length);
    } while (index === lastQuoteIndex && quotes.length > 1);
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

    let targetDate = new Date(currentYear, 2, 20); // March 20
    if (now > targetDate) {
        targetDate = new Date(currentYear + 1, 2, 20);
    }

    const diff = targetDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(3, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// ===== CLICKER GAME =====
let gameScore = 0;
let gameLevel = 1;
let clickValue = 1;
let autoClickEnabled = false;
let multiplier = 1;
const upgradeCosts = { 1: 10, 2: 50, 3: 200 };
const upgradeOwned = { 1: false, 2: false, 3: false };

function clickBaguette() {
    const points = clickValue * multiplier;
    gameScore += points;
    document.getElementById('gameScore').textContent = gameScore;

    updateLevel();
    updateUpgradeButtons();
    createParticle();
}

function createParticle() {
    const container = document.getElementById('clickParticles');
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.textContent = '+ ' + (clickValue * multiplier);

    const clicker = document.getElementById('tetoClicker');
    const rect = clicker.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    particle.style.left = (rect.left - containerRect.left + rect.width / 2 + (Math.random() * 40 - 20)) + 'px';
    particle.style.top = (rect.top - containerRect.top + rect.height / 2) + 'px';
    particle.style.color = '#ff6b9d';

    container.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
}

function updateLevel() {
    const newLevel = Math.floor(gameScore / 100) + 1;
    if (newLevel !== gameLevel) {
        gameLevel = newLevel;
        document.getElementById('gameLevel').textContent = gameLevel;
    }
}

function buyUpgrade(id) {
    if (gameScore >= upgradeCosts[id] && !upgradeOwned[id]) {
        gameScore -= upgradeCosts[id];
        upgradeOwned[id] = true;
        document.getElementById('gameScore').textContent = gameScore;

        switch(id) {
            case 1:
                clickValue += 1;
                break;
            case 2:
                autoClickEnabled = true;
                setInterval(() => {
                    if (autoClickEnabled) {
                        gameScore += 1;
                        document.getElementById('gameScore').textContent = gameScore;
                        updateLevel();
                        updateUpgradeButtons();
                    }
                }, 1000);
                break;
            case 3:
                multiplier *= 2;
                break;
        }

        document.getElementById(`upgrade${id}`).disabled = true;
        updateUpgradeButtons();
    }
}

function updateUpgradeButtons() {
    for (let i = 1; i <= 3; i++) {
        const btn = document.getElementById(`upgrade${i}`);
        if (!upgradeOwned[i]) {
            btn.disabled = gameScore < upgradeCosts[i];
        }
    }
}

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.timeline-item, .detail-card, .album-card, .video-card').forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

// ===== NAVBAR SCROLL EFFECT =====
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const scrollTop = window.pageYOffset;

    if (scrollTop > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.9)';
        navbar.style.boxShadow = 'none';
    }

    lastScroll = scrollTop;
});

// ===== HIGHLIGHT ACTIVE NAV ON SCROLL =====
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id], header[id]');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.pageYOffset >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// ===== CSS ANIMATION KEYFRAME (for filter) =====
const style = document.createElement('style');
style.textContent = `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    initTrackList();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    updateUpgradeButtons();
});
