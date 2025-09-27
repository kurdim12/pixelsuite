/**
 * Jordan Map - Interactive Leaflet Map
 * Displays Jordan's agricultural regions with productivity data
 */

class JordanMap {
  constructor() {
    this.map = null;
    this.geoJsonLayer = null;
    this.mapContainer = 'jordan-map';
    this.init();
  }

  async init() {
    // Wait for page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createMap());
    } else {
      this.createMap();
    }
  }

  async createMap() {
    const mapElement = document.getElementById(this.mapContainer);
    if (!mapElement || !window.L) return;

    try {
      // Initialize map centered on Jordan
      this.map = L.map(this.mapContainer, {
        center: [31.5, 36.4],
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: false,
        doubleClickZoom: true,
        touchZoom: true,
        dragging: true,
        attributionControl: true
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 10,
        minZoom: 6
      }).addTo(this.map);

      // Load and display GeoJSON data
      await this.loadGeoJsonData();

      // Add map controls
      this.addMapControls();

      // Handle responsive behavior
      this.handleResponsive();

    } catch (error) {
      console.error('Failed to initialize map:', error);
      this.showMapError();
    }
  }

  async loadGeoJsonData() {
    try {
      const response = await fetch('assets/data/geo/jordan-regions.geojson');
      if (!response.ok) throw new Error('Failed to load GeoJSON data');

      const geoData = await response.json();

      // Add GeoJSON layer with styling
      this.geoJsonLayer = L.geoJSON(geoData, {
        style: (feature) => this.getFeatureStyle(feature),
        onEachFeature: (feature, layer) => this.bindFeaturePopup(feature, layer)
      }).addTo(this.map);

      // Fit map to bounds
      this.map.fitBounds(this.geoJsonLayer.getBounds(), {
        padding: [20, 20]
      });

    } catch (error) {
      console.error('Failed to load GeoJSON data:', error);
      // Use fallback data
      this.loadFallbackData();
    }
  }

  getFeatureStyle(feature) {
    const productivity = feature.properties.productivity_index || 0;
    let color, fillColor;

    // Color based on productivity index
    if (productivity >= 0.8) {
      color = '#2F855A';
      fillColor = '#38A169';
    } else if (productivity >= 0.6) {
      color = '#B7791F';
      fillColor = '#D69E2E';
    } else {
      color = '#C53030';
      fillColor = '#E53E3E';
    }

    return {
      fillColor: fillColor,
      weight: 2,
      opacity: 1,
      color: color,
      dashArray: '',
      fillOpacity: 0.7
    };
  }

  bindFeaturePopup(feature, layer) {
    const props = feature.properties;

    // Create popup content
    const popupContent = `
      <div class="map-popup">
        <h3 class="popup-title">${props.name}</h3>
        <div class="popup-subtitle">${props.name_ar}</div>

        <div class="popup-stats">
          <div class="popup-stat">
            <span class="stat-label">Population:</span>
            <span class="stat-value">${this.formatNumber(props.population)}</span>
          </div>

          <div class="popup-stat">
            <span class="stat-label">Agricultural Area:</span>
            <span class="stat-value">${props.agricultural_area} km²</span>
          </div>

          <div class="popup-stat">
            <span class="stat-label">Productivity Index:</span>
            <span class="stat-value productivity-${this.getProductivityClass(props.productivity_index)}">
              ${(props.productivity_index * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <div class="popup-crops">
          <span class="stat-label">Main Crops:</span>
          <div class="crop-tags">
            ${props.main_crops.map(crop => `<span class="crop-tag">${crop}</span>`).join('')}
          </div>
        </div>

        <div class="popup-water">
          <span class="stat-label">Water Sources:</span>
          <div class="water-sources">
            ${props.water_sources.map(source => `<span class="water-source">${source}</span>`).join('')}
          </div>
        </div>
      </div>
    `;

    // Bind popup with custom options
    layer.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'custom-popup'
    });

    // Add hover effects
    layer.on({
      mouseover: (e) => this.highlightFeature(e),
      mouseout: (e) => this.resetHighlight(e),
      click: (e) => this.zoomToFeature(e)
    });
  }

  highlightFeature(e) {
    const layer = e.target;

    layer.setStyle({
      weight: 4,
      color: '#2D7A4F',
      dashArray: '',
      fillOpacity: 0.9
    });

    layer.bringToFront();
  }

  resetHighlight(e) {
    this.geoJsonLayer.resetStyle(e.target);
  }

  zoomToFeature(e) {
    this.map.fitBounds(e.target.getBounds(), {
      padding: [20, 20]
    });
  }

  getProductivityClass(productivity) {
    if (productivity >= 0.8) return 'high';
    if (productivity >= 0.6) return 'medium';
    return 'low';
  }

  formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
  }

  addMapControls() {
    // Custom control for map information
    const InfoControl = L.Control.extend({
      onAdd: function(map) {
        const div = L.DomUtil.create('div', 'map-info-control');
        div.innerHTML = `
          <div class="map-info-header">
            <strong>🗺️ Jordan Agricultural Map</strong>
          </div>
          <div class="map-info-text">
            Click regions to explore<br>
            Scroll to zoom
          </div>
        `;
        return div;
      }
    });

    new InfoControl({ position: 'topright' }).addTo(this.map);

    // Add fullscreen control if available
    if (L.Control.Fullscreen) {
      this.map.addControl(new L.Control.Fullscreen());
    }
  }

  handleResponsive() {
    // Handle window resize
    window.addEventListener('resize', () => {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    });

    // Handle mobile interactions
    if (window.innerWidth < 768) {
      this.map.scrollWheelZoom.disable();
      this.map.on('focus', () => this.map.scrollWheelZoom.enable());
      this.map.on('blur', () => this.map.scrollWheelZoom.disable());
    }
  }

  loadFallbackData() {
    // Fallback markers for major agricultural regions
    const fallbackLocations = [
      {
        name: "Jordan Valley",
        coords: [32.0, 35.6],
        productivity: 0.93,
        crops: ["Tomatoes", "Cucumbers", "Citrus"]
      },
      {
        name: "Irbid",
        coords: [32.55, 35.85],
        productivity: 0.85,
        crops: ["Wheat", "Olives", "Vegetables"]
      },
      {
        name: "Balqa",
        coords: [31.8, 35.85],
        productivity: 0.78,
        crops: ["Olives", "Grapes", "Stone fruits"]
      }
    ];

    fallbackLocations.forEach(location => {
      const color = location.productivity >= 0.8 ? '#38A169' : '#D69E2E';

      L.circleMarker(location.coords, {
        radius: 10,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      })
      .bindPopup(`
        <div class="fallback-popup">
          <h3>${location.name}</h3>
          <p>Productivity: ${(location.productivity * 100).toFixed(0)}%</p>
          <p>Main crops: ${location.crops.join(', ')}</p>
        </div>
      `)
      .addTo(this.map);
    });
  }

  showMapError() {
    const mapElement = document.getElementById(this.mapContainer);
    if (mapElement) {
      mapElement.innerHTML = `
        <div class="map-error">
          <div class="error-icon">🗺️</div>
          <h3>Map Loading Error</h3>
          <p>Unable to load the interactive map. Please check your internet connection.</p>
          <button class="btn btn-primary" onclick="location.reload()">Retry</button>
        </div>
      `;
    }
  }
}

// Add map-specific styles
const addMapStyles = () => {
  const styles = document.createElement('style');
  styles.textContent = `
    .jordan-map-section {
      padding: 4rem 0;
      background: linear-gradient(135deg, var(--bg) 0%, var(--surface) 100%);
    }

    .map-container {
      position: relative;
      margin: 2rem 0;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-xl);
    }

    .map-display {
      width: 100%;
      height: 500px;
      min-height: 400px;
      border-radius: var(--radius-lg);
    }

    .map-legend {
      position: absolute;
      bottom: 20px;
      right: 20px;
      background: var(--surface-glass);
      backdrop-filter: var(--backdrop-blur);
      padding: 1rem;
      border-radius: var(--radius);
      border: 1px solid var(--glass-border);
      box-shadow: var(--shadow-md);
      z-index: 1000;
    }

    .map-legend h3 {
      margin: 0 0 0.75rem 0;
      font-size: 0.875rem;
      font-weight: var(--font-weight-semibold);
      color: var(--text);
    }

    .legend-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--text);
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 3px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .map-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .map-stat {
      text-align: center;
      padding: 1.5rem;
      background: var(--surface);
      border-radius: var(--radius);
      border: 1px solid var(--border);
      transition: transform var(--transition-medium);
    }

    .map-stat:hover {
      transform: translateY(-2px);
    }

    .map-stat .stat-number {
      font-size: 2rem;
      font-weight: var(--font-weight-bold);
      color: var(--accent);
      margin-bottom: 0.5rem;
    }

    .map-stat .stat-label {
      font-size: 0.875rem;
      color: var(--muted);
      font-weight: var(--font-weight-medium);
    }

    /* Map popup styles */
    .leaflet-popup-content-wrapper {
      background: var(--surface-glass);
      backdrop-filter: var(--backdrop-blur);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
    }

    .leaflet-popup-tip {
      background: var(--surface-glass);
      border: 1px solid var(--glass-border);
    }

    .map-popup {
      padding: 0.5rem;
      min-width: 250px;
    }

    .popup-title {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      font-weight: var(--font-weight-semibold);
      color: var(--text);
    }

    .popup-subtitle {
      margin-bottom: 1rem;
      font-size: 0.875rem;
      color: var(--muted);
      font-style: italic;
    }

    .popup-stats {
      margin-bottom: 1rem;
    }

    .popup-stat {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .stat-label {
      font-weight: var(--font-weight-medium);
      color: var(--muted);
    }

    .stat-value {
      font-weight: var(--font-weight-semibold);
      color: var(--text);
    }

    .stat-value.productivity-high {
      color: var(--success);
    }

    .stat-value.productivity-medium {
      color: var(--warning);
    }

    .stat-value.productivity-low {
      color: var(--error);
    }

    .popup-crops,
    .popup-water {
      margin-bottom: 0.75rem;
    }

    .crop-tags,
    .water-sources {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      margin-top: 0.25rem;
    }

    .crop-tag,
    .water-source {
      background: var(--accent);
      color: white;
      padding: 0.125rem 0.375rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: var(--font-weight-medium);
    }

    .water-source {
      background: var(--info);
    }

    /* Map controls */
    .map-info-control {
      background: var(--surface-glass);
      backdrop-filter: var(--backdrop-blur);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius);
      padding: 0.75rem;
      box-shadow: var(--shadow-md);
      font-size: 0.75rem;
      color: var(--text);
      max-width: 150px;
    }

    .map-info-header {
      margin-bottom: 0.5rem;
    }

    .map-info-text {
      color: var(--muted);
      line-height: 1.4;
    }

    /* Map error state */
    .map-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      text-align: center;
      color: var(--muted);
    }

    .map-error .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .map-error h3 {
      margin-bottom: 0.5rem;
      color: var(--text);
    }

    .map-error p {
      margin-bottom: 1.5rem;
      max-width: 300px;
    }

    /* Responsive styles */
    @media (max-width: 768px) {
      .jordan-map-section {
        padding: 2rem 0;
      }

      .map-display {
        height: 350px;
      }

      .map-legend {
        position: static;
        margin-top: 1rem;
        border-radius: var(--radius);
      }

      .legend-items {
        flex-direction: row;
        justify-content: space-around;
      }

      .map-stats {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .map-stat {
        padding: 1rem;
      }

      .map-stat .stat-number {
        font-size: 1.5rem;
      }
    }
  `;
  document.head.appendChild(styles);
};

// Initialize map and styles
document.addEventListener('DOMContentLoaded', () => {
  addMapStyles();
  if (document.getElementById('jordan-map')) {
    window.jordanMap = new JordanMap();
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JordanMap;
}