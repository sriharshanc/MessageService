import type { CableRoutingResult, CostEstimate, ElectricalPointType, FloorPlan } from "../types";

const BASE = "/api/floor-plans";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Request failed (${res.status}): ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface CreateFloorPlanPayload {
  name: string;
  rooms: {
    name: string;
    x: number;
    y: number;
    width: number;
    length: number;
    height: number;
    doors: { wallSide: string; offset: number; width: number }[];
    windows: { wallSide: string; offset: number; width: number }[];
    plumbing: { x1: number; y1: number; x2: number; y2: number; clearance?: number }[];
  }[];
  electricalPoints: { type: ElectricalPointType; x: number; y: number; z: number; roomId?: string }[];
}

export function createFloorPlan(payload: CreateFloorPlanPayload): Promise<FloorPlan> {
  return request(BASE, { method: "POST", body: JSON.stringify(payload) });
}

export function getFloorPlan(id: string): Promise<FloorPlan> {
  return request(`${BASE}/${id}`);
}

export function getCableRoutes(id: string): Promise<CableRoutingResult> {
  return request(`${BASE}/${id}/cable-routes`);
}

export function getCostEstimate(
  id: string,
): Promise<{ routing: CableRoutingResult; cost: CostEstimate }> {
  return request(`${BASE}/${id}/cost-estimate`);
}
