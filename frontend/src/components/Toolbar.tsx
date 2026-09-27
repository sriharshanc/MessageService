import { usePlanStore, type Tool } from "../store/planStore";

const TOOLS: { tool: Tool; label: string }[] = [
  { tool: "select", label: "Select" },
  { tool: "room", label: "Draw Room" },
  { tool: "door", label: "Add Door" },
  { tool: "window", label: "Add Window" },
  { tool: "plumbing", label: "Draw Plumbing" },
  { tool: "point:mains", label: "Place Mains" },
  { tool: "point:outlet", label: "Place Outlet" },
  { tool: "point:switch", label: "Place Switch" },
  { tool: "point:light", label: "Place Light" },
];

export function Toolbar() {
  const { tool, setTool, view, setView, saveAndCompute, status, errorMessage, reset } = usePlanStore();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 220 }}>
      <h3 style={{ margin: 0 }}>Tools</h3>
      {TOOLS.map(({ tool: t, label }) => (
        <button
          key={t}
          onClick={() => setTool(t)}
          style={{
            padding: "6px 10px",
            textAlign: "left",
            background: tool === t ? "#2563eb" : "#f1f5f9",
            color: tool === t ? "#fff" : "#0f172a",
            border: "1px solid #cbd5e1",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          {label}
        </button>
      ))}

      <hr />
      <h3 style={{ margin: 0 }}>View</h3>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => setView("2d")} style={{ flex: 1, background: view === "2d" ? "#2563eb" : "#f1f5f9", color: view === "2d" ? "#fff" : "#0f172a", border: "1px solid #cbd5e1", borderRadius: 4, padding: 6 }}>
          2D Plan
        </button>
        <button onClick={() => setView("3d")} style={{ flex: 1, background: view === "3d" ? "#2563eb" : "#f1f5f9", color: view === "3d" ? "#fff" : "#0f172a", border: "1px solid #cbd5e1", borderRadius: 4, padding: 6 }}>
          3D View
        </button>
      </div>

      <hr />
      <button
        onClick={() => saveAndCompute()}
        disabled={status === "saving" || status === "computing"}
        style={{ padding: 10, background: "#16a34a", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
      >
        {status === "saving" ? "Saving..." : status === "computing" ? "Routing..." : "Compute Cable Routing & Cost"}
      </button>
      <button onClick={reset} style={{ padding: 8, background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
        Reset Plan
      </button>
      {status === "error" && errorMessage && (
        <div style={{ color: "#dc2626", fontSize: 12 }}>{errorMessage}</div>
      )}
    </div>
  );
}
