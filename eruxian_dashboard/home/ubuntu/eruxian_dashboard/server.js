// Eruxian Prime Continent v1 - Backend Server

const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs

const app = express();
const port = process.env.PORT || 3000;

// --- Simulation Configuration ---
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;
const INITIAL_FACTIONS = 5; // Increased slightly for more interaction
const TICK_INTERVAL_MS = 1000; // 1 second per tick
const EXPANSION_RESOURCE_THRESHOLD = 80;
const EXPANSION_STRENGTH_THRESHOLD = 12;
const ATTACK_STRENGTH_THRESHOLD = 15;
const CONFLICT_WIN_RATIO = 1.1; // Attacker needs > 1.1x defender strength
const FACTION_DESTRUCTION_STRENGTH = 1;

// --- Data Structures ---
class Tile {
    constructor(x, y) {
        this.id = `tile_${x}_${y}`;
        this.x = x;
        this.y = y;
        this.ownerFactionId = null;
        this.resourceNode = null; // { type: string, quantity: number, regenRate: number }
        this.manaPool = null; // { current: number, capacity: number, regenRate: number }
    }
}

class Faction {
    constructor(id, name, color, startTile) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.controlledTiles = [startTile.id];
        this.strength = 10; // Initial strength
        this.resources = { Food: 50, Wood: 50, Ore: 10 }; // Initial resources
        this.manaHeld = 20;
        this.relationships = {}; // { [factionId: string]: 'Neutral' | 'Alliance' | 'War' }
        this.loyalty = 'Neutral'; // Simplified
        startTile.ownerFactionId = this.id; // Claim the starting tile
    }
}

// --- Simulation State ---
let simulationState = {
    currentTick: 0,
    map: {
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
        tiles: [], // 2D array: tiles[y][x]
    },
    factions: [], // Array of Faction objects
    factionsById: {}, // Map for quick lookup
    events: [], // Array of event objects
    isRunning: true,
    tickIntervalId: null
};

// --- Helper Functions ---

function getTile(x, y) {
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) {
        return null; // Out of bounds
    }
    return simulationState.map.tiles[y][x];
}

function getFactionById(id) {
    return simulationState.factionsById[id] || null;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function addEvent(type, description, affectedEntities = []) {
    simulationState.events.push({
        timestamp: new Date().toISOString(),
        type: type,
        description: description,
        affectedEntities: affectedEntities
    });
    // Keep event log from growing indefinitely (e.g., keep last 200)
    if (simulationState.events.length > 200) {
        simulationState.events.shift();
    }
}

function initializeSimulation() {
    console.log("Initializing simulation...");
    simulationState.currentTick = 0;
    simulationState.factions = [];
    simulationState.factionsById = {};
    simulationState.events = [];
    simulationState.map.tiles = [];

    // 1. Create Map Grid
    for (let y = 0; y < MAP_HEIGHT; y++) {
        simulationState.map.tiles[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            simulationState.map.tiles[y][x] = new Tile(x, y);
        }
    }

    // 2. Place Initial Resources/Mana (Example)
    for (let i = 0; i < MAP_WIDTH * MAP_HEIGHT * 0.15; i++) { // Place resources on ~15% of tiles
        const x = getRandomInt(MAP_WIDTH);
        const y = getRandomInt(MAP_HEIGHT);
        const tile = getTile(x, y);
        if (tile && !tile.resourceNode && !tile.manaPool) { // Avoid placing on same tile for simplicity
            const resourceType = ["Food", "Wood", "Ore"][getRandomInt(3)];
            tile.resourceNode = { type: resourceType, quantity: 100 + getRandomInt(150), regenRate: 0.1 + Math.random() * 0.4 };
        }
    }
     for (let i = 0; i < MAP_WIDTH * MAP_HEIGHT * 0.1; i++) { // Place mana pools on ~10% of tiles
        const x = getRandomInt(MAP_WIDTH);
        const y = getRandomInt(MAP_HEIGHT);
        const tile = getTile(x, y);
        if (tile && !tile.resourceNode && !tile.manaPool) {
             tile.manaPool = { current: 50 + getRandomInt(50), capacity: 100 + getRandomInt(100), regenRate: 0.5 + Math.random() };
        }
    }

    // 3. Spawn Initial Factions
    const colors = ["#FF0000", "#0000FF", "#00FF00", "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080"]; // Example colors
    let attempts = 0;
    while (simulationState.factions.length < INITIAL_FACTIONS && attempts < 200) {
        const x = getRandomInt(MAP_WIDTH);
        const y = getRandomInt(MAP_HEIGHT);
        const startTile = getTile(x, y);

        // Ensure starting tile is not too close to others
        let tooClose = false;
        for (const existingFaction of simulationState.factions) {
            const [px, py] = existingFaction.controlledTiles[0].split('_').slice(1).map(Number);
            const dist = Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2));
            if (dist < 3) { // Minimum distance between starting points
                tooClose = true;
                break;
            }
        }

        if (startTile && !startTile.ownerFactionId && !tooClose) {
            const factionId = uuidv4();
            const factionName = `Clan_${simulationState.factions.length + 1}`;
            const factionColor = colors[simulationState.factions.length % colors.length];
            const newFaction = new Faction(factionId, factionName, factionColor, startTile);
            simulationState.factions.push(newFaction);
            simulationState.factionsById[factionId] = newFaction;
        } else {
            attempts++;
        }
    }

    addEvent("SimulationStart", "Simulation initialized.");
    console.log(`Simulation initialized with ${simulationState.factions.length} factions.`);
}

function resolveConflict(attacker, defender, tile) {
    const attackerStrength = attacker.strength * (0.8 + Math.random() * 0.4); // Add randomness
    const defenderStrength = defender.strength * (0.8 + Math.random() * 0.4);

    if (attackerStrength > defenderStrength * CONFLICT_WIN_RATIO) {
        // Attacker Wins
        addEvent("ConflictWin", `${attacker.name} defeated ${defender.name} and conquered tile (${tile.x}, ${tile.y}).`, [attacker.id, defender.id, tile.id]);

        // Update tile ownership
        tile.ownerFactionId = attacker.id;
        attacker.controlledTiles.push(tile.id);
        defender.controlledTiles = defender.controlledTiles.filter(tId => tId !== tile.id);

        // Adjust strength (winner gains, loser loses more)
        attacker.strength += 2;
        defender.strength = Math.max(FACTION_DESTRUCTION_STRENGTH, defender.strength - 3);

        // Check if defender is destroyed
        if (defender.controlledTiles.length === 0 || defender.strength <= FACTION_DESTRUCTION_STRENGTH) {
            addEvent("FactionDestroyed", `${defender.name} was destroyed by ${attacker.name}.`, [defender.id, attacker.id]);
            // Remove faction
            simulationState.factions = simulationState.factions.filter(f => f.id !== defender.id);
            delete simulationState.factionsById[defender.id];
            // Make remaining tiles neutral (or could be absorbed by winner)
            // For simplicity, let's just mark them neutral if any were missed
             simulationState.map.tiles.flat().forEach(t => {
                 if (t.ownerFactionId === defender.id) {
                     t.ownerFactionId = null;
                 }
             });
        }
        return true; // Attacker won
    } else {
        // Defender Wins (Attacker Repelled)
        addEvent("ConflictDefend", `${defender.name} successfully defended tile (${tile.x}, ${tile.y}) against ${attacker.name}.`, [defender.id, attacker.id, tile.id]);
        // Adjust strength (attacker loses, defender loses less)
        attacker.strength = Math.max(FACTION_DESTRUCTION_STRENGTH + 1, attacker.strength - 2);
        defender.strength = Math.max(FACTION_DESTRUCTION_STRENGTH, defender.strength - 1);
        return false; // Attacker lost
    }
}

function runSimulationTick() {
    if (!simulationState.isRunning) return;

    simulationState.currentTick++;

    // --- Tick Logic --- 

    // 1. Resource/Mana Regeneration (on Tiles)
    simulationState.map.tiles.flat().forEach(tile => {
        if (tile.resourceNode) {
            tile.resourceNode.quantity += tile.resourceNode.regenRate;
        }
        if (tile.manaPool) {
            tile.manaPool.current = Math.min(tile.manaPool.capacity, tile.manaPool.current + tile.manaPool.regenRate);
        }
    });

    // 2. Faction Actions (Iterate over a copy in case factions are destroyed)
    const currentFactions = [...simulationState.factions];
    currentFactions.forEach(faction => {
        // Check if faction still exists (might have been destroyed in a previous conflict this tick)
        if (!getFactionById(faction.id)) return;

        // a. Gather Resources/Mana
        let gatheredResources = { Food: 0, Wood: 0, Ore: 0 };
        let gatheredMana = 0;
        const gatherRate = 1.0;

        faction.controlledTiles.forEach(tileId => {
            const [prefix, xStr, yStr] = tileId.split('_');
            const tile = getTile(parseInt(xStr), parseInt(yStr));
            if (!tile) return;

            if (tile.resourceNode && tile.resourceNode.quantity > 0) {
                const amount = Math.min(tile.resourceNode.quantity, gatherRate);
                gatheredResources[tile.resourceNode.type] = (gatheredResources[tile.resourceNode.type] || 0) + amount;
                tile.resourceNode.quantity -= amount;
            }
            if (tile.manaPool && tile.manaPool.current > 0) {
                const amount = Math.min(tile.manaPool.current, gatherRate);
                gatheredMana += amount;
                tile.manaPool.current -= amount;
            }
        });

        for (const type in gatheredResources) {
            faction.resources[type] = (faction.resources[type] || 0) + gatheredResources[type];
        }
        faction.manaHeld += gatheredMana;

        // b. AI Decision Making (Expand / Attack)
        const totalResources = Object.values(faction.resources).reduce((sum, val) => sum + val, 0);
        const canExpand = totalResources > EXPANSION_RESOURCE_THRESHOLD && faction.strength > EXPANSION_STRENGTH_THRESHOLD;
        const canAttack = faction.strength > ATTACK_STRENGTH_THRESHOLD; // Separate threshold for initiating attacks

        if (canExpand || canAttack) {
            let potentialTargets = []; // { tile: Tile, action: 'expand' | 'attack' }
            faction.controlledTiles.forEach(tileId => {
                const [prefix, xStr, yStr] = tileId.split('_');
                const x = parseInt(xStr);
                const y = parseInt(yStr);
                const neighbors = [
                    getTile(x, y - 1), getTile(x, y + 1),
                    getTile(x + 1, y), getTile(x - 1, y)
                ].filter(n => n); // Filter out nulls (out of bounds)

                neighbors.forEach(neighbor => {
                    if (!neighbor.ownerFactionId && canExpand) {
                        potentialTargets.push({ tile: neighbor, action: 'expand' });
                    }
                     else if (neighbor.ownerFactionId && neighbor.ownerFactionId !== faction.id && canAttack) {
                        // Simple rule: only consider attacking if stronger (can be refined)
                        const defender = getFactionById(neighbor.ownerFactionId);
                        if (defender && faction.strength > defender.strength) {
                             potentialTargets.push({ tile: neighbor, action: 'attack' });
                        }
                    }
                });
            });

            // Remove duplicates based on tile id
            potentialTargets = potentialTargets.filter((target, index, self) =>
                index === self.findIndex((t) => (t.tile.id === target.tile.id))
            );

            if (potentialTargets.length > 0) {
                // Prioritize attacks slightly? Or just random?
                // Let's keep it random for now.
                const target = potentialTargets[getRandomInt(potentialTargets.length)];
                const targetTile = target.tile;

                if (target.action === 'expand') {
                    // Expand into neutral territory
                    targetTile.ownerFactionId = faction.id;
                    faction.controlledTiles.push(targetTile.id);
                    faction.strength += 1;
                    faction.resources.Food = Math.max(0, faction.resources.Food - 15);
                    faction.resources.Wood = Math.max(0, faction.resources.Wood - 15);
                    addEvent("FactionExpand", `${faction.name} expanded to tile (${targetTile.x}, ${targetTile.y}).`, [faction.id, targetTile.id]);
                } else if (target.action === 'attack') {
                    // Attack occupied territory
                    const defender = getFactionById(targetTile.ownerFactionId);
                    if (defender) { // Defender might have been destroyed already this tick
                         // Cost to initiate attack
                        faction.resources.Ore = Math.max(0, faction.resources.Ore - 10);
                        faction.manaHeld = Math.max(0, faction.manaHeld - 5);
                        faction.strength -= 0.5; // Small strength cost to attack

                        resolveConflict(faction, defender, targetTile);
                    }
                }
            }
        }
        
        // TODO: Implement Diplomacy Logic

    });

    // --- End Tick --- 
    if (simulationState.currentTick % 50 === 0) {
         console.log(`Tick ${simulationState.currentTick} complete. Factions: ${simulationState.factions.length}`);
         addEvent("TickMilestone", `Reached tick ${simulationState.currentTick}.`);
    }
    
    // Check for end condition (e.g., only one faction left)
    if (simulationState.factions.length === 1 && currentFactions.length > 1) {
        const winner = simulationState.factions[0];
        addEvent("SimulationEnd", `${winner.name} is the last surviving faction! Simulation ended.`);
        console.log(`${winner.name} is the last surviving faction! Simulation ended at tick ${simulationState.currentTick}.`);
        simulationState.isRunning = false;
        clearInterval(simulationState.tickIntervalId);
        simulationState.tickIntervalId = null;
    }
}

// --- API Endpoints ---
app.use(cors());
app.use(express.json());

app.get('/api/simulation/state', (req, res) => {
    // Send a snapshot, potentially excluding the full tile grid for brevity
    res.json({
        currentTick: simulationState.currentTick,
        map: {
            width: simulationState.map.width,
            height: simulationState.map.height,
            // Send only owner info for map overview
            tiles: simulationState.map.tiles.flat().map(t => ({ id: t.id, x: t.x, y: t.y, owner: t.ownerFactionId }))
        },
        factions: simulationState.factions.map(f => ({ // Send summary faction data
            id: f.id,
            name: f.name,
            color: f.color,
            strength: f.strength,
            tileCount: f.controlledTiles.length,
            resources: f.resources,
            manaHeld: f.manaHeld
        })),
        events: simulationState.events.slice(-20), // Last 20 events
        isRunning: simulationState.isRunning
    });
});

app.get('/api/map/tiles', (req, res) => {
    // Endpoint to get full tile details if needed
    res.json(simulationState.map.tiles.flat());
});

app.get('/api/factions', (req, res) => {
    res.json(simulationState.factions.map(f => ({ // Send summary faction data
        id: f.id,
        name: f.name,
        color: f.color,
        strength: f.strength,
        tileCount: f.controlledTiles.length,
        resources: f.resources,
        manaHeld: f.manaHeld
    })));
});

app.get('/api/factions/:id', (req, res) => {
    const faction = getFactionById(req.params.id);
    if (faction) {
        res.json(faction); // Send full details for a specific faction
    } else {
        res.status(404).json({ message: 'Faction not found' });
    }
});

app.get('/api/events', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const recentEvents = simulationState.events.slice(-limit);
    res.json(recentEvents);
});

// --- Simulation Control API ---
app.post('/api/simulation/control', (req, res) => {
    const { action } = req.body;
    let message = 'Invalid action.';
    let status = 400;

    if (action === 'pause') {
        if (simulationState.isRunning) {
            simulationState.isRunning = false;
            clearInterval(simulationState.tickIntervalId);
            simulationState.tickIntervalId = null;
            message = 'Simulation paused.';
            status = 200;
            addEvent("SimControl", message);
        } else {
            message = 'Simulation already paused.';
            status = 200;
        }
    } else if (action === 'resume') {
        if (!simulationState.isRunning) {
            simulationState.isRunning = true;
            simulationState.tickIntervalId = setInterval(runSimulationTick, TICK_INTERVAL_MS);
            message = 'Simulation resumed.';
            status = 200;
            addEvent("SimControl", message);
        } else {
            message = 'Simulation already running.';
            status = 200;
        }
    } else if (action === 'reset') {
         if (simulationState.tickIntervalId) {
            clearInterval(simulationState.tickIntervalId);
         }
         initializeSimulation();
         simulationState.isRunning = true;
         simulationState.tickIntervalId = setInterval(runSimulationTick, TICK_INTERVAL_MS);
         message = 'Simulation reset and started.';
         status = 200;
         addEvent("SimControl", message);
    } else if (action === 'tick') { // Manual tick advance (for debugging/stepping)
        if (!simulationState.isRunning) {
            runSimulationTick();
            message = `Advanced to tick ${simulationState.currentTick}.`;
            status = 200;
            addEvent("SimControl", message);
        } else {
            message = 'Cannot advance tick while simulation is running.';
            status = 400;
        }
    }

    res.status(status).json({ message });
});


// --- Server Start ---
app.listen(port, '0.0.0.0', () => {
    console.log(`Eruxian Simulation Backend listening on port ${port}`);
    // UUID should be installed now, direct initialization
    initializeSimulation();
    // Start the simulation loop
    simulationState.isRunning = true;
    simulationState.tickIntervalId = setInterval(runSimulationTick, TICK_INTERVAL_MS);
});

