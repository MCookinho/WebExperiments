/* ============================================
   AGENT SUIT — O Traje do Agente
   JavaScript: animações, dados, interatividade
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // DADOS DAS PEÇAS
    // ============================================
    const PIECES = [
        {
            name: 'Jaqueta Leve',
            category: 'base',
            icon: '🧥',
            price: 89,
            currency: 'R$',
            link: 'https://shopee.com.br/search?keyword=jaqueta%20leve%20masculina%20moletom',
            desc: 'Jaqueta leve de tecido respirável (algodão/poli). Ideal para o calor e com bolsos internos discretos.',
            details: [
                'Tecido respirável ideal pro calor',
                'Bolsos internos invisíveis',
                'Capuz removível',
                'Discreta e casual'
            ]
        },
        {
            name: 'Camiseta Base',
            category: 'base',
            icon: '👕',
            price: 29,
            currency: 'R$',
            link: 'https://shopee.com.br/search?keyword=camiseta%20basica%20preta%20algodao',
            desc: 'Camiseta básica de algodão. Serve de segunda camada e esconde fios discretamente sob a jaqueta.',
            details: [
                '100% algodão',
                'Cor neutra pra discreção',
                'Esconde fios e bateria',
                'Confortável no calor'
            ]
        },
        {
            name: 'Fone Intra-Auricular',
            category: 'comunicacao',
            icon: '🎧',
            price: 79,
            currency: 'R$',
            link: 'https://shopee.com.br/search?keyword=fone%20intra-auricular%20bluetooth%20discreto',
            desc: 'Micro fone intra-auricular translúcido. Fica praticamente invisível no ouvido e toca a IA só pra você.',
            details: [
                'Som privado e claro',
                'Translúcido, discreto',
                'Bluetooth ao celular',
                'Bateria longa'
            ]
        },
        {
            name: 'Microfone de Lapela',
            category: 'comunicacao',
            icon: '🎤',
            price: 39,
            currency: 'R$',
            link: 'https://shopee.com.br/search?keyword=microfone%20lapela%20discreto',
            desc: 'Microfone minúsculo escondido no colarinho. Capta sua voz com qualidade enquanto parece apenas um botão.',
            details: [
                'Qualidade de estúdio',
                'Escondido no colarinho',
                'Redução de ruído',
                'Compatível com apps de IA'
            ]
        },
        {
            name: 'Baralho de Cartas (Mágica)',
            category: 'magica',
            icon: '🃏',
            price: 25,
            currency: 'R$',
            link: 'https://shopee.com.br/search?keyword=baralho%20magia%20profissional',
            desc: 'Baralho profissional para truques de sleight of hand. Guardado num bolso secreto da jaqueta.',
            details: [
                'Truques clássicos',
                'Sleight of hand',
                'Cabe no bolso secreto',
                'Qualidade profissional'
            ]
        },
        {
            name: 'Máquina de Fumaça de Bolso',
            category: 'magica',
            icon: '💨',
            price: 49,
            currency: 'R$',
            link: 'https://shopee.com.br/search?keyword=maquina%20fuma%C3%A7a%20mini%20de%20bolso',
            desc: 'Dispositivo de bolso que solta uma nuvem de fumaça. Perfeito para revelações e saídas dramáticas.',
            details: [
                'Ativa no ato',
                'Ware de bolso',
                'Efeito dramático',
                'Recarregável'
            ]
        },
        {
            name: 'Equipamento de Moeda Voadora',
            category: 'magica',
            icon: '🪙',
            price: 19,
            currency: 'R$',
            link: 'https://shopee.com.br/search?keyword=moeda%20magica%20truque%20flutuar',
            desc: 'Gimmick de moeda que faz moedas aparecer, desaparecer e flutuar. Clássico impressionante.',
            details: [
                'Aparece/desaparece',
                'Faz a moeda flutuar',
                'Cabe no bolso',
                'Grande impacto'
            ]
        },
        {
            name: 'Gravador de Voz Escondido',
            category: 'extras',
            icon: '🎙️',
            price: 45,
            currency: 'R$',
            link: 'https://shopee.com.br/search?keyword=gravador%20voz%20pen%20drive%20escondido',
            desc: 'Gravador em formato de pen drive escondido no bolso. Grava reuniões e conversas discretamente.',
            details: [
                'Formato pen drive',
                'Gravação de longa duração',
                'Ativação no bolso',
                'Baixa visibilidade'
            ]
        },
        {
            name: 'Compartimentos Secretos',
            category: 'extras',
            icon: '🔒',
            price: 29,
            currency: 'R$',
            link: 'https://shopee.com.br/search?keyword=pochete%20secreta%20escondida',
            desc: 'Bolsos invisíveis para dinheiro, documentos e chaves. Escondidos no forro da jaqueta.',
            details: [
                'Escondidos no forro',
                'Dinheiro e docs',
                'Não parecem bolsos',
                'Fácil acesso'
            ]
        },
        {
            name: 'GPS Rastreador',
            category: 'extras',
            icon: '📡',
            price: 35,
            currency: 'R$',
            link: 'https://shopee.com.br/search?keyword=rastreador%20gps%20mini%20pequeno',
            desc: 'Rastreador GPS minúsculo escondido no forro. Saiba onde sua jaqueta está a qualquer momento.',
            details: [
                'Rastreamento em tempo real',
                'Minúsculo e discreto',
                'Bateria durável',
                'App no celular'
            ]
        },
        {
            name: 'Vibrador de Alertas',
            category: 'extras',
            icon: '📳',
            price: 29,
            currency: 'R$',
            link: 'https://shopee.com.br/search?keyword=pulseira%20vibra%C3%A7%C3%A3o%20alerta%20discreta',
            desc: 'Dispositivo de vibração escondido na manga. Receba notificações discretas sem olhar o celular.',
            details: [
                'Alertas discretos',
                'Escondido na manga',
                'Conecta ao celular',
                'Sem som'
            ]
        }
    ];

    const CATEGORY_LABELS = {
        base: 'Base',
        comunicacao: 'Comunicação',
        magica: 'Mágica',
        extras: 'Extras'
    };

    // ============================================
    // ELEMENTOS
    // ============================================
    const catalog = document.getElementById('catalog');
    const toast = document.getElementById('toast');
    const navbar = document.querySelector('.navbar');
    const particles = document.getElementById('hero-particles');

    // ============================================
    // PREÇOS
    // ============================================
    function sumByCategory(cat) {
        return PIECES.filter(p => p.category === cat)
            .reduce((sum, p) => sum + p.price, 0);
    }

    function totalPrice() {
        return PIECES.reduce((sum, p) => sum + p.price, 0);
    }

    function updatePrices() {
        const fmt = (v) => 'R$ ' + v;
        const total = totalPrice();
        document.querySelectorAll('[data-price="total"], [data-price="sum"], [data-price="footer"]')
            .forEach(el => el.textContent = fmt(total));
        document.querySelectorAll('[data-price="base"]')
            .forEach(el => el.textContent = fmt(sumByCategory('base')));
        document.querySelectorAll('[data-price="comunicacao"]')
            .forEach(el => el.textContent = fmt(sumByCategory('comunicacao')));
        document.querySelectorAll('[data-price="magica"]')
            .forEach(el => el.textContent = fmt(sumByCategory('magica')));
        document.querySelectorAll('[data-price="extras"]')
            .forEach(el => el.textContent = fmt(sumByCategory('extras')));
        document.querySelectorAll('[data-price="fone"]')
            .forEach(el => el.textContent = fmt(PIECES.find(p => p.name === 'Fone Intra-Auricular')?.price || 0));
        document.querySelectorAll('[data-price="mic"]')
            .forEach(el => el.textContent = fmt(PIECES.find(p => p.name === 'Microfone de Lapela')?.price || 0));
        document.querySelectorAll('[data-price="cartas"]')
            .forEach(el => el.textContent = fmt(PIECES.find(p => p.name === 'Baralho de Cartas (Mágica)')?.price || 0));
        document.querySelectorAll('[data-price="fumaca"]')
            .forEach(el => el.textContent = fmt(PIECES.find(p => p.name === 'Máquina de Fumaça de Bolso')?.price || 0));
        document.querySelectorAll('[data-price="moeda"]')
            .forEach(el => el.textContent = fmt(PIECES.find(p => p.name === 'Equipamento de Moeda Voadora')?.price || 0));
        document.querySelectorAll('[data-price="gravador"]')
            .forEach(el => el.textContent = fmt(PIECES.find(p => p.name === 'Gravador de Voz Escondido')?.price || 0));
        document.querySelectorAll('[data-price="compart"]')
            .forEach(el => el.textContent = fmt(PIECES.find(p => p.name === 'Compartimentos Secretos')?.price || 0));
        document.querySelectorAll('[data-price="gps"]')
            .forEach(el => el.textContent = fmt(PIECES.find(p => p.name === 'GPS Rastreador')?.price || 0));
        document.querySelectorAll('[data-price="vibra"]')
            .forEach(el => el.textContent = fmt(PIECES.find(p => p.name === 'Vibrador de Alertas')?.price || 0));
    }

    // ============================================
    // CATÁLOGO (PEÇAS)
    // ============================================
    function buildCatalog() {
        catalog.innerHTML = PIECES.map((p, i) => `
            <div class="catalog-card reveal delay-${i % 4}">
                <span class="cat-icon">${p.icon}</span>
                <h3>${p.name}</h3>
                <div class="cat-category">${CATEGORY_LABELS[p.category]}</div>
                <p>${p.desc}</p>
                <ul class="cat-details">
                    ${p.details.map(d => `<li>✅ ${d}</li>`).join('')}
                </ul>
                <div class="feature-buy">
                    <span class="feature-price">R$ ${p.price}</span>
                    <a href="${p.link}" target="_blank" rel="noopener" class="btn-buy">Comprar na Shopee</a>
                </div>
            </div>
        `).join('');
    }

    // ============================================
    // PREÇO NA FOOTER
    // ============================================
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // ============================================
    // SCROLL REVEAL
    // ============================================
    function initReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    // ============================================
    // NAVBAR SCROLL
    // ============================================
    function initNavbar() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // ============================================
    // PARTICLES
    // ============================================
    function initParticles() {
        for (let i = 0; i < 25; i++) {
            const p = document.createElement('div');
            p.className = 'p';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';
            p.style.width = (Math.random() * 4 + 2) + 'px';
            p.style.height = p.style.width;
            p.style.animationDelay = Math.random() * 5 + 's';
            p.style.animationDuration = (Math.random() * 6 + 6) + 's';
            p.style.background = `rgba(${124 + Math.random() * 50}, ${92 + Math.random() * 80}, 255, 0.6)`;
            particles.appendChild(p);
        }
    }

    // ============================================
    // ANIMAÇÃO DE RING/MAGIC NO FIGURE
    // ============================================
    function initMagicRing() {
        // Sem ação extra, só animação CSS
    }

    // ============================================
    // INIT
    // ============================================
    function init() {
        buildCatalog();
        updatePrices();
        initReveal();
        initNavbar();
        initParticles();
        initMagicRing();

        // Toast ao clicar em tooltips do figure
        document.querySelectorAll('.suit-pocket').forEach(p => {
            p.addEventListener('click', () => showToast(p.getAttribute('data-tooltip')));
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
