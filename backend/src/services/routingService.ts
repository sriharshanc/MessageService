import { findPath } from "./astar";
import { buildObstacleGrid, worldToCell, type GridRoom } from "./grid";
import type { CableRoutingResult, ElectricalPointType, Point2D } from "../models/types";

interface RoutableFloorPlan {
  rooms: GridRoom[];
  electricalPoints: {
    id: string;
    type: ElectricalPointType;
    x: number;
    y: number;
  }[];
}

function pathLength(path: Point2D[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    total += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
  }
  return total;
}

export function computeCableRouting(plan: RoutableFloorPlan): CableRoutingResult {
  const mainsPoints = plan.electricalPoints.filter((p) => p.type === "mains");
  if (mainsPoints.length === 0 || plan.rooms.length === 0) {
    return {
      routes: [],
      unroutable: plan.electricalPoints.map((p) => p.id),
    };
  }

  const grid = buildObstacleGrid(plan.rooms);
  const routes: CableRoutingResult["routes"] = [];
  const unroutable: string[] = [];

  for (const point of plan.electricalPoints) {
    if (point.type === "mains") continue;

    let best: { path: Point2D[]; length: number } | null = null;
    for (const mains of mainsPoints) {
      const startCell = worldToCell(grid, { x: mains.x, y: mains.y });
      const goalCell = worldToCell(grid, { x: point.x, y: point.y });
      const path = findPath(grid, startCell, goalCell);
      if (!path) continue;
      const length = pathLength(path);
      if (!best || length < best.length) best = { path, length };
    }

    if (best) {
      routes.push({
        pointId: point.id,
        pointType: point.type,
        path: best.path,
        lengthMeters: Math.round(best.length * 100) / 100,
      });
    } else {
      unroutable.push(point.id);
    }
  }

  return { routes, unroutable };
}
