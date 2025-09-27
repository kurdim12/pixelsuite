/**
 * Food Security Jordan - Data Management Layer
 * Handles data loading, caching, and API for all site data
 */

class DataManager {
    constructor() {
        this.data = null;
        this.cache = new Map();
        this.isLoaded = false;
        this.loadingPromise = null;
    }

    /**
     * Initialize and load all data
     */
    async init() {
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = this.loadData();
        return this.loadingPromise;
    }

    /**
     * Load data from JSON file with error handling
     */
    async loadData() {
        try {
            const response = await fetch('./assets/data/data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.data = await response.json();
            this.isLoaded = true;
            
            // Cache commonly accessed data
            this.cacheCommonQueries();
            
            console.log('✅ Data loaded successfully');
            return this.data;
        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.data = this.getFallbackData();
            this.isLoaded = true;
            return this.data;
        }
    }

    /**
     * Cache frequently accessed data for performance
     */
    cacheCommonQueries() {
        if (!this.data) return;

        // Cache crops by category
        const cropsByCategory = {};
        this.data.crops.forEach(crop => {
            if (!cropsByCategory[crop.category]) {
                cropsByCategory[crop.category] = [];
            }
            cropsByCategory[crop.category].push(crop);
        });
        this.cache.set('cropsByCategory', cropsByCategory);

        // Cache high-value crops
        const highValueCrops = this.data.crops.filter(crop => crop.economicValue === 'high');
        this.cache.set('highValueCrops', highValueCrops);

        // Cache drought-resistant crops
        const droughtResistant = this.data.crops.filter(crop => 
            crop.waterRequirement === 'low' || crop.traits.includes('drought-resistant')
        );
        this.cache.set('droughtResistantCrops', droughtResistant);
    }

    /**
     * Get all crops data
     */
    getCrops() {
        this.ensureDataLoaded();
        return this.data?.crops || [];
    }

    /**
     * Search crops by name, category, or traits
     */
    searchCrops(query) {
        const cacheKey = `search_${query.toLowerCase()}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        this.ensureDataLoaded();
        const crops = this.data?.crops || [];
        const searchTerm = query.toLowerCase();
        
        const results = crops.filter(crop => 
            crop.name.toLowerCase().includes(searchTerm) ||
            crop.scientificName.toLowerCase().includes(searchTerm) ||
            crop.category.toLowerCase().includes(searchTerm) ||
            crop.traits.some(trait => trait.toLowerCase().includes(searchTerm)) ||
            crop.description.toLowerCase().includes(searchTerm)
        );

        this.cache.set(cacheKey, results);
        return results;
    }

    /**
     * Filter crops by multiple criteria
     */
    filterCrops(filters = {}) {
        this.ensureDataLoaded();
        let crops = this.data?.crops || [];

        // Apply category filter
        if (filters.category && filters.category !== 'all') {
            crops = crops.filter(crop => crop.category === filters.category);
        }

        // Apply water requirement filter
        if (filters.waterRequirement && filters.waterRequirement !== 'all') {
            crops = crops.filter(crop => crop.waterRequirement === filters.waterRequirement);
        }

        // Apply economic value filter
        if (filters.economicValue && filters.economicValue !== 'all') {
            crops = crops.filter(crop => crop.economicValue === filters.economicValue);
        }

        // Apply season filter
        if (filters.season && filters.season !== 'all') {
            crops = crops.filter(crop => crop.seasons.includes(filters.season));
        }

        // Apply traits filter
        if (filters.traits && filters.traits.length > 0) {
            crops = crops.filter(crop => 
                filters.traits.some(trait => crop.traits.includes(trait))
            );
        }

        return crops;
    }

    /**
     * Get crop by ID
     */
    getCropById(id) {
        this.ensureDataLoaded();
        const crops = this.data?.crops || [];
        return crops.find(crop => crop.id === id);
    }

    /**
     * Get crops by category
     */
    getCropsByCategory(category) {
        const cached = this.cache.get('cropsByCategory');
        if (cached && cached[category]) {
            return cached[category];
        }

        this.ensureDataLoaded();
        const crops = this.data?.crops || [];
        return crops.filter(crop => crop.category === category);
    }

    /**
     * Get agriculture statistics
     */
    getAgricultureStats() {
        this.ensureDataLoaded();
        return this.data?.agriculture || {};
    }

    /**
     * Get irrigation data
     */
    getIrrigationData() {
        this.ensureDataLoaded();
        return this.data?.irrigation || {};
    }

    /**
     * Get vertical farming data
     */
    getVerticalFarmingData() {
        this.ensureDataLoaded();
        return this.data?.verticalFarming || {};
    }

    /**
     * Get plant diseases data
     */
    getDiseases() {
        this.ensureDataLoaded();
        return this.data?.diseases || [];
    }

    /**
     * Search diseases by name or affected crops
     */
    searchDiseases(query) {
        this.ensureDataLoaded();
        const diseases = this.data?.diseases || [];
        const searchTerm = query.toLowerCase();
        
        return diseases.filter(disease => 
            disease.name.toLowerCase().includes(searchTerm) ||
            disease.affectedCrops.some(crop => crop.toLowerCase().includes(searchTerm)) ||
            disease.symptoms.some(symptom => symptom.toLowerCase().includes(searchTerm))
        );
    }

    /**
     * Get dashboard metrics
     */
    getDashboardMetrics() {
        this.ensureDataLoaded();
        return this.data?.dashboard || {};
    }

    /**
     * Get unique categories for filters
     */
    getCategories() {
        this.ensureDataLoaded();
        const crops = this.data?.crops || [];
        return [...new Set(crops.map(crop => crop.category))].sort();
    }

    /**
     * Get unique traits for filters
     */
    getTraits() {
        this.ensureDataLoaded();
        const crops = this.data?.crops || [];
        const allTraits = crops.flatMap(crop => crop.traits);
        return [...new Set(allTraits)].sort();
    }

    /**
     * Get statistics for charts and counters
     */
    getStats() {
        this.ensureDataLoaded();
        const data = this.data;
        
        return {
            totalCrops: data?.crops?.length || 0,
            categories: this.getCategories().length,
            diseases: data?.diseases?.length || 0,
            irrigationProjects: data?.irrigation?.projects?.length || 0,
            verticalFarms: data?.verticalFarming?.facilities?.length || 0,
            waterSaved: data?.irrigation?.waterSavings || 0,
            yieldIncrease: data?.agriculture?.yieldIncrease || 0,
            foodSecurity: data?.dashboard?.foodSecurityIndex || 0
        };
    }

    /**
     * Ensure data is loaded before access
     */
    ensureDataLoaded() {
        if (!this.isLoaded) {
            console.warn('⚠️ Data not loaded yet. Call init() first.');
        }
    }

    /**
     * Fallback data in case of loading errors
     */
    getFallbackData() {
        return {
            crops: [
                {
                    id: 1,
                    name: "Olive",
                    scientificName: "Olea europaea",
                    category: "fruits",
                    waterRequirement: "low",
                    economicValue: "high",
                    seasons: ["spring", "summer"],
                    traits: ["drought-resistant", "traditional"],
                    description: "Traditional Jordanian crop with high economic value"
                },
                {
                    id: 2,
                    name: "Tomato",
                    scientificName: "Solanum lycopersicum",
                    category: "vegetables",
                    waterRequirement: "medium",
                    economicValue: "medium",
                    seasons: ["spring", "summer", "fall"],
                    traits: ["high-yield", "greenhouse-suitable"],
                    description: "Popular vegetable crop suitable for various growing conditions"
                }
            ],
            agriculture: {
                totalLand: 89000,
                cultivatedLand: 3500,
                yieldIncrease: 15
            },
            irrigation: {
                projects: [],
                waterSavings: 25
            },
            verticalFarming: {
                facilities: []
            },
            diseases: [],
            dashboard: {
                foodSecurityIndex: 65
            }
        };
    }

    /**
     * Clear cache (useful for memory management)
     */
    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache cleared');
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Create global instance
const db = new DataManager();

// Initialize data loading when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing data layer...');
    await db.init();
    
    // Dispatch custom event when data is ready
    const dataReadyEvent = new CustomEvent('dataReady', {
        detail: { stats: db.getStats() }
    });
    document.dispatchEvent(dataReadyEvent);
});

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataManager, db };
}