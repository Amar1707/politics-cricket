/**
 * Cricket Election Card Game - Main Application Module
 * This is a simplified structure to reduce module interdependencies
 */

// Game state - centralized here to avoid circular references
const game = {
    allCards: {},
    deck: [],
    bowlerHand: [],
    batterHand: [],
    bowlerPlayedCard: null,
    batterPlayedCard: null,
    gamePhase: 'bowler',
    totalRuns: 0,
    totalWickets: 0,
    ballNumber: 0,
    ballHistory: []
};

// DOM element references
const elements = {
    bowlerHand: document.getElementById('bowler-hand'),
    batterHand: document.getElementById('batter-hand'),
    bowlerPlayedCard: document.getElementById('bowler-played-card'),
    batterPlayedCard: document.getElementById('batter-played-card'),
    gameStatus: document.getElementById('game-status'),
    cardsRemaining: document.getElementById('cards-remaining'),
    ballInputContainer: document.getElementById('ball-input-container'),
    runsInput: document.getElementById('runs-input'),
    wicketInput: document.getElementById('wicket-input'),
    submitResultButton: document.getElementById('submit-result'),
    totalRuns: document.getElementById('total-runs'),
    totalWickets: document.getElementById('total-wickets'),
    ballHistory: document.getElementById('ball-history'),
    resetButton: document.getElementById('reset-button')
};

/**
 * Initialize the application
 */
export async function initApp() {
    console.log("Initializing application...");
    
    // Load cards
    await loadCards();
    
    // Initialize game
    initializeGame();
    
    // Set up event listeners
    setupEventListeners();
    
    console.log("Application initialized successfully");
}

/**
 * Load cards from file or create sample ones
 */
async function loadCards() {
    try {
        console.log("Loading cards...");
        
        // Try multiple paths to find cards.json
        const possiblePaths = [
            './cards.json',
            '/cards.json',
            'cards.json',
            './data/cards.json',
            '/data/cards.json'
        ];
        
        let response;
        let loaded = false;
        
        for (const path of possiblePaths) {
            try {
                console.log(`Trying to load cards from: ${path}`);
                response = await fetch(path);
                
                if (response.ok) {
                    console.log(`Successfully loaded cards from: ${path}`);
                    game.allCards = await response.json();
                    loaded = true;
                    break;
                }
            } catch (error) {
                console.warn(`Failed to load cards from ${path}:`, error);
            }
        }
        
        if (!loaded) {
            console.log("Using sample cards instead");
            createSampleCards();
        }
        
        console.log(`Loaded ${Object.keys(game.allCards).length} cards`);
    } catch (error) {
        console.error("Error loading cards:", error);
        elements.gameStatus.textContent = "Error loading cards. Using sample cards instead.";
        createSampleCards();
    }
}

/**
 * Create sample cards for testing
 */
function createSampleCards() {
    console.log("Creating sample cards...");
    
    const sampleParties = ['BJP', 'INC', 'AITC', 'DMK', 'YSRCP', 'SHS', 'JD(U)'];
    const sampleStates = ['West Bengal', 'Maharashtra', 'Tamil Nadu', 'Uttar Pradesh', 'Kerala'];
    const sampleTypes = ['GEN', 'SC', 'ST', 'OBC'];
    const sampleCategories = ['A', 'B', 'C', 'D'];
    
    for (let i = 1; i <= 30; i++) {
        const party = sampleParties[Math.floor(Math.random() * sampleParties.length)];
        const voteShare = Math.round((25 + Math.random() * 40) * 100) / 100;
        const margin = Math.round((0.5 + Math.random() * 15) * 100) / 100;
        
        game.allCards[i] = {
            id: i,
            name: `CANDIDATE ${i}`,
            photo: `/api/placeholder/250/120`,
            age: 30 + Math.floor(Math.random() * 40),
            gender: Math.random() > 0.3 ? 'MALE' : 'FEMALE',
            party: party,
            incumbent: Math.random() > 0.7 ? 1 : 0,
            previous_member: Math.random() > 0.8 ? 1 : 0,
            vote_share: voteShare,
            rank: Math.floor(Math.random() * 3) + 1,
            constituency: `Constituency ${i}`,
            state: sampleStates[Math.floor(Math.random() * sampleStates.length)],
            type: sampleTypes[Math.floor(Math.random() * sampleTypes.length)],
            category: sampleCategories[Math.floor(Math.random() * sampleCategories.length)],
            voters: Math.floor(800000 + Math.random() * 800000),
            turnout: Math.round((60 + Math.random() * 25) * 100) / 100,
            male_turnout: Math.round((60 + Math.random() * 25) * 100) / 100,
            female_turnout: Math.round((60 + Math.random() * 25) * 100) / 100,
            winner_share: voteShare,
            margin: margin,
            nota_share: Math.round((0.5 + Math.random() * 2) * 100) / 100
        };
    }
    
    console.log(`Created ${Object.keys(game.allCards).length} sample cards`);
}

/**
 * Initialize the game
 */
function initializeGame() {
    console.log("Initializing game...");
    
    // Reset state
    game.deck = [];
    game.bowlerHand = [];
    game.batterHand = [];
    game.bowlerPlayedCard = null;
    game.batterPlayedCard = null;
    game.gamePhase = 'bowler';
    game.totalRuns = 0;
    game.totalWickets = 0;
    game.ballNumber = 0;
    game.ballHistory = [];
    
    // Create deck
    for (const id in game.allCards) {
        game.deck.push(parseInt(id));
    }
    
    // Shuffle deck
    shuffleDeck(game.deck);
    
    // Deal initial hands
    for (let i = 0; i < 6; i++) {
        if (game.deck.length > 0) game.bowlerHand.push(game.deck.pop());
        if (game.deck.length > 0) game.batterHand.push(game.deck.pop());
    }
    
    // Update UI
    updateUI();
    
    // Update scoreboard
    updateScoreboard();
    
    // Clear ball history
    elements.ballHistory.innerHTML = '<div class="ball-entry">No balls bowled yet</div>';
    
    // Update game status
    elements.gameStatus.textContent = 'Game started! Bowler plays first.';
    
    console.log("Game initialized");
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleDeck(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    console.log("Setting up event listeners...");
    
    // Reset button
    elements.resetButton.addEventListener('click', () => {
        console.log("Reset button clicked");
        initializeGame();
    });
    
    // Submit result button
    elements.submitResultButton.addEventListener('click', () => {
        console.log("Submit result button clicked");
        const runs = elements.runsInput.value;
        const wicket = elements.wicketInput.value;
        processBallResult(runs, wicket);
    });
    
    console.log("Event listeners set up");
}

/**
 * Update the user interface
 */
function updateUI() {
    try {
        console.log("Updating UI...");
        
        // Update hands
        renderHand(elements.bowlerHand, game.bowlerHand, 'bowler');
        renderHand(elements.batterHand, game.batterHand, 'batter');
        
        // Update played cards on the pitch
        if (game.bowlerPlayedCard) {
            elements.bowlerPlayedCard.innerHTML = 
                `<div class="pitched-card">${createCardHTML(game.allCards[game.bowlerPlayedCard])}</div>`;
        } else {
            elements.bowlerPlayedCard.innerHTML = '';
        }
        
        if (game.batterPlayedCard) {
            elements.batterPlayedCard.innerHTML = 
                `<div class="pitched-card">${createCardHTML(game.allCards[game.batterPlayedCard])}</div>`;
        } else {
            elements.batterPlayedCard.innerHTML = '';
        }
        
        // Update cards remaining
        elements.cardsRemaining.textContent = `Cards remaining: ${game.deck.length}`;
        
        // Update game phase visibility
        updatePhaseUI();
        
        console.log("UI updated successfully");
    } catch (error) {
        console.error("Error updating UI:", error);
    }
}

/**
 * Update UI based on current game phase
 */
function updatePhaseUI() {
    // Hide input container by default
    elements.ballInputContainer.style.display = 'none';
    
    if (game.gamePhase === 'bowler') {
        elements.gameStatus.textContent = 'Bowler\'s turn to play a card.';
        
        // Enable bowler cards, disable batter cards
        Array.from(elements.bowlerHand.querySelectorAll('.card')).forEach(card => {
            card.style.cursor = 'pointer';
            card.style.opacity = '1';
        });
        
        Array.from(elements.batterHand.querySelectorAll('.card')).forEach(card => {
            card.style.cursor = 'not-allowed';
            card.style.opacity = '0.7';
        });
    } else if (game.gamePhase === 'batter') {
        elements.gameStatus.textContent = 'Batter\'s turn to play a card.';
        
        // Disable bowler cards, enable batter cards
        Array.from(elements.bowlerHand.querySelectorAll('.card')).forEach(card => {
            card.style.cursor = 'not-allowed';
            card.style.opacity = '0.7';
        });
        
        Array.from(elements.batterHand.querySelectorAll('.card')).forEach(card => {
            card.style.cursor = 'pointer';
            card.style.opacity = '1';
        });
    } else if (game.gamePhase === 'input') {
        elements.gameStatus.textContent = 'Enter the ball result.';
        
        // Disable all cards
        Array.from(elements.bowlerHand.querySelectorAll('.card')).forEach(card => {
            card.style.cursor = 'not-allowed';
            card.style.opacity = '0.7';
        });
        
        Array.from(elements.batterHand.querySelectorAll('.card')).forEach(card => {
            card.style.cursor = 'not-allowed';
            card.style.opacity = '0.7';
        });
        
        // Show input container
        elements.ballInputContainer.style.display = 'block';
        
        // Reset input values
        elements.runsInput.value = '0';
        elements.wicketInput.value = '0';
    }
}

/**
 * Render a player's hand
 */
function renderHand(element, hand, player) {
    if (!element) {
        console.error(`Element for ${player}'s hand not found`);
        return;
    }
    
    element.innerHTML = '';
    
    hand.forEach(cardId => {
        try {
            const cardData = game.allCards[cardId];
            if (!cardData) {
                console.warn(`Card data not found for ID: ${cardId}`);
                return;
            }
            
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.innerHTML = createCardHTML(cardData);
            cardElement.dataset.cardId = cardId;
            
            // Add click event
            cardElement.addEventListener('click', () => {
                if ((player === 'bowler' && game.gamePhase === 'bowler') || 
                    (player === 'batter' && game.gamePhase === 'batter')) {
                    playCard(cardId, player);
                }
            });
            
            element.appendChild(cardElement);
        } catch (error) {
            console.error(`Error rendering card ${cardId}:`, error);
        }
    });
}

/**
 * Generate HTML for a card
 */
function createCardHTML(cardData) {
    if (!cardData) {
        console.warn("Attempted to create HTML for undefined card data");
        return '<div class="card-inner"><div class="card-content card-front">Card data unavailable</div></div>';
    }
    
    try {
        // Make sure all properties exist with fallbacks
        const name = cardData.name || 'Unknown';
        const photo = cardData.photo || '/api/placeholder/250/120';
        const age = cardData.age || 'N/A';
        const gender = cardData.gender || 'N/A';
        const party = cardData.party || 'N/A';
        const incumbent = cardData.incumbent ? 'Yes' : 'No';
        const prevMember = cardData.previous_member ? 'Yes' : 'No';
        const voteShare = (cardData.vote_share !== undefined) ? cardData.vote_share : 0;
        const rank = cardData.rank || 'N/A';
        const constituency = cardData.constituency || 'Unknown';
        const state = cardData.state || 'Unknown';
        const type = cardData.type || '';
        const category = cardData.category || '';
        
        // Format numbers safely
        const voters = cardData.voters ? cardData.voters.toLocaleString() : '0';
        const turnout = (cardData.turnout !== undefined) ? cardData.turnout : 0;
        const maleTurnout = (cardData.male_turnout !== undefined) ? cardData.male_turnout : 0;
        const femaleTurnout = (cardData.female_turnout !== undefined) ? cardData.female_turnout : 0;
        const winnerShare = (cardData.winner_share !== undefined) ? cardData.winner_share : 0;
        const margin = (cardData.margin !== undefined) ? cardData.margin : 0;
        const notaShare = (cardData.nota_share !== undefined) ? cardData.nota_share : 0;
        
        return `
            <div class="card-inner">
                <div class="card-content card-front">
                    <div class="card-header">
                        <span class="card-name">${name}</span>
                    </div>
                    
                    <img class="card-photo" src="${photo}" onerror="this.src='/api/placeholder/250/120'" alt="${name}">
                    
                    <div class="card-details">
                        <div class="detail-row">
                            <span class="detail-label">Age:</span>
                            <span class="detail-value">${age}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Gender:</span>
                            <span class="detail-value">${gender}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Party:</span>
                            <span class="detail-value">${party}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Incumbent:</span>
                            <span class="detail-value">${incumbent}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Previous Member:</span>
                            <span class="detail-value">${prevMember}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Vote Share:</span>
                            <span class="detail-value">${voteShare}%</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Rank:</span>
                            <span class="detail-value">${rank}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Constituency:</span>
                            <span class="detail-value">${constituency}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">State:</span>
                            <span class="detail-value">${state}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Type:</span>
                            <span class="detail-value">${type}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Category:</span>
                            <span class="detail-value">${category}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Voters:</span>
                            <span class="detail-value">${voters}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Turnout:</span>
                            <span class="detail-value">${turnout}%</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Male Turnout:</span>
                            <span class="detail-value">${maleTurnout}%</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Female Turnout:</span>
                            <span class="detail-value">${femaleTurnout}%</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Winner Share:</span>
                            <span class="detail-value">${winnerShare}%</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Margin:</span>
                            <span class="detail-value">${margin}%</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">NOTA Share:</span>
                            <span class="detail-value">${notaShare}%</span>
                        </div>
                    </div>
                    
                    <div class="card-footer">
                        <span>${constituency}</span>
                        <span>${state}</span>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error creating card HTML:", error);
        return '<div class="card-inner"><div class="card-content card-front">Error rendering card</div></div>';
    }
}

/**
 * Play a card from a player's hand
 */
function playCard(cardId, player) {
    console.log(`Playing card ${cardId} for ${player}`);
    
    if (player === 'bowler' && game.gamePhase === 'bowler') {
        // Remove card from hand
        game.bowlerHand = game.bowlerHand.filter(id => id != cardId);
        
        // Set as played card
        game.bowlerPlayedCard = cardId;
        
        // Move to batter's phase
        game.gamePhase = 'batter';
        
        // Update UI
        updateUI();
    } else if (player === 'batter' && game.gamePhase === 'batter') {
        // Remove card from hand
        game.batterHand = game.batterHand.filter(id => id != cardId);
        
        // Set as played card
        game.batterPlayedCard = cardId;
        
        // Move to input phase
        game.gamePhase = 'input';
        
        // Update UI
        updateUI();
    }
}

/**
 * Process the ball result
 */
function processBallResult(runs, wicket) {
    console.log(`Processing ball result: ${runs} runs, wicket: ${wicket}`);
    
    if (!game.bowlerPlayedCard || !game.batterPlayedCard) {
        console.warn("Cannot process ball result: played cards missing");
        return;
    }
    
    // Increment ball number
    game.ballNumber++;
    
    const bowlerCard = game.allCards[game.bowlerPlayedCard];
    const batterCard = game.allCards[game.batterPlayedCard];
    
    // Update score
    game.totalRuns += parseInt(runs);
    if (wicket === '1') {
        game.totalWickets++;
    }
    
    // Update scoreboard
    updateScoreboard();
    
    // Record ball history
    const ballEntry = {
        ballNumber: game.ballNumber,
        bowlerCard: bowlerCard,
        batterCard: batterCard,
        bowlerCardId: game.bowlerPlayedCard,
        batterCardId: game.batterPlayedCard,
        runs: parseInt(runs),
        wicket: wicket === '1',
        timestamp: new Date().toLocaleTimeString()
    };
    
    game.ballHistory.unshift(ballEntry);
    updateBallHistory();
    
    // Update game status
    let resultText = `Ball ${game.ballNumber}: `;
    if (parseInt(runs) === 0) {
        resultText += "Dot ball";
    } else {
        resultText += `${runs} run${parseInt(runs) > 1 ? 's' : ''}`;
    }
    
    if (wicket === '1') {
        resultText += ", WICKET!";
    }
    
    elements.gameStatus.textContent = resultText;
    
    // Draw new cards if available
    if (game.deck.length > 0) game.bowlerHand.push(game.deck.pop());
    if (game.deck.length > 0) game.batterHand.push(game.deck.pop());
    
    // Reset for next round
    setTimeout(() => {
        if (game.totalWickets >= 10 || (game.deck.length === 0 && 
            (game.bowlerHand.length === 0 || game.batterHand.length === 0))) {
            elements.gameStatus.textContent = 'Game over! Press Reset to play again.';
        } else {
            game.bowlerPlayedCard = null;
            game.batterPlayedCard = null;
            game.gamePhase = 'bowler';
            updateUI();
        }
    }, 1500);
}

/**
 * Update the scoreboard
 */
function updateScoreboard() {
    elements.totalRuns.textContent = game.totalRuns;
    elements.totalWickets.textContent = game.totalWickets;
}

/**
 * Update the ball history display
 */
function updateBallHistory() {
    try {
        elements.ballHistory.innerHTML = '';
        
        if (game.ballHistory.length === 0) {
            elements.ballHistory.innerHTML = '<div class="ball-entry">No balls bowled yet</div>';
            return;
        }
        
        game.ballHistory.forEach(ball => {
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
            bowlerMiniCard.innerHTML = createCardHTML(ball.bowlerCard);
            
            // Batter's card
            const batterMiniCard = document.createElement('div');
            batterMiniCard.className = 'ball-card';
            batterMiniCard.innerHTML = createCardHTML(ball.batterCard);
            
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
            
            elements.ballHistory.appendChild(ballEntryElement);
        });
    } catch (error) {
        console.error("Error updating ball history:", error);
    }
}
