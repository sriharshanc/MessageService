# House Electrical Planner — Backend

Node.js + TypeScript + Express API backing the floor plan / electrical
planning app.

## Stack

- **Express** — HTTP API
- **Prisma + SQLite** — persistence (swap the `datasource` in `prisma/schema.prisma` for Postgres in production)
- **Zod** — request validation
- Custom **A\* pathfinding** over a grid derived from room geometry for cable routing
- Rule-based **cost estimation** using a configurable market-rate table

## Setup

```bash
npm install
npx prisma migrate dev   # creates dev.db and applies the schema
npm run dev              # starts on http://localhost:4000
```

## API

| Method | Path                                     | Description                                  |
|--------|-------------------------------------------|-----------------------------------------------|
| GET    | `/api/floor-plans`                        | List saved floor plans                        |
| POST   | `/api/floor-plans`                        | Create a floor plan (rooms + electrical points) |
| GET    | `/api/floor-plans/:id`                    | Fetch a floor plan with rooms/points          |
| DELETE | `/api/floor-plans/:id`                    | Delete a floor plan                           |
| POST   | `/api/floor-plans/:id/electrical-points`  | Add an electrical point                       |
| DELETE | `/api/floor-plans/electrical-points/:id`  | Remove an electrical point                    |
| GET    | `/api/floor-plans/:id/cable-routes`       | Compute A* cable routes from mains to each point |
| GET    | `/api/floor-plans/:id/cost-estimate`      | Compute routes + cable/accessory cost estimate |

## How cable routing works

`src/services/grid.ts` rasterizes all rooms into a shared grid (10cm cells).
A room's footprint is passable; cells are blocked around door/window
openings (no wall cavity to route through) and around plumbing lines (using
each line's clearance radius). `src/services/astar.ts` runs 8-directional
A* from the mains supply to each electrical point over that grid;
`src/services/routingService.ts` picks the nearest reachable mains per point.

`src/services/costEstimationService.ts` assigns a cable gauge per fitting
type (outlet/switch/light/mains), applies a 10% slack allowance to routed
length, and multiplies by a market-rate table (`DEFAULT_MARKET_RATES`) —
replace those rates with real supplier pricing for production use.

## Known simplifications (MVP scope)

- Routing works in 2D plan space; it does not model routing through ceiling
  vs. floor vs. wall cavities in 3D, or shared conduit runs between points.
- Market rates are illustrative defaults, not live pricing.
- Room shapes are axis-aligned rectangles (a `polygon` field exists on the
  schema for future non-rectangular rooms but isn't used by the routing grid yet).
