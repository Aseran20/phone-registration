// Debug utility for consistent logging across the application
const DEBUG_MODE = true; // Set to false to disable debug logging

export function debug(...args) {
    if (DEBUG_MODE) {
        const timestamp = new Date().toISOString();
        const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
        ).join(' ');
        console.log(`[${timestamp}] ${message}`);
    }
}

// Export additional debug levels if needed
export const debugError = (...args) => {
    if (DEBUG_MODE) {
        console.error(...args);
    }
};

export const debugWarn = (...args) => {
    if (DEBUG_MODE) {
        console.warn(...args);
    }
};

export const debugInfo = (...args) => {
    if (DEBUG_MODE) {
        console.info(...args);
    }
}; 