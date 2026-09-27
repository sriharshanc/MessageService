import { Router } from "express";
import { z } from "zod";
import {
  addElectricalPoint,
  createFloorPlan,
  deleteFloorPlan,
  getFloorPlan,
  listFloorPlans,
  removeElectricalPoint,
} from "../services/floorPlanService";

const wallSide = z.enum(["north", "south", "east", "west"]);

const doorSchema = z.object({
  wallSide,
  offset: z.number().min(0).max(1),
  width: z.number().positive(),
});

const plumbingSchema = z.object({
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
  clearance: z.number().positive().optional(),
});

const roomSchema = z.object({
  name: z.string().min(1),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  length: z.number().positive(),
  height: z.number().positive(),
  polygon: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
  doors: z.array(doorSchema).optional(),
  windows: z.array(doorSchema).optional(),
  plumbing: z.array(plumbingSchema).optional(),
});

const electricalPointSchema = z.object({
  type: z.enum(["outlet", "switch", "mains", "light"]),
  x: z.number(),
  y: z.number(),
  z: z.number(),
  roomId: z.string().optional(),
});

const floorPlanSchema = z.object({
  name: z.string().min(1),
  rooms: z.array(roomSchema).min(1),
  electricalPoints: z.array(electricalPointSchema).optional(),
});

export const floorPlanRouter = Router();

floorPlanRouter.get("/", async (_req, res) => {
  res.json(await listFloorPlans());
});

floorPlanRouter.get("/:id", async (req, res) => {
  const plan = await getFloorPlan(req.params.id);
  if (!plan) return res.status(404).json({ error: "Floor plan not found" });
  res.json(plan);
});

floorPlanRouter.post("/", async (req, res) => {
  const parsed = floorPlanSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const plan = await createFloorPlan(parsed.data);
  res.status(201).json(plan);
});

floorPlanRouter.delete("/:id", async (req, res) => {
  await deleteFloorPlan(req.params.id);
  res.status(204).send();
});

floorPlanRouter.post("/:id/electrical-points", async (req, res) => {
  const parsed = electricalPointSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const point = await addElectricalPoint(req.params.id, parsed.data);
  res.status(201).json(point);
});

floorPlanRouter.delete("/electrical-points/:pointId", async (req, res) => {
  await removeElectricalPoint(req.params.pointId);
  res.status(204).send();
});
