/**
 * Card Management for the Cricket Card Game
 * Handles card loading, display, and operations
 */
const Cards = {
    // Card data
    allCards: [],
    deck: [],
    playerCards: [],
    computerCards: [],
    
    /**
     * Initialize card data
     * @returns {Promise} Promise that resolves when cards are loaded
     */
    init: async function() {
        try {
            // Load cards from cards.json
            const response = await fetch(CONFIG.CARDS_JSON_PATH);
            const cardsData = await response.json();
            this.allCards = Object.values(cardsData);
            console.log(`Loaded ${this.allCards.length} cards`);
            return true;
        } catch (error) {
            console.error('Error loading cards:', error);
            alert('Error loading cards. Please check the console for details.');
            return false;
        }
    },
    
    /**
     * Shuffle the deck
     */
    shuffleDeck: function() {
        this.deck = Utils.shuffleArray(this.allCards);
    },
    
    /**
     * Deal cards to players
     */
    dealCards: function() {
        this.playerCards = this.deck.splice(0, CONFIG.CARDS_PER_PLAYER);
        this.computerCards = this.deck.splice(0, CONFIG.CARDS_PER_PLAYER);
        this.renderPlayerCards();
    },
    
    /**
     * Render player's cards in the UI
     */
    renderPlayerCards: function() {
        const playerCardsDisplay = document.getElementById('player-cards');
        playerCardsDisplay.innerHTML = '';
        
        this.playerCards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'player-card';
            cardElement.dataset.index = index;
            
            cardElement.innerHTML = `
                <div class="mini-card-header">${card.name}</div>
                <img src="${card.photo}" alt="${card.name}" class="mini-player-image">
                <div class="mini-card-body">
                    <div class="mini-card-info">
                        <span class="mini-info-label">Party:</span>
                        <span>${card.party}</span>
                    </div>
                    <div class="mini-card-info">
                        <span class="mini-info-label">Vote Share:</span>
                        <span>${card.vote_share}%</span>
                    </div>
                    <div class="mini-card-info">
                        <span class="mini-info-label">Rank:</span>
                        <span>${card.rank}</span>
                    </div>
                    <div class="mini-card-info">
                        <span class="mini-info-label">Age:</span>
                        <span>${card.age}</span>
                    </div>
                    <div class="mini-card-info">
                        <span class="mini-info-label">Gender:</span>
                        <span>${card.gender}</span>
                    </div>
                    <div class="mini-card-info">
                        <span class="mini-info-label">Type:</span>
                        <span>${card.type}</span>
                    </div>
                    <div class="mini-card-info">
                        <span class="mini-info-label">Constituency:</span>
                        <span title="${card.constituency}">${card.constituency.length > 12 ? card.constituency.substring(0, 10) + '...' : card.constituency}</span>
                    </div>
                    <div class="mini-card-info">
                        <span class="mini-info-label">State:</span>
                        <span title="${card.state}">${card.state.length > 12 ? card.state.substring(0, 10) + '...' : card.state}</span>
                    </div>
                    <div class="mini-card-info">
                        <span class="mini-info-label">Turnout:</span>
                        <span>${card.turnout}%</span>
                    </div>
                    <div class="mini-card-info">
                        <span class="mini-info-label">Margin:</span>
                        <span>${card.margin}%</span>
                    </div>
                    <div class="mini-card-info">
                        <span class="mini-info-label">Female Turnout Edge:</span>
                        <span>${card.female_turnout_edge}%</span>
                    </div>
                </div>
            `;
            
            // Enable card selection if the game is in a valid state for selection
            if (!Game.state.waitingForNextBall) {
                // Add clear visual indicator that the card is selectable
                cardElement.classList.add('selectable-card');
                cardElement.addEventListener('click', () => Game.playerSelectsCard(index));
            }
            
            playerCardsDisplay.appendChild(cardElement);
        });
    },
    
    /**
     * Render cards for card refresh
     */
    renderCardsForRefresh: function() {
        const playerCardsDisplay = document.getElementById('player-cards');
        playerCardsDisplay.innerHTML = '';
        
        this.playerCards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'player-card card-refresh-highlight';
            cardElement.dataset.index = index;
            
            cardElement.innerHTML = `
                <div class="mini-card-header">${card.name}</div>
                <img src="${card.photo}" alt="${card.name}" class="mini-player-image">
                <div class="mini-card-body">
                    <div class="mini-card-info">
                        <span class="mini-info-label">Party:</span>
                        <span>${card.party}</span>
                    </div>
                    <div class="mini-card-info">
                        <span class="mini-info-label">Vote Share:</span>
                        <span>${card.vote_share}%</span>
                    </div>
                    <div class="mini-card-info">
                        <span class="mini-info-label">Rank:</span>
                        <span>${card.rank}</span>
                    </div>
                    <div class="mini-card-info">
                        <span class="mini-info-label">Gender:</span>
                        <span>${card.gender}</span>
                    </div>
                    <div class="mini-card-info">
                        <span class="mini-info-label">Type:</span>
                        <span>${card.type}</span>
                    </div>
                    <button class="discard-btn">Discard</button>
                </div>
            `;
            
            // Add click handler for card discard
            cardElement.addEventListener('click', () => Game.discardAndDrawCard(index));
            
            playerCardsDisplay.appendChild(cardElement);
        });
    },
    
    /**
     * Find the best card for computer to use as bowler
     * @returns {object} The best card and its index
     */
    getBestBowlingCard: function() {
        let bestIndex = 0;
        let highestScore = -1;
        
        for (let i = 0; i < this.computerCards.length; i++) {
            const card = this.computerCards[i];
            let score = card.vote_share;
            
            // Bonus for special cards
            if (card.gender === "FEMALE") score += 5; // Bonus for gender advantage
            if (card.type === "SC" || card.type === "ST") score += 5; // Bonus for type advantage
            
            // Pick the card with highest score
            if (score > highestScore) {
                highestScore = score;
                bestIndex = i;
            }
        }
        
        return { card: this.computerCards[bestIndex], index: bestIndex };
    },
    
    /**
     * Find the best card for computer to use as batter
     * @param {object} bowlerCard - The bowler's card
     * @returns {object} The best card and its index
     */
    getBestBattingCard: function(bowlerCard) {
        let bestIndex = 0;
        let bestScore = -Infinity;
        
        for (let i = 0; i < this.computerCards.length; i++) {
            const card = this.computerCards[i];
            let score = 0;
            
            // If vote share is below bowler's but rank is 1, it's a good choice
            if (card.vote_share < bowlerCard.vote_share && card.rank === 1) {
                score = 100; // Very high score for rank 1 cards when needed
            } else {
                // Otherwise score based on vote share difference
                score = card.vote_share - bowlerCard.vote_share;
                
                // Special case matching
                if (card.party === bowlerCard.party) {
                    score -= 20; // Bad choice if same party
                }
                if (bowlerCard.gender === "FEMALE" && card.gender !== "FEMALE") {
                    score -= 20; // Bad choice if gender disadvantage
                }
                if (bowlerCard.type === "SC" && card.type !== "SC") {
                    score -= 20; // Bad choice if type disadvantage
                }
                if (bowlerCard.type === "ST" && card.type !== "ST") {
                    score -= 20; // Bad choice if type disadvantage
                }
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestIndex = i;
            }
        }
        
        return { card: this.computerCards[bestIndex], index: bestIndex };
    },
    
    /**
     * Draw a card from the deck
     * @returns {object|null} The drawn card or null if deck is empty
     */
    drawCard: function() {
        if (this.deck.length > 0) {
            return this.deck.shift();
        }
        return null;
    },
    
    /**
     * Computer discards a card and draws a new one
     * @returns {object} Information about the discard
     */
    computerRefreshCard: function() {
        // Find the card with the lowest vote_share to discard
        let lowestIndex = 0;
        let lowestVoteShare = this.computerCards[0].vote_share;
        
        for (let i = 1; i < this.computerCards.length; i++) {
            if (this.computerCards[i].vote_share < lowestVoteShare) {
                lowestVoteShare = this.computerCards[i].vote_share;
                lowestIndex = i;
            }
        }
        
        // Get the card info for the log
        const discardedCard = this.computerCards[lowestIndex];
        
        // Remove the card with lowest vote_share
        this.computerCards.splice(lowestIndex, 1);
        
        // Draw a new card
        let newCard = null;
        if (this.deck.length > 0) {
            newCard = this.deck.shift();
            this.computerCards.push(newCard);
            Utils.addLogEntry(`Computer discarded <span class="log-highlight">${discardedCard.name}</span> (${discardedCard.vote_share}% vote share) and drew a new card.`);
        } else {
            Utils.addLogEntry(`Computer discarded <span class="log-highlight">${discardedCard.name}</span>, but the deck is empty!`);
        }
        
        return { discardedCard, newCard };
    }
};
