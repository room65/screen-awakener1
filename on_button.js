
let wakeLock = null;
const toggleButton = document.getElementById('toggleWakeLockButton');
const statusMessage = document.getElementById('statusMessage');
const currentTimeElement = document.getElementById('currentTime');

// --- Wake Lock API Logic ---
async function acquireWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
            console.log('Wake Lock was released by system or manually.');
            updateUI('inactive');
        });
        console.log('Wake Lock is active!');
        updateUI('active');
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
        alert(`Failed to activate screen keep-alive: ${err.message}. Please ensure your browser supports Wake Lock API and you grant permission.`);
        updateUI('error');
    }
}

function releaseWakeLock() {
    if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
        console.log('Wake Lock released manually.');
        updateUI('inactive');
    }
}

function updateUI(state) {
    if (state === 'active') {
        statusMessage.textContent = 'Status: Active (Screen will not sleep)';
        statusMessage.classList.remove('inactive', 'error');
        statusMessage.classList.add('active');
        toggleButton.textContent = 'OFF';
        toggleButton.classList.remove('off');
    } else if (state === 'inactive') {
        statusMessage.textContent = 'Status: Inactive (Screen can sleep)';
        statusMessage.classList.remove('active', 'error');
        statusMessage.classList.add('inactive');
        toggleButton.textContent = 'ON';
        toggleButton.classList.add('off');
    } else if (state === 'error') {
            statusMessage.textContent = 'Status: Error (API not supported or permission denied)';
            statusMessage.classList.remove('active', 'inactive');
            statusMessage.classList.add('error');
            toggleButton.textContent = 'N/A';
            toggleButton.disabled = true;
    }
}

// --- Current Time Logic ---
function updateCurrentTime() {
    const now = new Date();
    // Using toLocaleTimeString for a user-friendly format based on locale
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    const timeString = now.toLocaleTimeString(undefined, timeOptions);
    const dateString = now.toLocaleDateString(undefined, dateOptions);

    // You can adjust the format here:
    currentTimeElement.textContent = `Current Time: ${timeString}\nDate: ${dateString}`;
}

// --- Event Listeners and Initial Setup ---
toggleButton.addEventListener('click', () => {
    if (wakeLock) {
        releaseWakeLock();
    } else {
        acquireWakeLock();
    }
});

document.addEventListener('visibilitychange', () => {
    if ('wakeLock' in navigator && document.visibilityState === 'visible') {
        if (!wakeLock) { // Re-acquire if it was released due to visibility change
            acquireWakeLock();
        }
    } else if (wakeLock !== null && document.visibilityState === 'hidden') {
        updateUI('inactive'); // Assume inactive when hidden
    }
});

// Initial check for Wake Lock API support
if ('wakeLock' in navigator) {
    console.log("Wake Lock API is supported!");
    updateUI('inactive'); // Start with inactive state, button says 'ON'
} else {
    console.warn("Wake Lock API is NOT supported in this browser.");
    updateUI('error'); // Display error if API not supported
}

// Update time immediately and then every second
updateCurrentTime();
setInterval(updateCurrentTime, 1000); // Update every 1 second

