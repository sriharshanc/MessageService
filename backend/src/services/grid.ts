// Builds a 2D obstacle grid over a floor plan's bounding box for cable-path A* search.
//
// Modeling choice: cables are assumed to run through wall/floor cavities, so a room's
// walls themselves are NOT obstacles — a path may hug any wall. What DOES block a path:
//   1. Door and window openings: there's no structural cavity across an opening, so a
//      buffer zone around each opening's wall segment is marked impassable, forcing the
//      route to detour through the room interior instead of crossing the gap.
//   2. Plumbing lines: blocked within their clearance radius, per room.
// Cells outside every room's footprint are also impassable (no cavity to run cable in).

import type { Point2D, WallSide } from "../models/types";

export interface GridRoom {
  id: string;
  x: number;
  y: number;
  width: number;
  length: number;
  doors: { wallSide: WallSide; offset: number; width: number }[];
  windows: { wallSide: WallSide; offset: number; width: number }[];
  plumbing: { x1: number; y1: number; x2: number; y2: number; clearance: number }[];
}

export interface ObstacleGrid {
  originX: number;
  originY: number;
  cellSize: number;
  cols: number;
  rows: number;
  blocked: Uint8Array; // 1 = impassable
  passable: Uint8Array; // 1 = inside some room's footprint
}

const CELL_SIZE = 0.1; // meters
const OPENING_BUFFER = 0.25; // meters either side of a door/window along the wall

function wallSegmentPoint(room: GridRoom, side: WallSide, offset: number): Point2D {
  switch (side) {
    case "north":
      return { x: room.x + offset * room.width, y: room.y };
    case "south":
      return { x: room.x + offset * room.width, y: room.y + room.length };
    case "west":
      return { x: room.x, y: room.y + offset * room.length };
    case "east":
      return { x: room.x + room.width, y: room.y + offset * room.length };
  }
}

export function buildObstacleGrid(rooms: GridRoom[]): ObstacleGrid {
  const minX = Math.min(...rooms.map((r) => r.x)) - 1;
  const minY = Math.min(...rooms.map((r) => r.y)) - 1;
  const maxX = Math.max(...rooms.map((r) => r.x + r.width)) + 1;
  const maxY = Math.max(...rooms.map((r) => r.y + r.length)) + 1;

  const cols = Math.ceil((maxX - minX) / CELL_SIZE);
  const rows = Math.ceil((maxY - minY) / CELL_SIZE);
  const blocked = new Uint8Array(cols * rows);
  const passable = new Uint8Array(cols * rows);

  const idx = (col: number, row: number) => row * cols + col;
  const toCol = (x: number) => Math.floor((x - minX) / CELL_SIZE);
  const toRow = (y: number) => Math.floor((y - minY) / CELL_SIZE);

  // Mark each room's footprint as passable.
  for (const room of rooms) {
    const c0 = toCol(room.x);
    const c1 = toCol(room.x + room.width);
    const r0 = toRow(room.y);
    const r1 = toRow(room.y + room.length);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        if (c >= 0 && c < cols && r >= 0 && r < rows) passable[idx(c, r)] = 1;
      }
    }
  }

  // Block door/window opening buffers.
  for (const room of rooms) {
    for (const opening of [...room.doors, ...room.windows]) {
      const center = wallSegmentPoint(room, opening.wallSide, opening.offset);
      const halfSpan = opening.width / 2 + OPENING_BUFFER;
      const c0 = toCol(center.x - halfSpan);
      const c1 = toCol(center.x + halfSpan);
      const r0 = toRow(center.y - halfSpan);
      const r1 = toRow(center.y + halfSpan);
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          if (c >= 0 && c < cols && r >= 0 && r < rows) blocked[idx(c, r)] = 1;
        }
      }
    }

    // Block plumbing clearance zones (sampled along each line segment).
    for (const line of room.plumbing) {
      const steps = Math.ceil(
        Math.hypot(line.x2 - line.x1, line.y2 - line.y1) / (CELL_SIZE / 2),
      );
      for (let s = 0; s <= steps; s++) {
        const t = steps === 0 ? 0 : s / steps;
        const px = line.x1 + (line.x2 - line.x1) * t;
        const py = line.y1 + (line.y2 - line.y1) * t;
        const cellRadius = Math.ceil(line.clearance / CELL_SIZE);
        const cc = toCol(px);
        const cr = toRow(py);
        for (let dr = -cellRadius; dr <= cellRadius; dr++) {
          for (let dc = -cellRadius; dc <= cellRadius; dc++) {
            const c = cc + dc;
            const r = cr + dr;
            if (c >= 0 && c < cols && r >= 0 && r < rows) blocked[idx(c, r)] = 1;
          }
        }
      }
    }
  }

  return { originX: minX, originY: minY, cellSize: CELL_SIZE, cols, rows, blocked, passable };
}

export function worldToCell(grid: ObstacleGrid, point: Point2D): { col: number; row: number } {
  return {
    col: Math.floor((point.x - grid.originX) / grid.cellSize),
    row: Math.floor((point.y - grid.originY) / grid.cellSize),
  };
}

export function cellToWorld(grid: ObstacleGrid, col: number, row: number): Point2D {
  return {
    x: grid.originX + (col + 0.5) * grid.cellSize,
    y: grid.originY + (row + 0.5) * grid.cellSize,
  };
}

export function isTraversable(grid: ObstacleGrid, col: number, row: number): boolean {
  if (col < 0 || col >= grid.cols || row < 0 || row >= grid.rows) return false;
  const i = row * grid.cols + col;
  return grid.passable[i] === 1 && grid.blocked[i] === 0;
}
