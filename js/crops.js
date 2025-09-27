/**
 * Food Security Jordan - Crops Page Functionality
 * Handles crop search, filtering, display, and interactions
 */

class CropsPage {
    constructor() {
        this.currentCrops = [];
        this.allCrops = [];
        this.filteredCrops = [];
        this.displayedCrops = [];
        this.itemsPerPage = 9;
        this.currentPage = 1;
        this.activeFilters = {
            search: '',
            category: 'all',
            waterRequirement: 'all',
            economicValue: 'all',
            season: 'all',
            traits: []
        };
        this.sortBy = 'name';

        this.initializeEventListeners();
        this.loadCropsData();
    }

    // Load crops data directly
    async loadCropsData() {
        try {
            const response = await fetch('assets/data/crops.json');
            if (response.ok) {
                this.allCrops = await response.json();
                this.filteredCrops = [...this.allCrops];
                this.currentCrops = [...this.allCrops];
                this.setupCSVExport();
            }
        } catch (error) {
            console.error('Failed to load crops data:', error);
        }
    }

    // Setup CSV export functionality
    setupCSVExport() {
        const exportBtn = document.getElementById('export-csv');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToCSV());
        }

        // Also try alternative button selectors
        const exportButtons = document.querySelectorAll('[data-action="export"], .export-btn, .btn-export');
        exportButtons.forEach(btn => {
            btn.addEventListener('click', () => this.exportToCSV());
        });
    }

    // Export to CSV functionality
    exportToCSV() {
        if (!this.filteredCrops || this.filteredCrops.length === 0) {
            this.showNotification('No crops to export', 'warning');
            return;
        }

        const headers = [
            'Name', 'Scientific Name', 'Category', 'Season', 'Water Needs',
            'Export Potential', 'Cultivation Method', 'Yield Per Hectare',
            'Economic Value', 'Regions', 'Sustainability Score'
        ];

        const csvData = [
            headers.join(','),
            ...this.filteredCrops.map(crop => [
                `"${crop.name || ''}"`,
                `"${crop.scientificName || ''}"`,
                `"${crop.category || ''}"`,
                `"${crop.season || ''}"`,
                `"${crop.waterNeeds || ''}"`,
                `"${crop.exportPotential || ''}"`,
                `"${crop.cultivationMethod || ''}"`,
                `"${crop.yieldPerHectare || ''}"`,
                `"${crop.economicValue || ''}"`,
                `"${(crop.regions || []).join('; ')}"`,
                crop.sustainabilityScore || 0
            ].join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `jordan-crops-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('CSV exported successfully!', 'success');
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#38A169' : type === 'warning' ? '#D69E2E' : '#3182CE'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Wait for DOM and data to be ready
        document.addEventListener('DOMContentLoaded', () => {
            this.initializePage();
        });

        document.addEventListener('dataReady', (event) => {
            this.handleDataReady(event.detail);
        });
    }

    /**
     * Initialize the page when DOM is ready
     */
    async initializePage() {
        try {
            // Show loading state
            this.showLoadingState();

            // Wait for data if not ready
            if (!db.isLoaded) {
                await db.init();
            }

            // Load and display crops
            await this.loadCropsData();
            this.setupUIControls();
            this.hideLoadingState();
            
            console.log('✅ Crops page initialized');
        } catch (error) {
            console.error('❌ Error initializing crops page:', error);
            this.showErrorState();
        }
    }

    /**
     * Handle data ready event
     */
    handleDataReady(data) {
        if (data.stats) {
            this.updateHeroStats(data.stats);
        }
    }

    /**
     * Load crops data and initialize display
     */
    async loadCropsData() {
        this.allCrops = db.getCrops();
        this.filteredCrops = [...this.allCrops];
        this.currentCrops = [...this.allCrops];
        
        this.populateFilterOptions();
        this.displayCrops();
        this.updateResultsCount();
        this.loadFeaturedCrops();
        this.loadCategoriesOverview();
    }

    /**
     * Setup UI controls and event listeners
     */
    setupUIControls() {
        // Search input
        const searchInput = document.getElementById('search-input');
        const clearSearch = document.getElementById('clear-search');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
                this.toggleClearButton(e.target.value);
            });
        }

        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                this.clearSearch();
            });
        }

        // Filter controls
        const categoryFilter = document.getElementById('category-filter');
        const waterFilter = document.getElementById('water-filter');
        const valueFilter = document.getElementById('value-filter');
        const seasonFilter = document.getElementById('season-filter');
        const sortSelect = document.getElementById('sort-select');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.activeFilters.category = e.target.value;
                this.applyFilters();
            });
        }

        if (waterFilter) {
            waterFilter.addEventListener('change', (e) => {
                this.activeFilters.waterRequirement = e.target.value;
                this.applyFilters();
            });
        }

        if (valueFilter) {
            valueFilter.addEventListener('change', (e) => {
                this.activeFilters.economicValue = e.target.value;
                this.applyFilters();
            });
        }

        if (seasonFilter) {
            seasonFilter.addEventListener('change', (e) => {
                this.activeFilters.season = e.target.value;
                this.applyFilters();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applySorting();
                this.displayCrops();
            });
        }

        // Quick filter tags
        const filterTags = document.querySelectorAll('.filter-tag');
        filterTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                this.toggleTraitFilter(e.target.dataset.filter);
                e.target.classList.toggle('active');
            });
        });

        // Reset filters
        const resetFilters = document.getElementById('reset-filters');
        const clearAllFilters = document.getElementById('clear-all-filters');
        
        if (resetFilters) {
            resetFilters.addEventListener('click', () => this.resetAllFilters());
        }

        if (clearAllFilters) {
            clearAllFilters.addEventListener('click', () => this.resetAllFilters());
        }

        // Load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreCrops());
        }

        // Modal controls
        const modal = document.getElementById('crop-modal');
        const modalClose = document.getElementById('modal-close');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    /**
     * Populate filter dropdown options
     */
    populateFilterOptions() {
        const categories = db.getCategories();
        const categoryFilter = document.getElementById('category-filter');
        
        if (categoryFilter && categories.length > 0) {
            // Clear existing options except "All Categories"
            categoryFilter.innerHTML = '<option value="all">All Categories</option>';
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = this.capitalizeFirst(category);
                categoryFilter.appendChild(option);
            });
        }
    }

    /**
     * Handle search input
     */
    handleSearch(query) {
        this.activeFilters.search = query.trim().toLowerCase();
        this.applyFilters();
    }

    /**
     * Toggle clear search button visibility
     */
    toggleClearButton(value) {
        const clearButton = document.getElementById('clear-search');
        if (clearButton) {
            clearButton.style.display = value ? 'flex' : 'none';
        }
    }

    /**
     * Clear search input
     */
    clearSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
            this.activeFilters.search = '';
            this.toggleClearButton('');
            this.applyFilters();
        }
    }

    /**
     * Toggle trait filter
     */
    toggleTraitFilter(trait) {
        const index = this.activeFilters.traits.indexOf(trait);
        if (index > -1) {
            this.activeFilters.traits.splice(index, 1);
        } else {
            this.activeFilters.traits.push(trait);
        }
        this.applyFilters();
    }

    /**
     * Apply all active filters
     */
    applyFilters() {
        let filtered = [...this.allCrops];

        // Apply search filter
        if (this.activeFilters.search) {
            filtered = filtered.filter(crop => 
                crop.name.toLowerCase().includes(this.activeFilters.search) ||
                crop.scientificName.toLowerCase().includes(this.activeFilters.search) ||
                crop.category.toLowerCase().includes(this.activeFilters.search) ||
                crop.description.toLowerCase().includes(this.activeFilters.search) ||
                crop.traits.some(trait => trait.toLowerCase().includes(this.activeFilters.search))
            );
        }

        // Apply category filter
        if (this.activeFilters.category !== 'all') {
            filtered = filtered.filter(crop => crop.category === this.activeFilters.category);
        }

        // Apply water requirement filter
        if (this.activeFilters.waterRequirement !== 'all') {
            filtered = filtered.filter(crop => crop.waterRequirement === this.activeFilters.waterRequirement);
        }

        // Apply economic value filter
        if (this.activeFilters.economicValue !== 'all') {
            filtered = filtered.filter(crop => crop.economicValue === this.activeFilters.economicValue);
        }

        // Apply season filter
        if (this.activeFilters.season !== 'all') {
            filtered = filtered.filter(crop => crop.seasons && crop.seasons.includes(this.activeFilters.season));
        }

        // Apply traits filter
        if (this.activeFilters.traits.length > 0) {
            filtered = filtered.filter(crop => 
                this.activeFilters.traits.some(trait => crop.traits.includes(trait))
            );
        }

        this.filteredCrops = filtered;
        this.currentPage = 1;
        this.applySorting();
        this.displayCrops();
        this.updateResultsCount();
    }

    /**
     * Apply sorting to filtered crops
     */
    applySorting() {
        this.filteredCrops.sort((a, b) => {
            switch (this.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'economic-value':
                    const valueOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                    return valueOrder[b.economicValue] - valueOrder[a.economicValue];
                case 'water-requirement':
                    const waterOrder = { 'low': 1, 'medium': 2, 'high': 3 };
                    return waterOrder[a.waterRequirement] - waterOrder[b.waterRequirement];
                case 'category':
                    return a.category.localeCompare(b.category);
                default:
                    return 0;
            }
        });
    }

    /**
     * Display crops in grid
     */
    displayCrops() {
        const cropsGrid = document.getElementById('crops-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (!cropsGrid) return;

        // Calculate crops to display
        const startIndex = 0;
        const endIndex = this.currentPage * this.itemsPerPage;
        this.displayedCrops = this.filteredCrops.slice(startIndex, endIndex);

        if (this.filteredCrops.length === 0) {
            cropsGrid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            this.hideLoadMoreButton();
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        cropsGrid.style.display = 'grid';

        // Generate crop cards HTML
        cropsGrid.innerHTML = this.displayedCrops.map(crop => this.createCropCard(crop)).join('');

        // Add click listeners to crop cards
        this.addCropCardListeners();

        // Show/hide load more button
        this.toggleLoadMoreButton();
    }

    /**
     * Create HTML for a crop card
     */
    createCropCard(crop) {
        const waterIcon = this.getWaterIcon(crop.waterRequirement);
        const valueIcon = this.getValueIcon(crop.economicValue);
        
        return `
            <div class="crop-card" data-crop-id="${crop.id}">
                <div class="crop-card-header">
                    <h3 class="crop-name">${crop.name}</h3>
                    <p class="crop-arabic">${crop.arabicName || ''}</p>
                    <p class="crop-scientific">${crop.scientificName}</p>
                </div>
                
                <div class="crop-card-body">
                    <p class="crop-description">${crop.description}</p>
                    
                    <div class="crop-details">
                        <div class="detail-item">
                            <span class="detail-label">Category:</span>
                            <span class="detail-value">${this.capitalizeFirst(crop.category)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Water Need:</span>
                            <span class="detail-value">
                                ${waterIcon} ${this.capitalizeFirst(crop.waterRequirement)}
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Economic Value:</span>
                            <span class="detail-value">
                                ${valueIcon} ${this.capitalizeFirst(crop.economicValue)}
                            </span>
                        </div>
                        ${crop.seasons ? `
                        <div class="detail-item">
                            <span class="detail-label">Seasons:</span>
                            <span class="detail-value">${crop.seasons.map(s => this.capitalizeFirst(s)).join(', ')}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="crop-traits">
                        ${crop.traits.map(trait => `
                            <span class="trait-tag">${trait.replace('-', ' ')}</span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="crop-card-footer">
                    <button class="btn-outline view-details" data-crop-id="${crop.id}">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Add click listeners to crop cards
     */
    addCropCardListeners() {
        const viewDetailsBtns = document.querySelectorAll('.view-details');
        const cropCards = document.querySelectorAll('.crop-card');

        viewDetailsBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cropId = parseInt(btn.dataset.cropId);
                this.showCropDetails(cropId);
            });
        });

        cropCards.forEach(card => {
            card.addEventListener('click', () => {
                const cropId = parseInt(card.dataset.cropId);
                this.showCropDetails(cropId);
            });
        });
    }

    /**
     * Show crop details in modal
     */
    showCropDetails(cropId) {
        const crop = this.allCrops.find(c => c.id === cropId);
        if (!crop) return;

        const modal = document.getElementById('crop-modal');
        const modalName = document.getElementById('modal-crop-name');
        const modalBody = document.getElementById('modal-body');

        if (!modal || !modalName || !modalBody) return;

        modalName.textContent = crop.name;
        modalBody.innerHTML = this.createCropDetailsHTML(crop);

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Create detailed HTML for crop modal
     */
    createCropDetailsHTML(crop) {
        return `
            <div class="crop-details-modal">
                <div class="crop-header-modal">
                    <div class="crop-names">
                        <h3>${crop.name}</h3>
                        ${crop.arabicName ? `<p class="arabic-name">${crop.arabicName}</p>` : ''}
                        <p class="scientific-name">${crop.scientificName}</p>
                    </div>
                    <div class="crop-category-badge">
                        ${this.capitalizeFirst(crop.category)}
                    </div>
                </div>

                <div class="crop-description-modal">
                    <p>${crop.description}</p>
                </div>

                <div class="crop-info-grid">
                    <div class="info-section">
                        <h4>Growing Requirements</h4>
                        <div class="info-items">
                            <div class="info-item">
                                <span class="info-label">Water Requirement:</span>
                                <span class="info-value">
                                    ${this.getWaterIcon(crop.waterRequirement)} ${this.capitalizeFirst(crop.waterRequirement)}
                                </span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Growing Seasons:</span>
                                <span class="info-value">
                                    ${crop.seasons ? crop.seasons.map(s => this.capitalizeFirst(s)).join(', ') : 'Year-round'}
                                </span>
                            </div>
                            ${crop.soilType ? `
                            <div class="info-item">
                                <span class="info-label">Soil Type:</span>
                                <span class="info-value">${crop.soilType.join(', ')}</span>
                            </div>
                            ` : ''}
                            ${crop.regions ? `
                            <div class="info-item">
                                <span class="info-label">Best Regions:</span>
                                <span class="info-value">${crop.regions.join(', ')}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="info-section">
                        <h4>Economic Information</h4>
                        <div class="info-items">
                            <div class="info-item">
                                <span class="info-label">Economic Value:</span>
                                <span class="info-value">
                                    ${this.getValueIcon(crop.economicValue)} ${this.capitalizeFirst(crop.economicValue)}
                                </span>
                            </div>
                            ${crop.averageYield ? `
                            <div class="info-item">
                                <span class="info-label">Average Yield:</span>
                                <span class="info-value">${crop.averageYield} tons/hectare</span>
                            </div>
                            ` : ''}
                            ${crop.pricePerKg ? `
                            <div class="info-item">
                                <span class="info-label">Market Price:</span>
                                <span class="info-value">${crop.pricePerKg} JOD/kg</span>
                            </div>
                            ` : ''}
                            ${crop.exportValue ? `
                            <div class="info-item">
                                <span class="info-label">Export Value:</span>
                                <span class="info-value">${(crop.exportValue / 1000000).toFixed(1)}M JOD</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    ${crop.cultivationArea || crop.spacing || crop.harvestTime ? `
                    <div class="info-section">
                        <h4>Cultivation Details</h4>
                        <div class="info-items">
                            ${crop.cultivationArea ? `
                            <div class="info-item">
                                <span class="info-label">Cultivation Area:</span>
                                <span class="info-value">${crop.cultivationArea.toLocaleString()} hectares</span>
                            </div>
                            ` : ''}
                            ${crop.spacing ? `
                            <div class="info-item">
                                <span class="info-label">Plant Spacing:</span>
                                <span class="info-value">${crop.spacing}</span>
                            </div>
                            ` : ''}
                            ${crop.harvestTime ? `
                            <div class="info-item">
                                <span class="info-label">Harvest Time:</span>
                                <span class="info-value">${crop.harvestTime}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    ` : ''}
                </div>

                <div class="crop-traits-modal">
                    <h4>Crop Characteristics</h4>
                    <div class="traits-grid">
                        ${crop.traits.map(trait => `
                            <span class="trait-tag-large">${trait.replace('-', ' ')}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Close crop details modal
     */
    closeModal() {
        const modal = document.getElementById('crop-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Load more crops (pagination)
     */
    loadMoreCrops() {
        this.currentPage++;
        this.displayCrops();
    }

    /**
     * Toggle load more button visibility
     */
    toggleLoadMoreButton() {
        const loadMoreSection = document.getElementById('load-more-section');
        const hasMoreCrops = this.displayedCrops.length < this.filteredCrops.length;
        
        if (loadMoreSection) {
            loadMoreSection.style.display = hasMoreCrops ? 'block' : 'none';
        }
    }

    /**
     * Hide load more button
     */
    hideLoadMoreButton() {
        const loadMoreSection = document.getElementById('load-more-section');
        if (loadMoreSection) {
            loadMoreSection.style.display = 'none';
        }
    }

    /**
     * Reset all filters
     */
    resetAllFilters() {
        // Reset filter values
        this.activeFilters = {
            search: '',
            category: 'all',
            waterRequirement: 'all',
            economicValue: 'all',
            season: 'all',
            traits: []
        };

        // Reset UI controls
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        const waterFilter = document.getElementById('water-filter');
        const valueFilter = document.getElementById('value-filter');
        const seasonFilter = document.getElementById('season-filter');
        const sortSelect = document.getElementById('sort-select');

        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        if (waterFilter) waterFilter.value = 'all';
        if (valueFilter) valueFilter.value = 'all';
        if (seasonFilter) seasonFilter.value = 'all';
        if (sortSelect) sortSelect.value = 'name';

        // Reset trait filter tags
        const filterTags = document.querySelectorAll('.filter-tag');
        filterTags.forEach(tag => tag.classList.remove('active'));

        // Reset sort
        this.sortBy = 'name';

        // Hide clear search button
        this.toggleClearButton('');

        // Apply filters (which will show all crops)
        this.applyFilters();
    }

    /**
     * Update results count display
     */
    updateResultsCount() {
        const cropCount = document.getElementById('crop-count');
        if (cropCount) {
            cropCount.textContent = this.filteredCrops.length;
        }
    }

    /**
     * Update hero stats
     */
    updateHeroStats(stats) {
        const totalCropsEl = document.getElementById('total-crops-hero');
        const totalCategoriesEl = document.getElementById('total-categories-hero');
        const exportValueEl = document.getElementById('export-value-hero');

        if (totalCropsEl) totalCropsEl.textContent = stats.totalCrops || 12;
        if (totalCategoriesEl) totalCategoriesEl.textContent = stats.categories || 5;
        if (exportValueEl) exportValueEl.textContent = '128M'; // Static for now
    }

    /**
     * Load featured crops section
     */
    loadFeaturedCrops() {
        const featuredGrid = document.getElementById('featured-crops-grid');
        if (!featuredGrid) return;

        // Get high-value and traditional crops
        const featuredCrops = this.allCrops.filter(crop => 
            crop.economicValue === 'high' || crop.traits.includes('traditional')
        ).slice(0, 3);

        featuredGrid.innerHTML = featuredCrops.map(crop => `
            <div class="featured-crop-card" data-crop-id="${crop.id}">
                <div class="featured-crop-icon">
                    ${this.getCropEmoji(crop.name)}
                </div>
                <h3>${crop.name}</h3>
                <p class="featured-crop-arabic">${crop.arabicName || ''}</p>
                <p class="featured-crop-desc">${crop.description}</p>
                <div class="featured-crop-stats">
                    <span class="stat">
                        ${this.getWaterIcon(crop.waterRequirement)} ${crop.waterRequirement} water
                    </span>
                    <span class="stat">
                        ${this.getValueIcon(crop.economicValue)} ${crop.economicValue} value
                    </span>
                </div>
                <button class="btn-primary view-crop" data-crop-id="${crop.id}">
                    Learn More
                </button>
            </div>
        `).join('');

        // Add click listeners
        const viewCropBtns = featuredGrid.querySelectorAll('.view-crop');
        const featuredCards = featuredGrid.querySelectorAll('.featured-crop-card');

        viewCropBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cropId = parseInt(btn.dataset.cropId);
                this.showCropDetails(cropId);
            });
        });

        featuredCards.forEach(card => {
            card.addEventListener('click', () => {
                const cropId = parseInt(card.dataset.cropId);
                this.showCropDetails(cropId);
            });
        });
    }

    /**
     * Load categories overview section
     */
    loadCategoriesOverview() {
        const categoriesGrid = document.getElementById('categories-grid');
        if (!categoriesGrid) return;

        const categories = db.getCategories();
        const categoryData = categories.map(category => {
            const crops = this.allCrops.filter(crop => crop.category === category);
            return {
                name: category,
                count: crops.length,
                crops: crops.slice(0, 3), // Show first 3 crops
                icon: this.getCategoryIcon(category)
            };
        });

        categoriesGrid.innerHTML = categoryData.map(category => `
            <div class="category-card" data-category="${category.name}">
                <div class="category-header">
                    <div class="category-icon">${category.icon}</div>
                    <h3>${this.capitalizeFirst(category.name)}</h3>
                    <span class="category-count">${category.count} crops</span>
                </div>
                <div class="category-crops">
                    ${category.crops.map(crop => `
                        <span class="category-crop-name">${crop.name}</span>
                    `).join('')}
                    ${category.count > 3 ? `<span class="more-crops">+${category.count - 3} more</span>` : ''}
                </div>
                <button class="btn-outline view-category" data-category="${category.name}">
                    View ${this.capitalizeFirst(category.name)}
                </button>
            </div>
        `).join('');

        // Add click listeners
        const viewCategoryBtns = categoriesGrid.querySelectorAll('.view-category');
        const categoryCards = categoriesGrid.querySelectorAll('.category-card');

        viewCategoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.filterByCategory(btn.dataset.category);
            });
        });

        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                this.filterByCategory(card.dataset.category);
            });
        });
    }

    /**
     * Filter crops by category and scroll to results
     */
    filterByCategory(category) {
        // Reset other filters
        this.resetAllFilters();
        
        // Set category filter
        this.activeFilters.category = category;
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.value = category;
        }

        // Apply filter and scroll to results
        this.applyFilters();
        
        // Scroll to crops grid
        const cropsSection = document.querySelector('.crops-grid-section');
        if (cropsSection) {
            cropsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        const loadingState = document.getElementById('loading-state');
        const cropsGrid = document.getElementById('crops-grid');
        const emptyState = document.getElementById('empty-state');

        if (loadingState) loadingState.style.display = 'block';
        if (cropsGrid) cropsGrid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        const loadingState = document.getElementById('loading-state');
        if (loadingState) loadingState.style.display = 'none';
    }

    /**
     * Show error state
     */
    showErrorState() {
        const errorState = document.getElementById('error-state');
        const loadingState = document.getElementById('loading-state');
        const cropsGrid = document.getElementById('crops-grid');

        if (errorState) errorState.style.display = 'block';
        if (loadingState) loadingState.style.display = 'none';
        if (cropsGrid) cropsGrid.style.display = 'none';
    }

    /**
     * Utility functions
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getWaterIcon(waterLevel) {
        const icons = {
            'low': '💧',
            'medium': '💧💧',
            'high': '💧💧💧'
        };
        return icons[waterLevel] || '💧';
    }

    getValueIcon(value) {
        const icons = {
            'low': '💰',
            'medium': '💰💰',
            'high': '💰💰💰'
        };
        return icons[value] || '💰';
    }

    getCropEmoji(cropName) {
        const emojis = {
            'Olive': '🫒',
            'Tomato': '🍅',
            'Wheat': '🌾',
            'Barley': '🌾',
            'Cucumber': '🥒',
            'Eggplant': '🍆',
            'Fig': '🍈',
            'Grape': '🍇',
            'Onion': '🧅',
            'Potato': '🥔',
            'Lemon': '🍋',
            'Almond': '🌰'
        };
        return emojis[cropName] || '🌱';
    }

    getCategoryIcon(category) {
        const icons = {
            'fruits': '🍎',
            'vegetables': '🥬',
            'cereals': '🌾',
            'nuts': '🌰',
            'herbs': '🌿',
            'legumes': '🫘'
        };
        return icons[category] || '🌱';
    }
}

// Initialize crops page when script loads
const cropsPage = new CropsPage();