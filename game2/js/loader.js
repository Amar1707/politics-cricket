/**
 * Loader for dynamic content
 * Loads the Match Center HTML into the container
 */
(function() {
    // Load Match Center HTML
    window.addEventListener('DOMContentLoaded', function() {
        const matchCenterContainer = document.getElementById('match-center-container');
        
        if (matchCenterContainer) {
            // Load Match Center content
            fetch('match-center.html')
                .then(response => response.text())
                .then(html => {
                    matchCenterContainer.innerHTML = html;
                })
                .catch(error => {
                    console.error('Error loading Match Center:', error);
                    matchCenterContainer.innerHTML = '<div class="error-message">Error loading Match Center. Please refresh the page.</div>';
                });
        }
    });
})();
