export interface User {
  id: string;
  email: string;
  displayName?: string;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  age: number;
  efficiencyRating: 'A' | 'B' | 'C';
  powerConsumption: number; // in watts
  knownKwh?: number; // Optional known kilowatt-hour consumption
}

export interface ConsumptionData {
  date: string;
  kwh: number;
  cost?: number;
  price_ils?: number;
}

export interface HourlyConsumptionData {
  hour: number;
  kwh: number;
  price_ils?: number;
}

export interface MonthlyConsumptionData {
  month: string;
  kwh: number;
  price_ils?: number;
}

export interface AnnualConsumptionData {
  year: string;
  kwh: number;
  price_ils?: number;
}

export interface ForecastData {
  forecast_hourly_avg: HourlyConsumptionData[];
  forecast_daily: ConsumptionData[];
  forecast_monthly: MonthlyConsumptionData[];
  explanation: string;
  insights: string[];
  pricing_tariff_ils_per_kwh?: number;
  forecast_total_price_ils?: number;
}

export interface HistoricalData {
  historical_hourly_avg: HourlyConsumptionData[];
  historical_daily: ConsumptionData[];
  historical_monthly: MonthlyConsumptionData[];
  pricing_tariff_ils_per_kwh?: number;
  historical_total_price_ils?: number;
}

export interface SavingTip {
  id: number;
  text: string;
}

export interface ElectricityData {
  annual_total_kwh: number;
  annual_total_price: number;
  avg_monthly_kwh: number;
  avg_monthly_price: number;
  daily_totals: Record<string, { kwh: number; price: number }>;
  month_stats: Record<string, {
    avg_kwh_per_day: number;
    avg_price_per_day: number;
    days: number;
    total_kwh: number;
    total_price: number;
  }>;
  monthly_totals: Record<string, { kwh: number; price: number }>;
  success: boolean;
  userId: string;
  fileUsed?: string;
  num_chunks?: number;
  createdAt?: any;
  meta?: {
    num_chunks: number;
    num_rows: number;
  };
}

export interface DailyConsumption {
  date: string;
  kwh: number;
  price: number;
  dayOfWeek?: string;
}

export interface MonthlyConsumption {
  month: string;
  kwh: number;
  price: number;
  monthName?: string;
  year?: string;
}

export interface ApiResponse {
  annual_total_kwh: number;
  annual_total_price: number;
  avg_monthly_kwh: number;
  avg_monthly_price: number;
  daily_totals: Record<string, { kwh: number; price: number }>;
  month_stats: Record<string, {
    avg_kwh_per_day: number;
    avg_price_per_day: number;
    days: number;
    total_kwh: number;
    total_price: number;
  }>;
  monthly_totals: Record<string, { kwh: number; price: number }>;
  success: boolean;
  userId: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
