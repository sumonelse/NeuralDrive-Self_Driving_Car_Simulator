/**
 * Utility functions for the self-driving car simulation.
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
