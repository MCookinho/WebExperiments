import { getRandomTheme, getAllTags } from './themes.js';

let allProjects = [];
let currentFilter = 'all';

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
    loadProjects();
});