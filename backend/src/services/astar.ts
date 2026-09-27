// Generic 8-directional A* over an ObstacleGrid.

import { type ObstacleGrid, cellToWorld, isTraversable } from "./grid";
import type { Point2D } from "../models/types";

interface Cell {
  col: number;
  row: number;
}

const NEIGHBORS: [number, number, number][] = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, Math.SQRT2],
  [1, -1, Math.SQRT2],
  [-1, 1, Math.SQRT2],
  [-1, -1, Math.SQRT2],
];

function heuristic(a: Cell, b: Cell): number {
  return Math.hypot(a.col - b.col, a.row - b.row);
}

class MinHeap<T> {
  private items: { priority: number; value: T }[] = [];

  push(priority: number, value: T) {
    this.items.push({ priority, value });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  pop(): T | undefined {
    return this.items.shift()?.value;
  }

  get size() {
    return this.items.length;
  }
}

export function findPath(
  grid: ObstacleGrid,
  start: Cell,
  goal: Cell,
): Point2D[] | null {
  if (!isTraversable(grid, start.col, start.row) || !isTraversable(grid, goal.col, goal.row)) {
    return null;
  }

  const key = (c: Cell) => c.row * grid.cols + c.col;
  const open = new MinHeap<Cell>();
  open.push(0, start);

  const gScore = new Map<number, number>([[key(start), 0]]);
  const cameFrom = new Map<number, Cell>();
  const visited = new Set<number>();

  while (open.size > 0) {
    const current = open.pop()!;
    const currentKey = key(current);
    if (visited.has(currentKey)) continue;
    visited.add(currentKey);

    if (current.col === goal.col && current.row === goal.row) {
      return reconstructPath(grid, cameFrom, current);
    }

    for (const [dc, dr, cost] of NEIGHBORS) {
      const next: Cell = { col: current.col + dc, row: current.row + dr };
      if (!isTraversable(grid, next.col, next.row)) continue;

      const nextKey = key(next);
      const tentativeG = (gScore.get(currentKey) ?? Infinity) + cost;
      if (tentativeG < (gScore.get(nextKey) ?? Infinity)) {
        gScore.set(nextKey, tentativeG);
        cameFrom.set(nextKey, current);
        open.push(tentativeG + heuristic(next, goal), next);
      }
    }
  }

  return null;
}

function reconstructPath(
  grid: ObstacleGrid,
  cameFrom: Map<number, Cell>,
  end: Cell,
): Point2D[] {
  const cells: Cell[] = [end];
  let key = end.row * grid.cols + end.col;
  while (cameFrom.has(key)) {
    const prev = cameFrom.get(key)!;
    cells.push(prev);
    key = prev.row * grid.cols + prev.col;
  }
  cells.reverse();
  return simplify(cells.map((c) => cellToWorld(grid, c.col, c.row)));
}

// Collapse consecutive collinear waypoints so the returned path only bends
// where the direction actually changes (cheaper to render and to cost out).
function simplify(points: Point2D[]): Point2D[] {
  if (points.length <= 2) return points;
  const result: Point2D[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const a = result[result.length - 1];
    const b = points[i];
    const c = points[i + 1];
    const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    if (Math.abs(cross) > 1e-6) result.push(b);
  }
  result.push(points[points.length - 1]);
  return result;
}
