// Core domain types shared conceptually with the frontend (frontend/src/types/index.ts).
// Plan-space coordinates are in meters, with (0,0) at the floor plan's origin.

export type WallSide = "north" | "south" | "east" | "west";
export type ElectricalPointType = "outlet" | "switch" | "mains" | "light";

export interface Point2D {
  x: number;
  y: number;
}

export interface DoorInput {
  wallSide: WallSide;
  offset: number; // 0..1 along the wall segment
  width: number; // meters
}

export interface WindowInput {
  wallSide: WallSide;
  offset: number;
  width: number;
}

export interface PlumbingLineInput {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  clearance?: number; // meters, defaults to 0.15
}

export interface RoomInput {
  id?: string;
  name: string;
  x: number;
  y: number;
  width: number;
  length: number;
  height: number;
  polygon?: Point2D[];
  doors?: DoorInput[];
  windows?: WindowInput[];
  plumbing?: PlumbingLineInput[];
}

export interface ElectricalPointInput {
  id?: string;
  type: ElectricalPointType;
  x: number;
  y: number;
  z: number;
  roomId?: string;
}

export interface FloorPlanInput {
  name: string;
  rooms: RoomInput[];
  electricalPoints?: ElectricalPointInput[];
}

export interface CableRouteSegment {
  from: Point2D;
  to: Point2D;
}

export interface CableRoute {
  pointId: string;
  pointType: ElectricalPointType;
  path: Point2D[]; // ordered waypoints from the mains to this point
  lengthMeters: number;
}

export interface CableRoutingResult {
  routes: CableRoute[];
  unroutable: string[]; // point IDs that could not be connected
}

export interface CostLineItem {
  pointId: string;
  pointType: ElectricalPointType;
  lengthMeters: number;
  cableGauge: string; // e.g. "1.5 sq mm", "2.5 sq mm", "4 sq mm"
  ratePerMeter: number;
  cost: number;
}

export interface CostEstimate {
  currency: string;
  items: CostLineItem[];
  totalCableCost: number;
  accessoriesCost: number; // switches/sockets/mains board estimated cost
  totalCost: number;
}
