document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('reset').addEventListener('click', resetOptions);

const inputs = document.querySelectorAll('input[type="color"]');

// Add change listener to all inputs to auto-save
inputs.forEach(input => {
    input.addEventListener('change', saveOptions);
});

function saveOptions() {
    const theme = {};
    inputs.forEach(input => {
        theme[input.id] = input.value;
    });

    chrome.storage.sync.set({ aikenTheme: theme }, () => {
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 1000);
        
        // Notify active tabs to update immediately
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {action: "updateTheme", theme: theme});
            }
        });
    });
}

function restoreOptions() {
    chrome.storage.sync.get({ aikenTheme: null }, (items) => {
        const theme = items.aikenTheme || {};
        inputs.forEach(input => {
            if (theme[input.id]) {
                input.value = theme[input.id];
            } else {
                input.value = input.dataset.default;
            }
        });
    });
}

function resetOptions() {
    const theme = {};
    inputs.forEach(input => {
        input.value = input.dataset.default;
        theme[input.id] = input.value;
    });
    saveOptions();
}
