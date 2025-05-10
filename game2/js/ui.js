/**
     * Reset card displays to default state
     */
    resetCardDisplays: function() {
        const defaultCardHTML = `
            <div class="card-header">Select a card to start</div>
            <img src="${CONFIG.DEFAULT_PLACEHOLDER}" alt="Candidate Photo" class="player-image">
            <div class="card-body">
                <div class="card-info">
                    <span class="info-label">Party:</span>
                    <span class="info-value party-tag">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Age:</span>
                    <span class="info-value">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Gender:</span>
                    <span class="info-value">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Vote Share:</span>
                    <span class="info-value">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Rank:</span>
                    <span class="info-value">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Constituency:</span>
                    <span class="info-value">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">State:</span>
                    <span class="info-value">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Type:</span>
                    <span class="info-value">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Turnout:</span>
                    <span class="info-value">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Margin:</span>
                    <span class="info-value">-</span>
                </div>
                <div class="card-info">
                    <span class="info-label">Female Turnout Edge:</span>
                    <span class="info-value">-</span>
                </div>
            </div>
        `;
