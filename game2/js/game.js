/**
 * Game Logic for the Cricket Card Game
 * Core game mechanics and state management
 */
const Game = {
    // Game state
    state: {
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
        lastBallOutcome: null,
        lastBallRuns: 0,
        lastBallWicket: false,
        waitingForNextBall: false,
        cardRefreshCount: 0,
        isCardRefreshTime: false,
        firstInningsData: null
    },
    
    /**
     * Initialize the game
     */
    init: async function() {
        // Initialize card data
        await Cards.init();
    },
    
    /**
     * Start the game
     * @param {boolean} userBatsFirst - Whether user bats first
     */
    startGame: function(userBatsFirst) {
        UI.showGameScreen();
        
        // Set game mode
        this.state.userIsBatting = userBatsFirst;
        this.state.userIsBowling = !userBatsFirst;
        
        // Shuffle deck and deal cards
        Cards.shuffleDeck();
        Cards.dealCards();
        
        // Set initial game state
        UI.updateDisplays();
        
        // Set action text based on who's batting/bowling
        UI.setActionText();
        
        // The bowler always plays first for each ball
        if (this.state.userIsBowling) {
            // If user is bowling first, wait for user to select a bowling card
            UI.elements.actionTextDisplay.textContent = 'Your turn to bowl! Select a card';
        } else {
            // If computer is bowling first, computer plays a bowling card
            this.computerPlaysBowlingCard();
        }
        
        // Log game start
        Utils.addLogEntry(`<span class="commentary-highlight">Game started!</span> ${userBatsFirst ? 'You' : 'Computer'} is batting first.`);
    },
    
    /**
     * Player selects a card
     * @param {number} index - Index of the selected card
     */
    playerSelectsCard: function(index) {
        if (this.state.gameOver || (this.state.waitingForNextBall && !this.state.isCardRefreshTime)) return;
        
        // Check if we're in card refresh mode
        if (this.state.isCardRefreshTime) {
            this.discardAndDrawCard(index);
            return;
        }
        
        // If player is bowling and bowler card not played yet
        if (this.state.userIsBowling && !this.state.bowlerCardPlayed) {
            this.state.bowlerCardPlayed = Cards.playerCards[index];
            UI.displayCard(this.state.bowlerCardPlayed, UI.elements.bowlerCardDisplay);
            
            // Remove the card from player's hand
            Cards.playerCards.splice(index, 1);
            
            // Draw a new card
            const newCard = Cards.drawCard();
            if (newCard) {
                Cards.playerCards.push(newCard);
            }
            
            // Re-render player cards
            Cards.renderPlayerCards();
            
            // Computer plays batting card
            this.computerPlaysBattingCard();
            
            // Log
            Utils.addLogEntry(`You bowled with <span class="commentary-highlight">${this.state.bowlerCardPlayed.name}</span> (${this.state.bowlerCardPlayed.vote_share}% vote share).`);
        }
        
        // If player is batting and bowler card already played
        else if (this.state.userIsBatting && this.state.bowlerCardPlayed) {
            this.state.batterCardPlayed = Cards.playerCards[index];
            UI.displayCard(this.state.batterCardPlayed, UI.elements.batterCardDisplay);
            
            // Remove the card from player's hand
            Cards.playerCards.splice(index, 1);
            
            // Draw a new card
            const newCard = Cards.drawCard();
            if (newCard) {
                Cards.playerCards.push(newCard);
            }
            
            // Re-render player cards
            Cards.renderPlayerCards();
            
            // Process the ball
            this.processBall();
            
            // Log
            Utils.addLogEntry(`You batted with <span class="commentary-highlight">${this.state.batterCardPlayed.name}</span> (${this.state.batterCardPlayed.vote_share}% vote share).`);
        }
        
        // Update displays
        UI.updateDisplays();
    },
    
    /**
     * Computer plays a bowling card
     */
    computerPlaysBowlingCard: function() {
        if (this.state.gameOver || this.state.waitingForNextBall) return;
        
        // Get best card for bowling
        const { card, index } = Cards.getBestBowlingCard();
        this.state.bowlerCardPlayed = card;
        
        // Display the card
        UI.displayCard(this.state.bowlerCardPlayed, UI.elements.bowlerCardDisplay);
        
        // Remove the card from computer's hand
        Cards.computerCards.splice(index, 1);
        
        // Draw a new card
        const newCard = Cards.drawCard();
        if (newCard) {
            Cards.computerCards.push(newCard);
        }
        
        // Update action text
        UI.elements.actionTextDisplay.textContent = "Your turn to bat! Select a card";
        
        // Log
        Utils.addLogEntry(`Computer bowled with <span class="commentary-highlight">${this.state.bowlerCardPlayed.name}</span> (${this.state.bowlerCardPlayed.vote_share}% vote share).`);
        
        // Update displays
        UI.updateDisplays();
    },
    
    /**
     * Computer plays a batting card
     */
    computerPlaysBattingCard: function() {
        if (this.state.gameOver || this.state.waitingForNextBall) return;
        
        // Get best card for batting
        const { card, index } = Cards.getBestBattingCard(this.state.bowlerCardPlayed);
        this.state.batterCardPlayed = card;
        
        // Display the card
        UI.displayCard(this.state.batterCardPlayed, UI.elements.batterCardDisplay);
        
        // Remove the card from computer's hand
        Cards.computerCards.splice(index, 1);
        
        // Draw a new card
        const newCard = Cards.drawCard();
        if (newCard) {
            Cards.computerCards.push(newCard);
        }
        
        // Process the ball
        this.processBall();
        
        // Log
        Utils.addLogEntry(`Computer batted with <span class="commentary-highlight">${this.state.batterCardPlayed.name}</span> (${this.state.batterCardPlayed.vote_share}% vote share).`);
        
        // Update displays
        UI.updateDisplays();
    },
    
    /**
     * Process the ball (determine outcome)
     */
    processBall: function() {
        this.state.balls++;
        let runsScored = 0;
        let isWicket = false;
        let outcomeDescription = "";
        
        // First check for wicket
        // Logic: If batter's vote_share < bowler's vote_share, it's a wicket
        // EXCEPTION: Rank 1 batters can never get out irrespective of vote_share
        if (this.state.batterCardPlayed.vote_share < this.state.bowlerCardPlayed.vote_share && this.state.batterCardPlayed.rank !== 1) {
            isWicket = true;
            outcomeDescription = `${this.state.batterCardPlayed.name}'s vote share (${this.state.batterCardPlayed.vote_share}%) is lower than ${this.state.bowlerCardPlayed.name}'s (${this.state.bowlerCardPlayed.vote_share}%).`;
        } else {
            // If no wicket, calculate runs based on the rules
            
            // Calculate the difference between batter and bowler vote shares
            const difference = this.state.batterCardPlayed.vote_share - this.state.bowlerCardPlayed.vote_share;
            
            // If batter's vote_share is less than bowler's, give 0 runs
            if (difference < 0) {
                runsScored = 0;
                outcomeDescription = `Batter's vote share (${this.state.batterCardPlayed.vote_share}%) is less than bowler's (${this.state.bowlerCardPlayed.vote_share}%). No runs scored.`;
            } 
            // If batter's vote_share is greater than or equal to bowler's, apply special rules
            else {
                // Special cases first:
                let specialCaseApplied = false;
                
                // 1. If both cards belong to the same party, compute 0 runs
                if (this.state.batterCardPlayed.party === this.state.bowlerCardPlayed.party) {
                    runsScored = 0;
                    outcomeDescription = `Both players belong to ${this.state.batterCardPlayed.party} party. No runs scored.`;
                    specialCaseApplied = true;
                }
                // 2. For FEMALE bowlers, non-FEMALE batters get 0 runs
                else if (this.state.bowlerCardPlayed.gender === "FEMALE" && this.state.batterCardPlayed.gender !== "FEMALE") {
                    runsScored = 0;
                    outcomeDescription = `${this.state.bowlerCardPlayed.name} (FEMALE) bowled to ${this.state.batterCardPlayed.name} (${this.state.batterCardPlayed.gender}). Gender advantage - no runs scored.`;
                    specialCaseApplied = true;
                }
                // 3. For SC bowlers, non-SC batters get 0 runs
                else if (this.state.bowlerCardPlayed.type === "SC" && this.state.batterCardPlayed.type !== "SC") {
                    runsScored = 0;
                    outcomeDescription = `${this.state.bowlerCardPlayed.name} (SC) bowled to ${this.state.batterCardPlayed.name} (${this.state.batterCardPlayed.type}). Caste advantage - no runs scored.`;
                    specialCaseApplied = true;
                }
                // 4. For ST bowlers, non-ST batters get 0 runs
                else if (this.state.bowlerCardPlayed.type === "ST" && this.state.batterCardPlayed.type !== "ST") {
                    runsScored = 0;
                    outcomeDescription = `${this.state.bowlerCardPlayed.name} (ST) bowled to ${this.state.batterCardPlayed.name} (${this.state.batterCardPlayed.type}). Tribal advantage - no runs scored.`;
                    specialCaseApplied = true;
                }
                // Otherwise, calculate runs based on the vote_share difference
                else {
                    // Find the applicable run scoring rule
                    for (const rule of CONFIG.RUN_SCORING) {
                        if (difference >= rule.min && difference < rule.max) {
                            runsScored = rule.runs;
                            outcomeDescription = `Vote share difference (${difference.toFixed(1)}%) is ${rule.min === 0 ? 'below' : (rule.max === Infinity ? '15% or more' : `between ${rule.min}-${rule.max}%`)}.`;
                            if (rule.runs === 0) {
                                outcomeDescription += ' No runs scored.';
                            } else {
                                outcomeDescription += ` ${rule.runs} run${rule.runs !== 1 ? 's' : ''} scored.`;
                            }
                            break;
                        }
                    }
                }
                
                // Check if Rank 1 batter would have been out but was saved
                if (this.state.batterCardPlayed.rank === 1 && this.state.batterCardPlayed.vote_share < this.state.bowlerCardPlayed.vote_share) {
                    outcomeDescription = `${this.state.batterCardPlayed.name} is a Rank 1 candidate and can't be dismissed despite lower vote share! ` + outcomeDescription;
                }
            }
        }
        
        // Store the outcome for next ball button
        this.state.lastBallOutcome = isWicket ? "WICKET!" : `${runsScored} RUN${runsScored !== 1 ? 'S' : ''}!`;
        this.state.lastBallRuns = runsScored;
        this.state.lastBallWicket = isWicket;
        
        // Set waiting for next ball
        this.state.waitingForNextBall = true;
        
        // Update scores
        if (this.state.userIsBatting) {
            if (isWicket) {
                this.state.userWickets++;
            } else {
                this.state.userRuns += runsScored;
            }
        } else {
            if (isWicket) {
                this.state.compWickets++;
            } else {
                this.state.compRuns += runsScored;
            }
        }
        
        // Store the current innings data to preserve it for scorecards
        if (this.state.currentInnings === 1) {
            if (this.state.userIsBatting) {
                // Save user's batting stats in first innings
                this.state.firstInningsData = {
                    team: "user",
                    runs: this.state.userRuns,
                    wickets: this.state.userWickets,
                    overs: Utils.formatOvers(this.state.balls)
                };
            } else {
                // Save computer's batting stats in first innings
                this.state.firstInningsData = {
                    team: "comp",
                    runs: this.state.compRuns,
                    wickets: this.state.compWickets,
                    overs: Utils.formatOvers(this.state.balls)
                };
            }
        }
        
        // Show the ball outcome
        UI.showBallOutcome(
            this.state.lastBallOutcome,
            outcomeDescription,
            isWicket,
            runsScored
        );
        
        // Log the result with more details
        if (isWicket) {
            Utils.addLogEntry(`<span class="commentary-highlight">WICKET!</span> ${this.state.userIsBatting ? 'You' : 'Computer'} lost a wicket. ${outcomeDescription}`);
        } else {
            Utils.addLogEntry(`<span class="commentary-highlight">${runsScored} run${runsScored !== 1 ? 's' : ''}</span> scored by ${this.state.userIsBatting ? 'you' : 'computer'}. ${outcomeDescription}`);
        }
        
        // Update displays
        UI.updateDisplays();
        
        // Check if over is complete
        if (this.state.balls % CONFIG.BALLS_PER_OVER === 0) {
            const currentOver = Math.floor(this.state.balls / CONFIG.BALLS_PER_OVER);
            Utils.addLogEntry(`<span class="commentary-highlight">End of over ${currentOver}</span>`);
            
            // At the end of each but the last over, bowler can refresh cards
            if (currentOver < CONFIG.TOTAL_OVERS - 1) {
                // Determine who is bowling in the current innings
                const userIsBowlingNow = (this.state.userIsBatting === false);
                
                // Check if card management is available in MatchCenter
                if (typeof MatchCenter !== 'undefined' && typeof MatchCenter.prepareCardRefresh === 'function') {
                    MatchCenter.prepareCardRefresh(currentOver, userIsBowlingNow);
                }
                
                // Set card refresh mode
                this.state.isCardRefreshTime = true;
                this.state.cardRefreshCount = 0;
            }
        }
        
        // Check if innings/game is over (but don't proceed automatically)
        this.checkInningsStatus();
    },
    
    /**
     * Prepare for the next ball
     */
    prepareNextBall: function() {
        if (this.state.gameOver) return;
        
        // Check if it's card refresh time (end of over but not last over)
        const currentOver = Math.floor(this.state.balls / CONFIG.BALLS_PER_OVER);
        
        // If we just finished an over (but not the last one) and we haven't used all refresh opportunities
        if (this.state.isCardRefreshTime && this.state.cardRefreshCount < 2) {
            // If we have a Match Center, use it's card refresh interface
            if (typeof MatchCenter !== 'undefined') {
                // Determine who is bowling in the current innings
                const userIsBowlingNow = (this.state.userIsBatting === false);
                
                if (userIsBowlingNow) {
                    // User is bowling, show card refresh interface
                    this.showCardRefreshInterface();
                    return;
                } else {
                    // Computer is bowling, it will automatically refresh cards
                    this.computerRefreshCards();
                    this.state.cardRefreshCount++;
                    
                    if (this.state.cardRefreshCount < 2) {
                        // Still has one more refresh
                        if (typeof MatchCenter.showRefreshResult === 'function') {
                            MatchCenter.showRefreshResult(
                                `Computer's Card Refresh (${this.state.cardRefreshCount}/2)`,
                                `Computer has refreshed one card. Click Continue to see next refresh.`,
                                "Continue"
                            );
                        }
                        return;
                    } else {
                        // Used all refreshes, proceed to next over
                        if (typeof MatchCenter.showRefreshResult === 'function') {
                            MatchCenter.showRefreshResult(
                                `Computer's Card Refresh Complete`,
                                `Computer has refreshed cards twice. Ready for the next over!`,
                                "Start Next Over"
                            );
                        }
                        this.state.cardRefreshCount = 0;
                        this.state.isCardRefreshTime = false;
                        return;
                    }
                }
            }
        } else if (this.state.cardRefreshCount >= 2) {
            // Reset card refresh state when both refreshes used
            this.state.cardRefreshCount = 0;
            this.state.isCardRefreshTime = false;
        }
        
        // Reset cards for next ball
        this.state.bowlerCardPlayed = null;
        this.state.batterCardPlayed = null;
        
        // Reset waiting state
        this.state.waitingForNextBall = false;
        
        // Reset card displays
        UI.resetCardDisplays();
        
        // The bowler always plays first for the next ball
        if ((this.state.userIsBatting && !this.state.userIsBowling) || (!this.state.userIsBatting && !this.state.userIsBowling)) {
            // Computer is bowling
            this.computerPlaysBowlingCard();
        } else {
            // User is bowling
            UI.setActionText();
        }
        
        // Update player cards to make them clickable again
        Cards.renderPlayerCards();
    },
    
    /**
     * Handle Continue button from innings summary
     */
    handleContinueInnings: function() {
        if (this.state.gameOver) {
            // If game is over, reset the game
            this.resetGame();
            return;
        }
        
        // If this was the end of first innings, start second innings
        if (this.state.currentInnings === 2 && this.state.balls === 0) {
            // For a clean transition between innings, explicitly set up the second innings
            
            // Reset cards for next ball
            this.state.bowlerCardPlayed = null;
            this.state.batterCardPlayed = null;
            
            // Reset waiting state
            this.state.waitingForNextBall = false;
            
            // Reset card displays
            UI.resetCardDisplays();
            
            // The bowler always plays first for the first ball of the new innings
            if ((this.state.userIsBatting && !this.state.userIsBowling) || (!this.state.userIsBatting && !this.state.userIsBowling)) {
                // Computer is bowling in second innings
                this.computerPlaysBowlingCard();
            } else {
                // User is bowling in second innings
                UI.setActionText();
            }
            
            // Update player cards to make them clickable again
            Cards.renderPlayerCards();
            
            // Update displays for second innings
            UI.updateDisplays();
        }
    },
    
    /**
     * Show interface for user to refresh cards
     */
    showCardRefreshInterface: function() {
        // Display card refresh interface in Match Center
        if (typeof MatchCenter !== 'undefined' && typeof MatchCenter.showCardRefreshInterface === 'function') {
            MatchCenter.showCardRefreshInterface(this.state.cardRefreshCount + 1);
        }
        
        // Display player cards with discard option
        Cards.renderCardsForRefresh();
        
        // Update action text
        UI.elements.actionTextDisplay.textContent = `Select a card to discard (${this.state.cardRefreshCount + 1}/2)`;
    },
    
    /**
     * User discards a card and draws a new one
     * @param {number} index - Index of the discarded card
     */
    discardAndDrawCard: function(index) {
        // Get the discarded card info for the log
        const discardedCard = Cards.playerCards[index];
        
        // Remove the card from player's hand
        Cards.playerCards.splice(index, 1);
        
        // Draw a new card
        let newCard = null;
        if (Cards.deck.length > 0) {
            newCard = Cards.deck.shift();
            Cards.playerCards.push(newCard);
            Utils.addLogEntry(`You discarded <span class="commentary-highlight">${discardedCard.name}</span> (${discardedCard.vote_share}% vote share) and drew a new card.`);
        } else {
            Utils.addLogEntry(`You discarded <span class="commentary-highlight">${discardedCard.name}</span>, but the deck is empty!`);
        }
        
        // Increment refresh count
        this.state.cardRefreshCount++;
        
        // Display refresh result in Match Center
        if (typeof MatchCenter !== 'undefined' && typeof MatchCenter.showRefreshResult === 'function') {
            // Check if user has used all refreshes
            if (this.state.cardRefreshCount < 2) {
                // Still has one more refresh
                MatchCenter.showRefreshResult(
                    `Card Refresh (${this.state.cardRefreshCount}/2)`,
                    `You discarded <strong>${discardedCard.name}</strong>.
                    ${newCard ? `<p>You drew <strong>${newCard.name}</strong> (${newCard.party}, ${newCard.vote_share}% vote share).</p>` : ''}
                    <p>You can discard one more card.</p>`,
                    "Continue"
                );
                
                // Show card refresh interface again
                this.showCardRefreshInterface();
            } else {
                // Used all refreshes, proceed to next ball
                MatchCenter.showRefreshResult(
                    `Card Refresh Complete`,
                    `You discarded <strong>${discardedCard.name}</strong>.
                    ${newCard ? `<p>You drew <strong>${newCard.name}</strong> (${newCard.party}, ${newCard.vote_share}% vote share).</p>` : ''}
                    <p>You have refreshed cards twice. Ready for next over!</p>`,
                    "Start Next Over"
                );
                
                // Reset refresh state
                this.state.isCardRefreshTime = false;
                
                // Re-render player cards
                Cards.renderPlayerCards();
            }
        }
        
        // Update displays
        UI.updateDisplays();
    },
    
    /**
     * Computer automatically refreshes cards
     */
    computerRefreshCards: function() {
        const { discardedCard, newCard } = Cards.computerRefreshCard();
        UI.updateDisplays();
        return { discardedCard, newCard };
    },
    
    /**
     * Check if innings or game is over
     */
    checkInningsStatus: function() {
        const oversCompleted = Math.floor(this.state.balls / CONFIG.BALLS_PER_OVER);
        const ballsInCurrentOver = this.state.balls % CONFIG.BALLS_PER_OVER;
        const currentWickets = this.state.userIsBatting ? this.state.userWickets : this.state.compWickets;
        const currentTeam = this.state.userIsBatting ? "Your" : "Computer's";
        
        // Check if innings is over
        const inningsOver = oversCompleted >= CONFIG.TOTAL_OVERS || currentWickets >= CONFIG.TOTAL_WICKETS;
        
        // Check if target has been achieved in second innings
        let targetAchieved = false;
        if (this.state.currentInnings === 2) {
            const currentRuns = this.state.userIsBatting ? this.state.userRuns : this.state.compRuns;
            targetAchieved = currentRuns >= this.state.target;
        }
        
        // If last wicket just fell or overs completed, show innings end message
        if (inningsOver) {
            const currentRuns = this.state.userIsBatting ? this.state.userRuns : this.state.compRuns;
            const oversText = `${oversCompleted}.${ballsInCurrentOver}`;
            
            if (this.state.currentInnings === 1) {
                // First innings coming to an end - show innings summary
                const inningsSummary = `
                    <div class="refresh-info">Innings Complete</div>
                    <p>${currentTeam} innings is over!</p>
                    <p>Final Score: ${currentRuns}/${currentWickets} in ${oversText} overs.</p>
                `;
                
                UI.showInningsSummary(inningsSummary);
                
                // Set waiting for next ball to ensure user acknowledges
                this.state.waitingForNextBall = true;
                
                // Start setting up for second innings
                this.prepareSecondInnings();
            } else if (this.state.currentInnings === 2 && !targetAchieved) {
                // Second innings all out or overs complete without achieving target
                const defendingTeam = this.state.userIsBatting ? "Computer" : "You";
                const winningRuns = this.state.target - currentRuns - 1;
                
                const inningsSummary = `
                    <div class="refresh-info">Innings Complete</div>
                    <p>${currentTeam} innings is over!</p>
                    <p>Final Score: ${currentRuns}/${currentWickets} in ${oversText} overs.</p>
                    <p>${defendingTeam} won by ${winningRuns} runs!</p>
                `;
                
                UI.showInningsSummary(inningsSummary);
                
                // Set waiting for next ball to ensure user acknowledges before game over
                this.state.waitingForNextBall = true;
                
                // Game is over - show the final result
                // Wait a moment to allow user to see the innings summary
                setTimeout(() => {
                    this.endGame();
                }, 1500);
            }
        }
        
        // If target achieved in second innings, show message
        if (this.state.currentInnings === 2 && targetAchieved) {
            const winningTeam = this.state.userIsBatting ? "You" : "Computer";
            const remainingWickets = CONFIG.TOTAL_WICKETS - currentWickets;
            const remainingBalls = (CONFIG.TOTAL_OVERS * CONFIG.BALLS_PER_OVER) - this.state.balls;
            
            const inningsSummary = `
                <div class="refresh-info">Target Achieved!</div>
                <p>${winningTeam} won by ${remainingWickets} wicket${remainingWickets !== 1 ? 's' : ''}!</p>
                <p>Target of ${this.state.target} runs achieved with ${remainingBalls} ball${remainingBalls !== 1 ? 's' : ''} remaining.</p>
            `;
            
            UI.showInningsSummary(inningsSummary);
            
            // Set waiting for next ball to ensure user acknowledges before game over
            this.state.waitingForNextBall = true;
            
            // Game is over - show the final result
            // Wait a moment to allow user to see the innings summary
            setTimeout(() => {
                this.endGame();
            }, 1500);
        }
    },
    
    /**
     * Prepare for the second innings after first innings ends
     */
    prepareSecondInnings: function() {
        // Store first innings data for scoreboard
        const firstInningsTeam = this.state.userIsBatting ? "user" : "comp";
        const firstInningsRuns = this.state.userIsBatting ? this.state.userRuns : this.state.compRuns;
        const firstInningsWickets = this.state.userIsBatting ? this.state.userWickets : this.state.compWickets;
        const firstInningsOvers = Utils.formatOvers(this.state.balls);
        
        // Set as game property
        this.state.firstInningsData = {
            team: firstInningsTeam,
            runs: firstInningsRuns,
            wickets: firstInningsWickets,
            overs: firstInningsOvers
        };
        
        // Change to second innings
        this.state.currentInnings = 2;
        
        // Set target for second innings
        if (this.state.userIsBatting) {
            this.state.target = this.state.userRuns + 1;
            
            // Message for transition to player bowling
            Utils.addLogEntry(`<span class="commentary-highlight">First innings over!</span> Computer needs ${this.state.target} runs to win.`);
        } else {
            this.state.target = this.state.compRuns + 1;
            
            // Message for transition to player batting
            Utils.addLogEntry(`<span class="commentary-highlight">First innings over!</span> You need ${this.state.target} runs to win.`);
        }
        
        // After first innings, switch roles and prepare for second innings
        // Reset roles for second innings
        const wasUserBatting = this.state.userIsBatting;
        this.state.userIsBatting = !wasUserBatting;
        this.state.userIsBowling = wasUserBatting;
        
        // Reset balls count for new innings
        this.state.balls = 0;
        
        // Reset card refresh variables
        this.state.cardRefreshCount = 0;
        this.state.isCardRefreshTime = false;
        
        // Update displays
        UI.updateDisplays();
    },
    
    /**
     * End the game - shows the final game summary
     */
    endGame: function() {
        // Set game as over
        this.state.gameOver = true;
        
        // Determine the winner
        let winner = '';
        let winMessage = '';
        let winReason = '';
        
        if (this.state.currentInnings === 2) {
            const userBattedSecond = this.state.userIsBatting;
            const compBattedSecond = !this.state.userIsBatting;
            
            if ((userBattedSecond && this.state.userRuns >= this.state.target) || (compBattedSecond && this.state.compRuns < this.state.target)) {
                winner = 'You';
                const remainingWickets = CONFIG.TOTAL_WICKETS - this.state.userWickets;
                const remainingBalls = (CONFIG.TOTAL_OVERS * CONFIG.BALLS_PER_OVER) - this.state.balls;
                
                if (userBattedSecond) {
                    winMessage = `You won by ${remainingWickets} wicket${remainingWickets !== 1 ? 's' : ''}!`;
                    winReason = `You successfully chased down the target of ${this.state.target} runs with ${remainingWickets} wicket${remainingWickets !== 1 ? 's' : ''} and ${remainingBalls} ball${remainingBalls !== 1 ? 's' : ''} remaining.`;
                } else {
                    winMessage = `You won by ${this.state.target - this.state.compRuns - 1} runs!`;
                    winReason = `You successfully defended your total of ${this.state.userRuns} runs, restricting the computer to ${this.state.compRuns}/${this.state.compWickets} in ${Math.floor(this.state.balls / CONFIG.BALLS_PER_OVER)}.${this.state.balls % CONFIG.BALLS_PER_OVER} overs.`;
                }
            } else if ((compBattedSecond && this.state.compRuns >= this.state.target) || (userBattedSecond && this.state.userRuns < this.state.target)) {
                winner = 'Computer';
                const remainingWickets = CONFIG.TOTAL_WICKETS - this.state.compWickets;
                const remainingBalls = (CONFIG.TOTAL_OVERS * CONFIG.BALLS_PER_OVER) - this.state.balls;
                
                if (compBattedSecond) {
                    winMessage = `Computer won by ${remainingWickets} wicket${remainingWickets !== 1 ? 's' : ''}!`;
                    winReason = `Computer successfully chased down the target of ${this.state.target} runs with ${remainingWickets} wicket${remainingWickets !== 1 ? 's' : ''} and ${remainingBalls} ball${remainingBalls !== 1 ? 's' : ''} remaining.`;
                } else {
                    winMessage = `Computer won by ${this.state.target - this.state.userRuns - 1} runs!`;
                    winReason = `Computer successfully defended its total of ${this.state.compRuns} runs, restricting you to ${this.state.userRuns}/${this.state.userWickets} in ${Math.floor(this.state.balls / CONFIG.BALLS_PER_OVER)}.${this.state.balls % CONFIG.BALLS_PER_OVER} overs.`;
                }
            } else {
                // This shouldn't happen with the current logic, but just in case
                winner = 'Nobody';
                winMessage = 'The game ended in a tie!';
                winReason = 'Both teams scored exactly the same number of runs.';
            }
        } else {
            // If game ended after first innings (shouldn't happen with current logic)
            if (this.state.userRuns > this.state.compRuns) {
                winner = 'You';
                winMessage = `You won by ${this.state.userRuns - this.state.compRuns} runs!`;
                winReason = 'Game ended after the first innings.';
            } else if (this.state.compRuns > this.state.userRuns) {
                winner = 'Computer';
                winMessage = `Computer won by ${this.state.compRuns - this.state.userRuns} runs!`;
                winReason = 'Game ended after the first innings.';
            } else {
                winner = 'Nobody';
                winMessage = 'The game ended in a tie!';
                winReason = 'Both teams scored exactly the same number of runs.';
            }
        }
        
        // Show final game summary
        UI.showGameSummary(winner, winMessage, winReason);
        
        // Log the result
        Utils.addLogEntry(`<span class="commentary-highlight">GAME OVER!</span> ${winMessage} ${winReason}`);
    },
    
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
};
