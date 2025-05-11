/**
 * Main entry point for the Cricket Card Game
 */
// Initialize the game when page loads
window.addEventListener('load', async () => {
    // Initialize game and other modules
    await Game.init();
    Rules.init();
    
    console.log('Cricket Card Game initialized!');
});
