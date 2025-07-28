
export interface DeviceUsage {
  hoursPerDay: number;
  daysPerWeek: number;
  seasonalVariation?: number; // Optional multiplier for seasonal changes
}

export interface ForecastDevice {
  id: string;
  name: string;
  type: string;
  age: number;
  efficiencyRating: 'A' | 'B' | 'C';
  powerConsumption: number; // in watts
  usage: DeviceUsage;
  knownKwh?: number;
  translationKey?: string;
  categoryTranslationKey?: string;
}

export interface DeviceConsumptionResult {
  dailyKwh: number;
  weeklyKwh: number;
  monthlyKwh: number;
  annualKwh: number;
  monthlyCost: number;
  annualCost: number;
}

export interface ForecastScenario {
  id: string;
  name: string;
  devices: ForecastDevice[];
  projections: {
    monthlyTotals: Record<string, { kwh: number; price: number }>;
    annualTotal: { kwh: number; price: number };
    comparison: {
      kwhDifference: number;
      priceDifference: number;
      percentageChange: number;
    };
  };
  createdAt: string;
}

export interface ForecastData {
  historical: {
    monthlyTotals: Record<string, { kwh: number; price: number }>;
    annualTotal: { kwh: number; price: number };
  };
  projected: {
    monthlyTotals: Record<string, { kwh: number; price: number }>;
    annualTotal: { kwh: number; price: number };
  };
  deviceBreakdown: Record<string, DeviceConsumptionResult & { deviceName: string }>;
  comparison: {
    kwhDifference: number;
    priceDifference: number;
    percentageChange: number;
  };
}
