/**
 * Main entry point for the self-driving car simulation.
 * Sets up the canvas, initializes objects, and starts the animation loop.
 *
 * This file serves as the central controller for the simulation,
 * coordinating the road, car, sensor systems, neural network, and animation loop.
 * It implements a simple game loop pattern with update and render phases.
 *
 * The simulation demonstrates:
 * 1. Car physics with realistic movement and collision detection
 * 2. Sensor systems that detect the environment (road borders and traffic)
 * 3. Neural network AI that can control the car based on sensor inputs
 * 4. Traffic simulation with multiple vehicles
 * 5. Real-time visualization of neural network decision making
 */

// Canvas setup
// -------------
// Get the canvas elements and set their dimensions
const carCanvas = document.getElementById("carCanvas")
carCanvas.width = 200 // Fixed width for the road (narrow for better visualization)
const networkCanvas = document.getElementById("networkCanvas")
networkCanvas.width = 300 // Width for neural network visualization

// Get the 2D rendering context for drawing operations
const carCtx = carCanvas.getContext("2d")
const networkCtx = networkCanvas.getContext("2d")

// Object initialization
// --------------------
// Create a new road instance centered in the canvas
// Parameters: center x-position, width (90% of canvas), and 3 lanes
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, 3)

// Create the player car instance positioned in the middle lane
// Parameters: x-position (center of middle lane), y-position, width, height, control type
// Using "AI" control type enables the neural network to drive the car
const car = new Car(road.getLaneCenter(1), 100, 30, 50, "AI")

// Initialize traffic cars (dummy cars that move on their own)
// These cars use the "DUMMY" control type which makes them drive forward automatically
// The last parameter (2) sets a slower max speed for traffic cars
const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2), // Car directly ahead
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2), // Car in left lane
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2), // Car in right lane
    new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2), // Another car further ahead
]

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
 * 1. Updates physics and state for all simulation objects
 * 2. Adjusts the viewport to follow the car (camera system)
 * 3. Renders all visual elements (road, cars, sensors)
 * 4. Visualizes the neural network's internal state
 * 5. Schedules the next frame using requestAnimationFrame
 *
 * @param {number} time - Timestamp provided by requestAnimationFrame
 */
function animate(time) {
    // Update phase - Physics and state calculations
    // --------------------------------------------

    // Update the traffic cars' positions and physics
    for (let i = 0; i < traffic.length; i++) {
        // Empty array as second parameter because traffic cars don't need to detect each other
        traffic[i].update(road.borders, [])
    }

    // Update the player car's position, physics, and sensor readings
    // Pass both road borders and traffic cars for collision and sensor detection
    car.update(road.borders, traffic)

    // Canvas preparation
    // -----------------
    // Resize canvas height to match window (responsive design)
    carCanvas.height = window.innerHeight
    networkCanvas.height = window.innerHeight

    // Camera following system
    // ----------------------
    // Save the current canvas state before applying transformations
    carCtx.save()

    // Translate the canvas to keep the car in view (camera follows car)
    // Offset by 70% of canvas height to position car in lower part of screen
    // This creates a third-person view with more visibility ahead of the car
    carCtx.translate(0, -car.y + carCanvas.height * 0.7)

    // Rendering phase - Draw all visual elements
    // -----------------------------------------
    // Draw the road with all lanes and borders
    road.draw(carCtx)

    // Draw all traffic cars in red
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx, "red")
    }

    // Draw the player car in blue with its sensors
    car.draw(carCtx, "blue")

    // Restore the canvas state (remove camera transformations)
    carCtx.restore()

    // Neural network visualization
    // ---------------------------
    // Create animated dashed lines for network connections
    networkCtx.lineDashOffset = -time / 50

    // Draw the neural network with its current state
    Visualizer.drawNetwork(networkCtx, car.brain)

    // Schedule the next animation frame
    // This creates a continuous loop that syncs with the display refresh rate
    requestAnimationFrame(animate)
}
