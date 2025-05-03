/**
 * Utility functions for the self-driving car simulation.
 *
 * This file contains mathematical and geometric helper functions used throughout the simulation:
 * - Linear interpolation (lerp): Used for sensor ray angle calculations and intersection points
 * - Line intersection detection: Used by sensors to detect obstacles
 * - Polygon intersection: Used for collision detection between car and environment
 *
 * These functions form the mathematical foundation for the simulation's
 * physics, collision detection, and sensor systems.
 */

/**
 * Linear interpolation function.
 * Calculates a point that is a fraction t between points A and B.
 *
 * @param {number} A - Starting value.
 * @param {number} B - Ending value.
 * @param {number} t - Interpolation factor (0.0 to 1.0).
 * @returns {number} Interpolated value between A and B.
 *
 * Examples:
 * - lerp(0, 10, 0.5) returns 5 (halfway between 0 and 10)
 * - lerp(20, 80, 0.25) returns 35 (25% from 20 toward 80)
 */
function lerp(A, B, t) {
    return A + (B - A) * t
}

/**
 * Calculates the intersection point between two line segments.
 * Uses the parametric form of line equations to find where they intersect.
 *
 * @param {Object} A - Start point of first line segment with x,y properties.
 * @param {Object} B - End point of first line segment with x,y properties.
 * @param {Object} C - Start point of second line segment with x,y properties.
 * @param {Object} D - End point of second line segment with x,y properties.
 * @returns {Object|null} Intersection point with x,y coordinates and offset, or null if no intersection.
 *
 * The offset property (t) represents how far along the first line segment (A-B) the intersection occurs,
 * where 0.0 is at point A and 1.0 is at point B.
 */
function getIntersection(A, B, C, D) {
    // Calculate the numerators for the parametric equations
    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x)
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y)

    // Calculate the denominator shared by both equations
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y)

    // Check if lines are not parallel (denominator != 0)
    if (bottom != 0) {
        // Calculate the parameters t and u
        const t = tTop / bottom
        const u = uTop / bottom

        // Check if intersection is within both line segments
        // t and u must be between 0 and 1 for the intersection to be within both segments
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                // Calculate the actual intersection point using linear interpolation
                x: lerp(A.x, B.x, t),
                y: lerp(A.y, B.y, t),
                offset: t, // Store how far along segment A-B the intersection occurs
            }
        }
    }

    // Return null if lines are parallel or don't intersect within segments
    return null
}

/**
 * Checks if two polygons intersect by testing all line segments against each other.
 * This function is used for collision detection between the car and road borders.
 *
 * @param {Array} poly1 - First polygon represented as an array of points (objects with x,y properties).
 * @param {Array} poly2 - Second polygon represented as an array of points (objects with x,y properties).
 * @returns {boolean} True if the polygons intersect, false otherwise.
 *
 * Note: For road borders, poly2 is typically just a line segment (array of 2 points),
 * while poly1 is the car's 4-corner polygon.
 */
function polysIntersect(poly1, poly2) {
    // Check each line segment of the first polygon against each line segment of the second polygon
    for (let i = 0; i < poly1.length; i++) {
        for (let j = 0; j < poly2.length; j++) {
            // Get the current line segment from poly1 (from current point to next point)
            // The modulo operation wraps around to the first point when we reach the last point
            const touch = getIntersection(
                poly1[i], // Current point of poly1
                poly1[(i + 1) % poly1.length], // Next point of poly1 (or first point if at the end)
                poly2[j], // Current point of poly2
                poly2[(j + 1) % poly2.length] // Next point of poly2 (or first point if at the end)
            )

            // If any intersection is found, the polygons intersect
            if (touch) {
                return true
            }
        }
    }

    // If no intersections were found, the polygons don't intersect
    return false
}

/**
 * Finds the intersection between a line segment and a polygon.
 * Used by sensors to detect intersections with other cars and obstacles.
 *
 * @param {Object} A - Start point of the line segment with x,y properties.
 * @param {Object} B - End point of the line segment with x,y properties.
 * @param {Array} poly - Polygon represented as an array of points (objects with x,y properties).
 * @returns {Object|null} Intersection point with x,y coordinates and offset, or null if no intersection.
 *
 * This function is primarily used by the car's sensors to detect obstacles in their path.
 * It checks if any of the sensor rays (line segments) intersect with other vehicles or road borders.
 */
function getPolyIntersection(A, B, poly) {
    // Check if the line segment from A to B intersects with any edge of the polygon
    for (let i = 0; i < poly.length; i++) {
        const touch = getIntersection(
            A,
            B,
            poly[i],
            poly[(i + 1) % poly.length] // Wrap around to the first point
        )
        if (touch) {
            return touch
        }
    }
    return null
}

/**
 * Generates an RGBA color string based on a numeric value.
 * Used for visualizing neural network weights and activations.
 *
 * @param {number} value - The value to convert to a color.
 * @returns {string} RGBA color string.
 *
 * Color mapping:
 * - Positive values: Green with intensity proportional to value
 * - Negative values: Red with intensity proportional to absolute value
 * - Zero: Transparent
 *
 * This function is used by the Visualizer to represent:
 * - Connection weights (red for negative, green for positive)
 * - Neuron activation levels
 * - Bias values
 */
function getRGBA(value) {
    const alpha = Math.abs(value)
    const R = value < 0 ? 0 : 255
    const G = R
    const B = value > 0 ? 0 : 255
    return `rgba(${R}, ${G}, ${B}, ${alpha})`
}

/**
 * Generates a random color for traffic cars.
 * Creates visually distinct colors for better identification of different vehicles.
 *
 * @returns {string} A random color in hexadecimal format (#RRGGBB)
 */

function getRandomColor() {
    const hue = Math.random() * 260
    return `hsl(${hue}, 100%, 60%)`
}
