
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
  
  // Calculate monthly projections based on device usage patterns
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i + 1, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    // Sum the monthlyKwh for all devices for this month
    let monthKwh = 0;
    let monthCost = 0;
    devices.forEach(device => {
      const consumption = calculateDeviceConsumption(device, avgPrice);
      monthKwh += consumption.monthlyKwh;
      monthCost += consumption.monthlyKwh * avgPrice;
    });
    
    projectedMonthlyTotals[monthKey] = {
      kwh: monthKwh,
      price: monthCost
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
  
  // Calculate comparison values with proper number handling
  const historicalKwh = historical.annualTotal.kwh || 0;
  const projectedKwh = totalAnnualKwh || 0;
  const historicalPrice = historical.annualTotal.price || 0;
  const projectedPrice = totalAnnualCost || 0;
  
  const kwhDifference = projectedKwh - historicalKwh;
  const priceDifference = projectedPrice - historicalPrice;
  const percentageChange = (historicalKwh > 0) ? (kwhDifference / historicalKwh) * 100 : 0;
  
  const comparison = {
    kwhDifference,
    priceDifference,
    percentageChange
  };
  
  // Debug logging for comparison values
  console.log('=== COMPARISON DEBUG ===');
  console.log('Historical kWh:', historicalKwh);
  console.log('Projected kWh:', projectedKwh);
  console.log('kWh Difference:', kwhDifference);
  console.log('Percentage Change:', percentageChange);
  console.log('Final comparison object:', comparison);
  console.log('========================');
  
  return {
    historical,
    projected: {
      monthlyTotals: projectedMonthlyTotals,
      annualTotal: {
        kwh: totalAnnualKwh,
        price: totalAnnualCost
      }
    },
    deviceBreakdown,
    comparison
  };
}

/**
 * Get default usage patterns based on device type
 */
export function getDefaultUsagePattern(deviceType: string): { hoursPerDay: number; daysPerWeek: number } {
  const patterns: Record<string, { hoursPerDay: number; daysPerWeek: number }> = {
    'Air Conditioner': { hoursPerDay: 6, daysPerWeek: 5 },
    'Washing Machine': { hoursPerDay: 1.5, daysPerWeek: 3 },
    'Refrigerator': { hoursPerDay: 8, daysPerWeek: 7 }, // Compressor run time
    'Television': { hoursPerDay: 4, daysPerWeek: 7 },
    'Computer': { hoursPerDay: 8, daysPerWeek: 5 },
    'Microwave': { hoursPerDay: 0.25, daysPerWeek: 5 },
    'Dishwasher': { hoursPerDay: 1, daysPerWeek: 3 },
    'Water Heater': { hoursPerDay: 2, daysPerWeek: 7 },
    'Lighting': { hoursPerDay: 5, daysPerWeek: 7 },
    'Oven': { hoursPerDay: 1, daysPerWeek: 3 }
  };
  
  // A more conservative default for unknown devices
  return patterns[deviceType] || { hoursPerDay: 1, daysPerWeek: 3 };
}
