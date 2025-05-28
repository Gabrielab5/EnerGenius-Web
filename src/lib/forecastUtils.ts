
import { ForecastDevice, DeviceConsumptionResult, ForecastData } from '@/types/forecast';
import { ElectricityData } from '@/types';

const AVERAGE_PRICE_PER_KWH = 0.64; // Default price in ILS per kWh

/**
 * Get efficiency multiplier based on rating
 */
export function getEfficiencyMultiplier(rating: 'A' | 'B' | 'C'): number {
  switch (rating) {
    case 'A': return 0.9; // 10% more efficient
    case 'B': return 1.0; // Baseline
    case 'C': return 1.1; // 10% less efficient
    default: return 1.0;
  }
}

/**
 * Calculate device consumption based on usage patterns
 */
export function calculateDeviceConsumption(
  device: ForecastDevice,
  pricePerKwh: number = AVERAGE_PRICE_PER_KWH
): DeviceConsumptionResult {
  const baseConsumption = device.powerConsumption / 1000; // Convert to kW
  const efficiencyMultiplier = getEfficiencyMultiplier(device.efficiencyRating);
  const ageMultiplier = 1 + (device.age * 0.02); // 2% degradation per year
  
  const dailyKwh = baseConsumption * device.usage.hoursPerDay * efficiencyMultiplier * ageMultiplier;
  const weeklyKwh = dailyKwh * device.usage.daysPerWeek;
  const monthlyKwh = weeklyKwh * 4.33; // Average weeks per month
  const annualKwh = monthlyKwh * 12;
  
  const monthlyCost = monthlyKwh * pricePerKwh;
  const annualCost = annualKwh * pricePerKwh;
  
  return {
    dailyKwh,
    weeklyKwh,
    monthlyKwh,
    annualKwh,
    monthlyCost,
    annualCost
  };
}

/**
 * Calculate total forecast for all devices with proper historical data integration
 */
export function calculateTotalForecast(
  devices: ForecastDevice[],
  historicalData?: ElectricityData,
  pricePerKwh?: number
): ForecastData {
  const avgPrice = pricePerKwh || 
    (historicalData?.annual_total_price && historicalData?.annual_total_kwh 
      ? historicalData.annual_total_price / historicalData.annual_total_kwh 
      : AVERAGE_PRICE_PER_KWH);
  
  console.log('Calculating forecast with historical data:', historicalData);
  console.log('Using average price per kWh:', avgPrice);
  
  // Calculate device breakdown with device names as keys
  const deviceBreakdown: Record<string, DeviceConsumptionResult & { deviceName: string }> = {};
  let totalAnnualKwh = 0;
  let totalAnnualCost = 0;
  
  devices.forEach(device => {
    const consumption = calculateDeviceConsumption(device, avgPrice);
    deviceBreakdown[device.name] = {
      ...consumption,
      deviceName: device.name
    };
    totalAnnualKwh += consumption.annualKwh;
    totalAnnualCost += consumption.annualCost;
  });
  
  // Generate monthly projections
  const projectedMonthlyTotals: Record<string, { kwh: number; price: number }> = {};
  const currentDate = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i + 1, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    projectedMonthlyTotals[monthKey] = {
      kwh: totalAnnualKwh / 12,
      price: totalAnnualCost / 12
    };
  }
  
  // Properly structure historical data from electricityData
  const historical = historicalData ? {
    monthlyTotals: historicalData.monthly_totals || {},
    annualTotal: {
      kwh: historicalData.annual_total_kwh || 0,
      price: historicalData.annual_total_price || 0
    }
  } : {
    monthlyTotals: {},
    annualTotal: { kwh: 0, price: 0 }
  };
  
  console.log('Historical data structured:', historical);
  console.log('Projected data:', {
    monthlyTotals: projectedMonthlyTotals,
    annualTotal: { kwh: totalAnnualKwh, price: totalAnnualCost }
  });
  
  return {
    historical,
    projected: {
      monthlyTotals: projectedMonthlyTotals,
      annualTotal: {
        kwh: totalAnnualKwh,
        price: totalAnnualCost
      }
    },
    deviceBreakdown
  };
}

/**
 * Get default usage patterns based on device type
 */
export function getDefaultUsagePattern(deviceType: string): { hoursPerDay: number; daysPerWeek: number } {
  const patterns: Record<string, { hoursPerDay: number; daysPerWeek: number }> = {
    'Air Conditioner': { hoursPerDay: 8, daysPerWeek: 7 },
    'Washing Machine': { hoursPerDay: 1, daysPerWeek: 4 },
    'Refrigerator': { hoursPerDay: 24, daysPerWeek: 7 },
    'Television': { hoursPerDay: 6, daysPerWeek: 7 },
    'Computer': { hoursPerDay: 8, daysPerWeek: 5 },
    'Microwave': { hoursPerDay: 0.5, daysPerWeek: 7 },
    'Dishwasher': { hoursPerDay: 1, daysPerWeek: 4 },
    'Water Heater': { hoursPerDay: 3, daysPerWeek: 7 },
    'Lighting': { hoursPerDay: 6, daysPerWeek: 7 },
    'Oven': { hoursPerDay: 1, daysPerWeek: 4 }
  };
  
  return patterns[deviceType] || { hoursPerDay: 4, daysPerWeek: 7 };
}
