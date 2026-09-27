import { useState } from "react";
import { Stage, Layer, Rect, Line, Circle, Text, Group } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { usePlanStore } from "../store/planStore";
import { findRoomAt, nearestWall, DEFAULT_ROOM_HEIGHT, POINT_DEFAULT_Z } from "../utils/geometry";
import type { ElectricalPointType, Point2D } from "../types";

const SCALE = 60; // pixels per meter
const OFFSET_X = 60;
const OFFSET_Y = 60;
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;

const POINT_COLORS: Record<ElectricalPointType, string> = {
  outlet: "#2563eb",
  switch: "#16a34a",
  mains: "#dc2626",
  light: "#ca8a04",
};

function toMeters(px: number, py: number): Point2D {
  return { x: (px - OFFSET_X) / SCALE, y: (py - OFFSET_Y) / SCALE };
}

function toPixels(m: Point2D): Point2D {
  return { x: m.x * SCALE + OFFSET_X, y: m.y * SCALE + OFFSET_Y };
}

export function FloorPlanEditor2D() {
  const { rooms, electricalPoints, tool, routing, addRoom, addDoor, addWindow, addPlumbing, addPoint, selectRoom } =
    usePlanStore();
  const [dragStart, setDragStart] = useState<Point2D | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Point2D | null>(null);

  const isPointTool = tool.startsWith("point:");

  function handleMouseDown(e: KonvaEventObject<MouseEvent>) {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;
    const m = toMeters(pos.x, pos.y);

    if (tool === "room" || tool === "plumbing") {
      setDragStart(m);
      setDragCurrent(m);
    }
  }

  function handleMouseMove(e: KonvaEventObject<MouseEvent>) {
    if (!dragStart) return;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;
    setDragCurrent(toMeters(pos.x, pos.y));
  }

  function handleMouseUp() {
    if (!dragStart || !dragCurrent) return;

    if (tool === "room") {
      const x = Math.min(dragStart.x, dragCurrent.x);
      const y = Math.min(dragStart.y, dragCurrent.y);
      const width = Math.abs(dragCurrent.x - dragStart.x);
      const length = Math.abs(dragCurrent.y - dragStart.y);
      if (width > 0.3 && length > 0.3) {
        addRoom({
          name: `Room ${rooms.length + 1}`,
          x: Math.round(x * 100) / 100,
          y: Math.round(y * 100) / 100,
          width: Math.round(width * 100) / 100,
          length: Math.round(length * 100) / 100,
          height: DEFAULT_ROOM_HEIGHT,
        });
      }
    } else if (tool === "plumbing") {
      const room = findRoomAt(rooms, dragStart) ?? findRoomAt(rooms, dragCurrent);
      if (room) {
        addPlumbing(room.id, {
          x1: Math.round(dragStart.x * 100) / 100,
          y1: Math.round(dragStart.y * 100) / 100,
          x2: Math.round(dragCurrent.x * 100) / 100,
          y2: Math.round(dragCurrent.y * 100) / 100,
          clearance: 0.15,
        });
      }
    }

    setDragStart(null);
    setDragCurrent(null);
  }

  function handleClick(e: KonvaEventObject<MouseEvent>) {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;
    const m = toMeters(pos.x, pos.y);
    const room = findRoomAt(rooms, m);

    if (tool === "door" || tool === "window") {
      if (!room) return;
      const { wallSide, offset } = nearestWall(room, m);
      if (tool === "door") addDoor(room.id, { wallSide, offset, width: 0.9 });
      else addWindow(room.id, { wallSide, offset, width: 1.2 });
    } else if (isPointTool) {
      const type = tool.split(":")[1] as ElectricalPointType;
      addPoint({
        type,
        x: Math.round(m.x * 100) / 100,
        y: Math.round(m.y * 100) / 100,
        z: POINT_DEFAULT_Z[type],
        roomId: room?.id,
      });
    } else if (tool === "select") {
      selectRoom(room?.id ?? null);
    }
  }

  const previewRect =
    tool === "room" && dragStart && dragCurrent
      ? {
          x: Math.min(dragStart.x, dragCurrent.x),
          y: Math.min(dragStart.y, dragCurrent.y),
          width: Math.abs(dragCurrent.x - dragStart.x),
          length: Math.abs(dragCurrent.y - dragStart.y),
        }
      : null;

  return (
    <Stage
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      style={{ background: "#f8fafc", border: "1px solid #cbd5e1", cursor: isPointTool ? "crosshair" : "default" }}
    >
      <Layer>
        {rooms.map((room) => {
          const p = toPixels({ x: room.x, y: room.y });
          return (
            <Group key={room.id}>
              <Rect
                x={p.x}
                y={p.y}
                width={room.width * SCALE}
                height={room.length * SCALE}
                stroke="#334155"
                strokeWidth={2}
                fill="#e2e8f0"
              />
              <Text
                x={p.x + 4}
                y={p.y + 4}
                text={`${room.name}\n${room.width}m x ${room.length}m x ${room.height}m`}
                fontSize={12}
                fill="#0f172a"
              />
              {room.doors.map((door) => {
                const c = wallPointPixels(room, door.wallSide, door.offset);
                return <Circle key={door.id} x={c.x} y={c.y} radius={6} fill="#92400e" />;
              })}
              {room.windows.map((win) => {
                const c = wallPointPixels(room, win.wallSide, win.offset);
                return <Circle key={win.id} x={c.x} y={c.y} radius={6} fill="#0891b2" />;
              })}
              {room.plumbing.map((line) => {
                const a = toPixels({ x: line.x1, y: line.y1 });
                const b = toPixels({ x: line.x2, y: line.y2 });
                return (
                  <Line
                    key={line.id}
                    points={[a.x, a.y, b.x, b.y]}
                    stroke="#1d4ed8"
                    strokeWidth={3}
                    dash={[6, 4]}
                  />
                );
              })}
            </Group>
          );
        })}

        {previewRect && (
          <Rect
            x={toPixels({ x: previewRect.x, y: previewRect.y }).x}
            y={toPixels({ x: previewRect.x, y: previewRect.y }).y}
            width={previewRect.width * SCALE}
            height={previewRect.length * SCALE}
            stroke="#2563eb"
            dash={[4, 4]}
          />
        )}

        {routing?.routes.map((route) => {
          const points = route.path.flatMap((pt) => {
            const p = toPixels(pt);
            return [p.x, p.y];
          });
          return (
            <Line key={route.pointId} points={points} stroke="#f97316" strokeWidth={2} lineCap="round" />
          );
        })}

        {electricalPoints.map((point) => {
          const p = toPixels(point);
          return (
            <Group key={point.id}>
              <Circle x={p.x} y={p.y} radius={7} fill={POINT_COLORS[point.type]} stroke="#000" strokeWidth={1} />
              <Text x={p.x + 8} y={p.y - 6} text={point.type} fontSize={10} fill="#0f172a" />
            </Group>
          );
        })}
      </Layer>
    </Stage>
  );
}

function wallPointPixels(
  room: { x: number; y: number; width: number; length: number },
  side: string,
  offset: number,
): Point2D {
  let m: Point2D;
  switch (side) {
    case "north":
      m = { x: room.x + offset * room.width, y: room.y };
      break;
    case "south":
      m = { x: room.x + offset * room.width, y: room.y + room.length };
      break;
    case "west":
      m = { x: room.x, y: room.y + offset * room.length };
      break;
    default:
      m = { x: room.x + room.width, y: room.y + offset * room.length };
  }
  return toPixels(m);
}
