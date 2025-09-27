/**
 * Food Security Jordan - Dashboard Functionality
 * Interactive dashboard with real-time data and controls
 */

class Dashboard {
    constructor() {
        this.currentFilters = {
            region: 'all',
            timeframe: '30d'
        };
        this.updateInterval = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupControls();
            this.loadDashboardData();
            this.startRealTimeUpdates();
        });

        document.addEventListener('dataReady', (event) => {
            this.updateMetrics();
            this.populateActivityFeed();
        });
    }

    setupControls() {
        // Filter controls
        const regionFilter = document.getElementById('regionFilter');
        const timeFilter = document.getElementById('timeFilter');
        const refreshBtn = document.getElementById('refreshData');

        if (regionFilter) {
            regionFilter.addEventListener('change', (e) => {
                this.currentFilters.region = e.target.value;
                this.updateDashboard();
            });
        }

        if (timeFilter) {
            timeFilter.addEventListener('change', (e) => {
                this.currentFilters.timeframe = e.target.value;
                this.updateDashboard();
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }

        // Export buttons
        const exportBtns = document.querySelectorAll('.export-btn');
        exportBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.exportData(btn.dataset.format);
            });
        });

        // Table controls
        const tableBtns = document.querySelectorAll('.table-btn');
        tableBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const siblings = btn.parentElement.querySelectorAll('.table-btn');
                siblings.forEach(s => s.classList.remove('active'));
                btn.classList.add('active');
                this.updateTableData(btn.dataset.table, btn.dataset.view);
            });
        });
    }

    loadDashboardData() {
        this.updateMetrics();
        this.populateTopFarms();
        this.populateActivityFeed();
        this.updateRealTimeMonitoring();
    }

    updateMetrics() {
        if (!db.isLoaded) return;

        const stats = db.getStats();

        // Update metric values with animation
        this.animateValue('totalProduction', 2847000);
        this.animateValue('waterUsage', 145.7);
        this.animateValue('efficiencyRate', 78.3);
        this.animateValue('activeFarms', 12450);

        // Update trends
        this.updateMetricTrend('production', 5.2, 'up');
        this.updateMetricTrend('water', -12.1, 'down');
        this.updateMetricTrend('efficiency', 8.4, 'up');
        this.updateMetricTrend('farms', 2.8, 'up');
    }

    animateValue(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
        const duration = 2000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutExpo);

            element.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    updateMetricTrend(metric, value, direction) {
        const trendElement = document.querySelector(`.metric-card.${metric} .metric-trend`);
        if (!trendElement) return;

        trendElement.textContent = `${value > 0 ? '+' : ''}${value}%`;
        trendElement.className = `metric-trend ${direction}`;
    }

    populateTopFarms() {
        const tableBody = document.querySelector('#topFarmsTable tbody');
        if (!tableBody) return;

        const topFarms = [
            { rank: 1, name: 'Al-Zahra Farm', region: 'Jordan Valley', yield: 45.2, efficiency: 95 },
            { rank: 2, name: 'Green Valley Co.', region: 'Irbid', yield: 42.8, efficiency: 92 },
            { rank: 3, name: 'Desert Bloom', region: 'Mafraq', yield: 38.6, efficiency: 88 },
            { rank: 4, name: 'Jordan Organics', region: 'Balqa', yield: 35.4, efficiency: 85 },
            { rank: 5, name: 'Modern Agriculture', region: 'Karak', yield: 33.2, efficiency: 82 }
        ];

        tableBody.innerHTML = topFarms.map(farm => `
            <tr>
                <td>${farm.rank}</td>
                <td>${farm.name}</td>
                <td>${farm.region}</td>
                <td>${farm.yield}</td>
                <td class="efficiency ${farm.efficiency >= 90 ? 'high' : farm.efficiency >= 80 ? 'medium' : 'low'}">${farm.efficiency}%</td>
            </tr>
        `).join('');
    }

    populateActivityFeed() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        const activities = [
            {
                icon: 'irrigation',
                emoji: '💧',
                title: 'Irrigation System Update',
                description: 'Al-Zahra Farm upgraded to smart drip irrigation',
                time: '2 hours ago',
                status: 'success',
                statusText: 'Completed'
            },
            {
                icon: 'disease',
                emoji: '🔬',
                title: 'Disease Alert',
                description: 'Powdery mildew detected in Jordan Valley region',
                time: '4 hours ago',
                status: 'warning',
                statusText: 'Alert'
            },
            {
                icon: 'harvest',
                emoji: '🌾',
                title: 'Harvest Completed',
                description: 'Green Valley Co. wheat harvest: 850 tons',
                time: '6 hours ago',
                status: 'success',
                statusText: 'Completed'
            },
            {
                icon: 'planting',
                emoji: '🌱',
                title: 'New Planting',
                description: 'Desert Bloom started tomato seedlings',
                time: '8 hours ago',
                status: 'in-progress',
                statusText: 'In Progress'
            },
            {
                icon: 'weather',
                emoji: '🌤️',
                title: 'Weather Update',
                description: 'Favorable conditions forecasted for next week',
                time: '12 hours ago',
                status: 'info',
                statusText: 'Info'
            }
        ];

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.icon}">${activity.emoji}</div>
                <div class="activity-content">
                    <span class="activity-title">${activity.title}</span>
                    <span class="activity-description">${activity.description}</span>
                    <span class="activity-time">${activity.time}</span>
                </div>
                <span class="activity-status ${activity.status}">${activity.statusText}</span>
            </div>
        `).join('');
    }

    updateRealTimeMonitoring() {
        // Update weather conditions
        this.updateWeatherData({
            temperature: 28,
            condition: 'Sunny',
            humidity: 45,
            wind: 12,
            pressure: 1013
        });

        // Update soil conditions
        this.updateSoilData({
            moisture: 68,
            ph: 7.2,
            temperature: 22
        });

        // Update system alerts
        this.updateSystemAlerts([
            { type: 'medium', icon: '⚠️', title: 'Low Soil Moisture', location: 'Sector 7-B', time: '10m' },
            { type: 'low', icon: 'ℹ️', title: 'Irrigation Scheduled', location: 'Sector 3-A', time: '15m' },
            { type: 'high', icon: '🚨', title: 'Disease Detection', location: 'Greenhouse 5', time: '25m' }
        ]);
    }

    updateWeatherData(data) {
        const updateElement = (id, value) => {
            const el = document.querySelector(id);
            if (el) el.textContent = value;
        };

        updateElement('.temperature', `${data.temperature}°C`);
        updateElement('.condition', data.condition);
        updateElement('.weather-item:nth-child(1) .value', `${data.humidity}%`);
        updateElement('.weather-item:nth-child(2) .value', `${data.wind} km/h`);
        updateElement('.weather-item:nth-child(3) .value', `${data.pressure} hPa`);
    }

    updateSoilData(data) {
        const updateMetric = (selector, value, percentage) => {
            const fill = document.querySelector(`${selector} .bar-fill`);
            const valueEl = document.querySelector(`${selector} .metric-value`);
            if (fill) fill.style.width = `${percentage}%`;
            if (valueEl) valueEl.textContent = value;
        };

        updateMetric('.soil-metric:nth-child(1)', `${data.moisture}%`, data.moisture);
        updateMetric('.soil-metric:nth-child(2)', data.ph.toString(), (data.ph / 14) * 100);
        updateMetric('.soil-metric:nth-child(3)', `${data.temperature}°C`, (data.temperature / 40) * 100);
    }

    updateSystemAlerts(alerts) {
        const alertsList = document.querySelector('.alerts-list');
        if (!alertsList) return;

        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">${alert.icon}</div>
                <div class="alert-content">
                    <span class="alert-title">${alert.title}</span>
                    <span class="alert-location">${alert.location}</span>
                </div>
                <span class="alert-time">${alert.time}</span>
            </div>
        `).join('');
    }

    updateDashboard() {
        // Update all dashboard components based on current filters
        this.updateMetrics();

        // Update charts if chart manager is available
        if (window.chartManager) {
            window.chartManager.updateChartsData();
        }

        console.log('Dashboard updated with filters:', this.currentFilters);
    }

    refreshData() {
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('.refresh-icon');
            if (icon) {
                icon.style.animation = 'spin 1s linear';
                setTimeout(() => {
                    icon.style.animation = '';
                }, 1000);
            }
        }

        // Simulate data refresh
        setTimeout(() => {
            this.loadDashboardData();
            this.showNotification('Data refreshed successfully', 'success');
        }, 1000);
    }

    exportData(format) {
        const data = {
            metrics: {
                production: 2847000,
                waterUsage: 145.7,
                efficiency: 78.3,
                farms: 12450
            },
            timestamp: new Date().toISOString(),
            filters: this.currentFilters
        };

        switch (format) {
            case 'csv':
                this.downloadCSV(data);
                break;
            case 'json':
                this.downloadJSON(data);
                break;
            case 'pdf':
                this.generatePDF(data);
                break;
            default:
                console.log('Export format not supported:', format);
        }
    }

    downloadCSV(data) {
        const csv = Object.entries(data.metrics)
            .map(([key, value]) => `${key},${value}`)
            .join('\n');

        const blob = new Blob(['Metric,Value\n' + csv], { type: 'text/csv' });
        this.downloadFile(blob, 'dashboard-data.csv');
    }

    downloadJSON(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadFile(blob, 'dashboard-data.json');
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification(`${filename} downloaded successfully`, 'success');
    }

    generatePDF(data) {
        // For a hackathon, we'll show a notification instead of implementing full PDF generation
        this.showNotification('PDF export feature coming soon!', 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#16a34a' : type === 'warning' ? '#f59e0b' : '#0ea5e9'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    startRealTimeUpdates() {
        // Update monitoring data every 30 seconds
        this.updateInterval = setInterval(() => {
            this.updateRealTimeMonitoring();
        }, 30000);
    }

    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    updateTableData(tableType, viewType) {
        console.log(`Updating ${tableType} table with ${viewType} view`);
        // Implementation for different table views
    }
}

// CSS for notifications
const notificationStyles = `
    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }

    .notification {
        animation: slideIn 0.3s ease;
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize dashboard
const dashboard = new Dashboard();
window.dashboard = dashboard;