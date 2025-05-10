/**
 * GameState class
 * Manages the core game state and logic
 */
import { shuffleDeck } from './utilities.js';
import { updateUI, updateScoreboard, updateBallHistory } from './uiController.js';

export class GameState {
    constructor() {
        // Cards collection
        this.allCards = {};
        
        // Game state
        this.deck = [];
        this.bowlerHand = [];
        this.batterHand = [];
        this.bowlerPlayedCard = null;
        this.batterPlayedCard = null;
        this.gamePhase = 'bowler'; // 'bowler', 'batter', 'input'
        
        // Game statistics
        this.totalRuns = 0;
        this.totalWickets = 0;
        this.ballNumber = 0;
        this.ballHistory = [];
    }
    
    /**
     * Initialize the game state with card data
     * @param {Object} cards - The card data loaded from JSON
     */
    initialize(cards) {
        // Set the cards
        this.allCards = cards;
        
        // Reset the game
        this.resetGame();
    }
    
    /**
     * Reset the game to its initial state
     */
    resetGame() {
        // Reset state
        this.deck = [];
        this.bowlerHand = [];
        this.batterHand = [];
        this.bowlerPlayedCard = null;
        this.batterPlayedCard = null;
        this.gamePhase = 'bowler';
        this.totalRuns = 0;
        this.totalWickets = 0;
        this.ballNumber = 0;
        this.ballHistory = [];
        
        // Create deck from all cards
        for (const id in this.allCards) {
            this.deck.push(parseInt(id));
        }
        
        // Shuffle the deck
        shuffleDeck(this.deck);
        
        // Deal initial hands
        for (let i = 0; i < 6; i++) {
            if (this.deck.length > 0) this.bowlerHand.push(this.deck.pop());
            if (this.deck.length > 0) this.batterHand.push(this.deck.pop());
        }
        
        // Update UI
        updateUI(this);
        updateScoreboard(this);
        
        // Initialize ball history
        document.getElementById('ball-history').innerHTML = 
            '<div class="ball-entry">No balls bowled yet</div>';
        
        // Update game status
        document.getElementById('game-status').textContent = 
            'Game started! Bowler plays first.';
    }
    
    /**
     * Play a card from a player's hand
     * @param {number} cardId - The ID of the card being played
     * @param {string} player - The player ('bowler' or 'batter') playing the card
     */
    playCard(cardId, player) {
        if (player === 'bowler' && this.gamePhase === 'bowler') {
            // Remove card from hand
            this.bowlerHand = this.bowlerHand.filter(id => id != cardId);
            
            // Set as played card
            this.bowlerPlayedCard = cardId;
            
            // Move to batter's phase
            this.gamePhase = 'batter';
            
            // Update UI
            updateUI(this);
        } else if (player === 'batter' && this.gamePhase === 'batter') {
            // Remove card from hand
            this.batterHand = this.batterHand.filter(id => id != cardId);
            
            // Set as played card
            this.batterPlayedCard = cardId;
            
            // Move to input phase
            this.gamePhase = 'input';
            
            // Update UI
            updateUI(this);
        }
    }
    
    /**
     * Process the ball result after cards have been played
     * @param {string} runs - The number of runs scored as a string
     * @param {string} wicket - Whether a wicket fell ('0' or '1')
     */
    processBallResult(runs, wicket) {
        if (!this.bowlerPlayedCard || !this.batterPlayedCard) return;
        
        // Increment ball number
        this.ballNumber++;
        
        const bowlerCard = this.allCards[this.bowlerPlayedCard];
        const batterCard = this.allCards[this.batterPlayedCard];
        
        // Update score
        this.totalRuns += parseInt(runs);
        if (wicket === '1') {
            this.totalWickets++;
        }
        
        // Update scoreboard
        updateScoreboard(this);
        
        // Record ball history
        const ballEntry = {
            ballNumber: this.ballNumber,
            bowlerCard: bowlerCard,
            batterCard: batterCard,
            bowlerCardId: this.bowlerPlayedCard,
            batterCardId: this.batterPlayedCard,
            runs: parseInt(runs),
            wicket: wicket === '1',
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.ballHistory.unshift(ballEntry); // Add to the beginning of the array
        updateBallHistory(this);
        
        // Update game status
        let resultText = `Ball ${this.ballNumber}: `;
        if (parseInt(runs) === 0) {
            resultText += "Dot ball";
        } else {
            resultText += `${runs} run${parseInt(runs) > 1 ? 's' : ''}`;
        }
        
        if (wicket === '1') {
            resultText += ", WICKET!";
        }
        
        document.getElementById('game-status').textContent = resultText;
        
        // Draw new cards if available
        if (this.deck.length > 0) this.bowlerHand.push(this.deck.pop());
        if (this.deck.length > 0) this.batterHand.push(this.deck.pop());
        
        // Reset for next round
        setTimeout(() => {
            if (this.totalWickets >= 10 || (this.deck.length === 0 && 
                (this.bowlerHand.length === 0 || this.batterHand.length === 0))) {
                document.getElementById('game-status').textContent = 
                    'Game over! Press Reset to play again.';
            } else {
                this.bowlerPlayedCard = null;
                this.batterPlayedCard = null;
                this.gamePhase = 'bowler';
                updateUI(this);
            }
        }, 1500);
    }
}
