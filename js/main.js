/**
 * Main entry point for the self-driving car simulation.
 * Sets up the canvas, initializes objects, and starts the animation loop.
 */

// Get the canvas element and set its dimensions
const canvas = document.getElementById("myCanvas")
canvas.height = window.innerHeight // Full height of the window
canvas.width = 200 // Fixed width for the road

// Get the 2D rendering context for drawing
const ctx = canvas.getContext("2d")

// Create a new car instance at position (100,100) with size 30x50
const car = new Car(100, 100, 30, 50)

// Initial draw of the car
car.draw(ctx)

// Start the animation loop
animate()

/**
 * Main animation function that runs every frame.
 * Updates and redraws all simulation elements.
 */
function animate() {
    // Clear the entire canvas for the new frame
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update the car's position and state
    car.update()

    // Redraw the car in its new position
    car.draw(ctx)

    // Schedule the next frame
    requestAnimationFrame(animate)
}
