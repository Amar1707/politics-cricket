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
        
        // Initialize UI elements
        UI.init();
    },
    
    /**
     * Start the game
     * @param {boolean} userBatsFirst - Whether user bats first
     */
    startGame: function(userBatsFirst) {
        UI.showGameScreen();
        
        // Hide game summary if shown
        UI.elements.gameSummaryArea.classList.add('hidden');
        
        // Set game mode
        this.state.userIsBatting = userBatsFirst;
        this.state.userIsBowling = !userBatsFirst;
        
        // Show current innings indicator
        if (this.state.userIsBatting) {
            UI.elements.userInningsIndicator.classList.remove('hidden');
            UI.elements.compInningsIndicator.classList.add('hidden');
        } else {
            UI.elements.userInningsIndicator.classList.add('hidden');
            UI.elements.compInningsIndicator.classList.remove('hidden');
        }
        
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
        Utils.addLogEntry(`<span class="log-highlight">Game started!</span> ${userBatsFirst ? 'You' : 'Computer'} is batting first.`);
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
            Utils.addLogEntry(`You bowled with <span class="log-highlight">${this.state.bowlerCardPlayed.name}</span> (${this.state.bowlerCardPlayed.vote_share}% vote share).`);
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
            Utils.addLogEntry(`You batted with <span class="log-highlight">${this.state.batterCardPlayed.name}</span> (${this.state.batterCardPlayed.vote_share}% vote share).`);
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
        Utils.addLogEntry(`Computer bowled with <span class="log-highlight">${this.state.bowlerCardPlayed.name}</span> (${this.state.bowlerCardPlayed.vote_share}% vote share).`);
        
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
        Utils.addLogEntry(`Computer batted with <span class="log-highlight">${this.state.batterCardPlayed.name}</span> (${this.state.batterCardPlayed.vote_share}% vote share).`);
        
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
        
        // Always show the ball outcome in the dedicated outcome area
        UI.showBallOutcome(
            this.state.lastBallOutcome,
            outcomeDescription,
            isWicket,
            runsScored
        );
        
        // Log the result with more details
        if (isWicket) {
            Utils.addLogEntry(`<span class="log-highlight">WICKET!</span> ${this.state.userIsBatting ? 'You' : 'Computer'} lost a wicket. ${outcomeDescription}`);
        } else {
            Utils.addLogEntry(`<span class="log-highlight">${runsScored} run${runsScored !== 1 ? 's' : ''}</span> scored by ${this.state.userIsBatting ? 'you' : 'computer'}. ${outcomeDescription}`);
        }
        
        // Update displays
        UI.updateDisplays();
        
        // Check if over is complete
        if (this.state.balls % CONFIG.BALLS_PER_OVER === 0) {
            const currentOver = Math.floor(this.state.balls / CONFIG.BALLS_PER_OVER);
            Utils.addLogEntry(`<span class="log-highlight">End of over ${currentOver}</span>`);
            
            // At the end of each but the last over, bowler can refresh cards
            if (currentOver < CONFIG.TOTAL_OVERS - 1) {
                // Determine who is bowling in the current innings
                const userIsBowlingNow = (this.state.userIsBatting === false);
                
                // After showing outcome, we'll show the card refresh option
                UI.elements.outcomeMessage.innerHTML += `
                    <p style="margin-top: 15px;"><strong>End of over ${currentOver}.</strong></p>
                    <p>${userIsBowlingNow ? 'You' : 'Computer'} can refresh cards twice.</p>
                `;
                
                // Change next ball button text
                UI.setNextBallButtonText("Manage Cards");
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
        if (this.state.balls % CONFIG.BALLS_PER_OVER === 0 && currentOver < CONFIG.TOTAL_OVERS - 1 && this.state.cardRefreshCount < 2) {
            // If button text is "Manage Cards" or we're already in refresh mode
            if (UI.elements.nextBallBtn.textContent === "Manage Cards" || this.state.isCardRefreshTime) {
                this.state.isCardRefreshTime = true;
                
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
                        UI.elements.outcomeMessage.innerHTML = `
                            <div class="refresh-info">Computer's Card Refresh (${this.state.cardRefreshCount}/2)</div>
                            <p>Computer has refreshed one card.</p>
                            <p>Click Continue to see next refresh.</p>
                        `;
                        UI.setNextBallButtonText("Continue");
                        return;
                    } else {
                        // Used all refreshes, proceed to next over
                        UI.elements.outcomeMessage.innerHTML = `
                            <div class="refresh-info">Computer's Card Refresh Complete</div>
                            <p>Computer has refreshed cards twice.</p>
                            <p>Ready for the next over!</p>
                        `;
                        UI.setNextBallButtonText("Start Next Over");
                        this.state.cardRefreshCount = 0;
                        this.state.isCardRefreshTime = false;
                        return;
                    }
                }
            } else if (UI.elements.nextBallBtn.textContent === "Continue") {
                // Second computer refresh
                this.computerRefreshCards();
                this.state.cardRefreshCount = 0;
                this.state.isCardRefreshTime = false;
                UI.elements.outcomeMessage.innerHTML = `
                    <div class="refresh-info">Computer's Card Refresh Complete</div>
                    <p>Computer has refreshed cards twice.</p>
                    <p>Ready for the next over!</p>
                `;
                UI.setNextBallButtonText("Start Next Over");
                return;
            } else if (UI.elements.nextBallBtn.textContent === "Start Next Over") {
                // Reset card refresh state
                this.state.cardRefreshCount = 0;
                this.state.isCardRefreshTime = false;
            }
        }
        
        // Hide outcome area
        UI.elements.outcomeArea.classList.add('hidden');
        UI.elements.inningsSummaryArea.classList.add('hidden');
        
        // Reset cards for next ball
        this.state.bowlerCardPlayed = null;
        this.state.batterCardPlayed = null;
        
        // Reset waiting state
        this.state.waitingForNextBall = false;
        
        // Reset button text
        UI.resetNextBallButton();
        
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
        if (this.state.gameOver) return;
        
        // Hide innings summary area
        UI.elements.inningsSummaryArea.classList.add('hidden');
        
        // If this was the end of first innings, start second innings
        if (UI.elements.nextBallBtn.textContent === "Start Second Innings") {
            // For a clean transition between innings, explicitly set up the second innings
            
            // Reset cards for next ball
            this.state.bowlerCardPlayed = null;
            this.state.batterCardPlayed = null;
            
            // Reset waiting state
            this.state.waitingForNextBall = false;
            
            // Hide outcome area
            UI.elements.outcomeArea.classList.add('hidden');
            
            // Reset button text
            UI.resetNextBallButton();
            
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
        else if (this.state.gameOver) {
            // If game is over, hide game summary and reset the game
            UI.elements.gameSummaryArea.classList.add('hidden');
            this.resetGame();
        }
    },
    
    /**
     * Show interface for user to refresh cards
     */
    showCardRefreshInterface: function() {
        // Display card refresh interface
        UI.elements.outcomeMessage.innerHTML = `<div class="refresh-info">Card Refresh (${this.state.cardRefreshCount + 1}/2)</div>
                                    Select a card to discard and draw a new one`;
        
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
            Utils.addLogEntry(`You discarded <span class="log-highlight">${discardedCard.name}</span> (${discardedCard.vote_share}% vote share) and drew a new card.`);
        } else {
            Utils.addLogEntry(`You discarded <span class="log-highlight">${discardedCard.name}</span>, but the deck is empty!`);
        }
        
        // Increment refresh count
        this.state.cardRefreshCount++;
        
        // Check if user has used all refreshes
        if (this.state.cardRefreshCount < 2) {
            // Still has one more refresh
            UI.elements.outcomeMessage.innerHTML = `
                <div class="refresh-info">Card Refresh (${this.state.cardRefreshCount}/2)</div>
                <p>You discarded <strong>${discardedCard.name}</strong>.</p>
                ${newCard ? `<p>You drew <strong>${newCard.name}</strong> (${newCard.party}, ${newCard.vote_share}% vote share).</p>` : ''}
                <p>You can discard one more card.</p>
            `;
            this.showCardRefreshInterface();
        } else {
            // Used all refreshes, proceed to next ball
            UI.elements.outcomeMessage.innerHTML = `
                <div class="refresh-info">Card Refresh Complete</div>
                <p>You discarded <strong>${discardedCard.name}</strong>.</p>
                ${newCard ? `<p>You drew <strong>${newCard.name}</strong> (${newCard.party}, ${newCard.vote_share}% vote share).</p>` : ''}
                <p>You have refreshed cards twice. Ready for next over!</p>
            `;
            UI.setNextBallButtonText("Start Next Over");
            this.state.cardRefreshCount = 0;
            this.state.isCardRefreshTime = false;
            
            // Re-render player cards
            Cards.renderPlayerCards();
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
                // First innings coming to an end - show innings summary in separate area
                const inningsSummary = `
                    <div class="refresh-info">Innings Complete</div>
                    <p>${currentTeam} innings is over!</p>
                    <p>Final Score: ${currentRuns}/${currentWickets} in ${oversText} overs.</p>
                `;
                
                UI.showInningsSummary(inningsSummary);
                
                // Set waiting for next ball to ensure user acknowledges
                this.state.waitingForNextBall = true;
                
                // Change continue button text
                UI.setContinueInningsButtonText("Start Second Innings");
                
                // Set next ball button text to match (for coordination)
                UI.setNextBallButtonText("Start Second Innings");
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
                
                // Change continue button text
                UI.setContinueInningsButtonText("View Final Result");
                
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
            
            // Change continue button text
            UI.setContinueInningsButtonText("View Final Result");
            
            // Set waiting for next ball to ensure user acknowledges before game over
            this.state.waitingForNextBall = true;
            
            // Game is over - show the final result
            // Wait a moment to allow user to see the innings summary
            setTimeout(() => {
                this.endGame();
            }, 1500);
        }
        
        // If first innings is over
        if (this.state.currentInnings === 1 && inningsOver && !targetAchieved) {
            // Store first innings data for scoreboard
            const firstInningsTeam = this.state.userIsBatting ? "user" : "comp";
            const firstInningsRuns = this.state.userIsBatting ? this.state.userRuns : this.state.compRuns;
            const firstInningsWickets = this.state.userIsBatting ? this.state.userWickets : this.state.compWickets;
            const firstInningsOvers = `${oversCompleted}.${ballsInCurrentOver}`;
            
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
                Utils.addLogEntry(`<span class="log-highlight">First innings over!</span> Computer needs ${this.state.target} runs to win.`);
                
                UI.showInningsSummary(`
                    <div class="refresh-info">Innings Complete</div>
                    <p>Your batting innings is over! You scored ${this.state.userRuns}/${this.state.userWickets} in ${oversCompleted}.${ballsInCurrentOver} overs.</p>
                    <p>Now you'll be bowling. Computer needs ${this.state.target} runs to win.</p>
                `);
            } else {
                this.state.target = this.state.compRuns + 1;
                
                // Message for transition to player batting
                Utils.addLogEntry(`<span class="log-highlight">First innings over!</span> You need ${this.state.target} runs to win.`);
                
                UI.showInningsSummary(`
                    <div class="refresh-info">Innings Complete</div>
                    <p>Computer's batting innings is over! They scored ${this.state.compRuns}/${this.state.compWickets} in ${oversCompleted}.${ballsInCurrentOver} overs.</p>
                    <p>Now you'll be batting. You need ${this.state.target} runs to win.</p>
                `);
            }
            
            // After first innings, switch roles and prepare for second innings
            // Reset roles for second innings
            const wasUserBatting = this.state.userIsBatting;
            this.state.userIsBatting = !wasUserBatting;
            this.state.userIsBowling = wasUserBatting;
            
            // Update innings indicators
            if (this.state.userIsBatting) {
                UI.elements.userInningsIndicator.classList.remove('hidden');
                UI.elements.compInningsIndicator.classList.add('hidden');
            } else {
                UI.elements.userInningsIndicator.classList.add('hidden');
                UI.elements.compInningsIndicator.classList.remove('hidden');
            }
            
            // Reset balls count for new innings
            this.state.balls = 0;
            
            // Reset card refresh variables
            this.state.cardRefreshCount = 0;
            this.state.isCardRefreshTime = false;
            
            // Update displays
            UI.updateDisplays();
        }
    },
    
    /**
     * End the game - shows the final game summary
     */
    endGame: function() {
        // Set game as over
        this.state.gameOver = true;
        
        // Keep both the ball outcome and innings summary areas visible
        // Do not hide any information at the end of the match
        // Both outcomeArea and inningsSummaryArea remain visible
        
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
        Utils.addLogEntry(`<span class="log-highlight">GAME OVER!</span> ${winMessage} ${winReason}`);
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
        
        // Reset displays
        UI.resetCardDisplays();
        UI.elements.resultDisplay.textContent = '';
        UI.hideComponents();
        UI.resetNextBallButton();
        
        // Clear log
        UI.clearLog();
        
        // Show start screen
        UI.showStartScreen();
        
        // Reset innings indicators
        UI.elements.userInningsIndicator.classList.add('hidden');
        UI.elements.compInningsIndicator.classList.add('hidden');
        
        // Re-shuffle the deck
        Cards.shuffleDeck();
        
        // Update the display
        UI.updateDisplays();
    }
};
