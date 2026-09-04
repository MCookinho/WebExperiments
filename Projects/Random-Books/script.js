/* ============================================
   RANDOM BOOKS - Book Reader JS
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // STATE
    // ============================================
    let books = [];
    let currentBook = null;
    let chapters = [];
    let currentChapterIndex = 0;
    let fontSize = 18;

    // ============================================
    // DOM
    // ============================================
    const $ = (s) => document.querySelector(s);
    const loadingScreen = $('#loading-screen');
    const loadingText = $('#loading-text');
    const errorScreen = $('#error-screen');
    const errorMsg = $('#error-msg');
    const retryBtn = $('#retry-btn');
    const reader = $('#reader');
    const topbarTitle = $('#topbar-title');
    const bookTitle = $('#book-title');
    const bookAuthor = $('#book-author');
    const chapterText = $('#chapter-text');
    const tocToggle = $('#toc-toggle');
    const tocSidebar = $('#toc-sidebar');
    const tocClose = $('#toc-close');
    const tocOverlay = $('#toc-overlay');
    const tocList = $('#toc-list');
    const prevBtn = $('#prev-chapter');
    const nextBtn = $('#next-chapter');
    const chapterIndicator = $('#chapter-indicator');
    const themeToggle = $('#theme-toggle');
    const randomBtn = $('#random-btn');
    const fontUp = $('#font-size-up');
    const fontDown = $('#font-size-down');
    const bookScroll = $('#book-scroll');
    const progressFill = $('#progress-fill');

    // ============================================
    // INIT
    // ============================================
    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        loadPrefs();
        bindEvents();
        try {
            await loadBooks();
            pickAndLoadRandomBook();
        } catch (e) {
            showError('Failed to load book list: ' + e.message);
        }
    }

    // ============================================
    // BOOK LIST
    // ============================================
    async function loadBooks() {
        const resp = await fetch('books.json');
        if (!resp.ok) throw new Error('books.json not found');
        const data = await resp.json();
        books = data.books;
    }

    function pickRandomBook() {
        const read = getReadIds();
        let available = books.filter(b => !read.includes(b.id));
        if (available.length === 0) {
            clearReadIds();
            available = books;
        }
        return available[Math.floor(Math.random() * available.length)];
    }

    // ============================================
    // LOCAL STORAGE
    // ============================================
    function getReadIds() {
        try { return JSON.parse(localStorage.getItem('lr_read') || '[]'); } catch { return []; }
    }

    function markAsRead(id) {
        const read = getReadIds();
        if (!read.includes(id)) {
            read.push(id);
            if (read.length > books.length * 0.8) read.splice(0, read.length - 50);
            localStorage.setItem('lr_read', JSON.stringify(read));
        }
    }

    function clearReadIds() {
        localStorage.removeItem('lr_read');
    }

    function getProgress(bookId) {
        try { return JSON.parse(localStorage.getItem('lr_prog_' + bookId) || '{}'); } catch { return {}; }
    }

    function saveProgress(bookId, chapterIdx, scrollPct) {
        localStorage.setItem('lr_prog_' + bookId, JSON.stringify({ chapter: chapterIdx, scroll: scrollPct }));
    }

    function loadPrefs() {
        fontSize = parseInt(localStorage.getItem('lr_fontsize') || '18', 10);
        const theme = localStorage.getItem('lr_theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.setProperty('--fs-base', fontSize + 'px');
    }

    function savePrefs() {
        localStorage.setItem('lr_fontsize', fontSize);
        localStorage.setItem('lr_theme', document.documentElement.getAttribute('data-theme') || 'light');
    }

    // ============================================
    // FETCH BOOK FROM LOCAL JSON
    // ============================================
    async function pickAndLoadRandomBook() {
        const book = pickRandomBook();
        await loadBook(book);
    }

    async function loadBook(book) {
        showLoading('Loading "' + book.title + '"...');
        currentBook = book;

        try {
            const resp = await fetch(`books/${book.id}.json`);
            if (!resp.ok) throw new Error('Book file not found');
            const data = await resp.json();
            chapters = data.chapters;
        } catch (e) {
            showError('Could not load book.');
            return;
        }
        markAsRead(book.id);

        topbarTitle.textContent = book.title;
        bookTitle.textContent = book.title;
        bookAuthor.textContent = book.author;

        buildTOC();
        currentChapterIndex = 0;

        const saved = getProgress(book.id);
        if (saved.chapter && saved.chapter < chapters.length) {
            currentChapterIndex = saved.chapter;
        }

        renderChapter();
        showReader();
        updateProgress();

        if (saved.scroll) {
            requestAnimationFrame(() => {
                bookScroll.scrollTop = saved.scroll * bookScroll.scrollHeight;
            });
        }
    }

    // ============================================
    // RENDERING
    // ============================================
    function renderChapter() {
        if (!chapters.length) return;
        const ch = chapters[currentChapterIndex];

        // Convert plain text to HTML paragraphs
        const html = textToHtml(ch.content);
        chapterText.innerHTML = html;

        bookScroll.scrollTop = 0;
        updateNav();
        updateTOCActive();
    }

    function textToHtml(text) {
        // Convert plain text Gutenberg files to decent HTML
        const lines = text.split('\n');
        let html = '';
        let inParagraph = false;
        let paragraphLines = [];

        function flushParagraph() {
            if (paragraphLines.length > 0) {
                const content = paragraphLines.join(' ').trim();
                if (content.length > 0) {
                    // Check if it's a heading
                    if (isHeading(content)) {
                        html += `<h2>${escapeHtml(content)}</h2>`;
                    } else {
                        html += `<p>${escapeHtml(content)}</p>`;
                    }
                }
                paragraphLines = [];
            }
            inParagraph = false;
        }

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            if (trimmed === '') {
                flushParagraph();
            } else if (trimmed.match(/^={3,}$/) || trimmed.match(/^-{3,}$/)) {
                flushParagraph();
                html += '<hr>';
            } else if (trimmed.match(/^\*{3,}$/) || trimmed.match(/^#{3,}$/)) {
                flushParagraph();
                html += '<hr>';
            } else {
                paragraphLines.push(trimmed);
                inParagraph = true;
            }
        }
        flushParagraph();

        return html;
    }

    function isHeading(text) {
        // Detect chapter/section headings in Gutenberg text
        if (text.length > 100) return false;
        if (/^(CHAPTER|Chapter|PART|Part|BOOK|Book|SECTION|Section)\s/.test(text)) return true;
        if (/^(CHAPTER|Chapter)\s+[IVXLCDM\d]/.test(text)) return true;
        if (/^[IVXLCDM]+\.\s/.test(text) && text.length < 40) return true;
        if (/^\d+\.\s/.test(text) && text.length < 40) return true;
        return false;
    }

    function escapeHtml(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ============================================
    // TOC
    // ============================================
    function buildTOC() {
        tocList.innerHTML = '';
        chapters.forEach((ch, i) => {
            const li = document.createElement('li');
            li.textContent = ch.title;
            li.addEventListener('click', () => {
                currentChapterIndex = i;
                renderChapter();
                closeTOC();
            });
            tocList.appendChild(li);
        });
    }

    function updateTOCActive() {
        const items = tocList.querySelectorAll('li');
        items.forEach((li, i) => {
            li.classList.toggle('active', i === currentChapterIndex);
        });
    }

    function openTOC() {
        tocSidebar.classList.add('open');
        tocOverlay.classList.remove('hidden');
    }

    function closeTOC() {
        tocSidebar.classList.remove('open');
        tocOverlay.classList.add('hidden');
    }

    // ============================================
    // NAVIGATION
    // ============================================
    function updateNav() {
        prevBtn.disabled = currentChapterIndex <= 0;
        nextBtn.disabled = currentChapterIndex >= chapters.length - 1;
        chapterIndicator.textContent = `${currentChapterIndex + 1} / ${chapters.length}`;
    }

    function updateProgress() {
        if (chapters.length === 0) return;
        const pct = ((currentChapterIndex + 1) / chapters.length) * 100;
        progressFill.style.width = pct + '%';
    }

    // ============================================
    // UI STATES
    // ============================================
    function showLoading(msg) {
        loadingText.textContent = msg || 'Loading...';
        loadingScreen.classList.remove('hidden', 'fade-out');
        errorScreen.classList.add('hidden');
        reader.classList.add('hidden');
    }

    function showReader() {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            loadingScreen.classList.remove('fade-out');
        }, 500);
        errorScreen.classList.add('hidden');
        reader.classList.remove('hidden');
    }

    function showError(msg) {
        loadingScreen.classList.add('hidden');
        reader.classList.add('hidden');
        errorScreen.classList.remove('hidden');
        errorMsg.textContent = msg;
    }

    // ============================================
    // THEME & FONT
    // ============================================
    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        savePrefs();
    }

    function changeFontSize(delta) {
        fontSize = Math.max(14, Math.min(28, fontSize + delta));
        document.documentElement.style.setProperty('--fs-base', fontSize + 'px');
        savePrefs();
    }

    // ============================================
    // EVENTS
    // ============================================
    function bindEvents() {
        prevBtn.addEventListener('click', () => {
            if (currentChapterIndex > 0) {
                currentChapterIndex--;
                renderChapter();
                updateProgress();
                saveProgress(currentBook.id, currentChapterIndex, 0);
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentChapterIndex < chapters.length - 1) {
                currentChapterIndex++;
                renderChapter();
                updateProgress();
                saveProgress(currentBook.id, currentChapterIndex, 0);
            }
        });

        tocToggle.addEventListener('click', openTOC);
        tocClose.addEventListener('click', closeTOC);
        tocOverlay.addEventListener('click', closeTOC);

        themeToggle.addEventListener('click', toggleTheme);
        fontUp.addEventListener('click', () => changeFontSize(2));
        fontDown.addEventListener('click', () => changeFontSize(-2));

        randomBtn.addEventListener('click', () => pickAndLoadRandomBook());
        retryBtn.addEventListener('click', () => pickAndLoadRandomBook());

        // Save scroll position
        let scrollTimer;
        bookScroll.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                if (currentBook) {
                    const pct = bookScroll.scrollTop / (bookScroll.scrollHeight - bookScroll.clientHeight || 1);
                    saveProgress(currentBook.id, currentChapterIndex, pct);
                    updateProgress();
                }
            }, 300);
        });

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (reader.classList.contains('hidden')) return;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                prevBtn.click();
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                nextBtn.click();
            } else if (e.key === 't' || e.key === 'T') {
                openTOC();
            } else if (e.key === 'Escape') {
                closeTOC();
            } else if (e.key === 'r' || e.key === 'R') {
                pickAndLoadRandomBook();
            }
        });
    }

})();
