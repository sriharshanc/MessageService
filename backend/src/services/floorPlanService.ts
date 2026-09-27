import { prisma } from "../db/client";
import type { FloorPlanInput, RoomInput } from "../models/types";

function serializePolygon(polygon: RoomInput["polygon"]): string | null {
  return polygon ? JSON.stringify(polygon) : null;
}

export async function createFloorPlan(input: FloorPlanInput) {
  return prisma.floorPlan.create({
    data: {
      name: input.name,
      rooms: {
        create: input.rooms.map((room) => ({
          name: room.name,
          x: room.x,
          y: room.y,
          width: room.width,
          length: room.length,
          height: room.height,
          polygon: serializePolygon(room.polygon),
          doors: { create: room.doors ?? [] },
          windows: { create: room.windows ?? [] },
          plumbing: {
            create: (room.plumbing ?? []).map((line) => ({
              x1: line.x1,
              y1: line.y1,
              x2: line.x2,
              y2: line.y2,
              clearance: line.clearance ?? 0.15,
            })),
          },
        })),
      },
      electricalPoints: {
        create: (input.electricalPoints ?? []).map((point) => ({
          type: point.type,
          x: point.x,
          y: point.y,
          z: point.z,
          roomId: point.roomId,
        })),
      },
    },
    include: fullInclude,
  });
}

const fullInclude = {
  rooms: { include: { doors: true, windows: true, plumbing: true } },
  electricalPoints: true,
} as const;

export async function getFloorPlan(id: string) {
  return prisma.floorPlan.findUnique({ where: { id }, include: fullInclude });
}

export async function listFloorPlans() {
  return prisma.floorPlan.findMany({
    select: { id: true, name: true, createdAt: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function deleteFloorPlan(id: string) {
  return prisma.floorPlan.delete({ where: { id } });
}

export async function addElectricalPoint(
  floorPlanId: string,
  point: { type: string; x: number; y: number; z: number; roomId?: string },
) {
  return prisma.electricalPoint.create({
    data: { floorPlanId, ...point },
  });
}

export async function removeElectricalPoint(id: string) {
  return prisma.electricalPoint.delete({ where: { id } });
}
