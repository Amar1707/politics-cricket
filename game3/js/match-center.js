/**
 * Match Center functionality for Cricket Card Game
 * Handles the integrated display of match information, commentary, and scorecards
 */
const MatchCenter = {
    // Match data storage
    data: {
        firstInnings: {
            team: null,
            runs: 0,
            wickets: 0,
            overs: "0.0",
            balls: [],
            overDetails: []
        },
        secondInnings: {
            team: null,
            runs: 0,
            wickets: 0,
            overs: "0.0",
            balls: [],
            overDetails: []
        },
        currentInningsNum: 1
    },
    
    /**
     * Initialize the Match Center
     */
    init: function() {
        // Set up tab switching
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
        
        // Set up innings tab switching
        const inningsTabs = document.querySelectorAll('.innings-tab');
        inningsTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const inningsId = tab.getAttribute('data-innings');
                this.switchInningsTab(inningsId);
            });
        });
        
        // Setup event delegation for log entries to maintain scrolling
        const logEntriesContainer = document.getElementById('log-entries');
        logEntriesContainer.addEventListener('DOMNodeInserted', () => {
            // Keep the log scrolled to the top (newest entries)
            logEntriesContainer.scrollTop = 0;
        });
    },
    
    /**
     * Switch between tabs
     * @param {string} tabId - ID of the tab to switch to
     */
    switchTab: function(tabId) {
        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            if (button.getAttribute('data-tab') === tabId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Update tab content
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            if (content.id === `${tabId}-tab`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    },
    
    /**
     * Switch between innings tabs in the scorecard
     * @param {string} inningsId - ID of the innings tab to switch to
     */
    switchInningsTab: function(inningsId) {
        // Update innings tabs
        const inningsTabs = document.querySelectorAll('.innings-tab');
        inningsTabs.forEach(tab => {
            if (tab.getAttribute('data-innings') === inningsId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update innings content
        if (inningsId === 'current') {
            document.getElementById('current-innings-details').classList.remove('hidden');
            document.getElementById('previous-innings-details').classList.add('hidden');
        } else {
            document.getElementById('current-innings-details').classList.add('hidden');
            document.getElementById('previous-innings-details').classList.remove('hidden');
        }
    },
    
    /**
     * Update the match center with current game state
     * @param {object} gameState - Current game state
     */
    updateMatchCenter: function(gameState) {
        // Update basic match information
        this.updateMatchInfo(gameState);
        
        // Store ball outcome for current innings
        if (gameState.lastBallOutcome && !gameState.waitingForNextBall) {
            this.storeBallOutcome(gameState);
        }
        
        // Update scorecard details
        this.updateScorecardDetails(gameState);
        
        // Update last ball info
        if (gameState.lastBallOutcome) {
            document.getElementById('last-ball').textContent = gameState.lastBallOutcome;
            document.getElementById('last-ball').className = 'info-value';
            if (gameState.lastBallWicket) {
                document.getElementById('last-ball').classList.add('wicket-text');
            } else if (gameState.lastBallRuns === 4) {
                document.getElementById('last-ball').classList.add('four-text');
            } else if (gameState.lastBallRuns === 6) {
                document.getElementById('last-ball').classList.add('six-text');
            }
        }
    },
    
    /**
     * Update basic match information display
     * @param {object} gameState - Current game state
     */
    updateMatchInfo: function(gameState) {
        // Determine current innings data
        const currentInningsData = this.getCurrentInningsData(gameState);
        
        // Update display
        if (gameState.currentInnings === 2 && gameState.target) {
            // Show target information
            document.getElementById('target-container').classList.remove('hidden');
            document.getElementById('target-runs').textContent = gameState.target;
            
            // Show required runs
            document.getElementById('req-container').classList.remove('hidden');
            const currentRuns = gameState.userIsBatting ? gameState.userRuns : gameState.compRuns;
            const requiredRuns = Math.max(0, gameState.target - currentRuns);
            document.getElementById('req-runs').textContent = requiredRuns;
            
            // Calculate required run rate if applicable
            const ballsRemaining = (CONFIG.TOTAL_OVERS * CONFIG.BALLS_PER_OVER) - gameState.balls;
            if (ballsRemaining > 0 && requiredRuns > 0) {
                const requiredRunRate = (requiredRuns / ballsRemaining) * 6;
                document.getElementById('req-runs-label').textContent = `Need ${requiredRuns} (RRR: ${requiredRunRate.toFixed(2)})`;
            } else {
                document.getElementById('req-runs-label').textContent = `Need ${requiredRuns}`;
            }
        } else {
            // Hide target and required runs for first innings
            document.getElementById('target-container').classList.add('hidden');
            document.getElementById('req-container').classList.add('hidden');
        }
        
        // Update match status message
        this.updateMatchStatusMessage(gameState);
    },
    
    /**
     * Get current innings data
     * @param {object} gameState - Current game state
     * @returns {object} Current innings data
     */
    getCurrentInningsData: function(gameState) {
        if (gameState.currentInnings === 1) {
            // First innings
            this.data.currentInningsNum = 1;
            if (gameState.userIsBatting) {
                this.data.firstInnings.team = "user";
                this.data.firstInnings.runs = gameState.userRuns;
                this.data.firstInnings.wickets = gameState.userWickets;
                this.data.firstInnings.overs = Utils.formatOvers(gameState.balls);
                return this.data.firstInnings;
            } else {
                this.data.firstInnings.team = "comp";
                this.data.firstInnings.runs = gameState.compRuns;
                this.data.firstInnings.wickets = gameState.compWickets;
                this.data.firstInnings.overs = Utils.formatOvers(gameState.balls);
                return this.data.firstInnings;
            }
        } else {
            // Second innings
            this.data.currentInningsNum = 2;
            if (gameState.userIsBatting) {
                this.data.secondInnings.team = "user";
                this.data.secondInnings.runs = gameState.userRuns;
                this.data.secondInnings.wickets = gameState.userWickets;
                this.data.secondInnings.overs = Utils.formatOvers(gameState.balls);
                return this.data.secondInnings;
            } else {
                this.data.secondInnings.team = "comp";
                this.data.secondInnings.runs = gameState.compRuns;
                this.data.secondInnings.wickets = gameState.compWickets;
                this.data.secondInnings.overs = Utils.formatOvers(gameState.balls);
                return this.data.secondInnings;
            }
        }
    },
    
    /**
     * Store ball outcome for the current innings
     * @param {object} gameState - Current game state
     */
    storeBallOutcome: function(gameState) {
        // Get current innings data
        const innings = gameState.currentInnings === 1 ? this.data.firstInnings : this.data.secondInnings;
        
        // Create ball outcome data
        const ballData = {
            runs: gameState.lastBallRuns,
            isWicket: gameState.lastBallWicket,
            outcome: gameState.lastBallOutcome,
            over: Math.floor((gameState.balls - 1) / CONFIG.BALLS_PER_OVER) + 1,
            ball: (gameState.balls - 1) % CONFIG.BALLS_PER_OVER + 1,
            bowler: gameState.bowlerCardPlayed ? gameState.bowlerCardPlayed.name : null,
            batter: gameState.batterCardPlayed ? gameState.batterCardPlayed.name : null
        };
        
        // Add to balls array
        innings.balls.push(ballData);
        
        // Update over details
        const overIndex = Math.floor((gameState.balls - 1) / CONFIG.BALLS_PER_OVER);
        if (!innings.overDetails[overIndex]) {
            innings.overDetails[overIndex] = {
                overNum: overIndex + 1,
                balls: [],
                runs: 0,
                wickets: 0
            };
        }
        
        innings.overDetails[overIndex].balls.push(ballData);
        innings.overDetails[overIndex].runs += ballData.runs;
        if (ballData.isWicket) {
            innings.overDetails[overIndex].wickets++;
        }
    },
    
    /**
     * Update scorecard details
     * @param {object} gameState - Current game state
     */
    updateScorecardDetails: function(gameState) {
        // Update current innings scorecard
        const currentInnings = gameState.currentInnings === 1 ? this.data.firstInnings : this.data.secondInnings;
        const currentTeamName = currentInnings.team === "user" ? "You" : "Computer";
        
        document.getElementById('current-innings-team').textContent = `${currentTeamName}`;
        document.getElementById('current-innings-score').textContent = `${currentInnings.runs}/${currentInnings.wickets} (${currentInnings.overs})`;
        
        // Generate over-by-over display
        const currentOversList = document.getElementById('current-innings-overs');
        currentOversList.innerHTML = '';
        
        currentInnings.overDetails.forEach(over => {
            const overItem = document.createElement('div');
            overItem.className = 'over-item';
            
            const overNum = document.createElement('div');
            overNum.className = 'over-num';
            overNum.textContent = `Over ${over.overNum}`;
            
            const overBalls = document.createElement('div');
            overBalls.className = 'over-balls';
            
            over.balls.forEach(ball => {
                const ballItem = document.createElement('div');
                ballItem.className = 'ball-item';
                
                if (ball.isWicket) {
                    ballItem.classList.add('ball-wicket');
                    ballItem.textContent = 'W';
                } else if (ball.runs === 0) {
                    ballItem.classList.add('ball-dot');
                    ballItem.textContent = '•';
                } else if (ball.runs === 4) {
                    ballItem.classList.add('ball-four');
                    ballItem.textContent = '4';
                } else if (ball.runs === 6) {
                    ballItem.classList.add('ball-six');
                    ballItem.textContent = '6';
                } else {
                    ballItem.classList.add('ball-runs');
                    ballItem.textContent = ball.runs;
                }
                
                ballItem.title = `${ball.batter} vs ${ball.bowler}: ${ball.outcome}`;
                overBalls.appendChild(ballItem);
            });
            
            // Add over summary
            const overSummary = document.createElement('div');
            overSummary.className = 'over-summary';
            overSummary.textContent = `${over.runs}/${over.wickets}`;
            
            overItem.appendChild(overNum);
            overItem.appendChild(overBalls);
            overItem.appendChild(overSummary);
            currentOversList.appendChild(overItem);
        });
        
        // Update previous innings scorecard if available
        if (gameState.currentInnings === 2 && gameState.firstInningsData) {
            const previousInnings = this.data.firstInnings;
            const previousTeamName = previousInnings.team === "user" ? "You" : "Computer";
            
            document.getElementById('previous-innings-team').textContent = `${previousTeamName}`;
            document.getElementById('previous-innings-score').textContent = `${previousInnings.runs}/${previousInnings.wickets} (${previousInnings.overs})`;
            
            // Generate over-by-over display for previous innings
            const previousOversList = document.getElementById('previous-innings-overs');
            previousOversList.innerHTML = '';
            
            previousInnings.overDetails.forEach(over => {
                const overItem = document.createElement('div');
                overItem.className = 'over-item';
                
                const overNum = document.createElement('div');
                overNum.className = 'over-num';
                overNum.textContent = `Over ${over.overNum}`;
                
                const overBalls = document.createElement('div');
                overBalls.className = 'over-balls';
                
                over.balls.forEach(ball => {
                    const ballItem = document.createElement('div');
                    ballItem.className = 'ball-item';
                    
                    if (ball.isWicket) {
                        ballItem.classList.add('ball-wicket');
                        ballItem.textContent = 'W';
                    } else if (ball.runs === 0) {
                        ballItem.classList.add('ball-dot');
                        ballItem.textContent = '•';
                    } else if (ball.runs === 4) {
                        ballItem.classList.add('ball-four');
                        ballItem.textContent = '4';
                    } else if (ball.runs === 6) {
                        ballItem.classList.add('ball-six');
                        ballItem.textContent = '6';
                    } else {
                        ballItem.classList.add('ball-runs');
                        ballItem.textContent = ball.runs;
                    }
                    
                    ballItem.title = `${ball.batter} vs ${ball.bowler}: ${ball.outcome}`;
                    overBalls.appendChild(ballItem);
                });
                
                // Add over summary
                const overSummary = document.createElement('div');
                overSummary.className = 'over-summary';
                overSummary.textContent = `${over.runs}/${over.wickets}`;
                
                overItem.appendChild(overNum);
                overItem.appendChild(overBalls);
                overItem.appendChild(overSummary);
                previousOversList.appendChild(overItem);
            });
        }
    },
    
    /**
     * Update match status message
     * @param {object} gameState - Current game state
     */
    updateMatchStatusMessage: function(gameState) {
        const messageEl = document.getElementById('match-status-message');
        const resultDisplay = document.getElementById('result-display');
        
        if (gameState.currentInnings === 2 && gameState.target) {
            const currentRuns = gameState.userIsBatting ? gameState.userRuns : gameState.compRuns;
            const requiredRuns = Math.max(0, gameState.target - currentRuns);
            const remainingBalls = (CONFIG.TOTAL_OVERS * CONFIG.BALLS_PER_OVER) - gameState.balls;
            const remainingWickets = CONFIG.TOTAL_WICKETS - (gameState.userIsBatting ? gameState.userWickets : gameState.compWickets);
            
            if (requiredRuns > 0) {
                const battingTeam = gameState.userIsBatting ? "You" : "Computer";
                resultDisplay.textContent = `${battingTeam} need ${requiredRuns} runs from ${remainingBalls} balls with ${remainingWickets} wickets remaining`;
                messageEl.classList.remove('hidden');
            } else {
                messageEl.classList.add('hidden');
            }
        } else {
            // First innings - show basic information
            messageEl.classList.add('hidden');
        }
    },
    
    /**
     * Show ball outcome in the live updates area
     * @param {string} outcome - Outcome text (e.g., "WICKET!" or "4 RUNS!")
     * @param {string} details - Detailed explanation of the outcome
     */
    showBallOutcome: function(outcome, details) {
        // Update ball outcome display
        const ballOutcome = document.getElementById('ball-outcome');
        const outcomeResult = document.getElementById('outcome-result');
        const outcomeDetails = document.getElementById('outcome-details');
        
        outcomeResult.textContent = outcome;
        outcomeDetails.innerHTML = details;
        
        ballOutcome.classList.remove('hidden');
        document.getElementById('innings-summary').classList.add('hidden');
        document.getElementById('game-summary').classList.add('hidden');
        
        // Make sure the live tab is active
        this.switchTab('live');
    },
    
    /**
     * Show innings summary in the live updates area
     * @param {string} message - Innings summary message
     */
    showInningsSummary: function(message) {
        const inningsSummary = document.getElementById('innings-summary');
        const inningsDetails = document.getElementById('innings-details');
        
        inningsDetails.innerHTML = message;
        
        inningsSummary.classList.remove('hidden');
        document.getElementById('ball-outcome').classList.add('hidden');
        document.getElementById('game-summary').classList.add('hidden');
        
        // Make sure the live tab is active
        this.switchTab('live');
    },
    
    /**
     * Show game summary in the live updates area
     * @param {string} winner - The winner of the game
     * @param {string} winMessage - Message about the win
     * @param {string} winReason - Reason for the win
     * @param {string} userScore - User's final score
     * @param {string} compScore - Computer's final score
     */
    showGameSummary: function(winner, winMessage, winReason, userScore, compScore) {
        const gameSummary = document.getElementById('game-summary');
        const summaryResult = document.getElementById('final-result');
        const summaryDetails = document.getElementById('game-summary-details');
        const finalUserScore = document.getElementById('final-user-score');
        const finalCompScore = document.getElementById('final-comp-score');
        
        summaryResult.textContent = winMessage;
        summaryDetails.innerHTML = `<p>${winReason}</p>`;
        finalUserScore.textContent = userScore;
        finalCompScore.textContent = compScore;
        
        gameSummary.classList.remove('hidden');
        document.getElementById('ball-outcome').classList.add('hidden');
        document.getElementById('innings-summary').classList.add('hidden');
        
        // Make sure the live tab is active
        this.switchTab('live');
    },
    
    /**
     * Format a log entry for the commentary
     * @param {string} text - Log text
     * @returns {HTMLElement} Formatted log entry element
     */
    formatLogEntry: function(text) {
        const entryElement = document.createElement('div');
        entryElement.className = 'commentary-item';
        
        const timeElement = document.createElement('div');
        timeElement.className = 'commentary-time';
        
        // Create timestamp
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}`;
        
        const textElement = document.createElement('div');
        textElement.className = 'commentary-text';
        textElement.innerHTML = text;
        
        entryElement.appendChild(timeElement);
        entryElement.appendChild(textElement);
        
        return entryElement;
    }
};
