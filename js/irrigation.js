/**
 * Food Security Jordan - Irrigation Page
 * Interactive irrigation systems and water management
 */

class IrrigationPage {
    constructor() {
        this.selectedTechnique = null;
        this.simulationRunning = false;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupInteractiveElements();
            this.loadIrrigationData();
            this.setupSimulation();
        });

        document.addEventListener('dataReady', () => {
            this.updateWithRealData();
        });
    }

    setupInteractiveElements() {
        // Interactive technique comparison
        this.setupTechniqueSelector();

        // Project timeline interaction
        this.setupTimelineInteraction();

        // Water calculator
        this.setupWaterCalculator();

        // Interactive maps (simplified)
        this.setupInteractiveMaps();
    }

    setupTechniqueSelector() {
        const techniqueCards = document.querySelectorAll('.technique-card');

        techniqueCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove active state from all cards
                techniqueCards.forEach(c => c.classList.remove('active', 'selected'));

                // Add active state to clicked card
                card.classList.add('active', 'selected');

                const techniqueId = card.dataset.technique;
                this.selectedTechnique = techniqueId;
                this.updateTechniqueComparison(techniqueId);
                this.showTechniqueDetails(techniqueId);
            });

            // Hover effects
            card.addEventListener('mouseenter', () => {
                if (!card.classList.contains('selected')) {
                    card.style.transform = 'translateY(-5px) scale(1.02)';
                }
            });

            card.addEventListener('mouseleave', () => {
                if (!card.classList.contains('selected')) {
                    card.style.transform = 'translateY(0) scale(1)';
                }
            });
        });
    }

    updateTechniqueComparison(techniqueId) {
        const techniques = {
            'drip': {
                name: 'Drip Irrigation',
                efficiency: 90,
                cost: 1200,
                maintenance: 'Low',
                waterSaving: 40,
                suitability: ['Vegetables', 'Fruits', 'Greenhouse crops'],
                advantages: ['Precise water delivery', 'Reduced water waste', 'Lower labor cost'],
                disadvantages: ['High initial cost', 'Clogging issues', 'Technical knowledge required']
            },
            'sprinkler': {
                name: 'Sprinkler System',
                efficiency: 75,
                cost: 800,
                maintenance: 'Medium',
                waterSaving: 25,
                suitability: ['Field crops', 'Cereals', 'Pastures'],
                advantages: ['Lower cost', 'Easy installation', 'Good for large areas'],
                disadvantages: ['Wind affected', 'Higher water use', 'Uneven distribution']
            },
            'micro': {
                name: 'Micro-Sprinkler',
                efficiency: 85,
                cost: 1000,
                maintenance: 'Medium',
                waterSaving: 30,
                suitability: ['Fruit trees', 'Nuts', 'Ornamentals'],
                advantages: ['Good coverage', 'Cooling effect', 'Dust suppression'],
                disadvantages: ['Moderate cost', 'Wind sensitivity', 'Regular maintenance']
            },
            'surface': {
                name: 'Surface Irrigation',
                efficiency: 60,
                cost: 300,
                maintenance: 'High',
                waterSaving: 10,
                suitability: ['Rice', 'Wheat', 'Traditional crops'],
                advantages: ['Low cost', 'Simple technology', 'Wide applicability'],
                disadvantages: ['High water waste', 'Labor intensive', 'Soil erosion risk']
            }
        };

        const technique = techniques[techniqueId];
        if (!technique) return;

        // Update comparison panel
        this.updateComparisonPanel(technique);

        // Update efficiency chart
        this.updateEfficiencyChart(technique);
    }

    updateComparisonPanel(technique) {
        const panel = document.getElementById('comparison-panel');
        if (!panel) return;

        panel.innerHTML = `
            <div class="comparison-header">
                <h3>${technique.name}</h3>
                <div class="efficiency-score">
                    <span class="score-value">${technique.efficiency}%</span>
                    <span class="score-label">Efficiency</span>
                </div>
            </div>

            <div class="comparison-metrics">
                <div class="metric-item">
                    <span class="metric-label">Cost per hectare:</span>
                    <span class="metric-value">$${technique.cost.toLocaleString()}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Maintenance:</span>
                    <span class="metric-value ${technique.maintenance.toLowerCase()}">${technique.maintenance}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Water Saving:</span>
                    <span class="metric-value">${technique.waterSaving}%</span>
                </div>
            </div>

            <div class="suitability-section">
                <h4>Best Suited For:</h4>
                <div class="suitability-tags">
                    ${technique.suitability.map(crop => `
                        <span class="suitability-tag">${crop}</span>
                    `).join('')}
                </div>
            </div>

            <div class="pros-cons">
                <div class="pros">
                    <h4>Advantages</h4>
                    <ul>
                        ${technique.advantages.map(advantage => `
                            <li>✓ ${advantage}</li>
                        `).join('')}
                    </ul>
                </div>
                <div class="cons">
                    <h4>Considerations</h4>
                    <ul>
                        ${technique.disadvantages.map(disadvantage => `
                            <li>⚠ ${disadvantage}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;

        // Animate panel
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(20px)';

        setTimeout(() => {
            panel.style.transition = 'all 0.5s ease';
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';
        }, 100);
    }

    showTechniqueDetails(techniqueId) {
        const modal = document.getElementById('technique-modal');
        const modalContent = document.getElementById('modal-technique-content');

        if (!modal || !modalContent) return;

        // Show modal with detailed information
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Load detailed content based on technique
        this.loadTechniqueModalContent(techniqueId, modalContent);
    }

    loadTechniqueModalContent(techniqueId, container) {
        const detailedInfo = {
            'drip': {
                video: 'assets/videos/drip-irrigation.mp4',
                description: 'Drip irrigation delivers water directly to plant roots through a network of tubes and emitters.',
                installation: [
                    'Design system layout',
                    'Install main water line',
                    'Connect distribution tubes',
                    'Place emitters at plant locations',
                    'Install timer and pressure regulator',
                    'Test system and adjust flow rates'
                ],
                cost: 'Initial cost: $800-1500 per hectare\nAnnual maintenance: $50-100 per hectare',
                timeline: '2-4 weeks for installation'
            }
            // Add more techniques...
        };

        const info = detailedInfo[techniqueId];
        if (!info) return;

        container.innerHTML = `
            <div class="technique-details">
                <div class="technique-overview">
                    <p>${info.description}</p>
                </div>

                <div class="installation-steps">
                    <h4>Installation Process</h4>
                    <ol class="steps-list">
                        ${info.installation.map((step, index) => `
                            <li class="step-item">
                                <span class="step-number">${index + 1}</span>
                                <span class="step-text">${step}</span>
                            </li>
                        `).join('')}
                    </ol>
                </div>

                <div class="cost-breakdown">
                    <h4>Cost Information</h4>
                    <pre>${info.cost}</pre>
                </div>

                <div class="timeline-info">
                    <h4>Installation Timeline</h4>
                    <p>${info.timeline}</p>
                </div>
            </div>
        `;
    }

    setupTimelineInteraction() {
        const timelineItems = document.querySelectorAll('.timeline-item');

        timelineItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                // Remove active from all items
                timelineItems.forEach(i => i.classList.remove('active'));

                // Add active to clicked item
                item.classList.add('active');

                // Show project details
                this.showProjectDetails(item.dataset.project);
            });

            // Animate timeline items on scroll
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, index * 200);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(item);
        });
    }

    showProjectDetails(projectId) {
        const projects = {
            'jordan-valley': {
                name: 'Jordan Valley Modernization',
                status: 'Completed',
                area: '5,500 hectares',
                investment: '$45 million',
                waterSaved: '40%',
                beneficiaries: '2,500 farmers',
                timeline: '2021-2023',
                impact: 'Increased crop yields by 35% and reduced water consumption significantly.'
            }
            // Add more projects...
        };

        const project = projects[projectId];
        if (!project) return;

        const detailsPanel = document.getElementById('project-details');
        if (!detailsPanel) return;

        detailsPanel.innerHTML = `
            <div class="project-details-content">
                <h3>${project.name}</h3>
                <div class="project-metrics">
                    <div class="metric">
                        <span class="metric-value">${project.area}</span>
                        <span class="metric-label">Coverage Area</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${project.investment}</span>
                        <span class="metric-label">Investment</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${project.waterSaved}</span>
                        <span class="metric-label">Water Saved</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${project.beneficiaries}</span>
                        <span class="metric-label">Beneficiaries</span>
                    </div>
                </div>
                <p class="project-impact">${project.impact}</p>
            </div>
        `;

        detailsPanel.classList.add('visible');
    }

    setupWaterCalculator() {
        const calculatorForm = document.getElementById('water-calculator-form');
        if (!calculatorForm) return;

        calculatorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateWaterSavings();
        });

        // Real-time calculation on input change
        const inputs = calculatorForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.calculateWaterSavings();
            });
        });
    }

    calculateWaterSavings() {
        const areaInput = document.getElementById('calc-area');
        const cropSelect = document.getElementById('calc-crop');
        const techniqueSelect = document.getElementById('calc-technique');
        const resultsContainer = document.getElementById('calculator-results');

        if (!areaInput || !cropSelect || !techniqueSelect || !resultsContainer) return;

        const area = parseFloat(areaInput.value) || 0;
        const crop = cropSelect.value;
        const technique = techniqueSelect.value;

        if (area === 0) {
            resultsContainer.innerHTML = '<p class="calc-note">Enter area to see calculations</p>';
            return;
        }

        // Water consumption data (liters per m² per day)
        const cropWaterNeeds = {
            'tomato': 6,
            'cucumber': 8,
            'olive': 3,
            'wheat': 4,
            'citrus': 7
        };

        const techniqueEfficiency = {
            'drip': 0.9,
            'sprinkler': 0.75,
            'micro': 0.85,
            'surface': 0.6
        };

        const baseDailyConsumption = (cropWaterNeeds[crop] || 5) * area * 10000; // Convert hectares to m²
        const traditionalConsumption = baseDailyConsumption;
        const efficientConsumption = baseDailyConsumption * (techniqueEfficiency[technique] || 0.75);

        const dailySaving = traditionalConsumption - efficientConsumption;
        const annualSaving = dailySaving * 365;
        const costSaving = annualSaving * 0.5 / 1000; // Assuming 0.5 JOD per m³

        resultsContainer.innerHTML = `
            <div class="calculation-results">
                <div class="result-item highlight">
                    <span class="result-label">Daily Water Saving:</span>
                    <span class="result-value">${(dailySaving/1000).toFixed(1)} m³</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Annual Water Saving:</span>
                    <span class="result-value">${(annualSaving/1000).toFixed(0)} m³</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Annual Cost Saving:</span>
                    <span class="result-value">${costSaving.toFixed(0)} JOD</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Efficiency Improvement:</span>
                    <span class="result-value">${((1 - (techniqueEfficiency[technique] || 0.75)) * 100).toFixed(0)}%</span>
                </div>
            </div>
        `;

        // Animate results
        const resultItems = resultsContainer.querySelectorAll('.result-item');
        resultItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';

            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }

    setupInteractiveMaps() {
        // Simplified interactive regions
        const regionItems = document.querySelectorAll('.region-item');

        regionItems.forEach(item => {
            item.addEventListener('click', () => {
                const regionId = item.dataset.region;
                this.showRegionData(regionId);

                // Update active state
                regionItems.forEach(r => r.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    showRegionData(regionId) {
        const regionData = {
            'jordan-valley': {
                name: 'Jordan Valley',
                irrigation: 'Drip irrigation (85%)',
                coverage: '2,500 hectares',
                efficiency: '90%',
                projects: 3,
                description: 'Most advanced irrigation systems in Jordan'
            },
            'highlands': {
                name: 'Northern Highlands',
                irrigation: 'Mixed systems',
                coverage: '3,200 hectares',
                efficiency: '65%',
                projects: 2,
                description: 'Traditional olive groves with modern upgrades'
            }
            // Add more regions...
        };

        const region = regionData[regionId];
        if (!region) return;

        const infoPanel = document.getElementById('region-info');
        if (!infoPanel) return;

        infoPanel.innerHTML = `
            <div class="region-info-content">
                <h3>${region.name}</h3>
                <div class="region-stats">
                    <div class="stat-item">
                        <span class="stat-label">Primary System:</span>
                        <span class="stat-value">${region.irrigation}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Coverage:</span>
                        <span class="stat-value">${region.coverage}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Efficiency:</span>
                        <span class="stat-value">${region.efficiency}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Active Projects:</span>
                        <span class="stat-value">${region.projects}</span>
                    </div>
                </div>
                <p class="region-description">${region.description}</p>
            </div>
        `;

        infoPanel.classList.add('visible');
    }

    setupSimulation() {
        const simulateBtn = document.getElementById('simulate-btn');
        if (!simulateBtn) return;

        simulateBtn.addEventListener('click', () => {
            if (!this.simulationRunning) {
                this.startWaterSimulation();
            } else {
                this.stopWaterSimulation();
            }
        });
    }

    startWaterSimulation() {
        const simulateBtn = document.getElementById('simulate-btn');
        const simulationDisplay = document.getElementById('simulation-display');

        if (!simulateBtn || !simulationDisplay) return;

        this.simulationRunning = true;
        simulateBtn.textContent = 'Stop Simulation';
        simulateBtn.classList.add('running');

        // Create animated water flow visualization
        this.runWaterFlowAnimation(simulationDisplay);
    }

    runWaterFlowAnimation(container) {
        container.innerHTML = `
            <div class="water-simulation">
                <div class="water-source">💧 Water Source</div>
                <div class="flow-pipe"></div>
                <div class="irrigation-points">
                    <div class="point active">🌱</div>
                    <div class="point active">🌱</div>
                    <div class="point active">🌱</div>
                    <div class="point active">🌱</div>
                </div>
                <div class="simulation-stats">
                    <div class="stat">
                        <span class="stat-label">Flow Rate:</span>
                        <span class="stat-value" id="flow-rate">2.5 L/min</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Pressure:</span>
                        <span class="stat-value" id="pressure">1.8 bar</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Efficiency:</span>
                        <span class="stat-value" id="efficiency">89%</span>
                    </div>
                </div>
            </div>
        `;

        // Animate flow
        this.animateWaterFlow();
    }

    animateWaterFlow() {
        let flowRate = 2.5;
        let pressure = 1.8;
        let efficiency = 89;

        const flowInterval = setInterval(() => {
            if (!this.simulationRunning) {
                clearInterval(flowInterval);
                return;
            }

            // Simulate varying conditions
            flowRate = 2.5 + Math.sin(Date.now() * 0.001) * 0.5;
            pressure = 1.8 + Math.sin(Date.now() * 0.0015) * 0.2;
            efficiency = 89 + Math.sin(Date.now() * 0.0008) * 3;

            // Update display
            const flowElement = document.getElementById('flow-rate');
            const pressureElement = document.getElementById('pressure');
            const efficiencyElement = document.getElementById('efficiency');

            if (flowElement) flowElement.textContent = `${flowRate.toFixed(1)} L/min`;
            if (pressureElement) pressureElement.textContent = `${pressure.toFixed(1)} bar`;
            if (efficiencyElement) efficiencyElement.textContent = `${efficiency.toFixed(0)}%`;
        }, 100);
    }

    stopWaterSimulation() {
        const simulateBtn = document.getElementById('simulate-btn');
        const simulationDisplay = document.getElementById('simulation-display');

        this.simulationRunning = false;

        if (simulateBtn) {
            simulateBtn.textContent = 'Start Simulation';
            simulateBtn.classList.remove('running');
        }

        if (simulationDisplay) {
            simulationDisplay.innerHTML = '<p class="simulation-stopped">Simulation stopped</p>';
        }
    }

    loadIrrigationData() {
        // Create water efficiency chart
        this.createWaterEfficiencyChart();

        // Populate technique comparison table
        this.populateTechniquesTable();
    }

    createWaterEfficiencyChart() {
        const canvas = document.getElementById('waterEfficiencyChart');
        if (!canvas || !window.Chart) return;

        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Water Efficiency', 'Cost Effectiveness', 'Maintenance', 'Reliability', 'Scalability'],
                datasets: [
                    {
                        label: 'Drip Irrigation',
                        data: [90, 75, 85, 90, 80],
                        borderColor: '#226646',
                        backgroundColor: '#226646' + '20',
                        pointBackgroundColor: '#226646'
                    },
                    {
                        label: 'Sprinkler System',
                        data: [75, 85, 70, 85, 90],
                        borderColor: '#BE8A2F',
                        backgroundColor: '#BE8A2F' + '20',
                        pointBackgroundColor: '#BE8A2F'
                    },
                    {
                        label: 'Surface Irrigation',
                        data: [60, 95, 50, 70, 95],
                        borderColor: '#16a34a',
                        backgroundColor: '#16a34a' + '20',
                        pointBackgroundColor: '#16a34a'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    populateTechniquesTable() {
        const tableBody = document.querySelector('#techniques-table tbody');
        if (!tableBody) return;

        const techniques = [
            { name: 'Drip Irrigation', efficiency: 90, cost: 1200, area: 15000, saving: 40 },
            { name: 'Micro-Sprinkler', efficiency: 85, cost: 1000, area: 8500, saving: 30 },
            { name: 'Sprinkler System', efficiency: 75, cost: 800, area: 12000, saving: 25 },
            { name: 'Surface Irrigation', efficiency: 60, cost: 300, area: 25000, saving: 10 }
        ];

        tableBody.innerHTML = techniques.map(tech => `
            <tr>
                <td>${tech.name}</td>
                <td class="efficiency ${tech.efficiency >= 85 ? 'high' : tech.efficiency >= 70 ? 'medium' : 'low'}">${tech.efficiency}%</td>
                <td>$${tech.cost.toLocaleString()}</td>
                <td>${tech.area.toLocaleString()} ha</td>
                <td>${tech.saving}%</td>
            </tr>
        `).join('');
    }

    updateWithRealData() {
        if (!db.isLoaded) return;

        const irrigationData = db.getIrrigationData();

        // Update real statistics
        this.updateStatistic('irrigation-projects', irrigationData.totalProjects);
        this.updateStatistic('modern-coverage', irrigationData.modernIrrigationCoverage);
        this.updateStatistic('water-savings', irrigationData.waterSavings);
    }

    updateStatistic(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value.toString() + (elementId.includes('coverage') || elementId.includes('savings') ? '%' : '');
        }
    }
}

// Enhanced styles for irrigation page
const irrigationStyles = `
    .technique-card.selected {
        border: 2px solid #226646;
        transform: translateY(-5px) scale(1.02);
        box-shadow: 0 10px 25px rgba(34, 102, 70, 0.2);
    }

    .timeline-item {
        opacity: 0;
        transform: translateX(-30px);
        transition: all 0.6s ease;
    }

    .timeline-item.visible {
        opacity: 1;
        transform: translateX(0);
    }

    .timeline-item.active {
        background: #f0f9ff;
        border-left-color: #226646;
    }

    .calculation-results .result-item.highlight {
        background: linear-gradient(135deg, #226646, #16a34a);
        color: white;
        font-weight: 600;
    }

    .water-simulation {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        padding: 20px;
        background: linear-gradient(135deg, #f0f9ff, #e0f7fa);
        border-radius: 12px;
    }

    .flow-pipe {
        width: 200px;
        height: 4px;
        background: linear-gradient(90deg, #0ea5e9, #06b6d4);
        border-radius: 2px;
        position: relative;
        overflow: hidden;
    }

    .flow-pipe::after {
        content: '';
        position: absolute;
        top: 0;
        left: -20px;
        width: 20px;
        height: 100%;
        background: linear-gradient(90deg, transparent, #ffffff80, transparent);
        animation: flow 2s linear infinite;
    }

    @keyframes flow {
        0% { left: -20px; }
        100% { left: 220px; }
    }

    .irrigation-points {
        display: flex;
        gap: 15px;
    }

    .point {
        font-size: 1.5rem;
        animation: bounce 2s ease-in-out infinite;
    }

    .point:nth-child(2) { animation-delay: 0.2s; }
    .point:nth-child(3) { animation-delay: 0.4s; }
    .point:nth-child(4) { animation-delay: 0.6s; }

    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
    }

    .region-item {
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .region-item:hover {
        background: #f3f4f6;
        transform: translateY(-2px);
    }

    .region-item.active {
        background: #226646;
        color: white;
    }

    .suitability-tag {
        background: #e0f7fa;
        color: #0e7490;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        margin: 2px;
        display: inline-block;
    }

    [data-theme="dark"] .suitability-tag {
        background: #0f172a;
        color: #38bdf8;
    }
`;

// Inject irrigation styles
const irrigationStyleSheet = document.createElement('style');
irrigationStyleSheet.textContent = irrigationStyles;
document.head.appendChild(irrigationStyleSheet);

// Initialize irrigation page
const irrigationPage = new IrrigationPage();