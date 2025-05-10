/**
 * Utilities Module
 * Contains various utility functions used throughout the application
 */

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 */
export function shuffleDeck(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Format a number as a percentage with 2 decimal places
 * @param {number} value - The value to format
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value) {
    return (Math.round(value * 100) / 100).toFixed(2) + '%';
}

/**
 * Format a number with comma separators for thousands
 * @param {number} value - The value to format
 * @returns {string} Formatted number string
 */
export function formatNumber(value) {
    return value.toLocaleString();
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate the absolute difference between two values
 * @param {number} a - First value
 * @param {number} b - Second value
 * @returns {number} Absolute difference
 */
export function getDifference(a, b) {
    return Math.abs(a - b);
}

/**
 * Delay execution for a specified time
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after the delay
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
