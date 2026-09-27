import { usePlanStore } from "../store/planStore";

export function RoomList() {
  const { rooms, removeRoom, electricalPoints, removePoint } = usePlanStore();

  return (
    <div style={{ width: 240, display: "flex", flexDirection: "column", gap: 8 }}>
      <h3 style={{ margin: 0 }}>Rooms ({rooms.length})</h3>
      {rooms.length === 0 && <p style={{ fontSize: 12, color: "#64748b" }}>Use "Draw Room" and drag on the plan.</p>}
      {rooms.map((room) => (
        <div key={room.id} style={{ border: "1px solid #e2e8f0", borderRadius: 4, padding: 8, fontSize: 13 }}>
          <strong>{room.name}</strong>
          <div>{room.width}m × {room.length}m × {room.height}m</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            {room.doors.length} door(s), {room.windows.length} window(s), {room.plumbing.length} plumbing line(s)
          </div>
          <button onClick={() => removeRoom(room.id)} style={{ marginTop: 4, fontSize: 11, color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>
            Remove room
          </button>
        </div>
      ))}

      <h3 style={{ margin: 0 }}>Electrical Points ({electricalPoints.length})</h3>
      {electricalPoints.map((point) => (
        <div key={point.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 4, padding: 6 }}>
          <span>{point.type} @ ({point.x}, {point.y}, {point.z})</span>
          <button onClick={() => removePoint(point.id)} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
