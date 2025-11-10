// -----------------------------------------------------------------
// 1. FIREBASE CONFIGURATION
// -----------------------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyDp0dQTnC8ndS1Iz4zs1vBi94GmRO7b1Eg",
    authDomain: "pollution-monitoring-2bbe1.firebaseapp.com",
    databaseURL: "https://pollution-monitoring-2bbe1-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "pollution-monitoring-2bbe1",
    storageBucket: "pollution-monitoring-2bbe1.firebasestorage.app",
    messagingSenderId: "724194484986",
    appId: "1:724194484986:web:dd6ebe52f1adaa93225f43"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// -----------------------------------------------------------------
// 2. GAUGE INITIALIZATION (using JustGage)
// -----------------------------------------------------------------

// PM2.5 Gauge
var gPm25 = new JustGage({
    id: 'pm25-gauge',
    value: 0,
    min: 0,
    max: 150,
    title: 'μg/m³',
    humanFriendly: true,
    levelColors: ["#67E667", "#FFD166", "#FF6B6B"],
    levelColorsGradient: true,
    customSectors: {
        percents: true,
        ranges: [{
            color: "#67E667", lo: 0, hi: 33.3 
        }, {
            color: "#FFD166", lo: 33.4, hi: 66.6
        }, {
            color: "#FF6B6B", lo: 66.7, hi: 100
        }]
    }
});

// PM10 Gauge
var gPm10 = new JustGage({
    id: 'pm10-gauge',
    value: 0,
    min: 0,
    max: 250,
    title: 'μg/m³',
    humanFriendly: true,
    customSectors: {
        percents: true,
        ranges: [{
            color: "#67E667", lo: 0, hi: 21.6
        }, {
            color: "#FFD166", lo: 21.7, hi: 61.6
        }, {
            color: "#FF6B6B", lo: 61.7, hi: 100
        }]
    }
});

// Temperature Gauge
var gTemp = new JustGage({
    id: 'temp-gauge',
    value: 0,
    min: -10,
    max: 50,
    title: '°C',
    decimals: 1,
    humanFriendly: false,
    levelColors: ["#007BFF", "#67E667", "#FF6B6B"],
    levelColorsGradient: true
});

// Humidity Gauge
var gHum = new JustGage({
    id: 'hum-gauge',
    value: 0,
    min: 0,
    max: 100,
    title: '%',
    decimals: 0,
    humanFriendly: false,
    levelColors: ["#FFD166", "#67E667", "#007BFF"],
    levelColorsGradient: true
});

// CO Gauge
var gCO = new JustGage({
    id: 'co-gauge',
    value: 0,
    min: 0,
    max: 50,
    title: 'ppm',
    decimals: 1,
    humanFriendly: false,
    levelColors: ["#67E667", "#FFD166", "#FF6B6B"],
    levelColorsGradient: true
});

// CO2 Gauge
var gCO2 = new JustGage({
    id: 'co2-gauge',
    value: 400,
    min: 400,
    max: 3000,
    title: 'ppm',
    decimals: 0,
    humanFriendly: false,
    levelColors: ["#67E667", "#FFD166", "#FF6B6B"],
    levelColorsGradient: true
});

// NO2 Gauge
var gNO2 = new JustGage({
    id: 'no2-gauge',
    value: 0,
    min: 0,
    max: 0.5,
    title: 'ppm',
    decimals: 3,
    humanFriendly: false,
    levelColors: ["#67E667", "#FFD166", "#FF6B6B"],
    levelColorsGradient: true
});

// -----------------------------------------------------------------
// 3. CHART INITIALIZATION (using Chart.js)
// -----------------------------------------------------------------
const CHART_HISTORY_LIMIT = 30;

// Initialize charts as null - will be created after DOM is ready
let pollutionChart = null;
let envChart = null;
let gasChart = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing charts...");
    
    // --- Pollution Chart (PM2.5 & PM10) ---
    const pollutionChartCtx = document.getElementById('pollutionChart');
    if (pollutionChartCtx) {
        console.log("Creating pollution chart");
        pollutionChart = new Chart(pollutionChartCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'PM2.5',
                    data: [],
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    fill: true,
                    tension: 0.3
                }, {
                    label: 'PM10',
                    data: [],
                    borderColor: '#FFD166',
                    backgroundColor: 'rgba(255, 209, 102, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: { 
                            unit: 'minute', 
                            displayFormats: { minute: 'h:mm a' } 
                        },
                        title: { display: true, text: 'Time' }
                    },
                    y: {
                        title: { display: true, text: 'μg/m³' },
                        beginAtZero: true
                    }
                }
            }
        });
    } else {
        console.error("pollutionChart canvas not found!");
    }

    // --- Environment Chart (Temp & Humidity) ---
    const envChartCtx = document.getElementById('envChart');
    if (envChartCtx) {
        console.log("Creating environment chart");
        envChart = new Chart(envChartCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Temperature',
                    data: [],
                    borderColor: '#007BFF',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'yTemp'
                }, {
                    label: 'Humidity',
                    data: [],
                    borderColor: '#67E667',
                    backgroundColor: 'rgba(103, 230, 103, 0.1)',
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'yHum'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: { 
                            unit: 'minute', 
                            displayFormats: { minute: 'h:mm a' } 
                        },
                        title: { display: true, text: 'Time' }
                    },
                    yTemp: {
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'Temperature (°C)' },
                        beginAtZero: false
                    },
                    yHum: {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'Humidity (%)' },
                        beginAtZero: true,
                        max: 100,
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    } else {
        console.error("envChart canvas not found!");
    }

    // --- Gas Chart (CO, CO2, NO2) ---
    const gasChartCtx = document.getElementById('gasChart');
    if (gasChartCtx) {
        console.log("Creating gas chart");
        gasChart = new Chart(gasChartCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'CO',
                    data: [],
                    borderColor: '#FFA500',
                    backgroundColor: 'rgba(255, 165, 0, 0.1)',
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'yGas'
                }, {
                    label: 'NO2',
                    data: [],
                    borderColor: '#8B4513',
                    backgroundColor: 'rgba(139, 69, 19, 0.1)',
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'yGas'
                }, {
                    label: 'CO2',
                    data: [],
                    borderColor: '#808080',
                    backgroundColor: 'rgba(128, 128, 128, 0.1)',
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'yCO2'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: { 
                            unit: 'minute', 
                            displayFormats: { minute: 'h:mm a' } 
                        },
                        title: { display: true, text: 'Time' }
                    },
                    yGas: {
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'CO & NO2 (ppm)' },
                        beginAtZero: true
                    },
                    yCO2: {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'CO2 (ppm)' },
                        beginAtZero: false,
                        min: 400,
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    } else {
        console.error("gasChart canvas not found!");
    }
});

// -----------------------------------------------------------------
// 4. FIREBASE DATA LISTENERS
// -----------------------------------------------------------------

// --- Listener for LIVE data (gauges and status) ---
const liveDataRef = database.ref('sensor_data/live');
liveDataRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        console.log("Live data received:", data);

        // Update Gauges (JustGage displays the values itself)
        if (gPm25) gPm25.refresh(data.pm25 || 0);
        if (gPm10) gPm10.refresh(data.pm10 || 0);
        if (gTemp) gTemp.refresh(data.temperature || 0);
        if (gHum) gHum.refresh(data.humidity || 0);
        if (gCO) gCO.refresh(data.co || 0);
        if (gCO2) gCO2.refresh(data.co2 || 400);
        if (gNO2) gNO2.refresh(data.no2 || 0);

        // Update Last Updated Timestamp
        const now = new Date();
        document.getElementById('last-updated').textContent = now.toLocaleString();
        
        // Update AQI Status Boxes
        updateAQIStatus('pm25', data.pm25 || 0);
        updateAQIStatus('pm10', data.pm10 || 0);
        updateAQIStatus('co', data.co || 0);
        updateAQIStatus('co2', data.co2 || 400);
        updateAQIStatus('no2', data.no2 || 0);
    }
});

// --- Listener for HISTORICAL data (charts) ---
const historyDataRef = database.ref('sensor_data/history').limitToLast(CHART_HISTORY_LIMIT);
historyDataRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data && pollutionChart && envChart && gasChart) {
        console.log("History data received:", data);

        // Clear existing chart data
        pollutionChart.data.labels = [];
        pollutionChart.data.datasets[0].data = [];
        pollutionChart.data.datasets[1].data = [];
        
        envChart.data.labels = [];
        envChart.data.datasets[0].data = [];
        envChart.data.datasets[1].data = [];

        gasChart.data.labels = [];
        gasChart.data.datasets[0].data = [];
        gasChart.data.datasets[1].data = [];
        gasChart.data.datasets[2].data = [];

        // Loop through historical data and add to charts
        for (const key in data) {
            const record = data[key];
            const timestamp = new Date(record.timestamp); 

            // Add to Pollution Chart
            pollutionChart.data.labels.push(timestamp);
            pollutionChart.data.datasets[0].data.push(record.pm25 || 0);
            pollutionChart.data.datasets[1].data.push(record.pm10 || 0);

            // Add to Environment Chart
            envChart.data.labels.push(timestamp);
            envChart.data.datasets[0].data.push(record.temperature || 0);
            envChart.data.datasets[1].data.push(record.humidity || 0);

            // Add to Gas Chart
            gasChart.data.labels.push(timestamp);
            gasChart.data.datasets[0].data.push(record.co || 0);
            gasChart.data.datasets[1].data.push(record.no2 || 0);
            gasChart.data.datasets[2].data.push(record.co2 || 400);
        }

        // Update charts
        pollutionChart.update();
        envChart.update();
        gasChart.update();
    } else if (!pollutionChart || !envChart || !gasChart) {
        console.error("Charts not initialized yet!");
    }
});

// -----------------------------------------------------------------
// 5. HELPER FUNCTIONS
// -----------------------------------------------------------------

function updateAQIStatus(type, value) {
    let statusText = '';
    let statusColor = '#f0f2f5';

    if (type === 'pm25') {
        if (value <= 12) {
            statusText = 'Good';
            statusColor = '#67E667';
        } else if (value <= 35.4) {
            statusText = 'Moderate';
            statusColor = '#FFD166';
        } else if (value <= 55.4) {
            statusText = 'Unhealthy (SG)';
            statusColor = '#FF9F40';
        } else if (value <= 150.4) {
            statusText = 'Unhealthy';
            statusColor = '#FF6B6B';
        } else {
            statusText = 'Hazardous';
            statusColor = '#A40606';
        }
    } else if (type === 'pm10') {
        if (value <= 54) {
            statusText = 'Good';
            statusColor = '#67E667';
        } else if (value <= 154) {
            statusText = 'Moderate';
            statusColor = '#FFD166';
        } else if (value <= 254) {
            statusText = 'Unhealthy (SG)';
            statusColor = '#FF9F40';
        } else if (value <= 354) {
            statusText = 'Unhealthy';
            statusColor = '#FF6B6B';
        } else {
            statusText = 'Hazardous';
            statusColor = '#A40606';
        }
    } else if (type === 'co') {
        if (value <= 4.4) {
            statusText = 'Good';
            statusColor = '#67E667';
        } else if (value <= 9.4) {
            statusText = 'Moderate';
            statusColor = '#FFD166';
        } else if (value <= 15.4) {
            statusText = 'Unhealthy (SG)';
            statusColor = '#FF9F40';
        } else {
            statusText = 'Hazardous';
            statusColor = '#FF6B6B';
        }
    } else if (type === 'co2') {
        if (value <= 1000) {
            statusText = 'Good (Indoors)';
            statusColor = '#67E667';
        } else if (value <= 2000) {
            statusText = 'Moderate';
            statusColor = '#FFD166';
        } else {
            statusText = 'Poor Air';
            statusColor = '#FF6B6B';
        }
    } else if (type === 'no2') {
        if (value <= 0.053) {
            statusText = 'Good';
            statusColor = '#67E667';
        } else if (value <= 0.1) {
            statusText = 'Moderate';
            statusColor = '#FFD166';
        } else if (value <= 0.36) {
            statusText = 'Unhealthy (SG)';
            statusColor = '#FF9F40';
        } else {
            statusText = 'Unhealthy';
            statusColor = '#FF6B6B';
        }
    }

    const statusBox = document.getElementById(`${type}-status`);
    if (statusBox) {
        statusBox.textContent = statusText;
        statusBox.style.backgroundColor = statusColor;
        if (statusColor !== '#f0f2f5') {
            statusBox.style.color = '#ffffff';
        } else {
            statusBox.style.color = '#333';
        }
    }
}
