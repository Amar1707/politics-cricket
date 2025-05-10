/**
 * Event Handlers Module
 * Sets up and manages all event listeners for user interactions
 */

/**
 * Set up all event listeners for the game
 * @param {Object} gameState - The current game state
 */
export function setupEventListeners(gameState) {
    // Get DOM elements
    const resetButton = document.getElementById('reset-button');
    const submitResultButton = document.getElementById('submit-result');
    const runsInput = document.getElementById('runs-input');
    const wicketInput = document.getElementById('wicket-input');
    
    // Reset button event listener
    resetButton.addEventListener('click', () => {
        gameState.resetGame();
    });
    
    // Submit result button event listener
    submitResultButton.addEventListener('click', () => {
        const runs = runsInput.value;
        const wicket = wicketInput.value;
        gameState.processBallResult(runs, wicket);
    });
    
    // Add keyboard support for result submission
    document.addEventListener('keydown', (event) => {
        // Only process when in input phase
        if (gameState.gamePhase !== 'input') return;
        
        if (event.key === 'Enter') {
            const runs = runsInput.value;
            const wicket = wicketInput.value;
            gameState.processBallResult(runs, wicket);
        }
    });
}
