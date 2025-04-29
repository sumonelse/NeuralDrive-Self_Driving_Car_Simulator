/**
 * Class handling keyboard input controls for the car.
 * Manages the state of directional controls (forward, reverse, left, right).
 */
class Controls {
    /**
     * Create a new Controls instance.
     * Initializes control states and sets up event listeners.
     */
    constructor() {
        // Control state flags - all initially false (not pressed)
        this.forward = false // Forward movement (up arrow)
        this.left = false // Left steering (left arrow)
        this.right = false // Right steering (right arrow)
        this.reverse = false // Reverse movement (down arrow)

        // Set up keyboard event listeners
        this.#addKeyboardListeners()
    }

    /**
     * Private method to set up keyboard event listeners.
     * Handles both keydown (press) and keyup (release) events.
     */
    #addKeyboardListeners() {
        // Event handler for key press
        document.onkeydown = (event) => {
            switch (event.key) {
                case "ArrowUp":
                    this.forward = true
                    break
                case "ArrowLeft":
                    this.left = true
                    break
                case "ArrowRight":
                    this.right = true
                    break
                case "ArrowDown":
                    this.reverse = true
                    break
            }
            // console.table(this)  // Debugging line (commented out)
        }

        // Event handler for key release
        document.onkeyup = (event) => {
            switch (event.key) {
                case "ArrowUp":
                    this.forward = false
                    break
                case "ArrowLeft":
                    this.left = false
                    break
                case "ArrowRight":
                    this.right = false
                    break
                case "ArrowDown":
                    this.reverse = false
                    break
            }
            // console.table(this)  // Debugging line (commented out)
        }
    }
}
