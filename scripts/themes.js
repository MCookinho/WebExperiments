export const themes = [
    {
        id: 'retro-pixel',
        name: 'Retro Pixel',
        description: 'Pixel art, cores neon e efeitos glitch',
        file: 'styles/themes/retro-pixel.css'
    },
    {
        id: 'glassmorphism',
        name: 'Glassmorphism',
        description: 'Vidro fosco, blur e transparências',
        file: 'styles/themes/glassmorphism.css'
    },
    {
        id: 'neon-cyberpunk',
        name: 'Neon Cyberpunk',
        description: 'Cores neon vibrantes e fundo escuro',
        file: 'styles/themes/neon-cyberpunk.css'
    },
    {
        id: 'nature',
        name: 'Natureza',
        description: 'Cores terrosas e fontes elegantes',
        file: 'styles/themes/nature.css'
    },
    {
        id: 'brutalism',
        name: 'Brutalismo',
        description: 'Bordas pesadas e cores sólidas',
        file: 'styles/themes/brutalism.css'
    },
    {
        id: 'watercolor',
        name: 'Aquarela',
        description: 'Cores pastel e texturas de pintura',
        file: 'styles/themes/watercolor.css'
    },
    {
        id: 'space',
        name: 'Space',
        description: 'Estrelas e gradientes cósmicos',
        file: 'styles/themes/space.css'
    },
    {
        id: 'retrowave',
        name: 'Retro Wave',
        description: 'Anos 80, gradiente neon e perspectiva',
        file: 'styles/themes/retrowave.css'
    },
    {
        id: 'memphis',
        name: 'Memphis',
        description: 'Formas geométricas coloridas',
        file: 'styles/themes/memphis.css'
    },
    {
        id: 'y2k',
        name: 'Y2K',
        description: 'Metais prateados e futurista',
        file: 'styles/themes/y2k.css'
    },
    {
        id: 'steampunk',
        name: 'Steampunk',
        description: 'Engrenagens, bronze e couro',
        file: 'styles/themes/steampunk.css'
    },
    {
        id: 'origami',
        name: 'Origami',
        description: 'Dobras de papel e sombras suaves',
        file: 'styles/themes/origami.css'
    }
];

export function getRandomTheme() {
    const savedTheme = sessionStorage.getItem('currentTheme');
    if (savedTheme) {
        return themes.find(t => t.id === savedTheme) || themes[Math.floor(Math.random() * themes.length)];
    }
    const randomIndex = Math.floor(Math.random() * themes.length);
    const selectedTheme = themes[randomIndex];
    sessionStorage.setItem('currentTheme', selectedTheme.id);
    return selectedTheme;
}

export function getAllTags(projects) {
    const tagsSet = new Set();
    projects.forEach(project => {
        if (project.tags) {
            project.tags.forEach(tag => tagsSet.add(tag));
        }
    });
    return Array.from(tagsSet).sort();
}