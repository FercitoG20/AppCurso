document.addEventListener('DOMContentLoaded', () => {
    
    if (typeof chartData === 'undefined' || chartData.nombresJuegos.length === 0) {
        return;
    }

    Chart.defaults.color = '#a0aec0';
    Chart.defaults.font.family = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

    const ctxLine = document.getElementById('lineChart');
    if (ctxLine) {
        new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: chartData.nombresJuegos,
                datasets: [{
                    label: 'Intentos por Misión',
                    data: chartData.intentosJuegos,
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#00ff88',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3 
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true, 
                        suggestedMax: 5, 
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: { stepSize: 1 } 
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // 2. GRÁFICA DE DONA
    const ctxDoughnut = document.getElementById('doughnutChart');
    if (ctxDoughnut) {
        new Chart(ctxDoughnut, {
            type: 'doughnut',
            data: {
                labels: chartData.nombresIslas,
                datasets: [{
                    data: chartData.conteoIslas,
                    backgroundColor: [
                        '#00ff88', 
                        '#3498db', 
                        '#9b59b6', 
                        '#f1c40f', 
                        '#e74c3c'  
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%', 
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e2e8f0',
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }
});