/**
 * Food Security Jordan - Chart Management System
 * Comprehensive charting functionality for all pages
 */

class ChartManager {
    constructor() {
        this.charts = new Map();
        this.colors = {
            primary: '#226646',
            secondary: '#BE8A2F',
            success: '#16a34a',
            warning: '#f59e0b',
            danger: '#dc2626',
            info: '#0ea5e9',
            light: '#f8fafc',
            dark: '#141A14',
            muted: '#6B7268',
            border: '#E3E3E0'
        };
        this.init();
    }

    init() {
        // Wait for data to be ready
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeCharts();
        });

        document.addEventListener('dataReady', () => {
            this.createDataDrivenCharts();
        });
    }

    initializeCharts() {
        // Create charts for different pages
        this.renderDashboardPreview();
        this.createDashboardCharts();
        this.setupChartControls();
    }

    registerChart(id, chart) {
        this.charts.set(id, chart);
    }

    createDataDrivenCharts() {
        // Create charts that use actual data
        this.createCropDistributionChart();
        this.createRegionalProductionChart();
        this.createSeasonalTrendsChart();
    }

    renderDashboardPreview() {
        const canvas = document.getElementById('home-chart');
        const fallback = document.getElementById('chart-fallback');

        if (!canvas) return;

        if (!window.Chart) {
            console.error('Chart.js not loaded');
            if (fallback) fallback.style.display = 'flex';
            return;
        }

        if (fallback) fallback.style.display = 'none';

        const ctx = canvas.getContext('2d');

        const data = {
            labels: ['Amman', 'Irbid', 'Zarqa', 'Balqa', 'Karak'],
            datasets: [
                {
                    label: 'Vegetables (tons)',
                    data: [15400, 12800, 9200, 18600, 8900],
                    backgroundColor: this.colors.primary,
                    borderColor: this.colors.primary,
                    borderWidth: 0,
                    borderRadius: 6,
                    borderSkipped: false
                },
                {
                    label: 'Fruits (tons)',
                    data: [8700, 9400, 6100, 12300, 11800],
                    backgroundColor: this.colors.secondary,
                    borderColor: this.colors.secondary,
                    borderWidth: 0,
                    borderRadius: 6,
                    borderSkipped: false
                }
            ]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: this.colors.light,
                    titleColor: this.colors.dark,
                    bodyColor: this.colors.dark,
                    borderColor: this.colors.border,
                    borderWidth: 1,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: { color: this.colors.border, drawBorder: false },
                    ticks: { color: this.colors.muted, font: { family: 'Inter', size: 12 } }
                },
                y: {
                    grid: { color: this.colors.border, drawBorder: false },
                    ticks: { color: this.colors.muted, font: { family: 'Inter', size: 12 } },
                    beginAtZero: true
                }
            }
        };

        try {
            const chart = new Chart(ctx, { type: 'bar', data: data, options: options });
            this.registerChart('home-chart', chart);
        } catch (error) {
            console.error('Error creating chart:', error);
            if (fallback) {
                fallback.style.display = 'flex';
                fallback.innerHTML = '<div class="fallback-content"><p>Chart error: ' + error.message + '</p></div>';
            }
        }
    }

    createDashboardCharts() {
        // Create all dashboard charts
        this.createMetricSparklines();
        this.createWaterUsageChart();
        this.createProductionTrendChart();
    }

    createMetricSparklines() {
        const metrics = [
            { id: 'productionChart', data: [2100, 2300, 2500, 2700, 2847] },
            { id: 'waterChart', data: [180, 165, 155, 150, 145] },
            { id: 'efficiencyChart', data: [68, 72, 75, 77, 78] },
            { id: 'farmsChart', data: [11800, 12100, 12250, 12380, 12450] }
        ];

        metrics.forEach(metric => {
            this.createSparkline(metric.id, metric.data);
        });
    }

    createSparkline(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: data.length}, (_, i) => i + 1),
                datasets: [{
                    data: data,
                    borderColor: this.colors.primary,
                    backgroundColor: this.colors.primary + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { display: false }
                },
                elements: { point: { radius: 0 } }
            }
        });

        this.registerChart(canvasId, chart);
    }

    createCropDistributionChart() {
        const canvas = document.getElementById('cropDistributionChart');
        if (!canvas || !db.isLoaded) return;

        const ctx = canvas.getContext('2d');
        const crops = db.getCrops();
        const categories = {};

        crops.forEach(crop => {
            categories[crop.category] = (categories[crop.category] || 0) + 1;
        });

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories).map(cat => this.capitalize(cat)),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: [
                        this.colors.primary,
                        this.colors.secondary,
                        this.colors.success,
                        this.colors.info,
                        this.colors.warning,
                        this.colors.danger
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { padding: 20, usePointStyle: true }
                    }
                }
            }
        });

        this.registerChart('cropDistribution', chart);
    }

    createRegionalProductionChart() {
        const canvas = document.getElementById('regionProductionChart');
        if (!canvas || !db.isLoaded) return;

        const ctx = canvas.getContext('2d');
        const dashboardData = db.getDashboardMetrics();
        const regionalData = dashboardData.regionalData || [
            { region: 'Jordan Valley', production: 180000 },
            { region: 'Northern Highlands', production: 95000 },
            { region: 'Central Plateau', production: 75000 },
            { region: 'Eastern Desert', production: 15000 }
        ];

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: regionalData.map(r => r.region),
                datasets: [{
                    label: 'Production (tons)',
                    data: regionalData.map(r => r.production),
                    backgroundColor: this.colors.primary,
                    borderColor: this.colors.primary,
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.parsed.y.toLocaleString()} tons`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `${(value/1000).toFixed(0)}K`
                        }
                    }
                }
            }
        });

        this.registerChart('regionProduction', chart);
    }

    createWaterUsageChart() {
        const canvas = document.getElementById('waterTrendsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const monthlyData = [
            { month: 'Jan', waterUsage: 450, production: 15000 },
            { month: 'Feb', waterUsage: 520, production: 18000 },
            { month: 'Mar', waterUsage: 680, production: 25000 },
            { month: 'Apr', waterUsage: 850, production: 35000 },
            { month: 'May', waterUsage: 1200, production: 45000 },
            { month: 'Jun', waterUsage: 1500, production: 55000 },
            { month: 'Jul', waterUsage: 1800, production: 62000 },
            { month: 'Aug', waterUsage: 1650, production: 58000 },
            { month: 'Sep', waterUsage: 1200, production: 48000 },
            { month: 'Oct', waterUsage: 950, production: 38000 },
            { month: 'Nov', waterUsage: 650, production: 28000 },
            { month: 'Dec', waterUsage: 480, production: 20000 }
        ];

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.map(m => m.month),
                datasets: [
                    {
                        label: 'Water Usage (million m³)',
                        data: monthlyData.map(m => m.waterUsage),
                        borderColor: this.colors.info,
                        backgroundColor: this.colors.info + '20',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Production (thousand tons)',
                        data: monthlyData.map(m => m.production / 1000),
                        borderColor: this.colors.primary,
                        backgroundColor: this.colors.primary + '20',
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Water Usage (million m³)' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Production (thousand tons)' },
                        grid: { drawOnChartArea: false }
                    }
                },
                plugins: { legend: { position: 'top' } }
            }
        });

        this.registerChart('waterTrends', chart);
    }

    createSeasonalTrendsChart() {
        const canvas = document.getElementById('seasonalChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const seasonalData = {
            'Spring': 85000,
            'Summer': 120000,
            'Autumn': 95000,
            'Winter': 45000
        };

        const chart = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: Object.keys(seasonalData),
                datasets: [{
                    data: Object.values(seasonalData),
                    backgroundColor: [
                        this.colors.success + '80',
                        this.colors.warning + '80',
                        this.colors.secondary + '80',
                        this.colors.info + '80'
                    ],
                    borderColor: [
                        this.colors.success,
                        this.colors.warning,
                        this.colors.secondary,
                        this.colors.info
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: { callback: (value) => `${(value/1000).toFixed(0)}K` }
                    }
                }
            }
        });

        this.registerChart('seasonal', chart);
    }

    setupChartControls() {
        const chartButtons = document.querySelectorAll('.chart-btn');
        chartButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chartType = e.target.dataset.chart;
                const displayType = e.target.dataset.type;

                // Update button states
                const siblings = btn.parentElement.querySelectorAll('.chart-btn');
                siblings.forEach(s => s.classList.remove('active'));
                btn.classList.add('active');

                // Update chart
                this.updateChartType(chartType, displayType);
            });
        });
    }

    updateChartType(chartName, newType) {
        const chart = this.charts.get(chartName);
        if (!chart) return;

        chart.config.type = newType;
        chart.update();
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Cleanup
    destroyCharts() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }
}

// Initialize chart manager
const chartManager = new ChartManager();
window.chartManager = chartManager;