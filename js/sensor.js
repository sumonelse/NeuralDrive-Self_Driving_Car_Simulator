/**
 * Class representing a sensor system for the self-driving car.
 * Creates and manages a set of rays that detect obstacles in the environment.
 * These sensors simulate LIDAR or radar systems used in real self-driving vehicles.
 */
class Sensor {
    /**
     * Create a new sensor system attached to a car.
     *
     * @param {Car} car - The car this sensor system is attached to.
     */
    constructor(car) {
        this.car = car
        this.rayCount = 5 // Number of sensor rays to cast
        this.rayLength = 100 // Maximum length of each ray
        this.raySpread = Math.PI / 2 // Angular spread of rays (90 degrees)
        this.rays = [] // Array to store ray coordinates
        this.readings = [] // Array to store intersection data with obstacles
    }

    /**
     * Update the sensor system for the current frame.
     * Casts rays and checks for intersections with road borders and traffic.
     *
     * @param {Array} roadBorders - Array of line segments representing road borders.
     * @param {Array} traffic - Array of other cars to detect.
     */
    update(roadBorders, traffic) {
        // First generate the rays based on car position and angle
        this.#castRays()

        // Reset readings array for new detections
        this.readings = []

        // For each ray, find the closest intersection with any obstacle
        for (let i = 0; i < this.rays.length; i++) {
            this.readings[i] = this.#getReading(
                this.rays[i],
                roadBorders,
                traffic
            )
        }
    }

    /**
     * Private method that detects intersections between a ray and obstacles (road borders and traffic).
     * Returns the closest intersection point if one exists.
     *
     * @param {Array} ray - Array containing start and end points of the ray.
     * @param {Array} roadBorders - Array of line segments representing road borders, traffic.
     * @param {Array} traffic - Array of other cars to detect.
     * @returns {Object|null} The closest intersection point or null if none exists.
     */
    #getReading(ray, roadBorders, traffic) {
        // Array to store all intersection points
        let touches = []

        // Check for intersections with road borders
        for (let i = 0; i < roadBorders.length; i++) {
            const touch = getIntersection(
                ray[0], // Ray start point
                ray[1], // Ray end point
                roadBorders[i][0], // Border segment start point
                roadBorders[i][1] // Border segment end point
            )
            if (touch) {
                touches.push(touch)
            }
        }

        for (let i = 0; i < traffic.length; i++) {
            const poly = traffic[i].polygon
            const touch = getPolyIntersection(ray[0], ray[1], poly)
            if (touch) {
                touches.push(touch)
            }
        }

        // Check for intersections with traffic cars
        for (let i = 0; i < traffic.length; i++) {
            const poly = traffic[i].polygon
            for (let j = 0; j < poly.length; j++) {
                const value = getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j + 1) % poly.length]
                )
                if (value) {
                    touches.push(value)
                }
            }
        }

        // If no intersections found, return null
        if (touches.length === 0) {
            return null
        } else {
            // Find the closest intersection by comparing offsets
            const offsets = touches.map((e) => e.offset)
            const minOffset = Math.min(...offsets)
            return touches.find((e) => e.offset === minOffset)
        }
    }

    /**
     * Private method that calculates and creates the sensor rays.
     * Rays are distributed evenly across the specified angular spread.
     * Each ray starts at the car's position and extends outward.
     */
    #castRays() {
        this.rays = []
        for (let i = 0; i < this.rayCount; i++) {
            // Calculate the angle for this ray using linear interpolation
            // Rays are spread evenly across the raySpread angle
            const rayAngle =
                lerp(
                    this.raySpread / 2,
                    -this.raySpread / 2,
                    this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
                ) + this.car.angle

            // Define start point (car position) and end point
            const start = {
                x: this.car.x,
                y: this.car.y,
            }
            const end = {
                x: this.car.x - Math.sin(rayAngle) * this.rayLength,
                y: this.car.y - Math.cos(rayAngle) * this.rayLength,
            }
            this.rays.push([start, end])
        }
    }

    /**
     * Render the sensor rays on the canvas.
     * Rays are drawn in two segments:
     * 1. Yellow segment from car to intersection or full length
     * 2. Black segment from intersection to end (if ray doesn't hit anything)
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
        for (let i = 0; i < this.rayCount; i++) {
            let end = this.rays[i][1]
            if (this.readings[i]) {
                end = this.readings[i]
            }
            // Draw the visible part of the ray (yellow)
            ctx.beginPath()
            ctx.lineWidth = 2
            ctx.strokeStyle = "yellow"

            ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y)
            ctx.lineTo(end.x, end.y)
            ctx.stroke()

            // Draw the part of the ray beyond the intersection (black)
            ctx.beginPath()
            ctx.lineWidth = 2
            ctx.strokeStyle = "black"

            ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y)
            ctx.lineTo(end.x, end.y)
            ctx.stroke()
        }
    }
}
