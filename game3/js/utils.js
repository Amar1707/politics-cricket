/**
 * Utility functions for the Cricket Card Game
 */
const Utils = {
    /**
     * Shuffle an array using Fisher-Yates algorithm
     * @param {Array} array - The array to shuffle
     * @returns {Array} The shuffled array
     */
    shuffleArray: function(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    /**
     * Format overs (e.g. 2.3 = 2 overs and 3 balls)
     * @param {number} balls - Total balls bowled
     * @returns {string} Formatted overs string
     */
    formatOvers: function(balls) {
        const overs = Math.floor(balls / CONFIG.BALLS_PER_OVER);
        const ballsInOver = balls % CONFIG.BALLS_PER_OVER;
        return `${overs}.${ballsInOver}`;
    },
    
    /**
     * Calculate run rate
     * @param {number} runs - Total runs scored
     * @param {number} balls - Total balls faced
     * @returns {string} Formatted run rate
     */
    calculateRunRate: function(runs, balls) {
        if (balls === 0) return '0.00';
        const runRate = (runs / balls) * 6;
        return runRate.toFixed(2);
    },
    
    /**
     * Add a log entry to the game commentary
     * @param {string} text - The text to log
     */
    addLogEntry: function(text) {
        // Create the entry element with enhanced formatting
        const formattedEntry = MatchCenter.formatLogEntry(text);
        
        // Get the log container and add the entry
        const logEntriesDisplay = document.getElementById('log-entries');
        logEntriesDisplay.prepend(formattedEntry);
        
        // Ensure logs don't get too long (keep latest 50 entries)
        while (logEntriesDisplay.children.length > 50) {
            logEntriesDisplay.removeChild(logEntriesDisplay.lastChild);
        }
    }
};
