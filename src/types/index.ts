

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
}

export interface SavingTip {
  id: number;
  text: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

