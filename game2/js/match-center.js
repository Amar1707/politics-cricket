/**
     * Show card refresh interface
     * @param {number} refreshCount - Current refresh count (1 or 2)
     */
    showCardRefreshInterface: function(refreshCount) {
        // Update the ball outcome view to show card refresh
        this.elements.outcomeResult.textContent = `Card Refresh (${refreshCount}/2)`;
        this.elements.outcomeDescription.textContent = `Select a card to discard and draw a new one`;
        
        // Show the outcome view if not visible
        this.showView('ballOutcome');
        
        // Update next ball button text
        if (this.elements.nextBallBtn) {
            this.elements.nextBallBtn.textContent = "Continue";
        }
    },
    
    /**
     * Show the result of a card refresh
     * @param {string} title - Title for the refresh result
     * @param {string} message - Message describing the refresh
     * @param {string} buttonText - Text for the button
     */
    showRefreshResult: function(title, message, buttonText) {
        // Update the ball outcome view to show refresh result
        this.elements.outcomeResult.textContent = title;
        this.elements.outcomeDescription.innerHTML = message;
        
        // Show the outcome view if not visible
        this.showView('ballOutcome');
        
        // Update next ball button text
        if (this.elements.nextBallBtn) {
            this.elements.nextBallBtn.textContent = buttonText;
        }
    },
