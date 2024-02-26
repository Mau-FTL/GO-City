let isRotating = true; // Global variable to control rotation

function rotateCamera(timestamp) {
    if (isRotating) { // Check if the map should continue rotating
        // clamp the rotation between 0 -360 degrees
        // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
        map.rotateTo((timestamp / 180) % 360, { duration: 0 });
        // Request the next frame of the animation.
        requestAnimationFrame(rotateCamera);
    }
}

map.on('load', () => {
    // Start the animation.
    rotateCamera(0);

    // Remove label layers to enhance the map 3D extrusion is done via Studio
    const layers = map.getStyle().layers;
    for (const layer of layers) {
        if (layer.type === 'symbol' && layer.layout['text-field']) {
            // remove text labels
            // map.removeLayer(layer.id);
        }
    }
});

// Add event listener to stop the rotation when the map is clicked
map.on('click', () => {
    isRotating = false; // Stop the rotation
});
