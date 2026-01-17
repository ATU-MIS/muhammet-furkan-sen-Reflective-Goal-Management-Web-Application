/**
 * Calculates and updates a countdown timer.
 * 
 * @param {string} targetDateString - The expiration date (e.g., "2026-01-30")
 * @param {string} displayElementId - The ID of the HTML element to render the timer
 */
function startCountdown(targetDateString, displayElementId) {
    // Get the element to display the timer
    const displayElement = document.getElementById(displayElementId);
    
    if (!displayElement) {
        console.error(`Element with ID '${displayElementId}' not found.`);
        return;
    }

    // Set the date we're counting down to
    const targetDate = new Date(targetDateString).getTime();

    // Update the count down every 1 second
    const intervalId = setInterval(function() {

        // Get today's date and time
        const now = new Date().getTime();

        // Find the distance between now and the count down date
        const distance = targetDate - now;

        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element
        displayElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        // If the count down is finished, write some text and stop the interval
        if (distance < 0) {
            clearInterval(intervalId);
            displayElement.innerHTML = "EXPIRED";
            displayElement.style.color = "var(--danger)"; // Optional styling
        }
    }, 1000);
    
    // Return interval ID in case we need to stop it externally
    return intervalId;
}
