/**
 * Class representing a car in the self-driving simulation.
 * Handles car physics, movement, sensor systems, and rendering.
 * This is the main vehicle entity that navigates through the environment.
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
        // Update car physics and position
        this.#move()

        // Update sensor readings based on new position and environment
        this.sensor.update(roadBorders)
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
     * Uses canvas transformations to position and rotate the car correctly.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
        // Save the current canvas state before applying transformations
        ctx.save()

        // Move to the car's position and rotate to match its angle
        // This transforms the coordinate system to make drawing easier
        ctx.translate(this.x, this.y)
        ctx.rotate(-this.angle) // Negative angle because canvas Y-axis is inverted

        // Draw the car as a rectangle centered at the origin (after transformation)
        ctx.beginPath()
        ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height)
        ctx.fill()

        // Restore the canvas state to remove transformations
        ctx.restore()

        // Draw the car's sensor system
        this.sensor.draw(ctx)
    }
}
