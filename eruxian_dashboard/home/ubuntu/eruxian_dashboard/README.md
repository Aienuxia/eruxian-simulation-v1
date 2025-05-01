# Eruxian Simulation Dashboard - README

This directory contains the React frontend for the Eruxian Prime Continent v1 simulation prototype.

## Features

*   Visualizes the simulation map using colored tiles for faction territories.
*   Displays a list of active factions with basic stats (strength, tiles, mana).
*   Shows a log of recent simulation events.
*   Provides controls to pause, resume, reset, or manually tick the simulation.
*   Connects to the backend API to fetch and display live data.

## Setup

1.  **Prerequisites:** Node.js (v18+ recommended), npm or pnpm.
2.  **Install Dependencies:** Navigate to this directory (`eruxian_dashboard`) in your terminal and run:
    ```bash
    npm install
    # or
    # pnpm install
    ```

## Running Locally

1.  **Ensure the backend server is running** (see backend README).
2.  Start the frontend development server:
    ```bash
    npm run dev
    # or
    # pnpm run dev
    ```
3.  The server will start, typically opening `http://localhost:5173` in your browser.
4.  The dashboard uses Vite's proxy feature (`vite.config.ts`) to forward API requests (`/api/...`) to the backend assumed to be running on `http://localhost:3000`.

## Deployment

This React application is suitable for deployment on static hosting platforms like Vercel, Netlify, GitHub Pages, etc. See the main `deployment_guide.md` for step-by-step instructions using Vercel.

**Important:** When deploying, the hosting platform needs to know how to handle the API calls. Options include:

*   Deploying the backend to a public URL and configuring the frontend's `API_BASE_URL` (in `src/App.jsx`) to point to that URL before building.
*   Using serverless functions provided by the hosting platform (e.g., Vercel Serverless Functions) to host the backend logic alongside the frontend (more advanced setup).
*   Using platforms that support deploying both frontend and backend together (like Render). The provided guide focuses on separate deployments to Vercel (frontend) and Render (backend).

