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
const cars = generateCars(100) // Generate 100 random cars for the simulation
let bestCar = cars[0] // Variable to hold the best car (the one that drives the best)
// Check if a saved neural network exists in local storage
// If it exists, load it into the best car's brain
if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        // Clone the best car's brain into each car in the array
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"))
        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.1) // Mutate the brain for diversity
        }
    }
}

// Initialize traffic cars (dummy cars that move on their own)
// These cars use the "DUMMY" control type which makes them drive forward automatically
// The last parameter (2) sets a slower max speed for traffic cars
const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2), // Car directly ahead
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2), // Car in left lane
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2), // Car in right lane
    new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2), // Another car further ahead
    new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2), // Another car further ahead
    new Car(road.getLaneCenter(1), -600, 30, 50, "DUMMY", 2), // Another car further ahead
    new Car(road.getLaneCenter(2), -850, 30, 50, "DUMMY", 2), // Another car further ahead
    new Car(road.getLaneCenter(0), -900, 30, 50, "DUMMY", 2), // Another car further ahead
]

// Animation system
// ---------------
// Start the animation loop
animate()

/**
 * Saves the neural network of the best performing car to local storage.
 * This function is called when the user clicks the save button.
 *
 * Saving allows users to:
 * - Preserve a well-performing neural network
 * - Use it as a starting point for further training
 * - Share successful networks with others
 */
function save() {
    // Convert the neural network to a JSON string
    const data = JSON.stringify(bestCar.brain)

    // Save to local storage with the key "bestBrain"
    localStorage.setItem("bestBrain", data)

    // Could be extended to save to a file or server in a more advanced version
}

/**
 * Discards the saved neural network from local storage.
 * This function is called when the user clicks the discard button.
 *
 * Discarding allows users to:
 * - Start fresh with new randomly initialized networks
 * - Compare performance of different training runs
 * - Reset after reaching a local optimum
 */
function discard() {
    // Remove the saved neural network from local storage
    localStorage.removeItem("bestBrain")

    // Next time the page loads, new random networks will be created
}

/**
 * Generates a population of cars for evolutionary training.
 * Creates multiple cars with the same starting position but different neural networks.
 *
 * This implements the population aspect of the genetic algorithm:
 * - Multiple individuals (cars) compete in the same environment
 * - The best performing car is selected for reproduction
 * - Mutations create diversity in the population
 *
 * @param {number} N - The number of cars to generate
 * @returns {Array} Array of Car objects with AI controls
 */
function generateCars(N) {
    const cars = [] // Array to hold the generated car instances

    for (let i = 0; i < N; i++) {
        // Create a new car instance in the middle lane
        // All cars use AI control type with maximum speed of 3
        cars.push(
            new Car(
                road.getLaneCenter(1), // x-position (center of middle lane)
                100, // y-position
                30, // width
                50, // height
                "AI", // control type
                3 // maximum speed
            )
        )
    }

    return cars
}

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
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic)
    }

    // Find the car with the highest y-position (closest to the top of the canvas)
    bestCar = cars.find((car) => car.y === Math.min(...cars.map((c) => c.y)))

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
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7)

    // Rendering phase - Draw all visual elements
    // -----------------------------------------
    // Draw the road with all lanes and borders
    road.draw(carCtx)

    // Draw all traffic cars in red
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx, "red")
    }

    carCtx.globalAlpha = 0.2 // Set transparency for the player car
    // Draw the player car in blue with its sensors
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx, "blue")
    }
    carCtx.globalAlpha = 1 // Reset transparency for the next drawing
    bestCar.draw(carCtx, "blue", true) // Draw the player car with sensors

    // Restore the canvas state (remove camera transformations)
    carCtx.restore()

    // Neural network visualization
    // ---------------------------
    // Create animated dashed lines for network connections
    networkCtx.lineDashOffset = -time / 50

    // Draw the neural network with its current state
    Visualizer.drawNetwork(networkCtx, bestCar.brain)

    // Schedule the next animation frame
    // This creates a continuous loop that syncs with the display refresh rate
    requestAnimationFrame(animate)
}
