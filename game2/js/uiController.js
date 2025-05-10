/**
 * UI Controller Module
 * Handles all UI-related functionality
 */

/**
 * Update the UI to reflect the current game state
 * @param {Object} gameState - The current game state
 */
export function updateUI(gameState) {
    // DOM elements
    const bowlerHandElement = document.getElementById('bowler-hand');
    const batterHandElement = document.getElementById('batter-hand');
    const bowlerPlayedCardElement = document.getElementById('bowler-played-card');
    const batterPlayedCardElement = document.getElementById('batter-played-card');
    const cardsRemainingElement = document.getElementById('cards-remaining');
    
    // Update hands
    renderHand(bowlerHandElement, gameState.bowlerHand, 'bowler', gameState);
    renderHand(batterHandElement, gameState.batterHand, 'batter', gameState);
    
    // Update played cards on the pitch
    if (gameState.bowlerPlayedCard) {
        bowlerPlayedCardElement.innerHTML = 
            `<div class="pitched-card">${createCardHTML(gameState.allCards[gameState.bowlerPlayedCard], false)}</div>`;
    } else {
        bowlerPlayedCardElement.innerHTML = '';
    }
    
    if (gameState.batterPlayedCard) {
        batterPlayedCardElement.innerHTML = 
            `<div class="pitched-card">${createCardHTML(gameState.allCards[gameState.batterPlayedCard], false)}</div>`;
    } else {
        batterPlayedCardElement.innerHTML = '';
    }
    
    // Update cards remaining
    cardsRemainingElement.textContent = `Cards remaining: ${gameState.deck.length}`;
    
    // Update game phase visibility
    updatePhaseUI(gameState);
}

/**
 * Update UI based on current game phase
 * @param {Object} gameState - The current game state
 */
export function updatePhaseUI(gameState) {
    const ballInputContainer = document.getElementById('ball-input-container');
    const gameStatusElement = document.getElementById('game-status');
    const bowlerHandElement = document.getElementById('bowler-hand');
    const batterHandElement = document.getElementById('batter-hand');
    
    // Hide input container by default
    ballInputContainer.style.display = 'none';
    
    if (gameState.gamePhase === 'bowler') {
        gameStatusElement.textContent = 'Bowler\'s turn to play a card.';
        
        // Enable bowler cards, disable batter cards
        Array.from(bowlerHandElement.querySelectorAll('.card')).forEach(card => {
            card.style.cursor = 'pointer';
            card.style.opacity = '1';
        });
        
        Array.from(batterHandElement.querySelectorAll('.card')).forEach(card => {
            card.style.cursor = 'not-allowed';
            card.style.opacity = '0.7';
        });
    } else if (gameState.gamePhase === 'batter') {
        gameStatusElement.textContent = 'Batter\'s turn to play a card.';
        
        // Disable bowler cards, enable batter cards
        Array.from(bowlerHandElement.querySelectorAll('.card')).forEach(card => {
            card.style.cursor = 'not-allowed';
            card.style.opacity = '0.7';
        });
        
        Array.from(batterHandElement.querySelectorAll('.card')).forEach(card => {
            card.style.cursor = 'pointer';
            card.style.opacity = '1';
        });
    } else if (gameState.gamePhase === 'input') {
        gameStatusElement.textContent = 'Enter the ball result.';
        
        // Disable all cards
        Array.from(bowlerHandElement.querySelectorAll('.card')).forEach(card => {
            card.style.cursor = 'not-allowed';
            card.style.opacity = '0.7';
        });
        
        Array.from(batterHandElement.querySelectorAll('.card')).forEach(card => {
            card.style.cursor = 'not-allowed';
            card.style.opacity = '0.7';
        });
        
        // Show input container
        ballInputContainer.style.display = 'block';
        
        // Reset input values
        document.getElementById('runs-input').value = '0';
        document.getElementById('wicket-input').value = '0';
    }
}

/**
 * Render a player's hand
 * @param {HTMLElement} element - The DOM element for the hand
 * @param {Array} hand - Array of card IDs in the hand
 * @param {string} player - The player ('bowler' or 'batter')
 * @param {Object} gameState - The current game state
 */
function renderHand(element, hand, player, gameState) {
    element.innerHTML = '';
    
    hand.forEach(cardId => {
        const cardData = gameState.allCards[cardId];
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.innerHTML = createCardHTML(cardData, true);
        cardElement.dataset.cardId = cardId;
        
        // Add click event
        cardElement.addEventListener('click', () => {
            if ((player === 'bowler' && gameState.gamePhase === 'bowler') || 
                (player === 'batter' && gameState.gamePhase === 'batter')) {
                gameState.playCard(cardId, player);
            }
        });
        
        element.appendChild(cardElement);
    });
}

/**
 * Generate HTML for a card
 * @param {Object} cardData - Data for the card
 * @param {boolean} isInHand - Whether the card is in a player's hand
 * @returns {string} HTML string for the card
 */
export function createCardHTML(cardData, isInHand) {
    if (!cardData) return '';
    
    return `
        <div class="card-inner">
            <div class="card-content card-front">
                <div class="card-header">
                    <span class="card-name">${cardData.name}</span>
                </div>
                
                <img class="card-photo" src="${cardData.photo}" onerror="this.src='/api/placeholder/250/120'" alt="${cardData.name}">
                
                <div class="card-details">
                    <div class="detail-row">
                        <span class="detail-label">Age:</span>
                        <span class="detail-value">${cardData.age}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Gender:</span>
                        <span class="detail-value">${cardData.gender}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Party:</span>
                        <span class="detail-value">${cardData.party}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Incumbent:</span>
                        <span class="detail-value">${cardData.incumbent ? 'Yes' : 'No'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Previous Member:</span>
                        <span class="detail-value">${cardData.previous_member ? 'Yes' : 'No'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Vote Share:</span>
                        <span class="detail-value">${cardData.vote_share}%</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Rank:</span>
                        <span class="detail-value">${cardData.rank}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Constituency:</span>
                        <span class="detail-value">${cardData.constituency}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">State:</span>
                        <span class="detail-value">${cardData.state}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">${cardData.type || ''}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Category:</span>
                        <span class="detail-value">${cardData.category || ''}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Voters:</span>
                        <span class="detail-value">${cardData.voters.toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Turnout:</span>
                        <span class="detail-value">${cardData.turnout}%</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Male Turnout:</span>
                        <span class="detail-value">${cardData.male_turnout}%</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Female Turnout:</span>
                        <span class="detail-value">${cardData.female_turnout}%</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Winner Share:</span>
                        <span class="detail-value">${cardData.winner_share}%</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Margin:</span>
                        <span class="detail-value">${cardData.margin}%</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">NOTA Share:</span>
                        <span class="detail-value">${cardData.nota_share}%</span>
                    </div>
                </div>
                
                <div class="card-footer">
                    <span>${cardData.constituency}</span>
                    <span>${cardData.state}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Update the scoreboard
 * @param {Object} gameState - The current game state
 */
export function updateScoreboard(gameState) {
    const totalRunsElement = document.getElementById('total-runs');
    const totalWicketsElement = document.getElementById('total-wickets');
    
    totalRunsElement.textContent = gameState.totalRuns;
    totalWicketsElement.textContent = gameState.totalWickets;
}

/**
 * Update the ball history display
 * @param {Object} gameState - The current game state
 */
export function updateBallHistory(gameState) {
    const ballHistoryElement = document.getElementById('ball-history');
    ballHistoryElement.innerHTML = '';
    
    if (gameState.ballHistory.length === 0) {
        ballHistoryElement.innerHTML = '<div class="ball-entry">No balls bowled yet</div>';
        return;
    }
    
    gameState.ballHistory.forEach(ball => {
        const ballEntryElement = document.createElement('div');
        ballEntryElement.className = 'ball-entry';
        
        const ballNumberElement = document.createElement('div');
        ballNumberElement.className = 'ball-number';
        ballNumberElement.textContent = `Ball ${ball.ballNumber}`;
        
        // Create mini cards for the ball history
        const ballCardsElement = document.createElement('div');
        ballCardsElement.className = 'ball-cards';
        
        // Bowler's card
        const bowlerMiniCard = document.createElement('div');
        bowlerMiniCard.className = 'ball-card';
        bowlerMiniCard.innerHTML = createCardHTML(ball.bowlerCard, false);
        
        // Batter's card
        const batterMiniCard = document.createElement('div');
        batterMiniCard.className = 'ball-card';
        batterMiniCard.innerHTML = createCardHTML(ball.batterCard, false);
        
        ballCardsElement.appendChild(bowlerMiniCard);
        ballCardsElement.appendChild(batterMiniCard);
        
        // Ball meta information
        const ballMetaElement = document.createElement('div');
        ballMetaElement.className = 'ball-meta';
        
        const ballDetailsElement = document.createElement('div');
        ballDetailsElement.className = 'ball-details';
        ballDetailsElement.innerHTML = `
            <div>Time: ${ball.timestamp}</div>
        `;
        
        const ballResultElement = document.createElement('div');
        ballResultElement.className = 'ball-result';
        let resultText = '';
        if (ball.runs === 0) {
            resultText += '<span>Dot</span>';
        } else {
            resultText += `<span class="runs-scored">${ball.runs} run${ball.runs > 1 ? 's' : ''}</span>`;
        }
        
        if (ball.wicket) {
            resultText += ' <span class="wicket-fallen">W</span>';
        }
        
        ballResultElement.innerHTML = resultText;
        
        ballMetaElement.appendChild(ballDetailsElement);
        ballMetaElement.appendChild(ballResultElement);
        
        // Assemble all elements
        ballEntryElement.appendChild(ballNumberElement);
        ballEntryElement.appendChild(ballCardsElement);
        ballEntryElement.appendChild(ballMetaElement);
        
        ballHistoryElement.appendChild(ballEntryElement);
    });
}
