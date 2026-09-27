// Mirrors backend/src/models/types.ts — kept in sync manually since this is a
// two-package (not shared-package) monorepo layout.

export type WallSide = "north" | "south" | "east" | "west";
export type ElectricalPointType = "outlet" | "switch" | "mains" | "light";

export interface Point2D {
  x: number;
  y: number;
}

export interface Door {
  id?: string;
  wallSide: WallSide;
  offset: number;
  width: number;
}

export interface WindowOpening {
  id?: string;
  wallSide: WallSide;
  offset: number;
  width: number;
}

export interface PlumbingLine {
  id?: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  clearance?: number;
}

export interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  length: number;
  height: number;
  doors: Door[];
  windows: WindowOpening[];
  plumbing: PlumbingLine[];
}

export interface ElectricalPoint {
  id: string;
  type: ElectricalPointType;
  x: number;
  y: number;
  z: number;
  roomId?: string;
}

export interface FloorPlan {
  id: string;
  name: string;
  rooms: Room[];
  electricalPoints: ElectricalPoint[];
}

export interface CableRoute {
  pointId: string;
  pointType: ElectricalPointType;
  path: Point2D[];
  lengthMeters: number;
}

export interface CableRoutingResult {
  routes: CableRoute[];
  unroutable: string[];
}

export interface CostLineItem {
  pointId: string;
  pointType: ElectricalPointType;
  lengthMeters: number;
  cableGauge: string;
  ratePerMeter: number;
  cost: number;
}

export interface CostEstimate {
  currency: string;
  items: CostLineItem[];
  totalCableCost: number;
  accessoriesCost: number;
  totalCost: number;
}
