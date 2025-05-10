/**
 * Rules modal functionality for the Cricket Card Game
 */
const Rules = {
    // DOM elements
    elements: {
        rulesBtn: document.getElementById('rules-btn'),
        rulesModalOverlay: document.getElementById('rules-modal-overlay'),
        rulesClose: document.getElementById('rules-close')
    },
    
    /**
     * Initialize rules modal
     */
    init: function() {
        // Open rules modal
        this.elements.rulesBtn.addEventListener('click', () => {
            this.openModal();
        });
        
        // Close rules modal
        this.elements.rulesClose.addEventListener('click', () => {
            this.closeModal();
        });
        
        // Close modal when clicking outside
        this.elements.rulesModalOverlay.addEventListener('click', (e) => {
            if (e.target === this.elements.rulesModalOverlay) {
                this.closeModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.rulesModalOverlay.style.display === 'flex') {
                this.closeModal();
            }
        });
    },
    
    /**
     * Open rules modal
     */
    openModal: function() {
        this.elements.rulesModalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
    },
    
    /**
     * Close rules modal
     */
    closeModal: function() {
        this.elements.rulesModalOverlay.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
};
