/**
 * Visualizer class for rendering neural network structure and activity.
 *
 * This class provides static methods to visualize the neural network's:
 * - Network architecture (layers and connections)
 * - Neuron activation states (using color intensity)
 * - Connection weights (using color and line thickness)
 * - Bias values (using dashed circles)
 * - Output actions (using directional arrow symbols)
 *
 * The visualization helps understand how the neural network processes
 * sensor inputs and makes driving decisions in real-time.
 */
class Visualizer {
    /**
     * Draws the entire neural network structure.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on
     * @param {NeuralNetwork} network - The neural network to visualize
     */
    static drawNetwork(ctx, network) {
        const margin = 50
        const left = margin
        const top = margin
        const width = ctx.canvas.width - margin * 2
        const height = ctx.canvas.height - margin * 2

        // Calculate vertical spacing between network levels
        const levelHeight = height / network.levels.length

        // Draw levels from output (top) to input (bottom)
        for (let i = network.levels.length - 1; i >= 0; i--) {
            const levelTop =
                top +
                lerp(
                    height - levelHeight,
                    0,
                    network.levels.length === 1
                        ? 0.5
                        : i / (network.levels.length - 1)
                )
            ctx.setLineDash([7, 3]) // Create dashed lines for connections
            Visualizer.drawLevel(
                ctx,
                network.levels[i],
                left,
                levelTop,
                width,
                levelHeight,
                i === network.levels.length - 1 // Last level is the output layer
                    ? // Arrow symbols representing car control directions
                      ["🠉", "🠈", "🠊", "🠋"] // Up, Left, Right, Down
                    : []
            )
        }
    }

    /**
     * Draws a single level (layer) of the neural network.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on
     * @param {Object} level - The network level to visualize
     * @param {number} left - Left boundary of the drawing area
     * @param {number} top - Top boundary of the drawing area
     * @param {number} width - Width of the drawing area
     * @param {number} height - Height of the drawing area
     * @param {Array} outputLabels - Labels for output neurons (if any)
     */
    static drawLevel(ctx, level, left, top, width, height, outputLabels) {
        const right = left + width
        const bottom = top + height

        const { inputs, outputs, weights, biases } = level

        // Draw connections between neurons (input to output)
        for (let i = 0; i < inputs.length; i++) {
            for (let j = 0; j < outputs.length; j++) {
                ctx.beginPath()
                ctx.moveTo(Visualizer.#getNodeX(inputs, i, left, right), bottom)
                ctx.lineTo(Visualizer.#getNodeX(outputs, j, left, right), top)
                ctx.lineWidth = 2
                // Color represents weight value (red for negative, green for positive)
                ctx.strokeStyle = getRGBA(weights[i][j])
                ctx.stroke()
            }
        }

        const nodeRadius = 18
        // Draw the input neurons
        for (let i = 0; i < inputs.length; i++) {
            const x = Visualizer.#getNodeX(inputs, i, left, right)
            // Draw outer circle (black border)
            ctx.beginPath()
            ctx.arc(x, bottom, nodeRadius, 0, Math.PI * 2)
            ctx.fillStyle = "black"
            ctx.fill()
            // Draw inner circle (colored by activation value)
            ctx.beginPath()
            ctx.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI * 2)
            ctx.fillStyle = getRGBA(inputs[i])
            ctx.fill()
        }

        // Draw the output neurons
        for (let i = 0; i < outputs.length; i++) {
            const x = Visualizer.#getNodeX(outputs, i, left, right)
            // Draw outer circle (black border)
            ctx.beginPath()
            ctx.arc(x, top, nodeRadius, 0, Math.PI * 2)
            ctx.fillStyle = "black"
            ctx.fill()
            // Draw inner circle (colored by activation value)
            ctx.beginPath()
            ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI * 2)
            ctx.fillStyle = getRGBA(outputs[i])
            ctx.fill()

            // Draw bias indicator (dashed circle)
            ctx.beginPath()
            ctx.lineWidth = 2
            ctx.arc(x, top, nodeRadius * 0.8, 0, Math.PI * 2)
            ctx.strokeStyle = getRGBA(biases[i])
            ctx.setLineDash([3, 3])
            ctx.stroke()
            ctx.setLineDash([])

            // Draw output labels (directional arrows for car controls)
            if (outputLabels[i]) {
                ctx.beginPath()
                ctx.textAlign = "center"
                ctx.textBaseline = "middle"
                ctx.fillStyle = "black"
                ctx.strokeStyle = "white"
                ctx.font = nodeRadius * 1.2 + "px Arial"
                ctx.fillText(outputLabels[i], x, top + nodeRadius * 0.1)
                ctx.lineWidth = 0.5
                ctx.strokeText(outputLabels[i], x, top + nodeRadius * 0.1)
            }
        }
    }

    /**
     * Private method to calculate the x-coordinate for a neuron.
     * Distributes neurons evenly across the available width.
     *
     * @param {Array} nodes - Array of nodes in the layer
     * @param {number} index - Index of the current node
     * @param {number} left - Left boundary of the drawing area
     * @param {number} right - Right boundary of the drawing area
     * @returns {number} The x-coordinate for the neuron
     */
    static #getNodeX(nodes, index, left, right) {
        return lerp(
            left,
            right,
            nodes.length === 1 ? 0.5 : index / (nodes.length - 1)
        )
    }
}
