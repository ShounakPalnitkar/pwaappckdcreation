// app.js - Core application functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all application components
    initFormControls();
    setupEventListeners();
});

// Global application state
const appState = {
    userRiskData: {},
    watchConnected: false,
    encryptionKey: null,
    bluetoothDevice: null
};

function initFormControls() {
    // Initialize diabetes duration field
    const diabetesSelect = document.getElementById('diabetes');
    const durationField = document.getElementById('duration');
    
    if (diabetesSelect && durationField) {
        diabetesSelect.addEventListener('change', function() {
            durationField.disabled = !(this.value === 'type1' || this.value === 'type2');
            durationField.required = !durationField.disabled;
            if (durationField.disabled) durationField.value = '0';
        });
    }

    // Initialize family history controls
    const familyHistorySelect = document.getElementById('family_history');
    const familyDiseasesContainer = document.getElementById('family-diseases-container');
    
    if (familyHistorySelect && familyDiseasesContainer) {
        familyHistorySelect.addEventListener('change', function() {
            familyDiseasesContainer.style.display = this.value !== 'no' ? 'block' : 'none';
            if (this.value === 'no') {
                document.querySelectorAll('input[name="family_diseases"]').forEach(el => el.checked = false);
            }
        });
    }
}

function setupEventListeners() {
    // Start assessment button
    document.getElementById('start-assessment-btn')?.addEventListener('click', function() {
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('assessment-form').classList.remove('hidden');
    });

    // Form submission
    document.getElementById('ckd-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        await calculateRisk();
    });

    // Reset button
    document.getElementById('reset-btn')?.addEventListener('click', resetForm);

    // Smartwatch connection
    document.getElementById('connect-watch-btn')?.addEventListener('click', function() {
        if (!appState.watchConnected) {
            connectSmartwatch();
        } else {
            disconnectSmartwatch();
        }
    });
}

async function calculateRisk() {
    const loadingSpinner = document.getElementById('loading-spinner');
    if (loadingSpinner) loadingSpinner.classList.remove('hidden');
    
    try {
        appState.userRiskData = gatherFormData();
        await calculateRiskWithHybridModel(); // API-based calculation
    } catch (apiError) {
        console.error('API failed, using fallback:', apiError);
        calculateRiskFallback(); // Client-side calculation
    } finally {
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
        displayResults();
        window.createVisualizations?.(); // Call chart.js functionality
        showResultsSection();
    }
}

function gatherFormData() {
    return {
        age: parseInt(document.getElementById('age').value),
        sex: document.getElementById('sex').value,
        race: document.getElementById('race').value,
        hypertension: document.getElementById('hypertension').value,
        diabetes: document.getElementById('diabetes').value,
        duration: parseInt(document.getElementById('duration').value) || 0,
        family_history: document.getElementById('family_history').value,
        familyDiseases: Array.from(document.querySelectorAll('input[name="family_diseases"]:checked')).map(el => el.value),
        bmi: parseFloat(document.getElementById('bmi').value),
        smoking: document.getElementById('smoking').value,
        cardiovascular: document.getElementById('cardiovascular').value,
        symptoms: Array.from(document.querySelectorAll('input[name="symptoms"]:checked')).map(el => el.value),
        watchData: appState.watchConnected ? getWatchData() : null
    };
}

function showResultsSection() {
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('visualizations').classList.remove('hidden');
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
    document.getElementById('ckd-form').reset();
    document.getElementById('result').classList.add('hidden');
    document.getElementById('visualizations').classList.add('hidden');
    document.getElementById('welcome-screen').classList.remove('hidden');
    document.getElementById('assessment-form').classList.add('hidden');
    
    if (appState.watchConnected) disconnectSmartwatch();
    window.riskCharts = {}; // Reset charts
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Smartwatch functions
async function connectSmartwatch() {
    try {
        if (!navigator.bluetooth) throw new Error('Web Bluetooth not supported');
        
        appState.bluetoothDevice = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['heart_rate', 'blood_pressure'] }]
        });
        
        // Update UI and connect...
        appState.watchConnected = true;
    } catch (error) {
        console.error('Connection failed:', error);
        appState.watchConnected = false;
    }
}

function disconnectSmartwatch() {
    if (appState.bluetoothDevice?.gatt?.connected) {
        appState.bluetoothDevice.gatt.disconnect();
    }
    appState.watchConnected = false;
    appState.bluetoothDevice = null;
}
