/**
     * Reset the game to initial state
     */
    resetGame: function() {
        // Reset game state variables
        this.state = {
            userIsBatting: false,
            userIsBowling: false,
            currentInnings: 1,
            userRuns: 0,
            userWickets: 0,
            compRuns: 0,
            compWickets: 0,
            balls: 0,
            target: null,
            bowlerCardPlayed: null,
            batterCardPlayed: null,
            gameOver: false,
            waitingForNextBall: false,
            cardRefreshCount: 0,
            isCardRefreshTime: false,
            firstInningsData: null
        };
        
        // Clear the UI
        UI.clearUI();
        
        // Show start screen
        UI.showStartScreen();
        
        // Re-shuffle the deck
        Cards.shuffleDeck();
        
        // Update the display
        UI.updateDisplays();
    }
