import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import { usePlanStore } from "../store/planStore";
import type { ElectricalPointType, Room } from "../types";

const WALL_THICKNESS = 0.1;

const POINT_COLORS: Record<ElectricalPointType, string> = {
  outlet: "#2563eb",
  switch: "#16a34a",
  mains: "#dc2626",
  light: "#ca8a04",
};

function RoomMesh({ room }: { room: Room }) {
  const cx = room.x + room.width / 2;
  const cz = room.y + room.length / 2;

  return (
    <group>
      {/* Floor */}
      <mesh position={[cx, -0.025, cz]}>
        <boxGeometry args={[room.width, 0.05, room.length]} />
        <meshStandardMaterial color="#d6d3d1" />
      </mesh>

      {/* North wall */}
      <mesh position={[cx, room.height / 2, room.y]}>
        <boxGeometry args={[room.width, room.height, WALL_THICKNESS]} />
        <meshStandardMaterial color="#e7e5e4" transparent opacity={0.85} />
      </mesh>
      {/* South wall */}
      <mesh position={[cx, room.height / 2, room.y + room.length]}>
        <boxGeometry args={[room.width, room.height, WALL_THICKNESS]} />
        <meshStandardMaterial color="#e7e5e4" transparent opacity={0.85} />
      </mesh>
      {/* West wall */}
      <mesh position={[room.x, room.height / 2, cz]}>
        <boxGeometry args={[WALL_THICKNESS, room.height, room.length]} />
        <meshStandardMaterial color="#e7e5e4" transparent opacity={0.85} />
      </mesh>
      {/* East wall */}
      <mesh position={[room.x + room.width, room.height / 2, cz]}>
        <boxGeometry args={[WALL_THICKNESS, room.height, room.length]} />
        <meshStandardMaterial color="#e7e5e4" transparent opacity={0.85} />
      </mesh>

      {room.doors.map((door) => (
        <OpeningMarker key={door.id} room={room} wallSide={door.wallSide} offset={door.offset} width={door.width} color="#92400e" heightSpan={[0, 2.1]} />
      ))}
      {room.windows.map((win) => (
        <OpeningMarker key={win.id} room={room} wallSide={win.wallSide} offset={win.offset} width={win.width} color="#0891b2" heightSpan={[0.9, 2.1]} />
      ))}

      {room.plumbing.map((line) => (
        <Line
          key={line.id}
          points={[
            [line.x1, 0.05, line.y1],
            [line.x2, 0.05, line.y2],
          ]}
          color="#1d4ed8"
          lineWidth={3}
          dashed
        />
      ))}

      <Html position={[cx, room.height + 0.2, cz]} center>
        <div style={{ color: "#0f172a", background: "#ffffffcc", padding: "1px 6px", borderRadius: 4, fontSize: 12, whiteSpace: "nowrap" }}>
          {room.name}
        </div>
      </Html>
    </group>
  );
}

function OpeningMarker({
  room,
  wallSide,
  offset,
  width,
  color,
  heightSpan,
}: {
  room: Room;
  wallSide: string;
  offset: number;
  width: number;
  color: string;
  heightSpan: [number, number];
}) {
  let x = room.x;
  let z = room.y;
  let rotY = 0;
  if (wallSide === "north") {
    x = room.x + offset * room.width;
    z = room.y;
  } else if (wallSide === "south") {
    x = room.x + offset * room.width;
    z = room.y + room.length;
  } else if (wallSide === "west") {
    x = room.x;
    z = room.y + offset * room.length;
    rotY = Math.PI / 2;
  } else {
    x = room.x + room.width;
    z = room.y + offset * room.length;
    rotY = Math.PI / 2;
  }
  const midHeight = (heightSpan[0] + heightSpan[1]) / 2;
  const span = heightSpan[1] - heightSpan[0];
  return (
    <mesh position={[x, midHeight, z]} rotation={[0, rotY, 0]}>
      <boxGeometry args={[width, span, WALL_THICKNESS + 0.02]} />
      <meshStandardMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
}

function CableRoutes() {
  const { routing, electricalPoints } = usePlanStore();
  if (!routing) return null;

  return (
    <>
      {routing.routes.map((route) => {
        const point = electricalPoints.find((p) => p.id === route.pointId);
        const z = point?.z ?? 0.3;
        const basePoints: [number, number, number][] = route.path.map((p) => [p.x, 0.05, p.y]);
        const last = route.path[route.path.length - 1];
        basePoints.push([last.x, z, last.y]);
        return <Line key={route.pointId} points={basePoints} color="#f97316" lineWidth={2} />;
      })}
    </>
  );
}

function ElectricalPoints() {
  const electricalPoints = usePlanStore((s) => s.electricalPoints);
  return (
    <>
      {electricalPoints.map((point) => (
        <mesh key={point.id} position={[point.x, point.z, point.y]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={POINT_COLORS[point.type]} />
        </mesh>
      ))}
    </>
  );
}

export function Scene3D() {
  const rooms = usePlanStore((s) => s.rooms);

  const centerX = rooms.length
    ? rooms.reduce((sum, r) => sum + r.x + r.width / 2, 0) / rooms.length
    : 0;
  const centerZ = rooms.length
    ? rooms.reduce((sum, r) => sum + r.y + r.length / 2, 0) / rooms.length
    : 0;

  return (
    <div style={{ width: 900, height: 600, background: "#0f172a" }}>
      <Canvas camera={{ position: [centerX + 8, 8, centerZ + 8], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={0.8} />
        <OrbitControls target={[centerX, 1, centerZ]} />
        {rooms.map((room) => (
          <RoomMesh key={room.id} room={room} />
        ))}
        <CableRoutes />
        <ElectricalPoints />
      </Canvas>
    </div>
  );
}
