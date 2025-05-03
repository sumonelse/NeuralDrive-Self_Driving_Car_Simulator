/**
 * Class for procedurally generating and managing traffic in the self-driving simulation.
 * Provides optimized and diverse traffic patterns with various behaviors and characteristics.
 *
 * Features:
 * - Dynamic traffic generation based on player position
 * - Varied car speeds, colors, and sizes
 * - Different traffic patterns (steady flow, clusters, sparse areas)
 * - Memory-efficient recycling of off-screen vehicles
 * - Difficulty scaling based on player progress
 */
class TrafficGenerator {
    /**
     * Create a new traffic generator.
     * @param {Road} road - The road instance where traffic will be generated.
     * @param {number} initialDensity - Initial traffic density (0.0 to 1.0).
     * @param {number} recycleDistance - Distance beyond which cars are recycled.
     */
    constructor(road, initialDensity = 0.5, recycleDistance = 3000) {
        this.road = road
        this.density = initialDensity
        this.recycleDistance = recycleDistance
        this.traffic = []
        this.playerY = 0
        this.lastGenerationPoint = 0
        this.generationDistance = 300 // Distance between generation points
        this.minSpeedFactor = 0.5 // Minimum speed as a factor of maxSpeed
        this.maxSpeedFactor = 1.2 // Maximum speed as a factor of maxSpeed
        this.baseSpeed = 2 // Base speed for traffic cars
        this.carSizeVariation = 0.2 // Size variation factor (±20%)

        // Traffic pattern weights (probabilities)
        this.patterns = {
            regular: 0.6, // Regular spaced traffic
            cluster: 0.3, // Clustered groups of cars
            sparse: 0.1, // Very few cars
        }

        // Lane change behavior probabilities
        this.laneChangeProbability = 0.2

        // Initialize traffic
        this.generateInitialTraffic()
    }

    /**
     * Generate initial traffic when the simulation starts.
     * Creates traffic ahead of the player to populate the road.
     */
    generateInitialTraffic() {
        // Generate traffic up to a certain distance ahead
        const initialDistance = 2000
        const segmentSize = 200

        for (let dist = 100; dist < initialDistance; dist += segmentSize) {
            this.generateTrafficSegment(-dist)
        }
    }

    /**
     * Generate a segment of traffic at the specified y-position.
     * @param {number} yPosition - The y-position where traffic should be generated.
     */
    generateTrafficSegment(yPosition) {
        // Select a traffic pattern based on weighted probabilities
        const patternRoll = Math.random()
        let pattern

        if (patternRoll < this.patterns.regular) {
            pattern = "regular"
        } else if (
            patternRoll <
            this.patterns.regular + this.patterns.cluster
        ) {
            pattern = "cluster"
        } else {
            pattern = "sparse"
        }

        // Generate traffic based on the selected pattern
        switch (pattern) {
            case "regular":
                this.generateRegularTraffic(yPosition)
                break
            case "cluster":
                this.generateClusterTraffic(yPosition)
                break
            case "sparse":
                this.generateSparseTraffic(yPosition)
                break
        }
    }

    /**
     * Generate regularly spaced traffic across lanes.
     * @param {number} yPosition - The y-position where traffic should be generated.
     */
    generateRegularTraffic(yPosition) {
        const laneCount = this.road.laneCount
        const usedLanes = new Set()

        // Determine how many cars to generate based on density
        const carsToGenerate = Math.floor(laneCount * this.density)

        for (let i = 0; i < carsToGenerate; i++) {
            // Select a random lane that hasn't been used yet
            let lane
            do {
                lane = Math.floor(Math.random() * laneCount)
            } while (usedLanes.has(lane) && usedLanes.size < laneCount)

            usedLanes.add(lane)

            // Create a car in the selected lane
            this.createTrafficCar(lane, yPosition)
        }
    }

    /**
     * Generate a cluster of cars close together.
     * @param {number} yPosition - The y-position where traffic should be generated.
     */
    generateClusterTraffic(yPosition) {
        const laneCount = this.road.laneCount
        const clusterSize = Math.max(
            2,
            Math.floor(laneCount * this.density * 1.5)
        )
        const clusterSpread = 80 // Vertical spread of the cluster

        for (let i = 0; i < clusterSize; i++) {
            const lane = Math.floor(Math.random() * laneCount)
            const yOffset = Math.random() * clusterSpread - clusterSpread / 2
            this.createTrafficCar(lane, yPosition + yOffset)
        }
    }

    /**
     * Generate sparse traffic (few cars).
     * @param {number} yPosition - The y-position where traffic should be generated.
     */
    generateSparseTraffic(yPosition) {
        const laneCount = this.road.laneCount
        const carsToGenerate = Math.max(
            1,
            Math.floor(laneCount * this.density * 0.3)
        )

        for (let i = 0; i < carsToGenerate; i++) {
            const lane = Math.floor(Math.random() * laneCount)
            const yOffset = Math.random() * 100 - 50
            this.createTrafficCar(lane, yPosition + yOffset)
        }
    }

    /**
     * Create a traffic car with randomized properties.
     * @param {number} lane - The lane index where the car should be placed.
     * @param {number} yPosition - The y-position where the car should be placed.
     * @returns {Car} The created traffic car.
     */
    createTrafficCar(lane, yPosition) {
        // Randomize car properties for diversity
        const speedFactor =
            this.minSpeedFactor +
            Math.random() * (this.maxSpeedFactor - this.minSpeedFactor)
        const speed = this.baseSpeed * speedFactor

        // Randomize car size (with limits)
        const sizeVariation =
            1 -
            this.carSizeVariation +
            Math.random() * this.carSizeVariation * 2
        const width = 30 * sizeVariation
        const height = 50 * sizeVariation

        // Create the car with randomized properties
        const car = new Car(
            this.road.getLaneCenter(lane),
            yPosition,
            width,
            height,
            "DUMMY",
            speed,
            getRandomColor()
        )

        // Add to traffic array
        this.traffic.push(car)
        return car
    }

    /**
     * Update traffic based on player position.
     * Generates new traffic ahead and recycles cars that are far behind.
     * @param {number} playerY - The current y-position of the player car.
     */
    update(playerY) {
        this.playerY = playerY

        // Generate new traffic when player advances
        if (this.playerY < this.lastGenerationPoint - this.generationDistance) {
            this.lastGenerationPoint = this.playerY
            this.generateTrafficSegment(this.playerY - this.recycleDistance / 2)
        }

        // Recycle cars that are far behind the player
        this.recycleOffscreenCars()

        // Update all traffic cars
        for (let i = 0; i < this.traffic.length; i++) {
            const car = this.traffic[i]

            // Ensure car is valid before updating
            if (!car) {
                // Remove invalid car from array
                this.traffic.splice(i, 1)
                i--
                continue
            }

            // Update car with road borders but no other traffic
            // This ensures each car's polygon is created before collision detection
            car.update(this.road.borders, [])

            // Randomly change lanes for some cars (if they're far enough ahead)
            if (
                car.y < this.playerY - 200 &&
                Math.random() < 0.005 * this.laneChangeProbability
            ) {
                this.changeLane(car)
            }
        }

        return this.traffic
    }

    /**
     * Change the lane of a traffic car.
     * @param {Car} car - The car to change lanes.
     */
    changeLane(car) {
        const currentLane = this.getLaneIndex(car.x)
        if (currentLane === -1) return // Car not in a valid lane

        // Determine possible directions (left or right)
        const canMoveLeft = currentLane > 0
        const canMoveRight = currentLane < this.road.laneCount - 1

        // Randomly choose direction if both are available
        if (canMoveLeft && canMoveRight) {
            if (Math.random() < 0.5) {
                car.x = this.road.getLaneCenter(currentLane - 1)
            } else {
                car.x = this.road.getLaneCenter(currentLane + 1)
            }
        } else if (canMoveLeft) {
            car.x = this.road.getLaneCenter(currentLane - 1)
        } else if (canMoveRight) {
            car.x = this.road.getLaneCenter(currentLane + 1)
        }
    }

    /**
     * Get the lane index for a given x-position.
     * @param {number} x - The x-position to check.
     * @returns {number} The lane index or -1 if not in a valid lane.
     */
    getLaneIndex(x) {
        const laneWidth = this.road.width / this.road.laneCount
        const relativeX = x - this.road.left
        const laneIndex = Math.floor(relativeX / laneWidth)

        if (laneIndex >= 0 && laneIndex < this.road.laneCount) {
            return laneIndex
        }
        return -1
    }

    /**
     * Recycle cars that are far behind the player.
     * Moves them ahead of the player to be reused instead of creating new objects.
     */
    recycleOffscreenCars() {
        for (let i = 0; i < this.traffic.length; i++) {
            const car = this.traffic[i]

            // Skip invalid cars
            if (!car) {
                this.traffic.splice(i, 1)
                i--
                continue
            }

            // If car is far behind the player
            if (car.y > this.playerY + this.recycleDistance / 2) {
                // Recycle the car by moving it ahead of the player
                const lane = Math.floor(Math.random() * this.road.laneCount)
                car.x = this.road.getLaneCenter(lane)
                car.y = this.playerY - this.recycleDistance / 2

                // Reset angle to face forward
                car.angle = 0

                // Reset speed
                car.speed = 0

                // Randomize properties for variety
                const speedFactor =
                    this.minSpeedFactor +
                    Math.random() * (this.maxSpeedFactor - this.minSpeedFactor)
                car.maxSpeed = this.baseSpeed * speedFactor

                // Reset damage state
                car.damaged = false
            }
        }
    }

    /**
     * Adjust traffic density based on player progress or difficulty setting.
     * @param {number} newDensity - New traffic density value (0.0 to 1.0).
     */
    setDensity(newDensity) {
        this.density = Math.max(0, Math.min(1, newDensity))
    }

    /**
     * Get all traffic cars for rendering and collision detection.
     * @returns {Array} Array of Car objects representing traffic.
     */
    getTraffic() {
        return this.traffic
    }
}
