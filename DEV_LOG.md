# Eunaxia / Eruxian Simulation V1 — Development Log

This file tracks what was added to the project so the build history stays clear.

## 2026-05-18

### Project direction
- Pivoted from Unity to a web-first prototype.
- Frontend target: Next.js deployed on Vercel.
- 3D visual layer: Three.js through React Three Fiber.
- Backend/database target: MongoDB.
- Visual style target: low-poly / stylized small 3D characters similar in readability to Albion-style observer view.

### Initial code setup
- Added `package.json` with core dependencies:
  - Next.js
  - React
  - Three.js
  - React Three Fiber
  - Drei
  - MongoDB
  - Zustand
  - TypeScript

### Build philosophy
- Start with one small village, not the full world.
- First prototype goal: a visible observer scene with a terrain, village center, and founder agents.
- Simulation logic should remain separate from visual rendering.
- Store memories as compressed structured data, not full logs.

### Non-coder workflow rule
- Each assistant response should clearly state:
  1. What changed
  2. What the user should do next
  3. What the next build step is
