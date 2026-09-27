import { usePlanStore } from "../store/planStore";

export function CostPanel() {
  const { cost, routing } = usePlanStore();

  if (!cost || !routing) {
    return (
      <div style={{ width: 260, fontSize: 13, color: "#64748b" }}>
        <h3 style={{ margin: 0 }}>Cost Estimate</h3>
        <p>Draw your rooms, place electrical points (including one mains supply), then click "Compute Cable Routing & Cost".</p>
      </div>
    );
  }

  return (
    <div style={{ width: 260 }}>
      <h3 style={{ margin: 0 }}>Cost Estimate</h3>
      {routing.unroutable.length > 0 && (
        <div style={{ background: "#fef3c7", color: "#92400e", padding: 6, borderRadius: 4, fontSize: 12, marginBottom: 8 }}>
          {routing.unroutable.length} point(s) could not be routed (blocked path).
        </div>
      )}
      <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #cbd5e1" }}>
            <th>Point</th>
            <th>Len (m)</th>
            <th>Gauge</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {cost.items.map((item) => (
            <tr key={item.pointId} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td>{item.pointType}</td>
              <td>{item.lengthMeters}</td>
              <td>{item.cableGauge}</td>
              <td>
                {cost.currency} {item.cost}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 10, fontSize: 13 }}>
        <div>Cable cost: {cost.currency} {cost.totalCableCost}</div>
        <div>Accessories: {cost.currency} {cost.accessoriesCost}</div>
        <div style={{ fontWeight: "bold", marginTop: 4 }}>
          Total: {cost.currency} {cost.totalCost}
        </div>
      </div>
      <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 8 }}>
        Rates are illustrative defaults, not live market prices.
      </p>
    </div>
  );
}
