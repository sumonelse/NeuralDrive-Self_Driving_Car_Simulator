/**
 * Class representing a neural network for the self-driving car AI.
 * Implements a multi-layer perceptron (MLP) neural network architecture
 * that processes sensor inputs to produce driving control outputs.
 *
 * The network consists of multiple "Level" objects (layers) with connections
 * between them. Each level contains neurons with weights and biases.
 */
class NeuralNetwork {
    /**
     * Create a new neural network with the specified layer sizes.
     *
     * @param {Array<number>} neuronCounts - Array specifying the number of neurons in each layer.
     *                                      For example, [5, 6, 4] creates a network with:
     *                                      - 5 input neurons (sensor data)
     *                                      - 6 neurons in the hidden layer
     *                                      - 4 output neurons (control signals)
     */
    constructor(neuronCounts) {
        this.levels = []

        // Create the network levels (layers) based on the provided neuron counts
        for (let i = 0; i < neuronCounts.length - 1; i++) {
            // Each level connects neurons from the current layer to the next layer
            this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]))
        }
    }

    /**
     * Process inputs through the network to generate outputs (forward propagation).
     * This is the core function that transforms sensor data into driving commands.
     *
     * @param {Array<number>} inputs - The input values (typically sensor readings)
     * @param {NeuralNetwork} network - The neural network to use for processing
     * @returns {Array<number>} The output values (control signals for the car)
     */
    static feedForward(inputs, network) {
        // Process inputs through the first level
        let outputs = Level.feedForward(inputs, network.levels[0])

        // Process outputs of each level as inputs to the next level
        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(outputs, network.levels[i])
        }

        // Return the final outputs (control signals)
        return outputs
    }

    /**
     * Mutates a neural network by randomly adjusting its weights and biases.
     * This is a key function for implementing genetic algorithms and evolution.
     *
     * @param {NeuralNetwork} network - The neural network to mutate
     * @param {number} amount - The mutation rate (0.0 to 1.0)
     *                          0.0 = no change, 1.0 = completely random values
     *
     * The function uses linear interpolation (lerp) to adjust each weight and bias:
     * - At amount=0, the original value is kept
     * - At amount=1, a completely random value replaces the original
     * - Values between 0-1 create a blend of original and random values
     *
     * This allows for controlled mutation that preserves some of the network's
     * existing "knowledge" while introducing variations for evolution.
     */
    static mutate(network, amount = 1) {
        network.levels.forEach((level) => {
            // Mutate biases
            for (let i = 0; i < level.biases.length; i++) {
                level.biases[i] = lerp(
                    level.biases[i], // Original value
                    Math.random() * 2 - 1, // Random value between -1 and 1
                    amount // Mutation rate
                )
            }

            // Mutate weights
            for (let i = 0; i < level.weights.length; i++) {
                for (let j = 0; j < level.weights[i].length; j++) {
                    level.weights[i][j] = lerp(
                        level.weights[i][j], // Original value
                        Math.random() * 2 - 1, // Random value between -1 and 1
                        amount // Mutation rate
                    )
                }
            }
        })
    }
}

/**
 * Class representing a single layer (level) in the neural network.
 * Each level contains input neurons, output neurons, weights connecting them,
 * and biases for each output neuron.
 *
 * This implements a fully-connected layer where each input is connected
 * to every output with a weighted connection.
 */
class Level {
    /**
     * Create a new neural network level.
     *
     * @param {number} inputCount - Number of input neurons in this level
     * @param {number} outputCount - Number of output neurons in this level
     */
    constructor(inputCount, outputCount) {
        // Arrays to store the values of input and output neurons
        this.inputs = new Array(inputCount)
        this.outputs = new Array(outputCount)

        // Array to store bias values for each output neuron
        this.biases = new Array(outputCount)

        // 2D array to store connection weights:
        // weights[i][j] is the weight from input i to output j
        this.weights = []
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount)
        }

        // Initialize weights and biases with random values
        Level.#randomize(this)
    }

    /**
     * Private static method to initialize the level with random weights and biases.
     * This creates the initial "brain" of the network before any learning occurs.
     *
     * @param {Level} level - The level to randomize
     */
    static #randomize(level) {
        // Initialize each weight with a random value between -1 and 1
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random() * 2 - 1
            }
        }

        // Initialize each bias with a random value between -1 and 1
        for (let i = 0; i < level.outputs.length; i++) {
            level.biases[i] = Math.random() * 2 - 1
        }
    }

    /**
     * Process inputs through this level to produce outputs.
     * Implements the forward propagation algorithm for a single layer.
     *
     * @param {Array<number>} inputs - The input values to process
     * @param {Level} level - The level to use for processing
     * @returns {Array<number>} The computed output values
     */
    static feedForward(inputs, level) {
        // Copy input values to the level's input neurons
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = inputs[i]
        }

        // Calculate output values for each output neuron
        for (let i = 0; i < level.outputs.length; i++) {
            // Calculate weighted sum of inputs for this output neuron
            let sum = 0
            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i]
            }

            // Apply step activation function:
            // If sum > bias, neuron activates (1), otherwise it doesn't (0)
            if (sum > level.biases[i]) {
                level.outputs[i] = 1 // Neuron activates
            } else {
                level.outputs[i] = 0 // Neuron doesn't activate
            }
        }

        // Return the computed outputs
        return level.outputs
    }
}
