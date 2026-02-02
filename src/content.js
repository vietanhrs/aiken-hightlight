function debug(msg) {
    console.log(`[AikenHL] ${msg}`);
}

function isAikenFile(filename) {
    return filename && filename.endsWith('.ak');
}

function getFilename(el) {
    const title = el.querySelector('.file-title-name');
    if (title) {
        if (title.getAttribute('data-path')) return title.getAttribute('data-path');
        if (title.textContent) return title.textContent.trim();
    }
    if (el.getAttribute('data-path')) return el.getAttribute('data-path');
    
    return "";
}

function applyHighlighting(fileHolder) {
    const codeLines = fileHolder.querySelectorAll('.line_content');
    
    // Check if we already processed this exact number of lines
    if (fileHolder.dataset.aikenProcessed === "true" && 
        parseInt(fileHolder.dataset.processedLineCount || "0") === codeLines.length) {
        return;
    }
    
    const filename = getFilename(fileHolder);
    
    if (!isAikenFile(filename)) {
        return;
    }
    
    debug(`Found Aiken file: ${filename} (${codeLines.length} lines)`);
    
    if (codeLines.length === 0) return;
    
    codeLines.forEach(line => {
        let target = line.querySelector('span.line');
        if (!target) target = line;
        
        if (target.querySelector('.aiken-keyword') || target.classList.contains('aiken-highlighted')) return;

        const originalText = target.textContent;
        if (!originalText) return;

        if (typeof window.highlightAiken === 'function') {
           const newHtml = window.highlightAiken(originalText);
           target.innerHTML = newHtml;
           target.classList.add('aiken-highlighted');
        }
    });

    fileHolder.dataset.aikenProcessed = "true";
    fileHolder.dataset.processedLineCount = codeLines.length;
}

// Theme handling
function updateThemeVariables(theme) {
    if (!theme) return;
    const root = document.documentElement;
    if (theme.keyword) root.style.setProperty('--aiken-keyword', theme.keyword);
    if (theme.function) root.style.setProperty('--aiken-function', theme.function);
    if (theme.string) root.style.setProperty('--aiken-string', theme.string);
    if (theme.number) root.style.setProperty('--aiken-number', theme.number);
    if (theme.comment) root.style.setProperty('--aiken-comment', theme.comment);
    if (theme.type) root.style.setProperty('--aiken-type', theme.type);
    if (theme.operator) root.style.setProperty('--aiken-operator', theme.operator);
}

function loadTheme() {
    chrome.storage.sync.get({ aikenTheme: null }, (items) => {
        if (items.aikenTheme) {
            updateThemeVariables(items.aikenTheme);
        }
    });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateTheme") {
        updateThemeVariables(request.theme);
    }
});

// Initial theme load
loadTheme();

function scanForFiles() {
    const holders = document.querySelectorAll('.file-holder');
    holders.forEach(applyHighlighting);
}

scanForFiles();

const observer = new MutationObserver((mutations) => {
    let shouldScan = false;
    for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
            shouldScan = true;
            break;
        }
    }
    if (shouldScan) {
        scanForFiles();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

debug("Content script loaded and observing.");
