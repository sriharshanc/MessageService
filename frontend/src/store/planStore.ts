import { create } from "zustand";
import { createFloorPlan, getCostEstimate } from "../api/client";
import type {
  CableRoutingResult,
  CostEstimate,
  Door,
  ElectricalPoint,
  ElectricalPointType,
  PlumbingLine,
  Room,
  WallSide,
  WindowOpening,
} from "../types";

export type Tool =
  | "select"
  | "room"
  | "door"
  | "window"
  | "plumbing"
  | `point:${ElectricalPointType}`;

export type View = "2d" | "3d";

interface PlanState {
  planName: string;
  rooms: Room[];
  electricalPoints: ElectricalPoint[];
  selectedRoomId: string | null;
  tool: Tool;
  view: View;
  floorPlanId: string | null;
  routing: CableRoutingResult | null;
  cost: CostEstimate | null;
  status: "idle" | "saving" | "computing" | "error";
  errorMessage: string | null;

  setTool: (tool: Tool) => void;
  setView: (view: View) => void;
  selectRoom: (roomId: string | null) => void;
  addRoom: (room: Omit<Room, "id" | "doors" | "windows" | "plumbing">) => string;
  removeRoom: (roomId: string) => void;
  addDoor: (roomId: string, door: Omit<Door, "id">) => void;
  addWindow: (roomId: string, win: Omit<WindowOpening, "id">) => void;
  addPlumbing: (roomId: string, line: Omit<PlumbingLine, "id">) => void;
  addPoint: (point: Omit<ElectricalPoint, "id">) => void;
  removePoint: (pointId: string) => void;
  saveAndCompute: () => Promise<void>;
  reset: () => void;
}

let localIdCounter = 0;
function localId(prefix: string): string {
  localIdCounter += 1;
  return `${prefix}-${localIdCounter}`;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  planName: "My House",
  rooms: [],
  electricalPoints: [],
  selectedRoomId: null,
  tool: "room",
  view: "2d",
  floorPlanId: null,
  routing: null,
  cost: null,
  status: "idle",
  errorMessage: null,

  setTool: (tool) => set({ tool }),
  setView: (view) => set({ view }),
  selectRoom: (roomId) => set({ selectedRoomId: roomId }),

  addRoom: (room) => {
    const id = localId("room");
    set((s) => ({
      rooms: [...s.rooms, { ...room, id, doors: [], windows: [], plumbing: [] }],
      selectedRoomId: id,
    }));
    return id;
  },

  removeRoom: (roomId) =>
    set((s) => ({
      rooms: s.rooms.filter((r) => r.id !== roomId),
      selectedRoomId: s.selectedRoomId === roomId ? null : s.selectedRoomId,
    })),

  addDoor: (roomId, door) =>
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === roomId ? { ...r, doors: [...r.doors, { ...door, id: localId("door") }] } : r,
      ),
    })),

  addWindow: (roomId, win) =>
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === roomId
          ? { ...r, windows: [...r.windows, { ...win, id: localId("window") }] }
          : r,
      ),
    })),

  addPlumbing: (roomId, line) =>
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === roomId
          ? { ...r, plumbing: [...r.plumbing, { ...line, id: localId("plumbing") }] }
          : r,
      ),
    })),

  addPoint: (point) =>
    set((s) => ({
      electricalPoints: [...s.electricalPoints, { ...point, id: localId("point") }],
    })),

  removePoint: (pointId) =>
    set((s) => ({ electricalPoints: s.electricalPoints.filter((p) => p.id !== pointId) })),

  saveAndCompute: async () => {
    const { planName, rooms, electricalPoints } = get();
    if (rooms.length === 0) {
      set({ status: "error", errorMessage: "Add at least one room before computing." });
      return;
    }
    if (!electricalPoints.some((p) => p.type === "mains")) {
      set({ status: "error", errorMessage: "Place a mains supply point before computing." });
      return;
    }

    set({ status: "saving", errorMessage: null });
    try {
      const plan = await createFloorPlan({
        name: planName,
        rooms: rooms.map((r) => ({
          name: r.name,
          x: r.x,
          y: r.y,
          width: r.width,
          length: r.length,
          height: r.height,
          doors: r.doors.map((d) => ({ wallSide: d.wallSide as WallSide, offset: d.offset, width: d.width })),
          windows: r.windows.map((w) => ({ wallSide: w.wallSide as WallSide, offset: w.offset, width: w.width })),
          plumbing: r.plumbing.map((p) => ({ x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2, clearance: p.clearance })),
        })),
        electricalPoints: electricalPoints.map((p) => ({
          type: p.type,
          x: p.x,
          y: p.y,
          z: p.z,
        })),
      });

      set({ floorPlanId: plan.id, status: "computing" });
      const { routing, cost } = await getCostEstimate(plan.id);
      set({ routing, cost, status: "idle" });
    } catch (err) {
      set({ status: "error", errorMessage: (err as Error).message });
    }
  },

  reset: () =>
    set({
      rooms: [],
      electricalPoints: [],
      selectedRoomId: null,
      floorPlanId: null,
      routing: null,
      cost: null,
      status: "idle",
      errorMessage: null,
    }),
}));
