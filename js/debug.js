// Debug utility for logging
const debug = {
    // Log levels
    levels: {
        info: { color: '#7fdbff', prefix: 'INFO' },
        warn: { color: '#ffdc00', prefix: 'WARN' },
        error: { color: '#ff4136', prefix: 'ERROR' },
        log: { color: '#fff', prefix: 'LOG' }
    },
    
    // Initialize the debug panel
    init() {
        console.log('Debug utility initialized');
        
        // Create debug panel if it doesn't exist
        if (!document.getElementById('debug-panel')) {
            const panel = document.createElement('div');
            panel.id = 'debug-panel';
            panel.innerHTML = `
                <div id="debug-content"></div>
                <div class="debug-controls">
                    <button onclick="window.debug.clear()">Clear</button>
                    <button onclick="window.debug.toggle()">Hide</button>
                </div>
            `;
            document.body.appendChild(panel);
        }
        
        // Make debug methods available globally
        window.debug = this;
        
        // Add keyboard shortcut to toggle debug panel
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                this.toggle();
            }
        });
        
        // Log initial message
        this.info('Debug panel initialized');
    },
    
    // Add a log entry
    _log(level, message, data) {
        const levelInfo = this.levels[level];
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const prefix = `[${timestamp}] [${levelInfo.prefix}]`;
        
        // Log to console
        console[level](prefix, message, data || '');
        
        // Log to debug panel
        const debugContent = document.getElementById('debug-content');
        if (debugContent) {
            const logEntry = document.createElement('div');
            logEntry.className = `debug-${level}`;
            
            let logText = `${prefix} ${message}`;
            if (data) {
                logText += ` ${typeof data === 'object' ? JSON.stringify(data) : data}`;
            }
            
            logEntry.textContent = logText;
            debugContent.appendChild(logEntry);
            debugContent.scrollTop = debugContent.scrollHeight;
        }
    },
    
    // Log methods
    info(message, data) {
        this._log('info', message, data);
    },
    
    warn(message, data) {
        this._log('warn', message, data);
    },
    
    error(message, data) {
        this._log('error', message, data);
    },
    
    log(message, data) {
        this._log('log', message, data);
    },
    
    // Clear all logs
    clear() {
        const debugContent = document.getElementById('debug-content');
        if (debugContent) {
            debugContent.innerHTML = '';
        }
        this.info('Debug logs cleared');
    },
    
    // Toggle debug panel visibility
    toggle() {
        const panel = document.getElementById('debug-panel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
            this.info(`Debug panel ${panel.style.display === 'none' ? 'hidden' : 'shown'}`);
        }
    }
};

// Initialize debug utility when the script loads
debug.init();

// Export the debug utility
export default debug; 