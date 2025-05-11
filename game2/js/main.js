/**
 * Main entry point for the Cricket Card Game
 */
// Initialize the game when page loads
window.addEventListener('load', async () => {
    // Initialize modules
    await Game.init();
    Rules.init();
    
    console.log('Cricket Card Game initialized!');
});
