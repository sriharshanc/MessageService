# House Electrical Planner — Frontend

React + TypeScript UI for drawing a floor plan, viewing it in 3D, placing
electrical points, and reviewing cable routing + cost estimates.

## Stack

- **Vite + React + TypeScript**
- **Konva / react-konva** — 2D floor plan editor (draw rooms, doors, windows, plumbing)
- **three.js / @react-three/fiber / @react-three/drei** — 3D interior view generated from room dimensions
- **Zustand** — client state (current plan, tool selection, routing/cost results)

## Setup

```bash
npm install
npm run dev   # http://localhost:5173 (proxies /api to the backend on :4000)
```

Run the backend first (see `../backend/README.md`) — the dev server proxies
`/api/*` requests to `http://localhost:4000`.

## Usage

1. Select **Draw Room** and drag on the 2D canvas to create a room; it's
   created with a default height (2.7m) editable via dimensions shown on the room.
2. Use **Add Door** / **Add Window** and click near a room's edge to place openings.
3. Use **Draw Plumbing** and drag inside a room to mark a pipe run cable
   routing must avoid.
4. Select a **Place Mains / Outlet / Switch / Light** tool and click to place
   electrical points (at least one **Mains** point is required).
5. Click **Compute Cable Routing & Cost** — this saves the plan to the
   backend, runs A* routing from the mains to every other point, and shows
   the cost estimate.
6. Switch to **3D View** to see the extruded room geometry, electrical
   points, and routed cable paths.

## Known simplifications (MVP scope)

- Room walls in the 3D view are solid boxes; door/window openings are shown
  as colored markers rather than true geometric cutouts (would require CSG).
- Cable paths are computed in 2D and given a simple vertical rise to the
  point's height for 3D display, rather than a fully 3D-routed path.
