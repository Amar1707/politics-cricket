/**
 * Initialize card data
 * @returns {Promise} Promise that resolves when cards are loaded
 */
init: async function() {
    try {
        // Load cards from cards.json
        const response = await fetch(CONFIG.CARDS_JSON_PATH);
        if (!response.ok) {
            throw new Error(`Failed to load cards: ${response.status} ${response.statusText}`);
        }
        const cardsData = await response.json();
        this.allCards = Object.values(cardsData);
        console.log(`Loaded ${this.allCards.length} cards`);
        
        // Handle image errors by setting a fallback
        this.allCards.forEach(card => {
            if (!card.photo || card.photo.trim() === '') {
                card.photo = `${CONFIG.DEFAULT_PLACEHOLDER}&text=${encodeURIComponent(card.name)}`;
            }
        });
        
        return true;
    } catch (error) {
        console.error('Error loading cards:', error);
        alert('Failed to load candidate cards. Please check the data file and reload the page.');
        return false;
    }
},
