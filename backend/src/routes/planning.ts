import { Router } from "express";
import { getFloorPlan } from "../services/floorPlanService";
import { computeCableRouting } from "../services/routingService";
import { estimateCost } from "../services/costEstimationService";
import type { WallSide } from "../models/types";

export const planningRouter = Router();

async function loadRoutableRooms(floorPlanId: string) {
  const plan = await getFloorPlan(floorPlanId);
  if (!plan) return null;

  const rooms = plan.rooms.map((room) => ({
    id: room.id,
    x: room.x,
    y: room.y,
    width: room.width,
    length: room.length,
    doors: room.doors.map((d) => ({
      wallSide: d.wallSide as WallSide,
      offset: d.offset,
      width: d.width,
    })),
    windows: room.windows.map((w) => ({
      wallSide: w.wallSide as WallSide,
      offset: w.offset,
      width: w.width,
    })),
    plumbing: room.plumbing.map((p) => ({
      x1: p.x1,
      y1: p.y1,
      x2: p.x2,
      y2: p.y2,
      clearance: p.clearance,
    })),
  }));

  const electricalPoints = plan.electricalPoints.map((p) => ({
    id: p.id,
    type: p.type as any,
    x: p.x,
    y: p.y,
  }));

  return { rooms, electricalPoints };
}

planningRouter.get("/:id/cable-routes", async (req, res) => {
  const routable = await loadRoutableRooms(req.params.id);
  if (!routable) return res.status(404).json({ error: "Floor plan not found" });
  res.json(computeCableRouting(routable));
});

planningRouter.get("/:id/cost-estimate", async (req, res) => {
  const routable = await loadRoutableRooms(req.params.id);
  if (!routable) return res.status(404).json({ error: "Floor plan not found" });
  const routing = computeCableRouting(routable);
  res.json({ routing, cost: estimateCost(routing.routes) });
});
