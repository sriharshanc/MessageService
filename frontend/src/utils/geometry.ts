import type { Point2D, Room, WallSide } from "../types";

export function findRoomAt(rooms: Room[], point: Point2D): Room | undefined {
  return rooms.find(
    (r) => point.x >= r.x && point.x <= r.x + r.width && point.y >= r.y && point.y <= r.y + r.length,
  );
}

// Given a click point and a room, returns which wall it's closest to and the
// normalized offset (0..1) along that wall — used for placing doors/windows.
export function nearestWall(room: Room, point: Point2D): { wallSide: WallSide; offset: number } {
  const distances: { wallSide: WallSide; dist: number; offset: number }[] = [
    { wallSide: "north", dist: Math.abs(point.y - room.y), offset: (point.x - room.x) / room.width },
    {
      wallSide: "south",
      dist: Math.abs(point.y - (room.y + room.length)),
      offset: (point.x - room.x) / room.width,
    },
    { wallSide: "west", dist: Math.abs(point.x - room.x), offset: (point.y - room.y) / room.length },
    {
      wallSide: "east",
      dist: Math.abs(point.x - (room.x + room.width)),
      offset: (point.y - room.y) / room.length,
    },
  ];
  const best = distances.reduce((a, b) => (b.dist < a.dist ? b : a));
  return { wallSide: best.wallSide, offset: Math.min(1, Math.max(0, best.offset)) };
}

export const DEFAULT_ROOM_HEIGHT = 2.7;

export const POINT_DEFAULT_Z: Record<string, number> = {
  outlet: 0.3,
  switch: 1.2,
  mains: 1.5,
  light: 2.6,
};
