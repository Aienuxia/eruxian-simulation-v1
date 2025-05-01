# Eruxian Simulation Backend - README

This directory contains the Node.js/Express backend for the Eruxian Prime Continent v1 simulation prototype.

## Features

*   Runs the core simulation logic (faction growth, resource management, conflict).
*   Provides a REST API for the frontend dashboard to fetch simulation state.
*   Basic simulation controls (pause, resume, reset, tick).

## Setup

1.  **Prerequisites:** Node.js (v18+ recommended), npm or pnpm.
2.  **Install Dependencies:** Navigate to this directory (`eruxian_sim_backend`) in your terminal and run:
    ```bash
    npm install
    # or
    # pnpm install
    ```

## Running Locally

1.  Start the server:
    ```bash
    node server.js
    ```
2.  The server will start, typically listening on `http://localhost:3000`.
3.  The simulation will begin running automatically.

## API Endpoints

*   `GET /api/simulation/state`: Get the current overall simulation state (map overview, faction summaries, recent events).
*   `GET /api/map/tiles`: Get detailed information for all map tiles.
*   `GET /api/factions`: Get a summary list of all active factions.
*   `GET /api/factions/:id`: Get detailed information for a specific faction.
*   `GET /api/events`: Get a list of recent simulation events (query param `limit` supported).
*   `POST /api/simulation/control`: Send control actions (e.g., `{ "action": "pause" }`, `{ "action": "resume" }`, `{ "action": "reset" }`, `{ "action": "tick" }`).

## Deployment

This Node.js application is suitable for deployment on platforms like Render, Heroku, AWS, Google Cloud, etc. See the main `deployment_guide.md` for step-by-step instructions using Render.

