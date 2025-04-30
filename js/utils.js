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
