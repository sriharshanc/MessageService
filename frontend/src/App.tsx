import { usePlanStore } from "./store/planStore";
import { Toolbar } from "./components/Toolbar";
import { RoomList } from "./components/RoomList";
import { FloorPlanEditor2D } from "./components/FloorPlanEditor2D";
import { Scene3D } from "./components/Scene3D";
import { CostPanel } from "./components/CostPanel";

export default function App() {
  const view = usePlanStore((s) => s.view);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 16 }}>
      <h1 style={{ marginBottom: 4 }}>House Electrical Planner</h1>
      <p style={{ marginTop: 0, color: "#64748b" }}>
        Draw your floor plan, place electrical points, and get cable routing + cost estimates.
      </p>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <Toolbar />
        {view === "2d" ? <FloorPlanEditor2D /> : <Scene3D />}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <RoomList />
          <CostPanel />
        </div>
      </div>
    </div>
  );
}
