/**
 * Food Security Jordan - Splash Screen
 * Animated loading screen with Jordan flag and progress
 */

class SplashScreen {
    constructor() {
        this.splashElement = document.getElementById('splash-screen');
        this.progressBar = null;
        this.duration = 3000; // 3 seconds
        this.init();
    }

    init() {
        if (!this.splashElement) return;

        // Show splash screen immediately
        this.show();

        // Start progress animation
        this.animateProgress();

        // Hide after duration
        setTimeout(() => {
            this.hide();
        }, this.duration);
    }

    show() {
        this.splashElement.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Animate flag
        this.animateFlag();
    }

    hide() {
        this.splashElement.style.opacity = '0';
        this.splashElement.style.transform = 'scale(0.95)';

        setTimeout(() => {
            this.splashElement.style.display = 'none';
            document.body.style.overflow = '';
        }, 500);
    }

    animateProgress() {
        this.progressBar = this.splashElement.querySelector('.splash-progress-bar');
        if (!this.progressBar) return;

        // Reset progress
        this.progressBar.style.width = '0%';

        // Animate to 100%
        setTimeout(() => {
            this.progressBar.style.width = '100%';
        }, 100);
    }

    animateFlag() {
        const flag = this.splashElement.querySelector('.jordan-flag');
        if (!flag) return;

        // Add entrance animation
        flag.style.transform = 'scale(0.8) rotate(-5deg)';
        flag.style.opacity = '0';

        setTimeout(() => {
            flag.style.transition = 'all 0.8s ease';
            flag.style.transform = 'scale(1) rotate(0deg)';
            flag.style.opacity = '1';
        }, 200);

        // Animate star
        const star = flag.querySelector('.flag-star');
        if (star) {
            star.style.animation = 'twinkle 2s ease-in-out infinite';
        }
    }
}

// Enhanced splash screen styles
const splashStyles = `
    .splash-screen {
        background: linear-gradient(135deg, #FAF7F1 0%, #F5F5F5 100%);
        transition: all 0.5s ease;
    }

    .jordan-flag {
        transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .flag-star {
        transform-origin: center;
    }

    @keyframes twinkle {
        0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 0.8;
        }
    }

    .splash-progress-bar {
        transition: width 2.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .splash-logo {
        animation: fadeInUp 1s ease 0.5s both;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Dark theme splash */
    [data-theme="dark"] .splash-screen {
        background: linear-gradient(135deg, #0E1110 0%, #161A19 100%);
    }
`;

// Inject splash styles
const splashStyleSheet = document.createElement('style');
splashStyleSheet.textContent = splashStyles;
document.head.appendChild(splashStyleSheet);

// Initialize splash screen only on index page
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the index page and splash element exists
    const isIndexPage = window.location.pathname.endsWith('index.html') ||
                       window.location.pathname === '/' ||
                       window.location.pathname.endsWith('/');

    const splashElement = document.getElementById('splash-screen');

    if (isIndexPage && splashElement) {
        new SplashScreen();
    }
});