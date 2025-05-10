/**
     * Prepare for card refresh at the end of an over
     * @param {number} overNumber - Current over number
     * @param {boolean} userIsBowling - Whether the user is bowling
     */
    prepareCardRefresh: function(overNumber, userIsBowling) {
        // Add card refresh controls to ball outcome
        const refreshMessage = `
            <p style="margin-top: 15px;"><strong>End of over ${overNumber}.</strong></p>
            <p>${userIsBowling ? 'You' : 'Computer'} can refresh cards twice.</p>
        `;
        
        // Update outcome message if it's showing
        if (this.views.ballOutcome && !this.views.ballOutcome.classList.contains('hidden')) {
            const outcomeDescription = this.elements.outcomeDescription;
            outcomeDescription.innerHTML += refreshMessage;
            
            // Update button text
            if (this.elements.nextBallBtn) {
                this.elements.nextBallBtn.textContent = "Manage Cards";
            }
        } else {
            // Otherwise, show a new ball outcome with this message
            this.showBallOutcome(
                "End of Over",
                refreshMessage,
                false,
                0
            );
            
            // Update button text
            if (this.elements.nextBallBtn) {
                this.elements.nextBallBtn.textContent = "Manage Cards";
            }
        }
    },
