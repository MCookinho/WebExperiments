/**
 * TechVault Corp - Main Application Script
 * Handles navigation, animations, and general UI interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Animate stats on scroll
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-item').forEach(stat => {
        stat.style.opacity = '0';
        stat.style.transform = 'translateY(20px)';
        stat.style.transition = 'all 0.6s ease-out';
        statsObserver.observe(stat);
    });

    // Service cards animation
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 150);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.service-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.5s ease-out';
        cardObserver.observe(card);
    });

    // CTF HINT 3: Debug mode check - logs sensitive info to console
    if (typeof TechVaultDebug !== 'undefined') {
        console.log('[TechVault] Debug mode active');
        console.log('[TechVault] API endpoint: https://api.techvault-internal.net/v2');
        console.log('[TechVault] Internal key: tv_internal_8f3k2mPq7wLz9xRv');
    }

    // CTF HINT 1: Version info exposed in footer
    const version = '3.2.1';
    console.log(`[TechVault] App v${version} loaded`);

    // CTF: Hidden debug function that can be called from console
    // This simulates a real scenario where devs leave debug functions
    window.__debug = {
        version: '3.2.1',
        environment: 'production',
        apiBase: 'https://api.techvault-internal.net/v2',
        getApiKey: function() {
            // In a real app this might fetch from a config endpoint
            return 'tv_internal_8f3k2mPq7wLz9xRv';
        },
        getSession: function() {
            return localStorage.getItem('tv_session');
        },
        getAuthToken: function() {
            return localStorage.getItem('tv_auth_token');
        }
    };
});
