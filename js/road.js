/**
 * Class representing a road in the self-driving simulation.
 * Handles road geometry, lanes, and rendering.
 */
class Road {
    /**
     * Create a new road.
     * @param {number} x - Center x-coordinate of the road.
     * @param {number} width - Total width of the road.
     * @param {number} laneCount - Number of lanes in the road (default: 3).
     */
    constructor(x, width, laneCount = 3) {
        // Road positioning and dimensions
        this.x = x
        this.width = width
        this.laneCount = laneCount

        // Calculate road boundaries
        this.left = x - width / 2
        this.right = x + width / 2

        // Set vertical boundaries to simulate infinite road length
        const infinity = 1000000
        this.top = -infinity
        this.bottom = infinity

        // Define corner points for road borders
        const topLeft = { x: this.left, y: this.top }
        const topRight = { x: this.right, y: this.top }
        const bottomLeft = { x: this.left, y: this.bottom }
        const bottomRight = { x: this.right, y: this.bottom }

        // Define road borders as line segments
        this.borders = [
            [topLeft, bottomLeft], // Left border
            [topRight, bottomRight], // Right border
        ]
    }

    /**
     * Calculate the center x-coordinate of a specific lane.
     * @param {number} laneIndex - Index of the lane (0 is leftmost lane).
     * @returns {number} The x-coordinate of the lane center.
     */
    getLaneCenter(laneIndex) {
        const laneWidth = this.width / this.laneCount
        return (
            this.left +
            laneWidth / 2 +
            Math.min(this.laneCount - 1, laneIndex) * laneWidth
        )
    }

    /**
     * Render the road on the canvas.
     * Draws lane markings and road borders.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
        // Set line style for road markings
        ctx.lineWidth = 5
        ctx.strokeStyle = "white"

        // Draw dashed lines for lane markings
        for (let i = 1; i < this.laneCount; i++) {
            // Calculate x position for each lane divider using linear interpolation
            const x = lerp(this.left, this.right, i / this.laneCount)
            ctx.setLineDash([20, 20]) // Dashed line pattern

            // Draw the lane divider line
            ctx.beginPath()
            ctx.moveTo(x, this.top)
            ctx.lineTo(x, this.bottom)
            ctx.stroke()
        }

        // Draw solid lines for road borders
        ctx.setLineDash([]) // Solid line (no dash)
        this.borders.forEach((border) => {
            ctx.beginPath()
            ctx.moveTo(border[0].x, border[0].y)
            ctx.lineTo(border[1].x, border[1].y)
            ctx.stroke()
        })
    }
}
