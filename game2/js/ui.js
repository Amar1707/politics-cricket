/**
 * UI Management for the Cricket Card Game
 * Handles display updates and UI state
 */
const UI = {
    // DOM element references
    elements: {
        startScreen: document.getElementById('start-screen'),
        gameScreen: document.getElementById('game-screen'),
        batFirstBtn: document.getElementById('bat-first-btn'),
        bowlFirstBtn: document.getElementById('bowl-first-btn'),
        resetBtn: document.getElementById('reset-btn'),
        bowlerCardDisplay: document.getElementById('bowler-card'),
        batterCardDisplay: document.getElementById('batter-card'),
        playerCardsDisplay: document.getElementById('player-cards'),
        actionTextDisplay: document.getElementById('action-text')
    },
    
    /**
     * Initialize UI
     */
    init: function() {
        // Setup event listeners
        this.elements.batFirstBtn.addEventListener('click', () => Game.startGame(true));
        this.elements.bowlFirstBtn.addEventListener('click', () => Game.startGame(false));
        this.elements.resetBtn.addEventListener('click', () => Game.resetGame());
    },
    
    /**
     * Initialize Match Center
     */
    initMatchCenter: function() {
        // Initialize Match Center when it's ready
        if (typeof MatchCenter !== 'undefined') {
            MatchCenter.init();
        } else {
            // Wait for Match Center to load
            setTimeout(() => this.initMatchCenter(), 100);
        }
    },
    
    /**
     * Show the game screen and hide the start screen
     */
    showGameScreen: function() {
        this.elements.startScreen.classList.add('hidden');
        this.elements.gameScreen.classList.remove('hidden');
    },
    
    /**
     * Show the start screen and hide the game screen
     */
    showStartScreen: function() {
        this.elements.gameScreen.classList.add('hidden');
        this.elements.startScreen.classList.remove('hidden');
    },
    
    /**
     * Update displays with current game state
     */
    updateDisplays: function() {
        // Update match center with game state
        if (typeof MatchCenter !== 'undefined') {
            MatchCenter.update(Game.state);
        }
        
        // Update action text
        this.setActionText();
    },
    
    /**
     * Set action text based on current game state
     */
    setActionText: function() {
        const gameState = Game.state;
        
        if (gameState.isCardRefreshTime) {
            this.elements.actionTextDisplay.textContent = `Select a card to discard (${gameState.cardRefreshCount + 1}/2)`;
        } else if (gameState.waitingForNextBall) {
            this.elements.actionTextDisplay.textContent = 'Waiting for next ball...';
        } else if (gameState.userIsBowling && !gameState.bowlerCardPlayed) {
            this.elements.actionTextDisplay.textContent = 'Your turn to bowl! Select a card';
        } else if (gameState.userIsBatting && gameState.bowlerCardPlayed) {
            this.elements.actionTextDisplay.textContent = 'Your turn to bat! Select a card';
        } else if (gameState.userIsBatting && !gameState.bowlerCardPlayed) {
            this.elements.actionTextDisplay.textContent = 'Please wait for the computer to bowl';
        } else if (gameState.userIsBowling && gameState.bowlerCardPlayed) {
            this.elements.actionTextDisplay.textContent = 'Please wait for the computer to bat';
        }
    },
    
    /**
     * Display a card in the card display area
     * @param {object} card - Card object to display
     * @param {Element} displayElement - DOM element to display the card in
     */
    displayCard: function(card, displayElement) {
        displayElement.innerHTML = `
            <div class="card-header">${card.name}</div>
            <img src="${card.photo}" alt="${card.name}" class="player-image">
            <div class="card-body">
                <div class="card-info">
                    <span class="info-label">Party:</span>
                    <span class="info-value party-tag">${card.party}</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Age:</span>
                    <span class="info-value">${card.age}</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Gender:</span>
                    <span class="info-value">${card.gender}</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Vote Share:</span>
                    <span class="info-value">${card.vote_share}%</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Rank:</span>
                    <span class="info-value">${card.rank}</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Constituency:</span>
                    <span class="info-value">${card.constituency}</span>
                </div>
                <div class="card-info">
                    <span class="info-label">State:</span>
                    <span class="info-value">${card.state}</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Type:</span>
                    <span class="info-value">${card.type}</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Turnout:</span>
                    <span class="info-value">${card.turnout}%</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Margin:</span>
                    <span class="info-value">${card.margin}%</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Female Turnout Edge:</span>
                    <span class="info-value">${card.female_turnout_edge}%</span>
                </div>
            </div>
        `;
    },
    
    /**
     * Reset card displays to default state
     */
    resetCardDisplays: function() {
        const defaultCardHTML = `
            <div class="card-header">Select a card to start</div>
            <img src="https://via.placeholder.com/400x180?text=Select+a+Card" alt="Candidate Photo" class="player-image">
            <div class="card-body">
                <div class="card-info">
                    <span class="info-label">Party:</span>
                    <span class="info-value party-tag">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Age:</span>
                    <span class="info-value">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Gender:</span>
                    <span class="info-value">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Vote Share:</span>
                    <span class="info-value">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Rank:</span>
                    <span class="info-value">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Constituency:</span>
                    <span class="info-value">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">State:</span>
                    <span class="info-value">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Type:</span>
                    <span class="info-value">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Turnout:</span>
                    <span class="info-value">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Margin:</span>
                    <span class="info-value">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Female Turnout Edge:</span>
                    <span class="info-value">-</span>
                </div>
            </div>
        `;
        
        this.elements.bowlerCardDisplay.innerHTML = defaultCardHTML;
        this.elements.batterCardDisplay.innerHTML = defaultCardHTML;
    },
    
    /**
     * Show ball outcome in the Match Center
     * @param {string} outcome - The outcome text
     * @param {string} description - Description of the outcome
     * @param {boolean} isWicket - Whether a wicket fell
     * @param {number} runsScored - Runs scored on the ball
     */
    showBallOutcome: function(outcome, description, isWicket, runsScored) {
        if (typeof MatchCenter !== 'undefined') {
            MatchCenter.showBallOutcome(outcome, description, isWicket, runsScored);
        }
    },
    
    /**
     * Show innings summary in the Match Center
     * @param {string} message - Message to display
     */
    showInningsSummary: function(message) {
        if (typeof MatchCenter !== 'undefined') {
            MatchCenter.showInningsSummary(message);
        }
    },
    
    /**
     * Show game summary in the Match Center
     * @param {string} winner - The winner of the game
     * @param {string} winMessage - Message about the win
     * @param {string} winReason - Reason for the win
     */
    showGameSummary: function(winner, winMessage, winReason) {
        if (typeof MatchCenter !== 'undefined') {
            // Create formatted scores
            const gameState = Game.state;
            
            // Get innings data
            let userOversPlayed, compOversPlayed;
            
            if (gameState.currentInnings === 2) {
                // Both innings were played
                if (gameState.firstInningsData) {
                    // Use stored data for first innings
                    if (gameState.firstInningsData.team === "user") {
                        // User batted first
                        userOversPlayed = gameState.firstInningsData.overs;
                        compOversPlayed = Utils.formatOvers(gameState.balls);
                    } else {
                        // Computer batted first
                        compOversPlayed = gameState.firstInningsData.overs;
                        userOversPlayed = Utils.formatOvers(gameState.balls);
                    }
                } else {
                    // Fallback if firstInningsData not available
                    userOversPlayed = gameState.userIsBatting ? 
                        Utils.formatOvers(gameState.balls) : 
                        `${CONFIG.TOTAL_OVERS}.0`;
                    compOversPlayed = !gameState.userIsBatting ? 
                        Utils.formatOvers(gameState.balls) : 
                        `${CONFIG.TOTAL_OVERS}.0`;
                }
            } else {
                // Only one innings was played (shouldn't happen normally)
                userOversPlayed = gameState.userIsBatting ? 
                    Utils.formatOvers(gameState.balls) : 
                    '0.0';
                compOversPlayed = !gameState.userIsBatting ? 
                    Utils.formatOvers(gameState.balls) : 
                    '0.0';
            }
            
            const userScore = `${gameState.userRuns}/${gameState.userWickets} (${userOversPlayed})`;
            const compScore = `${gameState.compRuns}/${gameState.compWickets} (${compOversPlayed})`;
            
            MatchCenter.showGameSummary(winner, winMessage, winReason, userScore, compScore);
        }
    },
    
    /**
     * Clear all UI elements for a reset
     */
    clearUI: function() {
        // Reset card displays
        this.resetCardDisplays();
        
        // Reset Match Center
        if (typeof MatchCenter !== 'undefined') {
            MatchCenter.reset();
        }
    }
};

// Update Utils.addLogEntry to use Match Center
Utils.addLogEntry = function(text) {
    if (typeof MatchCenter !== 'undefined') {
        MatchCenter.addCommentary(text);
    }
};
