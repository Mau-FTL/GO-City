// Select all toggle buttons in the map interface
const mapToggle = document.querySelectorAll('.map-toggle');

// Store the currently active map toggle button
let mapToggleActive = document.querySelector('.map-toggle--active');

// Iterate over each toggle button to add click event listeners
for (var i = 0; i < mapToggle.length; i++) {
    mapToggle[i].addEventListener('click', buttonClick);
}

// Define function to handle click events for map toggle buttons
function buttonClick() {
    // Check if the clicked button is not already the active button
    if (!this.classList.contains('map-toggle--active')) {

        // Remove the 'active' status from the currently active button
        mapToggleActive.classList.remove('map-toggle--active');

        // Assign 'active' status to the button that was clicked
        this.classList.add('map-toggle--active');

        // Add animation class to the previously active button to animate the transition
        mapToggleActive.classList.add('map-toggle--animate');

        // Add animation class to the new active button to animate the transition
        this.classList.add('map-toggle--animate');

        // Update the reference to the currently active button
        mapToggleActive = this;
    }
}

// Functions for button active style
function addActiveStyle(button) {
    button.style.backgroundColor = ''; // leave blank so CSS applies color
}

function clearActiveStyle() {
    document.querySelectorAll('.map-toggle').forEach(button => {
        button.style.backgroundColor = '';
    });
}