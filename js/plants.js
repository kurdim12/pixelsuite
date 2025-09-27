/**
 * Plants Page - Interactive Plant Database
 * Handles search, filtering, modal system, and data visualization
 */

class PlantsManager {
  constructor() {
    this.plants = [];
    this.filteredPlants = [];
    this.currentFilter = '';
    this.currentCategory = '';
    this.modal = null;
    this.chart = null;
    this.init();
  }

  async init() {
    try {
      await this.loadPlants();
      this.setupEventListeners();
      this.setupModal();
      this.renderPlants();
      this.createConservationChart();
      this.animateCounters();
    } catch (error) {
      console.error('Failed to initialize plants manager:', error);
      this.showError('Failed to load plant data');
    }
  }

  async loadPlants() {
    try {
      const response = await fetch('assets/data/plants.json');
      if (!response.ok) throw new Error('Failed to fetch plants data');
      this.plants = await response.json();
      this.filteredPlants = [...this.plants];
      this.updateResultsCount();
    } catch (error) {
      console.error('Error loading plants:', error);
      // Fallback data for demo
      this.plants = this.getFallbackData();
      this.filteredPlants = [...this.plants];
    }
  }

  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('plant-search');
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce((e) => {
        this.currentFilter = e.target.value.toLowerCase();
        this.filterPlants();
      }, 300));
    }

    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.currentCategory = e.target.value;
        this.filterPlants();
      });
    }

    // Clear search function
    window.clearSearch = () => {
      if (searchInput) searchInput.value = '';
      if (categoryFilter) categoryFilter.value = '';
      this.currentFilter = '';
      this.currentCategory = '';
      this.filterPlants();
    };
  }

  setupModal() {
    this.modal = document.getElementById('plant-modal');
    if (!this.modal) return;

    // Close modal events
    const closeBtn = this.modal.querySelector('.modal-close');
    const overlay = this.modal.querySelector('.modal-overlay');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    if (overlay) {
      overlay.addEventListener('click', () => this.closeModal());
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.getAttribute('aria-hidden') === 'false') {
        this.closeModal();
      }
    });
  }

  filterPlants() {
    this.filteredPlants = this.plants.filter(plant => {
      const matchesSearch = !this.currentFilter ||
        plant.name.toLowerCase().includes(this.currentFilter) ||
        plant.scientificName.toLowerCase().includes(this.currentFilter) ||
        plant.family.toLowerCase().includes(this.currentFilter) ||
        plant.description.toLowerCase().includes(this.currentFilter) ||
        plant.tags?.some(tag => tag.toLowerCase().includes(this.currentFilter));

      const matchesCategory = !this.currentCategory || plant.category === this.currentCategory;

      return matchesSearch && matchesCategory;
    });

    this.renderPlants();
    this.updateResultsCount();
  }

  renderPlants() {
    const grid = document.getElementById('plants-grid');
    const noResults = document.getElementById('no-results');

    if (!grid) return;

    if (this.filteredPlants.length === 0) {
      grid.innerHTML = '';
      if (noResults) noResults.style.display = 'block';
      return;
    }

    if (noResults) noResults.style.display = 'none';

    grid.innerHTML = this.filteredPlants.map(plant => `
      <div class="plant-card glass-card animate-scale-in"
           role="gridcell"
           data-plant-id="${plant.id}"
           tabindex="0"
           aria-label="Plant: ${plant.name}">
        <div class="plant-card-header">
          <div class="plant-image">
            <img src="${plant.image || 'assets/img/plants/placeholder.jpg'}"
                 alt="${plant.name}"
                 loading="lazy"
                 onerror="this.src='assets/img/plants/placeholder.jpg'">
          </div>
          <div class="plant-status ${plant.status}" title="Status: ${plant.status}">
            ${this.getStatusIcon(plant.status)}
          </div>
        </div>

        <div class="plant-card-body">
          <h3 class="plant-name">${plant.name}</h3>
          <p class="plant-scientific">${plant.scientificName}</p>
          <p class="plant-family">${plant.family}</p>

          <div class="plant-meta">
            <span class="plant-category ${plant.category}">${this.formatCategory(plant.category)}</span>
            <span class="plant-conservation">${plant.conservationStatus}</span>
          </div>

          <p class="plant-description-preview">
            ${this.truncateText(plant.description, 100)}
          </p>

          <div class="plant-tags">
            ${plant.tags?.slice(0, 3).map(tag => `
              <span class="plant-tag">${tag}</span>
            `).join('') || ''}
          </div>
        </div>

        <div class="plant-card-footer">
          <button class="btn btn-outline btn-small view-details"
                  data-plant-id="${plant.id}"
                  aria-label="View details for ${plant.name}">
            <span class="btn-icon">👁️</span>
            View Details
          </button>
        </div>
      </div>
    `).join('');

    // Add click events to cards and buttons
    grid.querySelectorAll('.plant-card').forEach(card => {
      const plantId = parseInt(card.dataset.plantId);

      card.addEventListener('click', () => this.openModal(plantId));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openModal(plantId);
        }
      });
    });

    grid.querySelectorAll('.view-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const plantId = parseInt(btn.dataset.plantId);
        this.openModal(plantId);
      });
    });
  }

  openModal(plantId) {
    const plant = this.plants.find(p => p.id === plantId);
    if (!plant || !this.modal) return;

    // Populate modal content
    document.getElementById('modal-title').textContent = plant.name;
    document.getElementById('modal-image').src = plant.image || 'assets/img/plants/placeholder.jpg';
    document.getElementById('modal-image').alt = plant.name;
    document.getElementById('modal-category').textContent = this.formatCategory(plant.category);
    document.getElementById('modal-category').className = `plant-category ${plant.category}`;
    document.getElementById('modal-status').textContent = plant.status;
    document.getElementById('modal-status').className = `plant-status ${plant.status}`;
    document.getElementById('modal-description').textContent = plant.description;
    document.getElementById('modal-scientific').textContent = plant.scientificName;
    document.getElementById('modal-family').textContent = plant.family;
    document.getElementById('modal-habitat').textContent = plant.habitat;
    document.getElementById('modal-uses').textContent = Array.isArray(plant.uses) ? plant.uses.join(', ') : plant.uses;

    // Show modal
    this.modal.setAttribute('aria-hidden', 'false');
    this.modal.style.display = 'flex';

    // Focus management
    const closeBtn = this.modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    if (!this.modal) return;

    this.modal.setAttribute('aria-hidden', 'true');
    this.modal.style.display = 'none';

    // Restore body scroll
    document.body.style.overflow = '';
  }

  updateResultsCount() {
    const countElement = document.getElementById('results-count');
    if (countElement) {
      const count = this.filteredPlants.length;
      countElement.textContent = `${count} plant${count !== 1 ? 's' : ''} found`;
    }
  }

  createConservationChart() {
    const canvas = document.getElementById('conservationChart');
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');

    // Calculate conservation status distribution
    const statusCounts = this.plants.reduce((acc, plant) => {
      const status = plant.conservationStatus || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);
    const colors = labels.map(label => {
      switch (label) {
        case 'Endangered': return '#E53E3E';
        case 'Vulnerable': return '#D69E2E';
        case 'Near Threatened': return '#F6E05E';
        case 'Least Concern': return '#38A169';
        default: return '#718096';
      }
    });

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              color: 'var(--text)'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} species (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');

    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
  }

  animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current);
    }, 16);
  }

  // Utility functions
  getStatusIcon(status) {
    const icons = {
      stable: '✅',
      protected: '🛡️',
      endangered: '⚠️',
      vulnerable: '🔶',
      abundant: '🌿',
      common: '📈',
      naturalized: '🌱'
    };
    return icons[status] || '📊';
  }

  formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  showError(message) {
    const grid = document.getElementById('plants-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="error-message glass-card">
          <div class="error-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>${message}</p>
          <button class="btn btn-primary" onclick="location.reload()">Retry</button>
        </div>
      `;
    }
  }

  getFallbackData() {
    return [
      {
        id: 1,
        name: "Desert Sage",
        scientificName: "Artemisia herba-alba",
        family: "Asteraceae",
        category: "native",
        status: "stable",
        habitat: "Desert steppes",
        description: "A hardy desert plant adapted to arid conditions.",
        uses: ["Traditional medicine", "Aromatherapy"],
        conservationStatus: "Least Concern",
        tags: ["drought-resistant", "medicinal"]
      }
    ];
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.plantsManager = new PlantsManager();
  });
} else {
  window.plantsManager = new PlantsManager();
}

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlantsManager;
}