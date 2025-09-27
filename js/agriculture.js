/**
 * Food Security Jordan - Agriculture Page
 * Interactive agriculture systems overview
 */

class AgriculturePage {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupInteractiveElements();
            this.loadAgricultureData();
            this.setupAnimations();
        });

        document.addEventListener('dataReady', () => {
            this.updateWithRealData();
        });
    }

    setupInteractiveElements() {
        // Interactive tabs
        this.setupTabs();

        // Interactive infographics
        this.setupInfographics();

        // Hover effects for cards
        this.setupCardHovers();
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;

                // Update button states
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update content visibility
                tabContents.forEach(content => {
                    if (content.id === targetTab) {
                        content.classList.add('active');
                        this.animateTabContent(content);
                    } else {
                        content.classList.remove('active');
                    }
                });
            });
        });
    }

    animateTabContent(content) {
        const cards = content.querySelectorAll('.card, .stat-card, .technique-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';

            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    setupInfographics() {
        // Animated progress bars
        const progressBars = document.querySelectorAll('.progress-bar');

        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateProgressBar(entry.target);
                }
            });
        }, observerOptions);

        progressBars.forEach(bar => observer.observe(bar));

        // Interactive statistics counters
        this.setupCounters();
    }

    animateProgressBar(progressBar) {
        const targetWidth = progressBar.dataset.percentage || '0';
        const fill = progressBar.querySelector('.progress-fill');

        if (fill) {
            fill.style.width = '0%';
            setTimeout(() => {
                fill.style.transition = 'width 2s ease-out';
                fill.style.width = targetWidth + '%';
            }, 100);
        }
    }

    setupCounters() {
        const counters = document.querySelectorAll('.counter');

        const observerOptions = {
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    this.animateCounter(entry.target);
                    entry.target.classList.add('counted');
                }
            });
        }, observerOptions);

        counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.target) || parseInt(element.textContent.replace(/,/g, ''));
        const duration = 2000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * easeOut);

            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = target.toLocaleString();
            }
        };

        requestAnimationFrame(animate);
    }

    setupCardHovers() {
        const cards = document.querySelectorAll('.technique-card, .challenge-card, .innovation-card');

        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
                card.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
            });
        });
    }

    loadAgricultureData() {
        // Sample data for demonstration
        this.updateLandUseChart();
        this.updateProductionTrends();
        this.populateTechniques();
        this.populateChallenges();
    }

    updateLandUseChart() {
        const canvas = document.getElementById('landUseChart');
        if (!canvas || !window.Chart) return;

        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Cultivated Land', 'Forests', 'Desert', 'Urban Areas', 'Water Bodies'],
                datasets: [{
                    data: [13, 11, 68, 6, 2],
                    backgroundColor: [
                        '#226646',
                        '#16a34a',
                        '#BE8A2F',
                        '#6b7280',
                        '#0ea5e9'
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
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.label}: ${context.parsed}%`
                        }
                    }
                }
            }
        });
    }

    updateProductionTrends() {
        const canvas = document.getElementById('productionTrendsChart');
        if (!canvas || !window.Chart) return;

        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
                datasets: [
                    {
                        label: 'Vegetables',
                        data: [145, 152, 168, 175, 182, 189],
                        borderColor: '#226646',
                        backgroundColor: '#226646' + '20',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Fruits',
                        data: [98, 103, 109, 115, 121, 128],
                        borderColor: '#BE8A2F',
                        backgroundColor: '#BE8A2F' + '20',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Cereals',
                        data: [45, 48, 52, 49, 53, 56],
                        borderColor: '#16a34a',
                        backgroundColor: '#16a34a' + '20',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Production (thousand tons)'
                        }
                    }
                }
            }
        });
    }

    populateTechniques() {
        const techniquesContainer = document.getElementById('techniques-container');
        if (!techniquesContainer) return;

        const techniques = [
            {
                name: 'Drip Irrigation',
                efficiency: 90,
                coverage: '15,000 hectares',
                savings: '40% water saved',
                icon: '💧',
                description: 'Precise water delivery directly to plant roots'
            },
            {
                name: 'Greenhouse Farming',
                efficiency: 85,
                coverage: '1,200 hectares',
                savings: '300% yield increase',
                icon: '🏠',
                description: 'Controlled environment agriculture'
            },
            {
                name: 'Precision Agriculture',
                efficiency: 75,
                coverage: '8,500 hectares',
                savings: '25% input reduction',
                icon: '🛰️',
                description: 'GPS and sensor-guided farming'
            },
            {
                name: 'Organic Farming',
                efficiency: 70,
                coverage: '2,800 hectares',
                savings: 'Premium pricing',
                icon: '🌱',
                description: 'Chemical-free sustainable practices'
            }
        ];

        techniquesContainer.innerHTML = techniques.map(tech => `
            <div class="technique-card">
                <div class="technique-icon">${tech.icon}</div>
                <h3>${tech.name}</h3>
                <p class="technique-description">${tech.description}</p>
                <div class="technique-stats">
                    <div class="stat-item">
                        <span class="stat-label">Efficiency</span>
                        <span class="stat-value">${tech.efficiency}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Coverage</span>
                        <span class="stat-value">${tech.coverage}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Impact</span>
                        <span class="stat-value">${tech.savings}</span>
                    </div>
                </div>
                <div class="efficiency-bar">
                    <div class="efficiency-fill" style="width: ${tech.efficiency}%"></div>
                </div>
            </div>
        `).join('');
    }

    populateChallenges() {
        const challengesContainer = document.getElementById('challenges-container');
        if (!challengesContainer) return;

        const challenges = [
            {
                title: 'Water Scarcity',
                severity: 'critical',
                impact: 'High',
                progress: 65,
                solutions: ['Drip irrigation', 'Water recycling', 'Drought-resistant crops'],
                icon: '💧'
            },
            {
                title: 'Climate Change',
                severity: 'high',
                impact: 'Medium',
                progress: 45,
                solutions: ['Heat-tolerant varieties', 'Shade systems', 'Climate monitoring'],
                icon: '🌡️'
            },
            {
                title: 'Soil Degradation',
                severity: 'medium',
                impact: 'Medium',
                progress: 70,
                solutions: ['Organic matter', 'Cover crops', 'Reduced tillage'],
                icon: '🪨'
            },
            {
                title: 'Market Access',
                severity: 'medium',
                impact: 'High',
                progress: 55,
                solutions: ['Digital platforms', 'Cooperatives', 'Direct sales'],
                icon: '🏪'
            }
        ];

        challengesContainer.innerHTML = challenges.map(challenge => `
            <div class="challenge-card ${challenge.severity}">
                <div class="challenge-header">
                    <div class="challenge-icon">${challenge.icon}</div>
                    <h3>${challenge.title}</h3>
                    <span class="severity-badge ${challenge.severity}">${challenge.severity}</span>
                </div>
                <div class="challenge-content">
                    <div class="challenge-impact">
                        <span class="impact-label">Impact Level:</span>
                        <span class="impact-value">${challenge.impact}</span>
                    </div>
                    <div class="progress-section">
                        <span class="progress-label">Solution Progress:</span>
                        <div class="progress-bar" data-percentage="${challenge.progress}">
                            <div class="progress-fill"></div>
                        </div>
                        <span class="progress-percentage">${challenge.progress}%</span>
                    </div>
                    <div class="solutions">
                        <span class="solutions-label">Solutions:</span>
                        <div class="solutions-list">
                            ${challenge.solutions.map(solution => `
                                <span class="solution-tag">${solution}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Animate progress bars after populating
        setTimeout(() => {
            const progressBars = challengesContainer.querySelectorAll('.progress-bar');
            progressBars.forEach(bar => this.animateProgressBar(bar));
        }, 500);
    }

    updateWithRealData() {
        if (!db.isLoaded) return;

        const agricultureData = db.getAgricultureStats();

        // Update statistics with real data
        this.updateStatistic('total-land', agricultureData.totalLandArea);
        this.updateStatistic('agricultural-land', agricultureData.agriculturalLand);
        this.updateStatistic('irrigated-land', agricultureData.irrigatedLand);
        this.updateStatistic('organic-farms', agricultureData.organicFarms);
    }

    updateStatistic(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value.toLocaleString();
        }
    }

    setupAnimations() {
        // Add entrance animations for sections
        const sections = document.querySelectorAll('.agriculture-section');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.2 });

        sections.forEach(section => observer.observe(section));
    }
}

// Enhanced styles for agriculture page
const agricultureStyles = `
    .technique-card, .challenge-card {
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .agriculture-section {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }

    .agriculture-section.animate-in {
        opacity: 1;
        transform: translateY(0);
    }

    .progress-fill {
        transition: width 0s ease;
    }

    .efficiency-fill {
        background: linear-gradient(90deg, #226646, #16a34a);
        height: 100%;
        border-radius: inherit;
        transition: width 1.5s ease-out;
    }

    .severity-badge.critical {
        background: #dc2626;
        color: white;
    }

    .severity-badge.high {
        background: #f59e0b;
        color: white;
    }

    .severity-badge.medium {
        background: #0ea5e9;
        color: white;
    }

    .solution-tag {
        background: #f3f4f6;
        color: #374151;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        margin: 2px;
        display: inline-block;
    }

    [data-theme="dark"] .solution-tag {
        background: #374151;
        color: #d1d5db;
    }
`;

// Inject agriculture styles
const agricultureStyleSheet = document.createElement('style');
agricultureStyleSheet.textContent = agricultureStyles;
document.head.appendChild(agricultureStyleSheet);

// Initialize agriculture page
const agriculturePage = new AgriculturePage();