
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Path to data file
const dataFilePath = path.join(__dirname, 'data', 'ambulances.json');

// Utility to read data
const readData = () => {
    const rawData = fs.readFileSync(dataFilePath);
    return JSON.parse(rawData);
};

// Utility to write data
const writeData = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};


app.get('/', (_req, res) => {
    res.status(200).json({
        "status": "ok",
    })
})
// GET all ambulances
app.get('/api/ambulances', (req, res) => {
    try {
        const ambulances = readData();
        res.json(ambulances);
    } catch (error) {
        res.status(500).json({ error: "Failed to read ambulance data" });
    }
});

// Chandigarh City Graph (Distances in km)
const cityGraph = {
    "Sector 16": { "Sector 17": 1.5, "Sector 22": 2.0, "Sector 34": 4.5, "Sector 32": 5.0 },
    "Sector 17": { "Sector 16": 1.5, "Sector 22": 1.2, "Sector 34": 3.0, "Sector 32": 4.5 },
    "Sector 22": { "Sector 17": 1.2, "Sector 16": 2.0, "Sector 34": 2.5, "Sector 32": 4.0 },
    "Sector 34": { "Sector 22": 2.5, "Sector 17": 3.0, "Sector 16": 4.5, "Sector 32": 2.0 },
    "Sector 32": { "Sector 34": 2.0, "Sector 22": 4.0, "Sector 17": 4.5, "Sector 16": 5.0 }
};

// Dijkstra's Algorithm Implementation
function dijkstra(graph, startNode) {
    let distances = {};
    let visited = new Set();

    for (let node in graph) distances[node] = Infinity;
    distances[startNode] = 0;

    while (true) {
        let shortestDistance = Infinity;
        let shortestIndex = null;

        for (let node in distances) {
            if (distances[node] < shortestDistance && !visited.has(node)) {
                shortestDistance = distances[node];
                shortestIndex = node;
            }
        }

        if (shortestIndex === null) break;

        let neighbors = graph[shortestIndex];
        for (let neighbor in neighbors) {
            let distance = distances[shortestIndex] + neighbors[neighbor];
            if (distance < distances[neighbor]) {
                distances[neighbor] = distance;
            }
        }
        visited.add(shortestIndex);
    }
    return distances;
}

// POST to allocate an ambulance using Dijkstra
app.post('/api/allocate', (req, res) => {
    const { sector, priority, hospital } = req.body;

    try {
        const ambulances = readData();
        const availableAmbulances = ambulances.filter(a => a.status === 'Available');

        if (availableAmbulances.length > 0) {

            // Run Dijkstra to find shortest paths from the patient's sector
            const distancesFromPatient = dijkstra(cityGraph, sector);

            let bestAmbulance = null;
            let minDistance = Infinity;

            // Evaluate which available ambulance is closest based on graph distance
            for (let amb of availableAmbulances) {
                const dist = distancesFromPatient[amb.location];
                if (dist !== undefined && dist < minDistance) {
                    minDistance = dist;
                    bestAmbulance = amb;
                }
            }

            // Fallback if location not in graph
            if (!bestAmbulance) bestAmbulance = availableAmbulances[0];

            // Mark the chosen ambulance as busy
            const index = ambulances.findIndex(a => a.ambulance_id === bestAmbulance.ambulance_id);
            ambulances[index].status = 'Busy';
            writeData(ambulances);

            res.json({
                success: true,
                message: `Ambulance allocated successfully via Dijkstra (Distance: ${minDistance} km)`,
                allocatedAmbulance: ambulances[index]
            });
        } else {
            res.status(404).json({
                success: false,
                message: "No ambulances available at the moment"
            });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to process allocation" });
    }
});

// Job Sequencing with Deadlines Algorithm
function jobSequencing(emergencies) {
    // Assign "profit" based on priority
    const profitMap = { "Critical": 100, "High": 50, "Normal": 10 };

    const jobs = emergencies.map(e => ({
        ...e,
        profit: profitMap[e.priority] || 0
    }));

    // Sort jobs by profit descending
    jobs.sort((a, b) => b.profit - a.profit);

    // Find max deadline
    let maxDeadline = 0;
    jobs.forEach(j => {
        if (j.deadline > maxDeadline) maxDeadline = j.deadline;
    });

    // Create time slots (1-based index)
    const result = new Array(maxDeadline + 1).fill(null);
    let totalProfit = 0;

    // Fill slots
    for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        for (let j = job.deadline; j > 0; j--) {
            if (result[j] === null) {
                result[j] = job;
                totalProfit += job.profit;
                break;
            }
        }
    }

    // Extract scheduled jobs in order of time slots
    const scheduledJobs = result.filter(j => j !== null);

    return {
        scheduledJobs,
        totalProfit
    };
}

// POST to reset all ambulances to "Available"
app.post('/api/reset', (req, res) => {
    try {
        const ambulances = readData();
        ambulances.forEach(a => {
            a.status = 'Available';
        });
        writeData(ambulances);

        res.json({
            success: true,
            message: "All ambulances have been reset to Available."
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to reset ambulances" });
    }
});

// POST to process multiple emergencies using Job Sequencing with Deadlines
app.post('/api/batch-allocate', (req, res) => {
    // Expecting req.body.emergencies: array of { id, priority, deadline, sector, hospital }
    const emergencies = req.body.emergencies;

    if (!emergencies || !Array.isArray(emergencies)) {
        return res.status(400).json({ error: "Invalid input. Provide an array of emergencies with deadlines." });
    }

    try {
        const { scheduledJobs, totalProfit } = jobSequencing(emergencies);

        res.json({
            success: true,
            message: "Emergencies scheduled optimally based on priorities and deadlines.",
            totalProfit,
            scheduledJobs
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to schedule emergencies" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚑 Ambulance Backend running at http://localhost:${PORT}`);
});
