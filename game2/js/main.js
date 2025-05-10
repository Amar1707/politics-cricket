/**
 * Cricket Election Card Game
 * Main entry point for the application
 */
import { GameState } from './gameState.js';
import { loadCards } from './cardManager.js';
import { setupEventListeners } from './eventHandlers.js';
import { updateUI, updateScoreboard } from './uiController.js';

// Global game state that will be accessible to all modules
let gameState;

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);

/**
 * Initialize the game by loading cards and setting up the game state
 */
async function initGame() {
    try {
        console.log("Initializing game...");
        
        // Create a new game state instance
        gameState = new GameState();
        console.log("GameState created");
        
        // Load cards from JSON or create sample cards
        console.log("Loading cards...");
        const cards = await loadCards();
        
        if (!cards || Object.keys(cards).length === 0) {
            throw new Error("No cards were loaded or created");
        }
        
        console.log(`Loaded ${Object.keys(cards).length} cards`);
        
        // Initialize the game with the loaded cards
        gameState.initialize(cards);
        console.log("Game initialized with cards");
        
        // Set up event listeners for user interactions
        setupEventListeners(gameState);
        console.log("Event listeners set up");
        
    } catch (error) {
        console.error('Error initializing game:', error);
        document.getElementById('game-status').textContent = 
            `Error initializing game: ${error.message}. Please check the console for details.`;
    }
}

// Export the game state for access from other modules
export { gameState };
