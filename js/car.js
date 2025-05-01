/**
 * Class representing a car in the self-driving simulation.
 * Handles car physics, movement, sensor systems, collision detection, and rendering.
 * This is the main vehicle entity that navigates through the environment.
 *
 * The car has the following key components:
 * - Physics system: Handles acceleration, friction, and steering
 * - Collision detection: Uses polygon-based collision with road borders
 * - Sensor system: Detects obstacles in the environment
 * - Controls: Processes keyboard input for manual driving
 * - Rendering: Visualizes the car and its sensors on the canvas
 */
class Car {
    /**
     * Create a new car.
     * @param {number} x - Initial x-coordinate of the car.
     * @param {number} y - Initial y-coordinate of the car.
     * @param {number} width - Width of the car in pixels.
     * @param {number} height - Height of the car in pixels.
     */
    constructor(x, y, width, height) {
        // Position and dimensions
        this.x = x
        this.y = y
        this.width = width
        this.height = height

        // Physics properties
        this.speed = 0 // Current speed (positive = forward, negative = reverse)
        this.acceleration = 0.2 // Rate of speed increase per frame when accelerating
        this.maxSpeed = 3 // Maximum forward speed
        this.friction = 0.05 // Deceleration rate when not accelerating
        this.angle = 0 // Direction the car is facing (in radians)

        this.damaged = false // Flag to indicate if the car is damaged

        // Create sensor system for obstacle detection
        this.sensor = new Sensor(this)

        // Initialize keyboard controls
        this.controls = new Controls()
    }

    /**
     * Update the car's state for the current animation frame.
     * Called once per frame from the animation loop.
     *
     * @param {Array} roadBorders - Array of line segments representing road boundaries.
     */
    update(roadBorders) {
        if (!this.damaged) {
            // Update car physics and position
            this.#move()

            // Create a polygon representation of the car for collision detection
            this.polygon = this.#createPolygon()

            this.damaged = this.#assessDamage(roadBorders)
        }

        // Update sensor readings based on new position and environment
        this.sensor.update(roadBorders)
    }

    /**
     * Private method that checks if the car has collided with any road borders.
     * Uses polygon intersection detection to determine if the car has gone off-road.
     *
     * @param {Array} roadBorders - Array of line segments representing road boundaries.
     * @returns {boolean} True if the car is damaged (collided), false otherwise.
     */
    #assessDamage(roadBorders) {
        for (let i = 0; i < roadBorders.length; i++) {
            if (polysIntersect(this.polygon, roadBorders[i])) {
                // If the car's polygon intersects with any road border, it is damaged
                return true
            }
        }
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
     * Uses the polygon representation to draw the car with proper rotation.
     * Changes color based on the car's damage state.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
        // Set the car's color based on its damage state
        if (this.damaged) {
            ctx.fillStyle = "gray" // Damaged car appears gray
        } else {
            ctx.fillStyle = "black" // Undamaged car appears black
        }

        // Draw the car as a polygon using its calculated corner points
        ctx.beginPath()
        // Start at the first point of the polygon
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y)

        // Connect lines to each subsequent point
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
        }

        // Fill the polygon to create the car's body
        ctx.fill()

        // Draw the car's sensor system
        this.sensor.draw(ctx)
    }
}
