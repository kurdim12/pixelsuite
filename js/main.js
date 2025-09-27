/**
 * Food Security Jordan - Main JavaScript
 * Premium minimalist interactions with scroll progress functionality
 */

// ===== GLOBAL STATE =====
const App = {
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  scrollProgress: 0,
  isLoaded: false
};

// ===== SCROLL PROGRESS MANAGER =====
class ScrollProgressManager {
  constructor() {
    this.progressCircle = document.querySelector('.progress-circle');
    this.progressFill = document.querySelector('.progress-fill');
    this.progressText = document.querySelector('.progress-text');
    this.header = document.querySelector('.header');

    if (this.progressCircle && this.progressFill && this.progressText) {
      this.init();
    }
  }

  init() {
    this.setupScrollListener();
    this.setupClickToTop();
    this.updateProgress(); // Initial call
  }

  setupScrollListener() {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateProgress();
          this.updateHeader();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
  }

  updateProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.min((scrollTop / documentHeight) * 100, 100);

    App.scrollProgress = scrollPercent;

    // Update progress circle
    const circumference = 2 * Math.PI * 25; // radius = 25
    const offset = circumference - (scrollPercent / 100) * circumference;

    if (!App.reducedMotion) {
      this.progressFill.style.strokeDashoffset = offset;
    } else {
      this.progressFill.style.strokeDashoffset = offset;
    }

    // Update progress text
    this.progressText.textContent = `${Math.round(scrollPercent)}%`;
    this.progressText.setAttribute('aria-valuenow', Math.round(scrollPercent));
  }

  updateHeader() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (this.header) {
      if (scrollTop > 50) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }
    }
  }

  setupClickToTop() {
    this.progressCircle.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Keyboard accessibility
    this.progressCircle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }
}

// ===== INTERSECTION OBSERVER =====
class IntersectionManager {
  constructor() {
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.setupObserver();
    } else {
      // Fallback for older browsers
      this.fallbackVisibility();
    }
  }

  setupObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          this.triggerAnimations(entry.target);
        }
      });
    }, options);

    // Observe all trackable elements
    document.querySelectorAll('.track').forEach(el => {
      observer.observe(el);
    });
  }

  fallbackVisibility() {
    // Simple fallback - show all elements
    document.querySelectorAll('.track').forEach(el => {
      el.classList.add('in-view');
      this.triggerAnimations(el);
    });
  }

  triggerAnimations(element) {
    // Trigger counter animations
    const counters = element.querySelectorAll('[data-target]');
    counters.forEach(counter => this.animateCounter(counter));
  }

  animateCounter(counter) {
    if (counter.dataset.animated) return;

    const target = parseInt(counter.dataset.target) || 0;
    const duration = App.reducedMotion ? 100 : 2000;
    const startTime = performance.now();
    const initialValue = parseInt(counter.textContent) || 0;

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
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
}

// ===== NAVIGATION MANAGER =====
class NavigationManager {
  constructor() {
    this.nav = document.querySelector('.nav');
    this.navToggle = document.querySelector('.nav-toggle');
    this.navLinks = document.querySelector('.nav-links');
    this.themeToggle = document.querySelector('.theme-toggle');

    this.init();
  }

  init() {
    this.setupMobileMenu();
    this.setupThemeToggle();
    this.setupSmoothScrolling();
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

      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.navLinks.classList.contains('active')) {
          this.closeMobileMenu();
          this.navToggle.focus();
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
                              index === 1 ? 'scaleX(0)' :
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

  setupThemeToggle() {
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => {
        // Theme toggle functionality would go here
        // For now, just add a subtle interaction
        this.themeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
          this.themeToggle.style.transform = '';
        }, 150);
      });
    }
  }

  setupSmoothScrolling() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#' || href === '#main') return;

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
    const headerHeight = this.nav ? this.nav.offsetHeight : 72;
    const targetPosition = target.offsetTop - headerHeight - 20;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

// ===== ENHANCED INTERACTIONS =====
class InteractionManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupHoverEffects();
    this.setupFocusEffects();
    this.setupClickEffects();
  }

  setupHoverEffects() {
    if (App.reducedMotion) return;

    // Card hover effects
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

    // Button hover effects
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-1px)';
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  setupFocusEffects() {
    // Enhanced focus for better accessibility
    document.querySelectorAll('a, button, input, select, textarea').forEach(element => {
      element.addEventListener('focus', () => {
        element.classList.add('focused');
      });

      element.addEventListener('blur', () => {
        element.classList.remove('focused');
      });
    });
  }

  setupClickEffects() {
    // Subtle click feedback
    document.querySelectorAll('.btn, .card').forEach(element => {
      element.addEventListener('click', (e) => {
        if (App.reducedMotion) return;

        this.createRipple(e, element);
      });
    });
  }

  createRipple(event, element) {
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
      background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      transform: scale(0);
      z-index: 1;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    // Animate ripple
    ripple.animate([
      { transform: 'scale(0)', opacity: 1 },
      { transform: 'scale(1)', opacity: 0 }
    ], {
      duration: 600,
      easing: 'ease-out'
    }).onfinish = () => ripple.remove();
  }
}

// ===== FORM ENHANCEMENTS =====
class FormManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupFormValidation();
    this.setupInputEnhancements();
  }

  setupFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
        }
      });
    });
  }

  setupInputEnhancements() {
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      // Floating label effect
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
      });

      input.addEventListener('blur', () => {
        if (!input.value) {
          input.parentElement.classList.remove('focused');
        }
      });

      // Initial state
      if (input.value) {
        input.parentElement.classList.add('focused');
      }
    });
  }

  validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        this.showFieldError(field, 'This field is required');
        isValid = false;
      } else {
        this.clearFieldError(field);
      }
    });

    return isValid;
  }

  showFieldError(field, message) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');

    let errorElement = field.parentElement.querySelector('.error-message');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.setAttribute('role', 'alert');
      field.parentElement.appendChild(errorElement);
    }

    errorElement.textContent = message;
  }

  clearFieldError(field) {
    field.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');

    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.remove();
    }
  }
}

// ===== PERFORMANCE MONITORING =====
class PerformanceManager {
  constructor() {
    this.init();
  }

  init() {
    this.monitorFrameRate();
    this.optimizeImages();
  }

  monitorFrameRate() {
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
        if (fps < 30 && !App.reducedMotion) {
          document.documentElement.classList.add('reduced-animations');
          console.warn('Performance: Reducing animations due to low FPS');
        }
      }

      if (!App.reducedMotion) {
        requestAnimationFrame(checkPerformance);
      }
    };

    if (!App.reducedMotion) {
      requestAnimationFrame(checkPerformance);
    }
  }

  optimizeImages() {
    // Lazy loading for images (if not supported natively)
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
}

// ===== ACCESSIBILITY MANAGER =====
class AccessibilityManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupKeyboardNavigation();
    this.setupAnnouncements();
    this.setupReducedMotion();
  }

  setupKeyboardNavigation() {
    // Tab trap for modals and menus
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.handleTabNavigation(e);
      }
    });
  }

  setupAnnouncements() {
    // Create announcement region for screen readers
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.id = 'announcer';
    document.body.appendChild(announcer);
  }

  setupReducedMotion() {
    // Watch for reduced motion preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    mediaQuery.addEventListener('change', (e) => {
      App.reducedMotion = e.matches;

      if (e.matches) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    });
  }

  announce(message) {
    const announcer = document.getElementById('announcer');
    if (announcer) {
      announcer.textContent = message;
    }
  }

  handleTabNavigation(e) {
    // Handle tab trapping for mobile menu
    const activeMenu = document.querySelector('.nav-links.active');
    if (activeMenu) {
      const focusableElements = activeMenu.querySelectorAll('a, button');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
}

// ===== APPLICATION INITIALIZER =====
class AppInitializer {
  constructor() {
    this.components = new Map();
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }
  }

  initializeComponents() {
    try {
      // Initialize core components
      this.components.set('scrollProgress', new ScrollProgressManager());
      this.components.set('intersection', new IntersectionManager());
      this.components.set('navigation', new NavigationManager());
      this.components.set('interactions', new InteractionManager());
      this.components.set('forms', new FormManager());
      this.components.set('performance', new PerformanceManager());
      this.components.set('accessibility', new AccessibilityManager());

      App.isLoaded = true;

      // Announce to screen readers
      setTimeout(() => {
        const accessibility = this.components.get('accessibility');
        if (accessibility) {
          accessibility.announce('Page loaded successfully');
        }
      }, 1000);

      console.log('🌾 Food Security Jordan - Loaded');

    } catch (error) {
      console.error('Error initializing application:', error);
    }
  }

  getComponent(name) {
    return this.components.get(name);
  }
}

// ===== START APPLICATION =====
const FoodSecurityApp = new AppInitializer();

// Export for use in other scripts
window.FoodSecurityApp = FoodSecurityApp;