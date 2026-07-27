/* ============================================
   NOITE DOS SLIDES - ANALOG HORRORS
   JavaScript: Navigation, ARG, Easter Eggs
   ============================================ */

// ============================================
// STATE
// ============================================
let currentSlide = 0;
const totalSlides = 32;
let isTransitioning = false;
let secretCode = '';
const targetCode = 'MONITOR';
let ghostEyeVisible = false;
let jumpscareActive = false;

// ============================================
// DOM ELEMENTS
// ============================================
const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const currentSlideEl = document.getElementById('current-slide');
const totalSlidesEl = document.getElementById('total-slides');
const progressFill = document.getElementById('progress-fill');
const presentationBtn = document.getElementById('presentation-mode-btn');
const secretScreen = document.getElementById('secret-screen');
const ghostEye = document.getElementById('ghost-eye');
const decodeBtn = document.getElementById('decode-btn');
const decodedMsg = document.getElementById('decoded-msg');
const audioInvertBtn = document.getElementById('audio-invert-btn');

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    totalSlidesEl.textContent = totalSlides;
    updateSlideCounter();
    updateProgress();
    initEventListeners();
    initGhostEye();
    initMandelaClick();
    initLocal58Moon();
    initBackroomsNoclip();
    initAudioInvert();
    initCardAudio();
});

// ============================================
// NAVIGATION
// ============================================
function goToSlide(index, direction = 'next') {
    if (isTransitioning || index === currentSlide || index < 0 || index >= totalSlides) return;

    isTransitioning = true;

    const current = slides[currentSlide];
    const next = slides[index];
    const goingForward = index > currentSlide;

    slides.forEach(s => {
        s.classList.remove('entering-from-right', 'entering-from-left', 'leaving-to-right', 'leaving-to-left');
    });

    current.classList.add(goingForward ? 'leaving-to-left' : 'leaving-to-right');
    next.classList.add(goingForward ? 'entering-from-right' : 'entering-from-left');
    next.classList.add('active');

    setTimeout(() => {
        current.classList.remove('active', 'leaving-to-left', 'leaving-to-right');
        next.classList.remove('entering-from-right', 'entering-from-left');

        currentSlide = index;
        updateSlideCounter();
        updateProgress();
        isTransitioning = false;

        onSlideEnter(index);
    }, 800);
}

function nextSlide() {
    if (currentSlide < totalSlides - 1) {
        goToSlide(currentSlide + 1, 'next');
    }
}

function prevSlide() {
    if (currentSlide > 0) {
        goToSlide(currentSlide - 1, 'prev');
    }
}

function updateSlideCounter() {
    currentSlideEl.textContent = currentSlide + 1;
}

function updateProgress() {
    const progress = ((currentSlide + 1) / totalSlides) * 100;
    progressFill.style.width = `${progress}%`;
}

// ============================================
// SLIDE-SPECIFIC EFFECTS
// ============================================
function onSlideEnter(index) {
    // Slide 18 (Sonic.exe Part 2) - Show audio invert button
    if (index === 17) {
        if (audioInvertBtn) {
            audioInvertBtn.classList.remove('hidden');
        }
    } else {
        if (audioInvertBtn) {
            audioInvertBtn.classList.add('hidden');
        }
    }

    // Random ghost text visibility
    const ghostTexts = document.querySelectorAll('.ghost-text');
    ghostTexts.forEach(text => {
        if (Math.random() > 0.7) {
            text.style.fontSize = '1px';
            text.style.color = 'rgba(0,255,0,0.1)';
            setTimeout(() => {
                text.style.fontSize = '0.1px';
                text.style.color = 'transparent';
            }, 100);
        }
    });

    // Caretaker slides: fade effect on stage cards
    if (index === 4) {
        const stageCards = document.querySelectorAll('.stage-card');
        stageCards.forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 150 * i);
        });
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        handleSecretCode(e.key);

        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
        } else if (e.key === 'Escape') {
            exitPresentationMode();
            closeJumpscare();
            closeSecretScreen();
        } else if (e.key === 'F11') {
            e.preventDefault();
            togglePresentationMode();
        }
    });

    // Button navigation
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Presentation mode
    if (presentationBtn) {
        presentationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            togglePresentationMode();
        });
    }

    // Cipher decode button
    if (decodeBtn) {
        decodeBtn.addEventListener('click', decodeCipher);
    }

    // Click to advance
    document.addEventListener('click', (e) => {
        if (e.target.closest('.nav-btn, .decode-btn, .audio-invert-btn, .mandela-click, .moon-secret, .noclip-secret, #secret-screen, #presentation-mode-btn, .detail-card, .origin-card, .stage-card, .track-highlight, .philosophy-quote, .cipher-secret')) {
            return;
        }

        if (e.clientX > window.innerWidth / 2) {
            nextSlide();
        } else {
            prevSlide();
        }
    });
}

// ============================================
// SECRET CODE (MONITOR)
// ============================================
function handleSecretCode(key) {
    secretCode += key.toUpperCase();

    if (secretCode.length > targetCode.length) {
        secretCode = secretCode.slice(-targetCode.length);
    }

    if (secretCode === targetCode) {
        showSecretScreen();
        secretCode = '';
    }
}

function showSecretScreen() {
    secretScreen.classList.remove('hidden');
    document.body.style.animation = 'glitchIn 0.5s ease-out';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 500);
}

function closeSecretScreen() {
    if (!secretScreen.classList.contains('hidden')) {
        secretScreen.classList.add('hidden');
    }
}

// ============================================
// PRESENTATION MODE
// ============================================
function togglePresentationMode() {
    const body = document.body;
    const isEntering = !body.classList.contains('presentation-mode');

    if (isEntering) {
        body.classList.add('presentation-mode');
        if (presentationBtn) presentationBtn.textContent = '📺 Sair (ESC)';
        const el = document.documentElement;
        const request = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
        if (request) {
            request.call(el).catch(err => {
                console.log('Fullscreen not available, using CSS-only mode');
            });
        }
    } else {
        body.classList.remove('presentation-mode');
        if (presentationBtn) presentationBtn.textContent = '📺 Modo Apresentação';
        if (document.fullscreenElement) {
            const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
            if (exit) exit.call(document).catch(() => {});
        }
    }
}

function exitPresentationMode() {
    document.body.classList.remove('presentation-mode');
    if (document.fullscreenElement) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (exit) exit.call(document).catch(() => {});
    }
}

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        document.body.classList.remove('presentation-mode');
    }
});

// ============================================
// GHOST EYE (EASTER EGG)
// ============================================
function initGhostEye() {
    setInterval(() => {
        if (Math.random() > 0.95 && !ghostEyeVisible) {
            showGhostEye();
        }
    }, 5000);
}

function showGhostEye() {
    ghostEyeVisible = true;

    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);

    ghostEye.style.left = `${x}px`;
    ghostEye.style.top = `${y}px`;
    ghostEye.classList.add('visible');

    setTimeout(() => {
        ghostEye.classList.remove('visible');
        ghostEyeVisible = false;
    }, 2000);
}

// ============================================
// MANDALA CATALOGUE JUMPSCARE
// ============================================
function initMandelaClick() {
    const mandelaClick = document.querySelector('.mandela-click');
    if (mandelaClick) {
        mandelaClick.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerJumpscare();
        });
    }
}

function triggerJumpscare() {
    const jumpscare = document.querySelector('.alternate-jumpscare');
    if (jumpscare) {
        jumpscare.classList.remove('hidden');
        jumpscareActive = true;

        document.body.style.animation = 'screenTear 0.2s steps(5)';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 200);

        setTimeout(() => {
            closeJumpscare();
        }, 3000);
    }
}

function closeJumpscare() {
    if (jumpscareActive) {
        const jumpscare = document.querySelector('.alternate-jumpscare');
        if (jumpscare) {
            jumpscare.classList.add('hidden');
            jumpscareActive = false;
        }
    }
}

// ============================================
// LOCAL 58 MOON EASTER EGG
// ============================================
function initLocal58Moon() {
    const moon = document.getElementById('local58-moon');
    if (moon) {
        moon.addEventListener('click', (e) => {
            e.stopPropagation();

            const msg = document.createElement('div');
            msg.style.cssText = `
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: #000;
                z-index: 3000;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                animation: glitchIn 0.3s ease-out;
            `;
            msg.innerHTML = `
                <p style="font-family: 'Press Start 2P', cursive; font-size: 2rem; color: #ff0000; animation: glitchText 0.2s infinite; margin-bottom: 2rem;">
                    DO NOT LOOK AT THE MOON
                </p>
                <p style="font-size: 1.2rem; color: #888;">
                    A forma que observa de l&aacute; de cima est&aacute; sorrindo.
                </p>
                <p style="font-family: 'Press Start 2P', cursive; font-size: 0.7rem; color: #ffff00; margin-top: 2rem; animation: blink 1s infinite;">
                    CLIQUE PARA FECHAR
                </p>
            `;
            msg.addEventListener('click', () => msg.remove());
            document.body.appendChild(msg);
        });
    }
}

// ============================================
// BACKROOMS NOCLIP EASTER EGG
// ============================================
function initBackroomsNoclip() {
    const noclip = document.getElementById('backrooms-noclip');
    if (noclip) {
        noclip.addEventListener('click', (e) => {
            e.stopPropagation();

            document.body.style.animation = 'screenTear 0.5s steps(10)';

            const flash = document.createElement('div');
            flash.style.cssText = `
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: #ffff00;
                z-index: 3000;
                opacity: 0.3;
                animation: blink 0.1s steps(2) 5;
                pointer-events: none;
            `;
            document.body.appendChild(flash);

            setTimeout(() => {
                flash.remove();
                document.body.style.animation = '';
            }, 500);

            const text = noclip.querySelector('.hidden-text');
            if (text) {
                text.style.color = 'rgba(255,255,0,0.8)';
                text.style.fontSize = '1.5rem';
                setTimeout(() => {
                    text.style.color = 'rgba(255,255,0,0.05)';
                    text.style.fontSize = '1rem';
                }, 3000);
            }
        });
    }
}

// ============================================
// CIPHER DECODE
// ============================================
function decodeCipher() {
    if (decodedMsg) {
        decodedMsg.classList.remove('hidden');
        decodeBtn.style.display = 'none';

        document.body.style.animation = 'glitchIn 0.5s ease-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    }
}

// ============================================
// AUDIO INVERT (Slide 18)
// ============================================
function initAudioInvert() {
    if (audioInvertBtn) {
        audioInvertBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            invertAudio();
        });
    }
}

function invertAudio() {
    audioInvertBtn.textContent = '\uD83D\uDD0A INVERTIDO!';
    audioInvertBtn.style.background = 'rgba(255,0,0,0.4)';

    const hiddenMsg = document.createElement('div');
    hiddenMsg.style.cssText = `
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.95);
        border: 3px solid #ff0000;
        padding: 40px;
        z-index: 2000;
        text-align: center;
        animation: glitchIn 0.3s ease-out;
    `;
    hiddenMsg.innerHTML = `
        <h2 style="color: #ff0000; font-family: 'Press Start 2P', cursive; margin-bottom: 20px; font-size: 1.2rem;">MENSAGEM INVERTIDA</h2>
        <p style="color: #00ff00; font-size: 1.3rem; margin-bottom: 15px;">"Eles estao ouvindo."</p>
        <p style="color: #888; font-size: 0.9rem;">A Ephrata Branch sabe que voce esta aqui.</p>
        <p style="color: #ffff00; font-size: 0.7rem; margin-top: 20px; animation: blink 1s infinite;">PRESSIONE ESC PARA FECHAR</p>
    `;
    document.body.appendChild(hiddenMsg);

    setTimeout(() => {
        if (hiddenMsg.parentNode) {
            hiddenMsg.remove();
        }
        audioInvertBtn.textContent = '\uD83D\uDD0A Inverter \u00C1udio';
        audioInvertBtn.style.background = 'rgba(255,0,0,0.2)';
    }, 5000);
}

// ============================================
// VHS TRACKING EFFECT
// ============================================
function triggerVHSTracking() {
    const tracking = document.getElementById('vhs-tracking');
    if (tracking) {
        tracking.style.opacity = '1';
        tracking.style.animation = 'none';
        tracking.offsetHeight;
        tracking.style.animation = 'vhsTracking 0.5s ease-out';

        setTimeout(() => {
            tracking.style.opacity = '0';
        }, 500);
    }
}

setInterval(() => {
    if (Math.random() > 0.9) {
        triggerVHSTracking();
    }
}, 10000);

// ============================================
// STATIC NOISE
// ============================================
function pulseStatic() {
    const staticNoise = document.getElementById('static-noise');
    if (staticNoise) {
        staticNoise.style.opacity = '0.1';
        setTimeout(() => {
            staticNoise.style.opacity = '0.03';
        }, 300);
    }
}

// ============================================
// GLITCH EFFECT ON ELEMENTS
// ============================================
function addGlitchEffect(element, duration = 500) {
    element.style.animation = `glitchText ${duration}ms steps(5)`;
    setTimeout(() => {
        element.style.animation = '';
    }, duration);
}

// ============================================
// CHROMATIC ABERRATION ON HOVER
// ============================================
document.querySelectorAll('.section-title').forEach(title => {
    title.addEventListener('mouseenter', () => {
        title.setAttribute('data-text', title.textContent);
    });
});

// ============================================
// KONAMI CODE
// ============================================
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);

    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }

    if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
        triggerKonamiEffect();
        konamiCode = [];
    }
});

function triggerKonamiEffect() {
    document.body.style.animation = 'screenTear 1s steps(10)';

    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: #ff0000;
        z-index: 3000;
        opacity: 0.5;
        animation: blink 0.2s steps(2) 5;
    `;
    document.body.appendChild(flash);

    setTimeout(() => {
        flash.remove();
        document.body.style.animation = '';
    }, 1000);

    const msg = document.createElement('div');
    msg.style.cssText = `
        position: fixed;
        bottom: 100px; left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.9);
        border: 2px solid #00ff00;
        padding: 20px 40px;
        z-index: 3001;
        text-align: center;
        animation: glitchIn 0.3s ease-out;
    `;
    msg.innerHTML = `
        <p style="color: #00ff00; font-family: 'Press Start 2P', cursive; font-size: 0.7rem;">
            KONAMI CODE DETECTED
        </p>
        <p style="color: #ffff00; font-size: 0.9rem; margin-top: 10px;">
            Voce e um verdadeiro explorador de ARGs!
        </p>
    `;
    document.body.appendChild(msg);

    setTimeout(() => {
        msg.remove();
    }, 3000);
}

// ============================================
// TOUCH SUPPORT
// ============================================
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    }
}

// ============================================
// MOUSE WHEEL NAVIGATION
// ============================================
let wheelTimeout;
document.addEventListener('wheel', (e) => {
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
        if (e.deltaY > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    }, 50);
}, { passive: true });

// ============================================
// RANDOM GLITCH EFFECTS
// ============================================
function randomGlitch() {
    const elements = document.querySelectorAll('.slide.active .section-title, .slide.active .highlight');
    if (elements.length > 0) {
        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        addGlitchEffect(randomElement, 200);
    }
}

setInterval(() => {
    if (Math.random() > 0.8) {
        randomGlitch();
    }
}, 8000);

// ============================================
// YOUTUBE AUDIO PLAYER FOR CARDS
// ============================================
let ytPlayer = null;
let ytReady = false;
let currentAudioTheme = null;

const AUDIO_MAP = {
    caretaker:  { videoId: 'wPOF5FgG3DU',  start: 10,  label: 'It\'s Just a Burning Memory — The Caretaker' },
    local58:    { videoId: '3c66w6fVqOI',  start: 15,  label: 'Contingency — LOCAL 58TV' },
    backrooms:  { videoId: 'H4dGpz6cnHo',  start: 10,  label: 'The Backrooms (Found Footage) — Kane Pixels' },
    mandela:    { videoId: 'C8d12w6pMos',  start: 0,   label: 'The Mandela Catalogue Vol. 1 — Alex Kister' },
    walten:     { videoId: 'uShQXE1Dla8',  start: 0,   label: 'Company Introductory Tape — The Walten Files' },
    gemini:     { videoId: 'vyDvpwpRPM4',  start: 30,  label: 'World\'s Weirdest Animals — Gemini Home Entertainment' },
    sonic:      { videoId: 'hen47NMa8NM',  start: 0,   label: 'Hill Act 1 (Remastered) — Sonic.exe' },
    scp:        { videoId: 'PH2FhZZscrQ',  start: 0,   label: 'Bump in the Night — SCP: Containment Breach' },
    boiled:     { videoId: 'rkbIjuVZ_54',  start: 30,  label: 'THE BOILED ONE PHENOMENON — Doctor Nowhere' },
    petscop:    { videoId: '6e6RK8o1fcs',  start: 0,   label: 'Petscop 1 — Tony Domenico' },
    vitacarnis: { videoId: 'BPf2hFSwpOs',  start: 0,   label: 'Living Meat Research Documentary — Darian Quilloy' },
    smile:      { videoId: 'KIunPyZSStg',  start: 0,   label: 'The SMILE Tapes (Complete) — Patorikku' },
    verity:     { videoId: 'hGBROjRqyDM',  start: 0,   label: 'Something is Knocking... — ThatMob' }
};

const musicPlayerEl = document.getElementById('music-player');
const musicPlayerTitle = document.getElementById('music-player-title');
const musicPlayerStop = document.getElementById('music-player-stop');
const ytPlayerContainer = document.getElementById('yt-player-container');

window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('yt-player-container', {
        height: '1',
        width: '1',
        playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            origin: window.location.origin
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError
        }
    });
};

function onPlayerReady() {
    ytReady = true;
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        stopCardAudio();
    }
}

function onPlayerError(event) {
    console.warn('YouTube player error:', event.data);
    stopCardAudio();
}

function playCardAudio(theme) {
    if (!AUDIO_MAP[theme]) return;

    if (currentAudioTheme === theme) {
        stopCardAudio();
        return;
    }

    stopCardAudio();
    const audio = AUDIO_MAP[theme];

    currentAudioTheme = theme;
    musicPlayerTitle.textContent = audio.label;
    musicPlayerEl.classList.remove('hidden');

    document.querySelectorAll('.slide.active .detail-card, .slide.active .origin-card, .slide.active .stage-card, .slide.active .track-highlight, .slide.active .philosophy-quote, .slide.active .cipher-secret').forEach(card => {
        card.classList.add('audio-playing');
    });

    if (!ytReady) {
        musicPlayerTitle.textContent = audio.label + ' (carregando...)';
        return;
    }

    try {
        ytPlayer.loadVideoById({
            videoId: audio.videoId,
            startSeconds: audio.start,
            suggestedQuality: 'small'
        });
    } catch (err) {
        console.warn('YouTube loadVideoById failed:', err);
        musicPlayerTitle.textContent = audio.label + ' (erro)';
    }
}

function stopCardAudio() {
    if (ytPlayer && ytReady) {
        try { ytPlayer.stopVideo(); } catch (e) {}
    }
    currentAudioTheme = null;
    musicPlayerEl.classList.add('hidden');
    musicPlayerTitle.textContent = '';
    document.querySelectorAll('.audio-playing').forEach(el => {
        el.classList.remove('audio-playing');
    });
}

function initCardAudio() {
    if (musicPlayerStop) {
        musicPlayerStop.addEventListener('click', (e) => {
            e.stopPropagation();
            stopCardAudio();
        });
    }

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.detail-card, .origin-card, .stage-card, .track-highlight, .philosophy-quote, .cipher-secret');
        if (!card) return;

        const slide = card.closest('.slide');
        if (!slide) return;

        const theme = slide.getAttribute('data-theme');
        if (!AUDIO_MAP[theme]) return;

        e.stopPropagation();
        playCardAudio(theme);
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentAudioTheme) {
        stopCardAudio();
    }
});

// ============================================
// CONSOLE EASTER EGG
// ============================================
console.log('%c\u26A0\uFE0F ATENCAO \u26A0\uFE0F', 'color: red; font-size: 3rem; font-weight: bold;');
console.log('%cSe voce esta vendo isso, voce e um verdadeiro explorador de ARGs!', 'color: #00ff00; font-size: 1.5rem;');
console.log('%cDica: Digite MONITOR no teclado durante a apresentacao...', 'color: #ffff00; font-size: 1rem;');
console.log('%cE nao olhe para a lua.', 'color: #888; font-size: 1rem;');

// ============================================
// INITIALIZATION COMPLETE
// ============================================
console.log('Analog Horrors Slide Deck loaded successfully.');
console.log(`Total slides: ${totalSlides}`);
console.log('Navigation: Arrow keys, click, touch swipe, mouse wheel');
console.log('Secret code: MONITOR');
console.log('Konami Code: \u2191\u2191\u2193\u2193\u2190\u2192\u2190\u2192BA');
