import { getRandomTheme, getAllTags } from './themes.js';

const randomPhrases = [
    "The only way to do great work is to love what you do. — Steve Jobs",
    "Stay hungry, stay foolish. — Steve Jobs",
    "In the middle of difficulty lies opportunity. — Albert Einstein",
    "Life is what happens when you're busy making other plans. — John Lennon",
    "The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt",
    "It does not matter how slowly you go as long as you do not stop. — Confucius",
    "Every moment is a fresh beginning. — T.S. Eliot",
    "Not all those who wander are lost. — J.R.R. Tolkien",
    "All that is gold does not glitter. — J.R.R. Tolkien",
    "To live is the rarest thing in the world. Most people just exist. — Oscar Wilde",
    "Be yourself; everyone else is already taken. — Oscar Wilde",
    "So we beat on, boats against the current, borne back ceaselessly into the past. — F. Scott Fitzgerald",
    "I think, therefore I am. — René Descartes",
    "The only limit is your imagination.",
    "Code is poetry. — WordPress",
    "First, solve the problem. Then, write the code. — John Johnson",
    "Talk is cheap. Show me the code. — Linus Torvalds",
    "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. — Martin Fowler",
    "Programs must be written for people to read, and only incidentally for machines to execute. — Abelson & Sussman",
    "Simplicity is the soul of efficiency. — Austin Freeman",
    "Make it work, make it right, make it fast. — Kent Beck",
    "The best error message is the one that never shows up. — Thomas Fuchs",
    "Code never lies, comments sometimes do. — Ron Jeffries",
    "Walking on water and developing software from a specification are easy if both are frozen. — Edward V. Berard",
    "It works on my machine. — Every developer ever",
    "There are only two hard things in Computer Science: cache invalidation and naming things. — Phil Karlton",
    "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away. — Antoine de Saint-Exupéry",
    "The only way to learn a new programming language is by writing programs in it. — Dennis Ritchie",
    "Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging code. — Daniel Quinn",
    "Deleted code is debugged code. — Jeff Sickel",
    "Weeks of coding can save you hours of planning."
];

let allProjects = [];
let currentFilter = 'all';

function showRandomPhrase() {
    const subtitle = document.getElementById('site-subtitle');
    if (!subtitle) return;
    const randomIndex = Math.floor(Math.random() * randomPhrases.length);
    subtitle.textContent = randomPhrases[randomIndex];
}

async function loadProjects() {
    try {
        const response = await fetch('Projects/projects.json?' + Date.now());
        if (!response.ok) throw new Error('Failed to load projects');
        const data = await response.json();
        allProjects = data.projects || [];
        renderProjects(allProjects);
        renderFilters(getAllTags(allProjects));
    } catch (error) {
        console.error('Error loading projects:', error);
        showNoProjects();
    }
}

function renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    if (projects.length === 0) {
        showNoProjects();
        return;
    }

    grid.innerHTML = projects.map(project => createProjectCard(project)).join('');
}

function createProjectCard(project) {
    const imageContent = project.image
        ? `<img src="${project.image}" alt="${project.name}" class="project-card-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
           <div class="project-card-placeholder" style="display:none;">${getInitials(project.name)}</div>`
        : `<div class="project-card-placeholder">${getInitials(project.name)}</div>`;

    const tags = project.tags
        ? project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')
        : '';

    const date = project.date
        ? `<div class="project-card-date">${formatDate(project.date)}</div>`
        : '';

    const accentColor = project.color ? `--project-accent: ${project.color};` : '';

    return `
        <a href="${project.url}" class="project-card" style="${accentColor}">
            ${imageContent}
            <div class="project-card-content">
                <h3 class="project-card-title">${project.name}</h3>
                <p class="project-card-description">${project.description || ''}</p>
                <div class="project-card-tags">${tags}</div>
                ${date}
            </div>
        </a>
    `;
}

function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

function renderFilters(tags) {
    const filtersContainer = document.getElementById('filters');
    if (!filtersContainer || tags.length === 0) return;

    const allBtn = filtersContainer.querySelector('[data-tag="all"]');
    const tagButtons = tags.map(tag =>
        `<button class="filter-btn" data-tag="${tag}">${tag}</button>`
    ).join('');

    allBtn.insertAdjacentHTML('afterend', tagButtons);

    filtersContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        filtersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentFilter = btn.dataset.tag;
        filterProjects();
    });
}

function filterProjects() {
    if (currentFilter === 'all') {
        renderProjects(allProjects);
        return;
    }

    const filtered = allProjects.filter(project =>
        project.tags && project.tags.includes(currentFilter)
    );
    renderProjects(filtered);
}

function showNoProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="no-projects">
            <h2>No projects yet</h2>
            <p>Add projects to Projects/projects.json to see them here.</p>
        </div>
    `;
}

function initTheme() {
    const theme = getRandomTheme();
    const themeLink = document.getElementById('theme-css');
    if (themeLink) {
        themeLink.href = theme.file;
    }
    console.log(`Theme applied: ${theme.name}`);
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    showRandomPhrase();
    loadProjects();
});