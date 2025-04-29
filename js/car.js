/**
 * Class representing a car in the self-driving simulation.
 * Handles car physics, movement, and rendering.
 */
class Car {
    /**
     * Create a new car.
     * @param {number} x - Initial x-coordinate of the car.
     * @param {number} y - Initial y-coordinate of the car.
     * @param {number} width - Width of the car.
     * @param {number} height - Height of the car.
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

        // Initialize keyboard controls
        this.controls = new Controls()
    }

    /**
     * Update the car's state for the current animation frame.
     * Called once per frame from the animation loop.
     */
    update() {
        this.#move()
    }

    /**
     * Private method that handles the car's movement physics.
     * Updates position and rotation based on controls and physics.
     */
    #move() {
        // Apply acceleration based on controls
        if (this.controls.forward) this.speed += this.acceleration
        if (this.controls.reverse) this.speed -= this.acceleration

        // Limit speed to maximum values (forward and reverse)
        if (this.speed > this.maxSpeed) this.speed = this.maxSpeed
        if (this.speed < -this.maxSpeed / 2) this.speed = -this.maxSpeed / 2

        // Apply friction to gradually slow down the car
        if (this.speed > 0) this.speed -= this.friction
        if (this.speed < 0) this.speed += this.friction

        // Stop the car completely if speed is very low
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
     * Render the car on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
        // Save the current canvas state
        ctx.save()

        // Move to the car's position and rotate to match its angle
        ctx.translate(this.x, this.y)
        ctx.rotate(-this.angle)

        // Draw the car as a rectangle
        ctx.beginPath()
        ctx.rect(-this.width, -this.height / 2, this.width, this.height)
        ctx.fill()

        // Restore the canvas state
        ctx.restore()
    }
}
