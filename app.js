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

// Helper function (no change)
function getGaugeColor(value, levels) {
   if (value < levels[0]) return "#67E667"; // Good
   if (value < levels[1]) return "#FFD166"; // Moderate
   if (value < levels[2]) return "#FF6B6B"; // Unhealthy
   return "#A40606"; // Hazardous
}

// PM2.5 Gauge (no change)
var gPm25 = new JustGage({
   id: 'pm25-gauge',
   value: 0,
   min: 0,
   max: 150,
   title: ' ',
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
   },
   valueFontColor: "#fff",
});

// PM10 Gauge (no change)
var gPm10 = new JustGage({
   id: 'pm10-gauge',
   value: 0,
   min: 0,
   max: 250,
   title: ' ',
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
   },
   valueFontColor: "#fff",
});

// Temperature Gauge (no change)
var gTemp = new JustGage({
   id: 'temp-gauge',
   value: 0,
   min: -10,
   max: 50,
   title: ' ',
   symbol: '°C',
   decimals: 1,
   humanFriendly: false,
   levelColors: ["#007BFF", "#67E667", "#FF6B6B"],
   levelColorsGradient: true
});

// Humidity Gauge (no change)
var gHum = new JustGage({
   id: 'hum-gauge',
   value: 0,
   min: 0,
   max: 100,
   title: ' ',
   symbol: '%',
   decimals: 0,
   humanFriendly: false,
   levelColors: ["#FFD166", "#67E667", "#007BFF"],
   levelColorsGradient: true
});

// NEW: CO Gauge
var gCO = new JustGage({
   id: 'co-gauge',
   value: 0,
   min: 0,
   max: 50, // Max 50 ppm
   title: ' ',
   symbol: 'ppm',
   decimals: 1,
   humanFriendly: false,
   levelColors: ["#67E667", "#FFD166", "#FF6B6B"], // Good, Moderate, Unhealthy
   levelColorsGradient: true
});

// NEW: CO2 Gauge
var gCO2 = new JustGage({
   id: 'co2-gauge',
   value: 400,
   min: 400, // Atmospheric level
   max: 3000, // Unhealthy indoor level
   title: ' ',
   symbol: 'ppm',
   decimals: 0,
   humanFriendly: false,
   levelColors: ["#67E667", "#FFD166", "#FF6B6B"], // Good, Moderate, Unhealthy
   levelColorsGradient: true
});

// NEW: NO2 Gauge
var gNO2 = new JustGage({
   id: 'no2-gauge',
   value: 0,
   min: 0,
   max: 0.5, // Max 0.5 ppm
   title: ' ',
   symbol: 'ppm',
   decimals: 3, // Needs more precision
   humanFriendly: false,
   levelColors: ["#67E667", "#FFD166", "#FF6B6B"], // Good, Moderate, Unhealthy
   levelColorsGradient: true
});


// -----------------------------------------------------------------
// 3. CHART INITIALIZATION (using Chart.js)
// -----------------------------------------------------------------
const CHART_HISTORY_LIMIT = 30;

// --- Pollution Chart (PM2.5 & PM10) --- (no change)
const pollutionChartCtx = document.getElementById('pollutionChart').getContext('2d');
const pollutionChart = new Chart(pollutionChartCtx, {
   type: 'line',
   data: {
       labels: [], // Timestamps
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
               time: { unit: 'second', displayFormats: { second: 'h:mm:ss a' } },
               title: { display: true, text: 'Time' }
           },
           y: {
               title: { display: true, text: 'μg/m³' },
               beginAtZero: true
           }
       }
   }
});

// --- Environment Chart (Temp & Humidity) --- (no change)
const envChartCtx = document.getElementById('envChart').getContext('2d');
const envChart = new Chart(envChartCtx, {
   type: 'line',
   data: {
       labels: [], // Timestamps
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
               time: { unit: 'second', displayFormats: { second: 'h:mm:ss a' } },
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

// NEW: --- Gas Chart (CO, CO2, NO2) ---
const gasChartCtx = document.getElementById('gasChart').getContext('2d');
const gasChart = new Chart(gasChartCtx, {
   type: 'line',
   data: {
       labels: [], // Timestamps
       datasets: [{
           label: 'CO',
           data: [],
           borderColor: '#FFA500', // Orange
           backgroundColor: 'rgba(255, 165, 0, 0.1)',
           fill: true,
           tension: 0.3,
           yAxisID: 'yGas' // CO and NO2 share an axis
       }, {
           label: 'NO2',
           data: [],
           borderColor: '#8B4513', // Brown
           backgroundColor: 'rgba(139, 69, 19, 0.1)',
           fill: true,
           tension: 0.3,
           yAxisID: 'yGas' // CO and NO2 share an axis
       }, {
           label: 'CO2',
           data: [],
           borderColor: '#808080', // Gray
           backgroundColor: 'rgba(128, 128, 128, 0.1)',
           fill: true,
           tension: 0.3,
           yAxisID: 'yCO2' // CO2 gets its own axis due to different scale
       }]
   },
   options: {
       responsive: true,
       maintainAspectRatio: false,
       scales: {
           x: {
               type: 'time',
               time: { unit: 'second', displayFormats: { second: 'h:mm:ss a' } },
               title: { display: true, text: 'Time' }
           },
           yGas: { // Y-axis for CO and NO2 (low ppm)
               type: 'linear',
               position: 'left',
               title: { display: true, text: 'CO & NO2 (ppm)' },
               beginAtZero: true
           },
           yCO2: { // Y-axis for CO2 (high ppm)
               type: 'linear',
               position: 'right',
               title: { display: true, text: 'CO2 (ppm)' },
               beginAtZero: false, // Start near atmospheric level
               min: 400,
               grid: { drawOnChartArea: false }
           }
       }
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

       // Update Gauges
       gPm25.refresh(data.pm25);
       gPm10.refresh(data.pm10);
       gTemp.refresh(data.temperature);
       gHum.refresh(data.humidity);
       // NEW: Update new gauges
       gCO.refresh(data.co);
       gCO2.refresh(data.co2);
       gNO2.refresh(data.no2);

       // Update Gauge Text Values
       document.getElementById('pm25-value').textContent = data.pm25.toFixed(0);
       document.getElementById('pm10-value').textContent = data.pm10.toFixed(0);
       document.getElementById('temp-value').textContent = data.temperature.toFixed(1);
       document.getElementById('hum-value').textContent = data.humidity.toFixed(0);
       // NEW: Update new text values
       document.getElementById('co-value').textContent = data.co.toFixed(1);
       document.getElementById('co2-value').textContent = data.co2.toFixed(0);
       document.getElementById('no2-value').textContent = data.no2.toFixed(3);


       // Update Last Updated Timestamp
       const now = new Date();
       document.getElementById('last-updated').textContent = now.toLocaleString();
       
       // Update AQI Status Boxes
       updateAQIStatus('pm25', data.pm25);
       updateAQIStatus('pm10', data.pm10);
       // NEW: Update new status boxes
       updateAQIStatus('co', data.co);
       updateAQIStatus('co2', data.co2);
       updateAQIStatus('no2', data.no2);
   }
});

// --- Listener for HISTORICAL data (charts) ---
const historyDataRef = database.ref('sensor_data/history').limitToLast(CHART_HISTORY_LIMIT);
historyDataRef.on('value', (snapshot) => {
   const data = snapshot.val();
   if (data) {
       console.log("History data received:", data);

       // Clear existing chart data
       pollutionChart.data.labels = [];
       pollutionChart.data.datasets[0].data = []; // PM2.5
       pollutionChart.data.datasets[1].data = []; // PM10
       
       envChart.data.labels = [];
       envChart.data.datasets[0].data = []; // Temp
       envChart.data.datasets[1].data = []; // Humidity

       // NEW: Clear gas chart data
       gasChart.data.labels = [];
       gasChart.data.datasets[0].data = []; // CO
       gasChart.data.datasets[1].data = []; // NO2
       gasChart.data.datasets[2].data = []; // CO2

       // Loop through historical data and add to charts
       for (const key in data) {
           const record = data[key];
           const timestamp = new Date(record.timestamp); 

           // Add to Pollution Chart
           pollutionChart.data.labels.push(timestamp);
           pollutionChart.data.datasets[0].data.push(record.pm25);
           pollutionChart.data.datasets[1].data.push(record.pm10);

           // Add to Environment Chart
           envChart.data.labels.push(timestamp);
           envChart.data.datasets[0].data.push(record.temperature);
           envChart.data.datasets[1].data.push(record.humidity);

           // NEW: Add to Gas Chart
           gasChart.data.labels.push(timestamp);
           gasChart.data.datasets[0].data.push(record.co);
           gasChart.data.datasets[1].data.push(record.no2);
           gasChart.data.datasets[2].data.push(record.co2);
       }

       // Update charts
       pollutionChart.update();
       envChart.update();
       // NEW: Update gas chart
       gasChart.update();
   }
});


// -----------------------------------------------------------------
// 5. HELPER FUNCTIONS
// -----------------------------------------------------------------

// Updates the status boxes with a color and text
function updateAQIStatus(type, value) {
   let statusText = '';
   let statusColor = '#f0f2f5'; // Default background
   let card = document.getElementById(`${type}-card`);

   // PM2.5 levels (no change)
   if (type === 'pm25') {
       if (value <= 12) {
           statusText = 'Good';
           statusColor = '#67E667'; // Green
       } else if (value <= 35.4) {
           statusText = 'Moderate';
           statusColor = '#FFD166'; // Yellow
       } else if (value <= 55.4) {
           statusText = 'Unhealthy (SG)';
           statusColor = '#FF9F40'; // Orange
       } else if (value <= 150.4) {
           statusText = 'Unhealthy';
           statusColor = '#FF6B6B'; // Red
       } else {
           statusText = 'Hazardous';
           statusColor = '#A40606'; // Maroon
       }
   // PM10 levels (no change)
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
   // NEW: CO levels (in ppm)
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
   // NEW: CO2 levels (in ppm)
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
   // NEW: NO2 levels (in ppm)
   } else if (type === 'no2') {
       if (value <= 0.053) { // ~53 ppb
           statusText = 'Good';
           statusColor = '#67E667';
       } else if (value <= 0.1) { // ~100 ppb
           statusText = 'Moderate';
           statusColor = '#FFD166';
       } else if (value <= 0.36) { // ~360 ppb
           statusText = 'Unhealthy (SG)';
           statusColor = '#FF9F40';
       } else {
           statusText = 'Unhealthy';
           statusColor = '#FF6B6B';
       }
   }

   // Apply the style
   const statusBox = document.getElementById(`${type}-status`);
   // Check if statusBox exists (it won't for temp/humidity)
   if (statusBox) {
       statusBox.textContent = statusText;
       statusBox.style.backgroundColor = statusColor;
       // Set text color to white for better contrast
       if (statusColor !== '#f0f2f5') {
           statusBox.style.color = '#ffffff';
       } else {
           statusBox.style.color = '#333';
       }
   }
}