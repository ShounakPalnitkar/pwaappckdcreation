// chart.js - All chart rendering functionality
const ChartManager = {
    charts: {},
    
    init: function() {
        // Initialize any chart-related setup
    },
    
    createAll: function(userData) {
        this.createFactorsChart(userData);
        this.createBarChart(userData);
        this.createProbabilityChart(userData);
        this.createRadarChart(userData);
        this.createRiskFactorsTable(userData);
        this.createUrgentWarning(userData);
        this.createPersonalRecommendations(userData);
    },
    
    createFactorsChart: function(userData) {
        const ctx = document.getElementById('factorsChart')?.getContext('2d');
        if (!ctx) return;
        
        if (this.charts.factorsChart) {
            this.charts.factorsChart.destroy();
        }
        
        // Process data and create chart
        const sortedFactors = [...userData.riskFactors]
            .filter(factor => factor.value > 0)
            .sort((a, b) => (b.value / b.max) - (a.value / a.max));
        
        this.charts.factorsChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: sortedFactors.slice(0, 6).map(f => f.name),
                datasets: [{
                    data: sortedFactors.slice(0, 6).map(f => f.value),
                    backgroundColor: ['#1a6fc9', '#27ae60', '#f39c12', '#e74c3c', '#9b59b6', '#3498db'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    datalabels: {
                        formatter: (value, ctx) => {
                            const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            return Math.round((value / total) * 100) + '%';
                        },
                        color: '#fff'
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
        
        this.updateFactorsLegend(sortedFactors);
    },
    
    updateFactorsLegend: function(factors) {
        const legendContainer = document.getElementById('factors-legend');
        if (!legendContainer) return;
        
        const total = factors.slice(0, 6).reduce((sum, f) => sum + f.value, 0);
        legendContainer.innerHTML = `
            <p><strong>Top contributing factors:</strong></p>
            <ul>
                ${factors.slice(0, 6).map((f, i) => `
                <li style="color: ${['#1a6fc9', '#27ae60', '#f39c12', '#e74c3c', '#9b59b6', '#3498db'][i]}">
                    <strong>${f.name}${f.details ? ' (' + f.details + ')' : ''}:</strong> 
                    ${f.value} pts (${Math.round((f.value / total) * 100)}%)
                </li>
                `).join('')}
            </ul>
        `;
    },
    
    // Other chart creation methods...
    createBarChart: function(userData) {
        // Bar chart implementation...
    },
    
    createProbabilityChart: function(userData) {
        // Probability chart implementation...
    },
    
    // Additional helper methods...
    downloadAsImage: function() {
        const element = document.getElementById('visualization-content');
        if (!element) return;
        
        html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `ckd-risk-${new Date().toISOString().slice(0,10)}.png`;
            link.href = canvas.toDataURL();
            link.click();
        });
    }
};

// Make available globally
window.createVisualizations = function() {
    ChartManager.createAll(window.userRiskData);
};

window.riskCharts = ChartManager.charts;
