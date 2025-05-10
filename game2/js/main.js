/**
 * Cricket Election Card Game
 * Main entry point for the application
 */
import { GameState } from './gameState.js';
import { loadCards } from './cardManager.js';
import { setupEventListeners } from './eventHandlers.js';

// Global game state that will be accessible to all modules
let gameState;

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);

/**
 * Initialize the game by loading cards and setting up the game state
 */
async function initGame() {
    try {
        // Create a new game state instance
        gameState = new GameState();
        
        // Load cards from JSON or create sample cards
        const cards = await loadCards();
        
        // Initialize the game with the loaded cards
        gameState.initialize(cards);
        
        // Set up event listeners for user interactions
        setupEventListeners(gameState);
        
    } catch (error) {
        console.error('Error initializing game:', error);
        document.getElementById('game-status').textContent = 
            'Error initializing game. Please check the console for details.';
    }
}

// Export the game state for access from other modules
export { gameState };
