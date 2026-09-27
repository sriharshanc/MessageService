# MessageService
MessageService 

.NetCore 3.0 Console app
    The calls must be threadsafe
    The call of the message service must not block the main thread
    The result of the call of the message service indicates whether the sending of the message was successful.
    A message is a "simple" string

## House Electrical Planner

This repo also contains a full-stack web app for designing a house's floor
plan, generating a 3D interior view, placing electrical points, and getting
cable-routing + cost estimates. See:

- [`backend/README.md`](backend/README.md) — Node.js/TypeScript API (Express, Prisma/SQLite, A* cable routing, cost estimation)
- [`frontend/README.md`](frontend/README.md) — React/TypeScript UI (Konva 2D editor, react-three-fiber 3D viewer)

Quick start (two terminals):

```bash
cd backend && npm install && npx prisma migrate dev && npm run dev   # http://localhost:4000
cd frontend && npm install && npm run dev                            # http://localhost:5173
```
