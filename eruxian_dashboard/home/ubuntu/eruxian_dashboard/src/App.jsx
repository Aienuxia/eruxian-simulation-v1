import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// --- Configuration ---
// API_BASE_URL is now relative, relying on Vite proxy
const API_BASE_URL = "https://eruxian-backend.onrender.com/api"; 
const POLLING_INTERVAL_MS = 2000; // Fetch updates every 2 seconds

// --- Placeholder Components ---

function MapView({ mapData, factions }) {
  if (!mapData || !mapData.tiles) {
    return <div>Loading Map...</div>;
  }

  const { width, height, tiles } = mapData;
  const tileSize = 20; // Size of each tile in pixels

  const getFactionColor = (factionId) => {
    // Handle potential missing factions during updates
    const faction = factions?.find(f => f.id === factionId);
    return faction ? faction.color : "#CCCCCC"; // Default grey for neutral
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Continent Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ position: "relative", width: width * tileSize, height: height * tileSize, border: "1px solid black", overflow: "hidden" }}>
          {tiles.map((tile) => (
            <div
              key={tile.id}
              title={`Tile (${tile.x}, ${tile.y}) - Owner: ${tile.owner || 'Neutral'}`}
              style={{
                position: "absolute",
                left: tile.x * tileSize,
                top: tile.y * tileSize,
                width: tileSize,
                height: tileSize,
                backgroundColor: getFactionColor(tile.owner),
                border: "1px solid #EEE",
                boxSizing: "border-box",
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FactionList({ factions }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Factions</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {!factions || factions.length === 0 ? (
            <p>No factions yet.</p>
          ) : (
            factions.map((faction) => (
              <div key={faction.id} className="mb-2 p-2 border rounded">
                <div className="flex items-center mb-1">
                  <span style={{ backgroundColor: faction.color, width: '12px', height: '12px', marginRight: '8px', display: 'inline-block', borderRadius: '50%' }}></span>
                  <span className="font-semibold">{faction.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Strength: {faction.strength.toFixed(1)} | Tiles: {faction.tileCount} | Mana: {faction.manaHeld.toFixed(1)}
                </p>
                {/* <p className="text-xs text-muted-foreground">Food: {faction.resources.Food.toFixed(0)}, Wood: {faction.resources.Wood.toFixed(0)}, Ore: {faction.resources.Ore.toFixed(0)}</p> */}
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function EventLog({ events }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {!events || events.length === 0 ? (
            <p>No events yet.</p>
          ) : (
            [...events].reverse().map((event, index) => (
              <div key={index} className="mb-1 text-sm">
                <span className="text-muted-foreground">[{new Date(event.timestamp).toLocaleTimeString()}]</span> {event.description}
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ControlPanel({ isRunning, onPause, onResume, onReset, onTick }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Simulation Control</CardTitle>
            </CardHeader>
            <CardContent className="flex space-x-2">
                {isRunning ? (
                    <Button onClick={onPause} variant="destructive">Pause</Button>
                ) : (
                    <Button onClick={onResume} variant="secondary">Resume</Button>
                )}
                <Button onClick={onReset} variant="outline">Reset</Button>
                {!isRunning && <Button onClick={onTick} variant="outline">Tick</Button>}
            </CardContent>
        </Card>
    );
}

// --- Main App Component ---
function App() {
  const [simState, setSimState] = useState({ factions: [], events: [], map: { tiles: [] }, isRunning: true, currentTick: 0 });
  const [error, setError] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  const fetchData = async () => {
    try {
      // Use relative path for API call - Vite proxy handles forwarding
      const response = await axios.get(`${API_BASE_URL}/simulation/state`);
      setSimState(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching simulation state:", err);
      setError("Failed to connect to simulation backend. Is it running and is the proxy configured?");
      // Stop polling if there's an error
      if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
      }
    }
  };

  const sendControlAction = async (action) => {
      try {
          // Use relative path for API call
          await axios.post(`${API_BASE_URL}/simulation/control`, { action });
          // Fetch data immediately after control action to reflect change
          fetchData();
      } catch (err) {
          console.error(`Error sending control action (${action}):`, err);
          setError(`Failed to ${action} simulation.`);
      }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up polling only if not already polling
    if (!intervalId) {
        const id = setInterval(fetchData, POLLING_INTERVAL_MS);
        setIntervalId(id);
    }

    // Cleanup on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []); // Run only once on mount

  // Adjust polling based on simulation running state
   useEffect(() => {
    if (simState.isRunning && !intervalId) {
      const id = setInterval(fetchData, POLLING_INTERVAL_MS);
      setIntervalId(id);
    } else if (!simState.isRunning && intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      // Fetch one last time when pausing
      fetchData();
    }
  }, [simState.isRunning]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Eruxian Prime Continent Simulation v1</h1>
      {error && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <MapView mapData={simState.map} factions={simState.factions} />
        </div>
        <div className="space-y-4">
          <ControlPanel
              isRunning={simState.isRunning}
              onPause={() => sendControlAction('pause')}
              onResume={() => sendControlAction('resume')}
              onReset={() => sendControlAction('reset')}
              onTick={() => sendControlAction('tick')}
          />
          <p className="text-center text-muted-foreground">Tick: {simState.currentTick}</p>
          <Separator />
          <FactionList factions={simState.factions} />
          <Separator />
          <EventLog events={simState.events} />
        </div>
      </div>
    </div>
  );
}

export default App;

