/**
 * Class handling input controls for the car.
 * Manages the state of directional controls (forward, reverse, left, right).
 *
 * This class serves as an abstraction layer between input devices (keyboard)
 * and the car's movement system. It maintains boolean flags for each control direction
 * that the car physics system can query to determine movement.
 *
 * The class supports multiple control types:
 * - "KEYS": Human player control via keyboard
 * - "DUMMY": Automated movement (always forward) for traffic simulation
 */
class Controls {
    /**
     * Create a new Controls instance.
     * Initializes control states and sets up appropriate control mechanism.
     *
     * @param {string} type - The type of control system to use:
     *                       "KEYS" for keyboard control (default)
     *                       "DUMMY" for automated traffic movement
     */
    constructor(type) {
        // Control state flags - all initially false (not pressed)
        this.forward = false // Forward movement (up arrow or W key)
        this.left = false // Left steering (left arrow or A key)
        this.right = false // Right steering (right arrow or D key)
        this.reverse = false // Reverse movement (down arrow or S key)

        // Initialize the appropriate control system based on type
        switch (type) {
            case "KEYS":
                // Set up event listeners for keyboard input
                this.#addKeyboardListeners()
                break
            case "DUMMY":
                // Dummy cars (traffic) always move forward at a constant speed
                this.forward = true
                break
        }
    }

    /**
     * Private method to set up keyboard event listeners.
     * Handles both keydown (press) and keyup (release) events.
     *
     * This method uses arrow keys for controlling the car:
     * - Up Arrow: Accelerate forward
     * - Down Arrow: Reverse/brake
     * - Left Arrow: Steer left
     * - Right Arrow: Steer right
     *
     * The event handlers use arrow functions to maintain the correct 'this' context,
     * allowing them to modify the control state properties of this instance.
     */
    #addKeyboardListeners() {
        // Event handler for key press (keydown)
        // Sets the corresponding control flag to true when a key is pressed
        document.onkeydown = (event) => {
            switch (event.key) {
                case "ArrowUp":
                    this.forward = true // Begin forward acceleration
                    break
                case "ArrowLeft":
                    this.left = true // Begin steering left
                    break
                case "ArrowRight":
                    this.right = true // Begin steering right
                    break
                case "ArrowDown":
                    this.reverse = true // Begin reverse/braking
                    break
            }
            // console.table(this)  // Debugging line (commented out)
        }

        // Event handler for key release (keyup)
        // Sets the corresponding control flag to false when a key is released
        document.onkeyup = (event) => {
            switch (event.key) {
                case "ArrowUp":
                    this.forward = false // Stop forward acceleration
                    break
                case "ArrowLeft":
                    this.left = false // Stop steering left
                    break
                case "ArrowRight":
                    this.right = false // Stop steering right
                    break
                case "ArrowDown":
                    this.reverse = false // Stop reverse/braking
                    break
            }
            // console.table(this)  // Debugging line (commented out)
        }
    }
}
