import type { CableRoute, CostEstimate, CostLineItem, ElectricalPointType } from "../models/types";

// Market-rate reference table. Rates are illustrative defaults (INR per meter /
// per unit) meant to be overridden via env or a future admin-configurable table;
// they are not live market data.
export interface MarketRates {
  currency: string;
  cablePerMeter: Record<string, number>; // gauge label -> rate/meter
  accessoryCost: Record<ElectricalPointType, number>; // fixed cost per fitting
}

export const DEFAULT_MARKET_RATES: MarketRates = {
  currency: "INR",
  cablePerMeter: {
    "1.5 sq mm": 22,
    "2.5 sq mm": 34,
    "4 sq mm": 52,
    "6 sq mm": 78,
  },
  accessoryCost: {
    outlet: 150,
    switch: 90,
    light: 120,
    mains: 2500,
  },
};

// Simple load-based gauge selection: higher-draw fittings get thicker cable.
// This is a common rule-of-thumb, not an electrical-code certification.
function selectGauge(pointType: ElectricalPointType): string {
  switch (pointType) {
    case "outlet":
      return "2.5 sq mm";
    case "light":
    case "switch":
      return "1.5 sq mm";
    case "mains":
      return "6 sq mm";
  }
}

export function estimateCost(
  routes: CableRoute[],
  rates: MarketRates = DEFAULT_MARKET_RATES,
): CostEstimate {
  const items: CostLineItem[] = routes.map((route) => {
    const gauge = selectGauge(route.pointType);
    const ratePerMeter = rates.cablePerMeter[gauge] ?? 0;
    // +10% allowance for slack, bends, and connection loops.
    const billedLength = Math.round(route.lengthMeters * 1.1 * 100) / 100;
    return {
      pointId: route.pointId,
      pointType: route.pointType,
      lengthMeters: billedLength,
      cableGauge: gauge,
      ratePerMeter,
      cost: Math.round(billedLength * ratePerMeter * 100) / 100,
    };
  });

  const totalCableCost = Math.round(items.reduce((sum, i) => sum + i.cost, 0) * 100) / 100;
  const accessoriesCost = Math.round(
    routes.reduce((sum, r) => sum + (rates.accessoryCost[r.pointType] ?? 0), 0) * 100,
  ) / 100;

  return {
    currency: rates.currency,
    items,
    totalCableCost,
    accessoriesCost,
    totalCost: Math.round((totalCableCost + accessoriesCost) * 100) / 100,
  };
}
