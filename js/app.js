/**
 * CINEMATIC FOOD SECURITY JORDAN - AWARD-WINNING INTERACTIONS
 * Advanced animations, parallax effects, and immersive user experiences
 */

// ===== GLOBAL STATE & CONFIGURATION =====
const CinematicApp = {
  theme: localStorage.getItem('fsj-theme') || 'light',
  isLoaded: false,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  mouse: { x: 0, y: 0 },
  scroll: { y: 0, direction: 0, speed: 0 },
  animations: new Map(),
  observers: new Map(),

  // Performance settings
  performance: {
    targetFPS: 60,
    frameTime: 1000 / 60,
    lastFrame: 0,
    animationFrame: null
  }
};

// ===== CINEMATIC LOADING ANIMATION =====
class CinematicLoader {
  constructor() {
    this.createLoader();
    this.init();
  }

  createLoader() {
    const loader = document.createElement('div');
    loader.className = 'cinematic-loader';
    loader.innerHTML = `
      <div class="loader-content">
        <div class="loader-logo">
          <div class="logo-text">Food Security Jordan</div>
          <div class="logo-subtitle">Agricultural Innovation Hub</div>
        </div>
        <div class="loader-progress">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <div class="progress-text">Loading 0%</div>
        </div>
        <div class="loader-particles"></div>
      </div>
    `;

    // Add loader styles
    const styles = `
      .cinematic-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #0B1220 0%, #1A2332 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        transition: opacity 1s ease-out, visibility 1s ease-out;
      }

      .cinematic-loader.hidden {
        opacity: 0;
        visibility: hidden;
      }

      .loader-content {
        text-align: center;
        animation: loaderFadeIn 1s ease-out;
      }

      .loader-logo {
        margin-bottom: 3rem;
      }

      .logo-text {
        font-size: clamp(2rem, 5vw, 4rem);
        font-weight: 800;
        background: linear-gradient(120deg, #1261A0, #29A36A);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 0.5rem;
        animation: titleGlow 2s ease-in-out infinite alternate;
      }

      .logo-subtitle {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 500;
        animation: subtitleSlide 1s ease-out 0.5s both;
      }

      .loader-progress {
        margin-bottom: 2rem;
      }

      .progress-bar {
        width: 300px;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
        margin: 0 auto 1rem;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #1261A0, #29A36A);
        width: 0%;
        transition: width 0.3s ease-out;
        border-radius: 2px;
        box-shadow: 0 0 10px rgba(18, 97, 160, 0.5);
      }

      .progress-text {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.9rem;
        font-weight: 500;
      }

      .loader-particles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
        animation: particles 20s linear infinite;
      }

      @keyframes loaderFadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes titleGlow {
        from { filter: brightness(1); }
        to { filter: brightness(1.2) drop-shadow(0 0 20px rgba(18, 97, 160, 0.3)); }
      }

      @keyframes subtitleSlide {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes particles {
        from { transform: translateY(0) translateX(0); }
        to { transform: translateY(-100px) translateX(50px); }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    document.body.appendChild(loader);

    this.loader = loader;
    this.progressFill = loader.querySelector('.progress-fill');
    this.progressText = loader.querySelector('.progress-text');
  }

  init() {
    this.simulateLoading();
  }

  simulateLoading() {
    let progress = 0;
    const duration = 2000;
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min((elapsed / duration) * 100, 100);

      this.progressFill.style.width = `${progress}%`;
      this.progressText.textContent = `Loading ${Math.round(progress)}%`;

      if (progress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        setTimeout(() => this.complete(), 500);
      }
    };

    requestAnimationFrame(updateProgress);
  }

  complete() {
    this.loader.classList.add('hidden');
    setTimeout(() => {
      this.loader.remove();
      CinematicApp.isLoaded = true;
      document.dispatchEvent(new CustomEvent('appLoaded'));
    }, 1000);
  }
}

// ===== CINEMATIC SCROLL EFFECTS =====
class CinematicScrollManager {
  constructor() {
    this.progressBar = document.querySelector('.progress-fill');
    this.contentProgress = document.querySelector('.content-progress');
    this.header = document.querySelector('.header');
    this.lastScrollY = 0;
    this.ticking = false;

    this.init();
  }

  init() {
    this.setupScrollHandlers();
    this.setupIntersectionObserver();
    this.setupParallaxElements();
  }

  setupScrollHandlers() {
    const handleScroll = () => {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.updateScrollEffects();
          this.ticking = false;
        });
        this.ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  updateScrollEffects() {
    const scrollY = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = (scrollY / documentHeight) * 100;

    // Update progress bar
    if (this.progressBar) {
      this.progressBar.style.width = `${Math.min(scrollProgress, 100)}%`;
    }

    // Update content progress
    if (this.contentProgress) {
      const progressText = this.contentProgress.querySelector('.progress-text');
      if (progressText) {
        progressText.textContent = `${Math.round(scrollProgress)}%`;
      }
    }

    // Header background opacity based on scroll
    if (this.header) {
      const opacity = Math.min(scrollY / 100, 1);
      this.header.style.background = `rgba(11, 18, 32, ${0.8 + (opacity * 0.15)})`;

      if (scrollY > 100) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }
    }

    // Update scroll direction for animations
    CinematicApp.scroll.direction = scrollY > this.lastScrollY ? 1 : -1;
    CinematicApp.scroll.speed = Math.abs(scrollY - this.lastScrollY);
    CinematicApp.scroll.y = scrollY;
    this.lastScrollY = scrollY;
  }

  setupIntersectionObserver() {
    const observerOptions = {
      threshold: [0, 0.1, 0.5, 1],
      rootMargin: '-50px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          this.triggerAnimations(entry.target);
        }
      });
    }, observerOptions);

    // Observe all trackable elements
    document.querySelectorAll('.track').forEach(el => {
      observer.observe(el);
    });

    CinematicApp.observers.set('scroll', observer);
  }

  setupParallaxElements() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    if (parallaxElements.length > 0 && !CinematicApp.reducedMotion) {
      const updateParallax = () => {
        parallaxElements.forEach(el => {
          const speed = parseFloat(el.dataset.parallax) || 0.5;
          const rect = el.getBoundingClientRect();
          const scrolled = window.scrollY;
          const rate = scrolled * -speed;

          el.style.transform = `translateY(${rate}px)`;
        });
      };

      window.addEventListener('scroll', updateParallax, { passive: true });
    }
  }

  triggerAnimations(element) {
    // Trigger counter animations
    const counters = element.querySelectorAll('[data-target]');
    counters.forEach(counter => this.animateCounter(counter));

    // Trigger stagger animations
    const staggerElements = element.querySelectorAll('.stagger-children > *');
    this.staggerAnimation(staggerElements);
  }

  animateCounter(counter) {
    if (counter.dataset.animated) return;

    const target = parseInt(counter.dataset.target);
    const duration = 2000;
    const startTime = performance.now();
    const initialValue = parseInt(counter.textContent) || 0;

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(initialValue + (target - initialValue) * easeOutQuart);

      counter.textContent = currentValue.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target.toLocaleString();
        counter.dataset.animated = 'true';
      }
    };

    requestAnimationFrame(updateCounter);
  }

  staggerAnimation(elements) {
    elements.forEach((el, index) => {
      if (!el.classList.contains('staggered')) {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          el.classList.add('staggered');
        }, index * 100);
      }
    });
  }
}

// ===== CINEMATIC THEME MANAGER =====
class CinematicThemeManager {
  constructor() {
    this.themeToggle = document.querySelector('.theme-toggle');
    this.themeIcons = {
      light: this.themeToggle?.querySelector('.theme-icon-light'),
      dark: this.themeToggle?.querySelector('.theme-icon-dark')
    };

    this.init();
  }

  init() {
    this.applyTheme(CinematicApp.theme);
    this.setupEventListeners();
    this.updateToggleState();
  }

  setupEventListeners() {
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // System theme change detection
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('fsj-theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  toggleTheme() {
    const newTheme = CinematicApp.theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);

    // Add celebration animation
    this.celebrateThemeChange();
  }

  setTheme(theme) {
    CinematicApp.theme = theme;
    this.applyTheme(theme);
    localStorage.setItem('fsj-theme', theme);
    this.updateToggleState();

    // Dispatch theme change event
    document.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme }
    }));
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    // Smooth theme transition
    document.body.style.transition = 'background-color 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  updateToggleState() {
    if (this.themeToggle) {
      const isDark = CinematicApp.theme === 'dark';

      // Update accessibility attributes
      this.themeToggle.setAttribute('aria-label',
        isDark ? 'Switch to light mode' : 'Switch to dark mode'
      );

      // Update icon visibility
      if (this.themeIcons.light && this.themeIcons.dark) {
        this.themeIcons.light.style.opacity = isDark ? '0' : '1';
        this.themeIcons.dark.style.opacity = isDark ? '1' : '0';
      }
    }
  }

  celebrateThemeChange() {
    // Create a burst of particles for theme change
    if (!CinematicApp.reducedMotion) {
      this.createThemeParticles();
    }
  }

  createThemeParticles() {
    const button = this.themeToggle;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: linear-gradient(45deg, #1261A0, #29A36A);
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        left: ${centerX}px;
        top: ${centerY}px;
      `;

      document.body.appendChild(particle);

      const angle = (i / 8) * Math.PI * 2;
      const velocity = 100;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;

      particle.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${vx}px, ${vy}px) scale(0)`, opacity: 0 }
      ], {
        duration: 600,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }).onfinish = () => particle.remove();
    }
  }
}

// ===== CINEMATIC NAVIGATION =====
class CinematicNavigation {
  constructor() {
    this.nav = document.querySelector('.nav');
    this.navToggle = document.querySelector('.nav-toggle');
    this.navLinks = document.querySelector('.nav-links');
    this.navItems = document.querySelectorAll('.nav-link');

    this.init();
  }

  init() {
    this.setupMobileMenu();
    this.setupSmoothScrolling();
    this.setupActiveStates();
    this.setupHoverEffects();
  }

  setupMobileMenu() {
    if (this.navToggle && this.navLinks) {
      this.navToggle.addEventListener('click', () => {
        this.toggleMobileMenu();
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.nav.contains(e.target) && this.navLinks.classList.contains('active')) {
          this.closeMobileMenu();
        }
      });
    }
  }

  toggleMobileMenu() {
    const isActive = this.navLinks.classList.toggle('active');
    this.navToggle.setAttribute('aria-expanded', isActive);

    // Animate hamburger lines
    const lines = this.navToggle.querySelectorAll('.nav-toggle-line');
    lines.forEach((line, index) => {
      if (isActive) {
        line.style.transform = index === 0 ? 'rotate(45deg) translateY(7px)' :
                              index === 1 ? 'opacity: 0' :
                              'rotate(-45deg) translateY(-7px)';
      } else {
        line.style.transform = '';
      }
    });
  }

  closeMobileMenu() {
    this.navLinks.classList.remove('active');
    this.navToggle.setAttribute('aria-expanded', 'false');

    const lines = this.navToggle.querySelectorAll('.nav-toggle-line');
    lines.forEach(line => {
      line.style.transform = '';
    });
  }

  setupSmoothScrolling() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          this.smoothScrollTo(target);
          this.closeMobileMenu();
        }
      });
    });
  }

  smoothScrollTo(target) {
    const headerHeight = this.nav.offsetHeight;
    const targetPosition = target.offsetTop - headerHeight - 20;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  setupActiveStates() {
    // Update active states based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    const updateActiveLink = () => {
      let current = '';

      sections.forEach(section => {
        const sectionTop = section.offsetTop - 200;
        if (window.scrollY >= sectionTop) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
          link.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', updateActiveLink, { passive: true });
  }

  setupHoverEffects() {
    this.navItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        if (!CinematicApp.reducedMotion) {
          item.style.transform = 'translateY(-2px)';
        }
      });

      item.addEventListener('mouseleave', () => {
        item.style.transform = '';
      });
    });
  }
}

// ===== CINEMATIC BUTTON EFFECTS =====
class CinematicButtonEffects {
  constructor() {
    this.buttons = document.querySelectorAll('.btn, .link-card, .glass-card');
    this.init();
  }

  init() {
    this.setupMagneticEffect();
    this.setupRippleEffect();
    this.setupGlowEffect();
  }

  setupMagneticEffect() {
    if (CinematicApp.reducedMotion) return;

    this.buttons.forEach(button => {
      if (button.classList.contains('btn-magnetic')) {
        this.addMagneticEffect(button);
      }
    });
  }

  addMagneticEffect(element) {
    let isHovering = false;

    const handleMouseMove = (e) => {
      if (!isHovering) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * 0.15;
      const deltaY = (e.clientY - centerY) * 0.15;

      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    };

    element.addEventListener('mouseenter', () => {
      isHovering = true;
      element.style.transition = 'transform 0.1s ease-out';
    });

    element.addEventListener('mouseleave', () => {
      isHovering = false;
      element.style.transform = '';
      element.style.transition = 'transform 0.3s ease-out';
    });

    document.addEventListener('mousemove', handleMouseMove);
  }

  setupRippleEffect() {
    this.buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.createRipple(e, button);
      });
    });
  }

  createRipple(event, element) {
    if (CinematicApp.reducedMotion) return;

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      transform: scale(0);
      z-index: 1;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    ripple.animate([
      { transform: 'scale(0)', opacity: 1 },
      { transform: 'scale(1)', opacity: 0 }
    ], {
      duration: 600,
      easing: 'ease-out'
    }).onfinish = () => ripple.remove();
  }

  setupGlowEffect() {
    document.querySelectorAll('.btn-glow').forEach(button => {
      if (!CinematicApp.reducedMotion) {
        this.addGlowAnimation(button);
      }
    });
  }

  addGlowAnimation(element) {
    element.addEventListener('mouseenter', () => {
      element.style.filter = 'brightness(1.1) drop-shadow(0 0 20px rgba(18, 97, 160, 0.4))';
    });

    element.addEventListener('mouseleave', () => {
      element.style.filter = '';
    });
  }
}

// ===== TYPING EFFECT =====
class TypingEffect {
  constructor() {
    this.elements = document.querySelectorAll('[data-typing]');
    this.init();
  }

  init() {
    if (CinematicApp.reducedMotion) return;

    this.elements.forEach(element => {
      this.animateTyping(element);
    });
  }

  animateTyping(element) {
    const text = element.textContent;
    element.textContent = '';
    element.style.opacity = '1';

    let index = 0;
    const typeChar = () => {
      if (index < text.length) {
        element.textContent += text[index];
        index++;
        setTimeout(typeChar, 50);
      }
    };

    // Start typing after element is visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => typeChar(), 500);
          observer.disconnect();
        }
      });
    });

    observer.observe(element);
  }
}

// ===== MOUSE FOLLOWER =====
class MouseFollower {
  constructor() {
    if (CinematicApp.reducedMotion) return;

    this.follower = this.createFollower();
    this.mouse = { x: 0, y: 0 };
    this.followerPos = { x: 0, y: 0 };
    this.isVisible = false;

    this.init();
  }

  createFollower() {
    const follower = document.createElement('div');
    follower.className = 'mouse-follower';
    follower.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background: radial-gradient(circle, rgba(18, 97, 160, 0.3), transparent);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      transition: opacity 0.3s ease;
      opacity: 0;
      mix-blend-mode: difference;
    `;

    document.body.appendChild(follower);
    return follower;
  }

  init() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      if (!this.isVisible) {
        this.isVisible = true;
        this.follower.style.opacity = '1';
      }
    });

    document.addEventListener('mouseleave', () => {
      this.isVisible = false;
      this.follower.style.opacity = '0';
    });

    this.animate();
  }

  animate() {
    const lerp = (start, end, factor) => start + (end - start) * factor;

    this.followerPos.x = lerp(this.followerPos.x, this.mouse.x, 0.1);
    this.followerPos.y = lerp(this.followerPos.y, this.mouse.y, 0.1);

    this.follower.style.left = `${this.followerPos.x - 10}px`;
    this.follower.style.top = `${this.followerPos.y - 10}px`;

    requestAnimationFrame(() => this.animate());
  }
}

// ===== AI ASSISTANT ENHANCED =====
class AIAssistant {
  constructor() {
    this.apiKey = 'your_openai_api_key_here'; // Replace with actual API key
    this.isOpen = false;
    this.conversationHistory = [];
    this.createAssistant();
    this.init();
  }

  createAssistant() {
    const assistant = document.createElement('div');
    assistant.className = 'ai-assistant';
    assistant.innerHTML = `
      <div class="assistant-trigger" title="AI Assistant">
        <div class="trigger-icon">🤖</div>
        <div class="trigger-pulse"></div>
      </div>
      <div class="assistant-panel">
        <div class="assistant-header">
          <h3>🌾 Agriculture AI Assistant</h3>
          <button class="assistant-close" aria-label="Close assistant">×</button>
        </div>
        <div class="assistant-content">
          <div class="conversation">
            <div class="message assistant-message">
              <div class="message-content">
                Hello! I'm your AI agriculture assistant. Ask me anything about crops, irrigation, farming techniques, or food security in Jordan.
              </div>
            </div>
          </div>
          <div class="input-area">
            <input type="text" placeholder="Ask about agriculture..." class="assistant-input">
            <button class="send-button" aria-label="Send message">
              <span class="send-icon">→</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Add assistant styles
    const styles = `
      .ai-assistant {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 9999;
      }

      .assistant-trigger {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #1261A0, #29A36A);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 8px 32px rgba(18, 97, 160, 0.3);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .assistant-trigger:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(18, 97, 160, 0.4);
      }

      .trigger-icon {
        font-size: 1.5rem;
        z-index: 2;
      }

      .trigger-pulse {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(255,255,255,0.3), transparent);
        border-radius: 50%;
        animation: pulse 2s ease-in-out infinite;
      }

      .assistant-panel {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 400px;
        max-height: 500px;
        background: rgba(11, 18, 32, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px);
        transition: all 0.3s ease;
      }

      .assistant-panel.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .assistant-header {
        padding: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .assistant-header h3 {
        color: white;
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0;
      }

      .assistant-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.6);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        transition: color 0.2s ease;
      }

      .assistant-close:hover {
        color: white;
      }

      .assistant-content {
        display: flex;
        flex-direction: column;
        height: 400px;
      }

      .conversation {
        flex: 1;
        padding: 1rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .message {
        max-width: 80%;
        animation: messageSlide 0.3s ease-out;
      }

      .user-message {
        align-self: flex-end;
      }

      .assistant-message {
        align-self: flex-start;
      }

      .message-content {
        padding: 0.75rem 1rem;
        border-radius: 18px;
        font-size: 0.9rem;
        line-height: 1.4;
      }

      .user-message .message-content {
        background: linear-gradient(135deg, #1261A0, #29A36A);
        color: white;
      }

      .assistant-message .message-content {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .input-area {
        padding: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        gap: 0.5rem;
      }

      .assistant-input {
        flex: 1;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 0.75rem;
        color: white;
        font-size: 0.9rem;
        outline: none;
        transition: border-color 0.2s ease;
      }

      .assistant-input:focus {
        border-color: #29A36A;
      }

      .assistant-input::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }

      .send-button {
        background: linear-gradient(135deg, #1261A0, #29A36A);
        border: none;
        border-radius: 12px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s ease;
      }

      .send-button:hover {
        transform: scale(1.05);
      }

      .send-icon {
        color: white;
        font-size: 1.2rem;
        font-weight: bold;
      }

      @keyframes pulse {
        0%, 100% { opacity: 0.7; transform: scale(1); }
        50% { opacity: 0.3; transform: scale(1.1); }
      }

      @keyframes messageSlide {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 480px) {
        .assistant-panel {
          width: calc(100vw - 2rem);
          right: 1rem;
          left: 1rem;
        }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    document.body.appendChild(assistant);

    this.assistant = assistant;
    this.trigger = assistant.querySelector('.assistant-trigger');
    this.panel = assistant.querySelector('.assistant-panel');
    this.closeBtn = assistant.querySelector('.assistant-close');
    this.input = assistant.querySelector('.assistant-input');
    this.sendBtn = assistant.querySelector('.send-button');
    this.conversation = assistant.querySelector('.conversation');
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.trigger.addEventListener('click', () => this.toggle());
    this.closeBtn.addEventListener('click', () => this.close());

    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.sendBtn.addEventListener('click', () => this.sendMessage());

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.assistant.contains(e.target)) {
        this.close();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.panel.classList.add('active');
    setTimeout(() => this.input.focus(), 300);
  }

  close() {
    this.isOpen = false;
    this.panel.classList.remove('active');
  }

  async sendMessage() {
    const message = this.input.value.trim();
    if (!message) return;

    this.addMessage(message, 'user');
    this.input.value = '';

    // Show typing indicator
    this.showTyping();

    try {
      const response = await this.getAIResponse(message);
      this.hideTyping();
      this.addMessage(response, 'assistant');
    } catch (error) {
      this.hideTyping();
      this.addMessage('Sorry, I encountered an error. Please try again later.', 'assistant');
    }
  }

  addMessage(content, sender) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${sender}-message`;
    messageEl.innerHTML = `<div class="message-content">${content}</div>`;

    this.conversation.appendChild(messageEl);
    this.conversation.scrollTop = this.conversation.scrollHeight;
  }

  showTyping() {
    const typingEl = document.createElement('div');
    typingEl.className = 'message assistant-message typing';
    typingEl.innerHTML = `
      <div class="message-content">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;

    this.conversation.appendChild(typingEl);
    this.conversation.scrollTop = this.conversation.scrollHeight;
  }

  hideTyping() {
    const typing = this.conversation.querySelector('.typing');
    if (typing) typing.remove();
  }

  async getAIResponse(query) {
    // This is a fallback response system
    // In production, you would integrate with OpenAI API or your preferred AI service

    const responses = {
      irrigation: "For Jordan's arid climate, drip irrigation is highly recommended. It can reduce water usage by up to 50% while maintaining crop yields. Consider micro-sprinklers for orchards and smart sensors for optimal water management.",
      crops: "Jordan's top crops include olives, tomatoes, citrus fruits, and wheat. Focus on drought-resistant varieties and consider indigenous crops like za'atar and sumac for sustainable farming.",
      water: "Water scarcity is Jordan's biggest agricultural challenge. Implement rainwater harvesting, greywater recycling, and precision irrigation. Every drop counts in sustainable farming.",
      technology: "Modern farming in Jordan benefits from IoT sensors, drone monitoring, and AI-powered crop management. These technologies help optimize resource use and increase productivity.",
      default: "I'd be happy to help with your agriculture question! I can provide information about crops, irrigation methods, sustainable farming practices, and agricultural technology suitable for Jordan's climate."
    };

    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('irrigation') || lowerQuery.includes('water')) {
      return responses.irrigation;
    } else if (lowerQuery.includes('crop') || lowerQuery.includes('plant')) {
      return responses.crops;
    } else if (lowerQuery.includes('technology') || lowerQuery.includes('iot') || lowerQuery.includes('smart')) {
      return responses.technology;
    } else if (lowerQuery.includes('water')) {
      return responses.water;
    } else {
      return responses.default;
    }
  }
}

// ===== INITIALIZE CINEMATIC APP =====
class CinematicAppInitializer {
  constructor() {
    this.components = new Map();
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }
  }

  initializeComponents() {
    // Initialize loader first
    this.components.set('loader', new CinematicLoader());

    // Initialize other components after app loads
    document.addEventListener('appLoaded', () => {
      this.components.set('scroll', new CinematicScrollManager());
      this.components.set('theme', new CinematicThemeManager());
      this.components.set('navigation', new CinematicNavigation());
      this.components.set('buttons', new CinematicButtonEffects());
      this.components.set('typing', new TypingEffect());
      this.components.set('mouse', new MouseFollower());
      this.components.set('ai', new AIAssistant());

      // Add scroll to top button
      this.addScrollToTop();

      // Initialize performance monitoring
      this.initPerformanceMonitoring();

      console.log('🎬 Cinematic Food Security Jordan - Loaded');
    });
  }

  addScrollToTop() {
    const scrollToTop = document.createElement('button');
    scrollToTop.className = 'scroll-to-top';
    scrollToTop.innerHTML = '↑';
    scrollToTop.setAttribute('aria-label', 'Scroll to top');
    scrollToTop.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 2rem;
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #1261A0, #29A36A);
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 1.2rem;
      font-weight: bold;
      cursor: pointer;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(18, 97, 160, 0.3);
    `;

    document.body.appendChild(scrollToTop);

    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        scrollToTop.style.opacity = '1';
        scrollToTop.style.visibility = 'visible';
      } else {
        scrollToTop.style.opacity = '0';
        scrollToTop.style.visibility = 'hidden';
      }
    });

    // Smooth scroll to top
    scrollToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  initPerformanceMonitoring() {
    // Monitor performance and adjust animations if needed
    let frameCount = 0;
    let lastTime = performance.now();

    const checkPerformance = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;

        // If FPS is too low, reduce animations
        if (fps < 30 && !CinematicApp.reducedMotion) {
          console.warn('Performance: Reducing animations due to low FPS');
          document.documentElement.classList.add('reduced-animations');
        }
      }

      requestAnimationFrame(checkPerformance);
    };

    requestAnimationFrame(checkPerformance);
  }
}

// ===== START THE CINEMATIC EXPERIENCE =====
new CinematicAppInitializer();