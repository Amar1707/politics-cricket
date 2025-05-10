/**
 * Card Manager Module
 * Handles loading cards and operations related to the card deck
 */

/**
 * Load cards from the cards.json file or create sample ones if unavailable
 * @returns {Promise<Object>} A promise that resolves to the card data
 */
export async function loadCards() {
    try {
        // Try multiple paths to find the cards.json file
        let response;
        const possiblePaths = ['./cards.json', '/cards.json', '../cards.json', 'cards.json', './data/cards.json', '/data/cards.json'];
        
        console.log("Attempting to load cards from multiple possible paths...");
        
        for (const path of possiblePaths) {
            try {
                console.log(`Trying to load cards from: ${path}`);
                response = await fetch(path);
                if (response.ok) {
                    console.log(`Successfully loaded cards from: ${path}`);
                    break;
                }
            } catch (e) {
                console.warn(`Failed to load cards from ${path}: ${e.message}`);
            }
        }
        
        // If no path worked, throw error to trigger sample cards
        if (!response || !response.ok) {
            throw new Error('Failed to load cards from any path');
        }
        
        const cards = await response.json();
        console.log("Cards loaded successfully:", Object.keys(cards).length);
        return cards;
    } catch (error) {
        console.error('Error loading cards:', error);
        document.getElementById('game-status').textContent = 
            'Error loading cards. Using sample cards instead.';
        
        // For demonstration/testing, create some sample cards
        return createSampleCards();
    }
}
        console.error('Error loading cards:', error);
        document.getElementById('game-status').textContent = 
            'Error loading cards. Using sample cards instead.';
        
        // For demonstration/testing, create some sample cards
        return createSampleCards();
    }
}

/**
 * Create sample cards for testing when cards.json is not available
 * @returns {Object} Sample card data
 */
function createSampleCards() {
    const sampleCards = {};
    const sampleParties = ['BJP', 'INC', 'AITC', 'DMK', 'YSRCP', 'SHS', 'JD(U)'];
    const sampleStates = ['West Bengal', 'Maharashtra', 'Tamil Nadu', 'Uttar Pradesh', 'Kerala'];
    const sampleTypes = ['GEN', 'SC', 'ST', 'OBC'];
    const sampleCategories = ['A', 'B', 'C', 'D'];
    
    for (let i = 1; i <= 30; i++) {
        const party = sampleParties[Math.floor(Math.random() * sampleParties.length)];
        const voteShare = Math.round((25 + Math.random() * 40) * 100) / 100;
        const margin = Math.round((0.5 + Math.random() * 15) * 100) / 100;
        
        // Make sure all properties are explicitly initialized
        sampleCards[i] = {
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
    
    console.log("Sample cards created:", sampleCards);
    return sampleCards;
}
