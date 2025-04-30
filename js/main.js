/**
 * Main entry point for the self-driving car simulation.
 * Sets up the canvas, initializes objects, and starts the animation loop.
 *
 * This file serves as the central controller for the simulation,
 * coordinating the road, car, and animation system.
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

// Create a new car instance positioned in the middle lane
// Parameters: x-position (center of middle lane), y-position, width, height
const car = new Car(road.getLaneCenter(1), 100, 30, 50)

// Initial rendering
// ----------------
// Draw the car in its starting position
car.draw(ctx)

// Animation system
// ---------------
// Start the animation loop
animate()

/**
 * Main animation function that runs every frame.
 * Updates and redraws all simulation elements to create continuous motion.
 *
 * This function:
 * 1. Clears the previous frame
 * 2. Updates car physics
 * 3. Adjusts the viewport to follow the car
 * 4. Renders all elements
 * 5. Schedules the next frame
 */
function animate() {
    // Clear the entire canvas for the new frame
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update the car's position and state based on physics and controls
    car.update()

    // Resize canvas height to match window (responsive design)
    canvas.height = window.innerHeight

    // Camera following system
    // ----------------------
    // Save the current canvas state before transformations
    ctx.save()

    // Translate the canvas to keep the car in view (camera follows car)
    // Offset by 70% of canvas height to position car in lower part of screen
    ctx.translate(0, -car.y + canvas.height * 0.7)

    // Rendering
    // ---------
    // Draw the road with all lanes and borders
    road.draw(ctx)

    // Draw the car in its updated position
    car.draw(ctx)

    // Restore the canvas state (remove transformations)
    ctx.restore()

    // Schedule the next animation frame
    requestAnimationFrame(animate)
}
