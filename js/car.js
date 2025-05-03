/**
 * Class representing a car in the self-driving simulation.
 * Handles car physics, movement, sensor systems, collision detection, and rendering.
 * This is the main vehicle entity that navigates through the environment.
 *
 * The car has the following key components:
 * - Physics system: Handles acceleration, friction, and steering
 * - Collision detection: Uses polygon-based collision with road borders and traffic
 * - Sensor system: Detects obstacles in the environment
 * - Neural network: Processes sensor data to make driving decisions (for AI cars)
 * - Controls: Processes keyboard input for manual driving or AI outputs
 * - Rendering: Visualizes the car with custom colors and optional sensors
 */
class Car {
    /**
     * Create a new car.
     * @param {number} x - Initial x-coordinate of the car.
     * @param {number} y - Initial y-coordinate of the car.
     * @param {number} width - Width of the car in pixels.
     * @param {number} height - Height of the car in pixels.
     * @param {string} controlType - Type of control system to use:
     *                              "KEYS" for keyboard control
     *                              "DUMMY" for automated traffic
     *                              "AI" for neural network control
     * @param {number} maxSpeed - Maximum forward speed of the car (default: 3).
     * @param {string} color - Color of the car for visual distinction (default: "blue").
     */
    constructor(
        x,
        y,
        width,
        height,
        controlType,
        maxSpeed = 3,
        color = "blue"
    ) {
        // Position and dimensions
        this.x = x
        this.y = y
        this.width = width
        this.height = height

        // Physics properties
        this.speed = 0 // Current speed (positive = forward, negative = reverse)
        this.acceleration = 0.2 // Rate of speed increase per frame when accelerating
        this.maxSpeed = maxSpeed // Maximum forward speed
        this.friction = 0.05 // Deceleration rate when not accelerating
        this.angle = 0 // Direction the car is facing (in radians)

        this.damaged = false // Flag to indicate if the car is damaged (collision occurred)

        this.useBrain = controlType === "AI" // Flag to indicate if the car uses AI brain

        // Only add sensors and neural network to AI cars, not to traffic cars
        if (controlType != "DUMMY") {
            // Create sensor system for obstacle detection
            this.sensor = new Sensor(this)

            // Create neural network "brain" with architecture:
            // - Input layer: one neuron per sensor ray (sensor.rayCount)
            // - Hidden layer: 6 neurons for processing
            // - Output layer: 4 neurons (forward, left, right, reverse controls)
            this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4])
        }

        // Initialize controls based on the specified type
        // (keyboard controls for player, automated for traffic, neural network for AI)
        this.controls = new Controls(controlType)

        // Visual representation setup
        // --------------------------
        // Load car sprite image
        this.img = new Image() // Create an image object for the car's visual representation
        this.img.src = "assets/car.png" // Load the car image from the specified path

        // Create a colored mask for the car
        this.mask = document.createElement("canvas") // Create a canvas for the car's mask
        this.mask.width = width // Set the mask canvas width to the car's width
        this.mask.height = height // Set the mask canvas height to the car's height

        // Set up the mask with the specified color
        const maskCtx = this.mask.getContext("2d") // Get the 2D rendering context for the mask canvas
        this.img.onload = () => {
            // Create a colored rectangle as the base
            maskCtx.fillStyle = color // Set the fill color for the mask
            maskCtx.rect(0, 0, this.width, this.height) // Draw a rectangle covering the entire mask canvas
            maskCtx.fill() // Fill the rectangle with the specified color

            // Apply the car shape as a mask (only keep color where the car image is opaque)
            maskCtx.globalCompositeOperation = "destination-atop" // Set composite operation to keep only the car shape
            maskCtx.drawImage(this.img, 0, 0, this.width, this.height) // Draw the car image on top of the mask
        }
    }

    /**
     * Update the car's state for the current animation frame.
     * Called once per frame from the animation loop.
     *
     * @param {Array} roadBorders - Array of line segments representing road boundaries.
     * @param {Array} traffic - Array of other cars to check for collisions with.
     */
    update(roadBorders, traffic) {
        // Always create the polygon for collision detection, even if damaged
        // This ensures the polygon exists for other cars to detect collisions with
        this.polygon = this.#createPolygon()

        if (!this.damaged) {
            // Only update movement and check for collisions if the car isn't already damaged

            // Update car physics and position based on current controls
            this.#move()

            // Update the polygon after movement
            this.polygon = this.#createPolygon()

            // Check if the car has collided with road borders or traffic
            this.damaged = this.#assessDamage(roadBorders, traffic)
        }

        // Update sensors even if the car is damaged (allows seeing what caused the crash)
        if (this.sensor) {
            // Update sensor readings based on new position and environment
            this.sensor.update(roadBorders, traffic)

            // Convert sensor readings to neural network inputs
            // For each sensor ray:
            // - If no obstacle detected (null reading): input = 0
            // - If obstacle detected: input = 1 - offset (closer obstacles = higher value)
            const offsets = this.sensor.readings.map((s) =>
                s == null ? 0 : 1 - s.offset
            )

            // Feed sensor data into the neural network to get control outputs
            const outputs = NeuralNetwork.feedForward(offsets, this.brain)
            // console.log(outputs)

            // If this car is AI-controlled, apply the neural network outputs to controls
            if (this.useBrain) {
                // Each output neuron controls one aspect of the car's movement
                this.controls.forward = outputs[0] // First output neuron controls acceleration
                this.controls.left = outputs[1] // Second output neuron controls left steering
                this.controls.right = outputs[2] // Third output neuron controls right steering
                this.controls.reverse = outputs[3] // Fourth output neuron controls braking/reverse
            }
        }
    }

    /**
     * Private method that checks if the car has collided with road borders or traffic.
     * Uses polygon intersection detection to determine collisions.
     *
     * @param {Array} roadBorders - Array of line segments representing road boundaries.
     * @param {Array} traffic - Array of other cars to check for collisions with.
     * @returns {boolean} True if the car is damaged (collided), false otherwise.
     */
    #assessDamage(roadBorders, traffic) {
        // Check for collisions with road borders
        for (let i = 0; i < roadBorders.length; i++) {
            if (polysIntersect(this.polygon, roadBorders[i])) {
                // If the car's polygon intersects with any road border, it is damaged
                return true
            }
        }

        // Check for collisions with other traffic cars
        for (let i = 0; i < traffic.length; i++) {
            // Make sure the traffic car has a valid polygon before checking collision
            if (
                traffic[i] &&
                traffic[i].polygon &&
                polysIntersect(this.polygon, traffic[i].polygon)
            ) {
                // If the car's polygon intersects with any traffic car, it is damaged
                return true
            }
        }

        // No collisions detected
        return false
    }

    /**
     * Private method that creates a polygon representation of the car.
     * Calculates the four corners of the car based on its position, dimensions, and rotation.
     * This polygon is used for collision detection with road borders.
     *
     * @returns {Array} Array of points (objects with x,y properties) representing the car's corners.
     */
    #createPolygon() {
        const points = []

        // Calculate the radius (distance from center to corner)
        const rad = Math.hypot(this.width, this.height) / 2

        // Calculate the angle between width and height vectors
        const alpha = Math.atan2(this.width, this.height)

        // Calculate the four corners of the car using trigonometry
        // Each corner is calculated by starting at the car's center position
        // and moving in the direction of the car's angle plus/minus alpha

        // Top-right corner
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad,
        })

        // Top-left corner
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad,
        })

        // Bottom-left corner
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
        })

        // Bottom-right corner
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
        })

        return points
    }

    /**
     * Private method that handles the car's movement physics.
     * Updates position and rotation based on controls and physics.
     * Implements a simplified car physics model with acceleration, friction, and steering.
     */
    #move() {
        // Apply acceleration based on controls
        if (this.controls.forward) this.speed += this.acceleration
        if (this.controls.reverse) this.speed -= this.acceleration

        // Limit speed to maximum values (forward and reverse)
        // Note: Reverse speed is limited to half of forward speed
        if (this.speed > this.maxSpeed) this.speed = this.maxSpeed
        if (this.speed < -this.maxSpeed / 2) this.speed = -this.maxSpeed / 2

        // Apply friction to gradually slow down the car
        if (this.speed > 0) this.speed -= this.friction
        if (this.speed < 0) this.speed += this.friction

        // Stop the car completely if speed is very low
        // This prevents tiny floating-point values from affecting movement
        if (Math.abs(this.speed) < this.friction) this.speed = 0

        // Handle steering (only when the car is moving)
        if (this.speed != 0) {
            // Flip steering direction when moving in reverse
            const flip = this.speed > 0 ? 1 : -1
            if (this.controls.left) this.angle += 0.03 * flip
            if (this.controls.right) this.angle -= 0.03 * flip
        }

        // Update position based on speed and angle
        // Using trigonometry to calculate x and y components of movement
        this.x -= Math.sin(this.angle) * this.speed
        this.y -= Math.cos(this.angle) * this.speed
    }

    /**
     * Render the car and its sensors on the canvas.
     * Uses sprite images with color masks for realistic car appearance.
     * Optionally shows sensors for AI-controlled cars.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {boolean} showSensors - Whether to display the car's sensors (default: false).
     */
    draw(ctx, showSensors = false) {
        // Draw sensors if they exist and showSensors is true
        if (this.sensor && showSensors) {
            // Draw the car's sensor system
            this.sensor.draw(ctx)
        }

        // Save the current canvas state
        ctx.save()

        // Position and rotate the car
        ctx.translate(this.x, this.y) // Move to car's position
        ctx.rotate(-this.angle) // Rotate to match car's direction

        // Draw the colored mask (only for undamaged cars)
        if (!this.damaged) {
            // Draw the colored mask first
            ctx.drawImage(
                this.mask,
                -this.width / 2, // Center the image horizontally
                -this.height / 2, // Center the image vertically
                this.width,
                this.height
            )
            // Use multiply blend mode to combine the mask with the car image
            ctx.globalCompositeOperation = "multiply" // Set composite operation to multiply
        }

        // Draw the car image on top
        ctx.drawImage(
            this.img,
            -this.width / 2, // Center the image horizontally
            -this.height / 2, // Center the image vertically
            this.width,
            this.height
        )

        // Restore the canvas state
        ctx.restore()
    }
}
