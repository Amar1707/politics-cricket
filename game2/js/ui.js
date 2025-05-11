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
        userRunsDisplay: document.getElementById('user-runs'),
        userWicketsDisplay: document.getElementById('user-wickets'),
        userOversDisplay: document.getElementById('user-overs'),
        compRunsDisplay: document.getElementById('comp-runs'),
        compWicketsDisplay: document.getElementById('comp-wickets'),
        compOversDisplay: document.getElementById('comp-overs'),
        targetRunsDisplay: document.getElementById('target-runs'),
        reqRunsDisplay: document.getElementById('req-runs'),
        currentOverDisplay: document.getElementById('current-over'),
        ballCountDisplay: document.getElementById('ball-count'),
        runRateDisplay: document.getElementById('run-rate'),
        bowlerCardDisplay: document.getElementById('bowler-card'),
        batterCardDisplay: document.getElementById('batter-card'),
        playerCardsDisplay: document.getElementById('player-cards'),
        actionTextDisplay: document.getElementById('action-text'),
        userInningsIndicator: document.getElementById('user-innings-indicator'),
        compInningsIndicator: document.getElementById('comp-innings-indicator'),
        resultDisplay: document.getElementById('result-display'),
        outcomeArea: document.getElementById('outcome-area'),
        outcomeMessage: document.getElementById('outcome-message'),
        nextBallBtn: document.getElementById('next-ball-btn'),
        inningsSummaryArea: document.getElementById('innings-summary-area'),
        inningsSummaryMessage: document.getElementById('innings-summary-message'),
        continueInningsBtn: document.getElementById('continue-innings-btn'),
        gameSummaryArea: document.getElementById('game-summary-area'),
        gameSummaryMessage: document.getElementById('game-summary-message'),
        finalUserScore: document.getElementById('final-user-score'),
        finalCompScore: document.getElementById('final-comp-score'),
        finalResult: document.getElementById('final-result')
    },
    
    /**
     * Initialize UI
     */
    init: function() {
        // Setup event listeners
        this.elements.batFirstBtn.addEventListener('click', () => Game.startGame(true));
        this.elements.bowlFirstBtn.addEventListener('click', () => Game.startGame(false));
        this.elements.resetBtn.addEventListener('click', () => Game.resetGame());
        this.elements.nextBallBtn.addEventListener('click', () => Game.prepareNextBall());
        this.elements.continueInningsBtn.addEventListener('click', () => Game.handleContinueInnings());
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
     * Update scoreboard and stats
     */
    updateDisplays: function() {
        const gameState = Game.state;
        
        // Update runs and wickets
        this.elements.userRunsDisplay.textContent = gameState.userRuns;
        this.elements.userWicketsDisplay.textContent = gameState.userWickets;
        this.elements.compRunsDisplay.textContent = gameState.compRuns;
        this.elements.compWicketsDisplay.textContent = gameState.compWickets;
        
        // Calculate overs for display
        let userOvers, compOvers;
        
        if (gameState.currentInnings === 1) {
            // First innings in progress
            if (gameState.userIsBatting) {
                userOvers = Utils.formatOvers(gameState.balls);
                compOvers = '0.0';
            } else {
                userOvers = '0.0';
                compOvers = Utils.formatOvers(gameState.balls);
            }
        } else {
            // Second innings - use stored data for first innings
            if (gameState.firstInningsData) {
                if (gameState.firstInningsData.team === 'user') {
                    // User batted first
                    userOvers = gameState.firstInningsData.overs;
                    compOvers = Utils.formatOvers(gameState.balls);
                } else {
                    // Computer batted first
                    compOvers = gameState.firstInningsData.overs;
                    userOvers = Utils.formatOvers(gameState.balls);
                }
            } else {
                // Fallback if no stored data
                if (gameState.userIsBatting) {
                    userOvers = Utils.formatOvers(gameState.balls);
                    compOvers = `${CONFIG.TOTAL_OVERS}.0`; // Assume completed
                } else {
                    userOvers = `${CONFIG.TOTAL_OVERS}.0`; // Assume completed
                    compOvers = Utils.formatOvers(gameState.balls);
                }
            }
        }
        
        this.elements.userOversDisplay.textContent = userOvers;
        this.elements.compOversDisplay.textContent = compOvers;
        
        // Update current over and ball display for current innings
        this.elements.currentOverDisplay.textContent = Utils.formatOvers(gameState.balls);
        this.elements.ballCountDisplay.textContent = gameState.balls;
        
        // Update target and required runs if available
        if (gameState.target) {
            this.elements.targetRunsDisplay.textContent = gameState.target;
            
            const currentRuns = gameState.userIsBatting ? gameState.userRuns : gameState.compRuns;
            const requiredRuns = Math.max(0, gameState.target - currentRuns);
            
            this.elements.reqRunsDisplay.textContent = requiredRuns;
            
            // If game is in second innings, add info about required runs
            if (gameState.currentInnings === 2) {
                const remainingBalls = (CONFIG.TOTAL_OVERS * CONFIG.BALLS_PER_OVER) - gameState.balls;
                const remainingWickets = CONFIG.TOTAL_WICKETS - (gameState.userIsBatting ? gameState.userWickets : gameState.compWickets);
                
                if (requiredRuns > 0) {
                    this.elements.resultDisplay.textContent = `${gameState.userIsBatting ? 'You need' : 'Computer needs'} ${requiredRuns} runs from ${remainingBalls} balls with ${remainingWickets} wickets remaining`;
                } else {
                    this.elements.resultDisplay.textContent = '';
                }
            } else {
                this.elements.resultDisplay.textContent = '';
            }
        } else {
            this.elements.targetRunsDisplay.textContent = '-';
            this.elements.reqRunsDisplay.textContent = '-';
            this.elements.resultDisplay.textContent = '';
        }
        
        // Calculate and update run rate
        if (gameState.balls > 0) {
            const currentRuns = gameState.userIsBatting ? gameState.userRuns : gameState.compRuns;
            this.elements.runRateDisplay.textContent = Utils.calculateRunRate(currentRuns, gameState.balls);
        } else {
            this.elements.runRateDisplay.textContent = '0.00';
        }
        
        // Update innings indicators
        if (gameState.userIsBatting) {
            this.elements.userInningsIndicator.classList.remove('hidden');
            this.elements.compInningsIndicator.classList.add('hidden');
        } else {
            this.elements.userInningsIndicator.classList.add('hidden');
            this.elements.compInningsIndicator.classList.remove('hidden');
        }
        
        // Update action text based on waiting state
        this.setActionText();
    },
    
    /**
     * Set action text based on current game state
     */
    setActionText: function() {
        const gameState = Game.state;
        
        if (gameState.isCardRefreshTime) {
            this.elements.actionTextDisplay.textContent = `Select a card to discard (${gameState.cardRefreshCount + 1}/2)`;
        } else if (gameState.waitingForNextBall && this.elements.nextBallBtn.textContent === "Start Second Innings") {
            this.elements.actionTextDisplay.textContent = 'Click "Start Second Innings" to continue';
        } else if (gameState.waitingForNextBall && this.elements.nextBallBtn.textContent === "Manage Cards") {
            this.elements.actionTextDisplay.textContent = 'Click "Manage Cards" to refresh your cards';
        } else if (gameState.waitingForNextBall && this.elements.nextBallBtn.textContent === "Start Next Over") {
            this.elements.actionTextDisplay.textContent = 'Click "Start Next Over" to continue';
        } else if (gameState.waitingForNextBall) {
            this.elements.actionTextDisplay.textContent = 'Click "Next Ball" to continue';
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
     * Show game outcome for a ball
     * @param {string} outcome - The outcome text
     * @param {string} description - Description of the outcome
     * @param {boolean} isWicket - Whether a wicket fell
     * @param {number} runsScored - Runs scored on the ball
     */
    showBallOutcome: function(outcome, description, isWicket, runsScored) {
        const gameState = Game.state;
        const battingTeam = gameState.userIsBatting ? 'You' : 'Computer';
        
        let resultText = '';
        if (isWicket) {
            resultText = `${battingTeam} lost a wicket!`;
        } else {
            resultText = runsScored === 0 
                ? 'Dot ball!' 
                : `${battingTeam} scored ${runsScored} run${runsScored !== 1 ? 's' : ''}!`;
        }
        
        this.elements.outcomeMessage.innerHTML = `
            <div class="refresh-info">${outcome}</div>
            <p>${description}</p>
            <p>${resultText}</p>
        `;
        this.elements.outcomeArea.classList.remove('hidden');
    },
    
    /**
     * Show innings summary
     * @param {string} message - Message to display
     */
    showInningsSummary: function(message) {
        this.elements.inningsSummaryMessage.innerHTML = message;
        this.elements.inningsSummaryArea.classList.remove('hidden');
    },
    
    /**
     * Show game summary
     * @param {string} winner - The winner of the game
     * @param {string} winMessage - Message about the win
     * @param {string} winReason - Reason for the win
     */
    showGameSummary: function(winner, winMessage, winReason) {
        // Update winner in result display
        this.elements.resultDisplay.textContent = `${winner} won the match!`;
        
        // Update final scoreboard
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
        
        // Update final scoreboard
        this.elements.finalUserScore.textContent = `${gameState.userRuns}/${gameState.userWickets} (${userOversPlayed})`;
        this.elements.finalCompScore.textContent = `${gameState.compRuns}/${gameState.compWickets} (${compOversPlayed})`;
        this.elements.finalResult.textContent = winMessage;
        
        // Show game summary
        this.elements.gameSummaryMessage.innerHTML = `
            <p>${winMessage}</p>
            <p>${winReason}</p>
            <p style="margin-top: 15px;">The ball outcome above shows what happened on the final delivery.</p>
        `;
        this.elements.gameSummaryArea.classList.remove('hidden');
        
        // Position the game summary below the ball outcome for better flow
        if (!this.elements.outcomeArea.classList.contains('hidden')) {
            this.elements.outcomeArea.after(this.elements.gameSummaryArea);
        }
    },
    
    /**
     * Hide UI components
     */
    hideComponents: function() {
        this.elements.outcomeArea.classList.add('hidden');
        this.elements.inningsSummaryArea.classList.add('hidden');
        this.elements.gameSummaryArea.classList.add('hidden');
    },
    
    /**
     * Reset next ball button text
     */
    resetNextBallButton: function() {
        this.elements.nextBallBtn.textContent = "Next Ball";
    },
    
    /**
     * Set next ball button text
     * @param {string} text - Text for the button
     */
    setNextBallButtonText: function(text) {
        this.elements.nextBallBtn.textContent = text;
    },
    
    /**
     * Set continue innings button text
     * @param {string} text - Text for the button
     */
    setContinueInningsButtonText: function(text) {
        this.elements.continueInningsBtn.textContent = text;
    },
    
    /**
     * Clear log entries
     */
    clearLog: function() {
        document.getElementById('log-entries').innerHTML = '';
    }
};
