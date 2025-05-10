/**
 * Configuration constants for the Cricket Card Game
 */
const CONFIG = {
    // Game structure
    TOTAL_OVERS: 6,
    TOTAL_WICKETS: 6,
    BALLS_PER_OVER: 6,
    CARDS_PER_PLAYER: 6,
    
    // Run scoring rules
    RUN_SCORING: [
        { min: 0, max: 3, runs: 0 },
        { min: 3, max: 6, runs: 1 },
        { min: 6, max: 9, runs: 2 },
        { min: 9, max: 12, runs: 3 },
        { min: 12, max: 15, runs: 4 },
        { min: 15, max: Infinity, runs: 6 }
    ],
    
    // Card data file path
    CARDS_JSON_PATH: 'data/cards.json',
    
    // Default card image placeholder (fallback if an image fails to load)
    DEFAULT_PLACEHOLDER: 'https://results.eci.gov.in/uploads4/candprofile/2024/PC/E24/S24/NAREN-2024-12699.jpg'
};
