/**
 * Main entry point for the self-driving car simulation.
 * Sets up the canvas, initializes objects, and starts the animation loop.
 *
 * This file serves as the central controller for the simulation,
 * coordinating the road, car, sensor systems, and animation loop.
 * It implements a simple game loop pattern with update and render phases.
 */

// Canvas setup
// -------------
// Get the canvas element and set its dimensions
const canvas = document.getElementById("myCanvas")
canvas.width = 200 // Fixed width for the road (narrow for better visualization)

// Get the 2D rendering context for drawing operations
const ctx = canvas.getContext("2d")

// Object initialization
// --------------------
// Create a new road instance centered in the canvas
// Parameters: center x-position, width (90% of canvas), and 3 lanes
const road = new Road(canvas.width / 2, canvas.width * 0.9, 3)

// Create the player car instance positioned in the middle lane
// Parameters: x-position (center of middle lane), y-position, width, height, control type
const car = new Car(road.getLaneCenter(1), 100, 30, 50, "KEYS")

// Initialize traffic cars (dummy cars that move on their own)
const traffic = [new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2)]

// Animation system
// ---------------
// Start the animation loop
animate()

/**
 * Main animation function that runs every frame.
 * Updates and redraws all simulation elements to create continuous motion.
 * Implements a standard game loop with separate update and render phases.
 *
 * This function:
 * 1. Clears the previous frame
 * 2. Updates car physics and sensor systems
 * 3. Adjusts the viewport to follow the car (camera system)
 * 4. Renders all elements (road, car, sensors)
 * 5. Schedules the next frame using requestAnimationFrame
 */
function animate() {
    // Clear the entire canvas for the new frame
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update the traffic cars' positions and physics
    // Loop through each traffic car and update its state
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []) // Update each traffic car
    }

    // Update the car's position, physics, and sensor readings
    // Pass road borders to allow sensors to detect them
    car.update(road.borders, traffic)

    // Resize canvas height to match window (responsive design)
    // This is done every frame to handle window resizing
    canvas.height = window.innerHeight

    // Camera following system
    // ----------------------
    // Save the current canvas state before applying transformations
    ctx.save()

    // Translate the canvas to keep the car in view (camera follows car)
    // Offset by 70% of canvas height to position car in lower part of screen
    // This creates a third-person view with more visibility ahead of the car
    ctx.translate(0, -car.y + canvas.height * 0.7)

    // Rendering phase
    // --------------
    // Draw the road with all lanes and borders
    road.draw(ctx)

    // Draw each traffic car on the road
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(ctx, "red") // Draw each traffic car
    }

    // Draw the car and its sensors in their updated positions
    car.draw(ctx, "blue")

    // Restore the canvas state (remove camera transformations)
    ctx.restore()

    // Schedule the next animation frame
    // This creates a continuous loop that syncs with the display refresh rate
    requestAnimationFrame(animate)
}
