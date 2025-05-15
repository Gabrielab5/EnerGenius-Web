
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ConsumptionData } from '@/types';
import { useDevices } from './DeviceContext';

interface ConsumptionContextType {
  historicalData: ConsumptionData[];
  forecastData: ConsumptionData[];
  uploadData: (data: ConsumptionData[]) => void;
  isLoading: boolean;
  lastUploadDate: string | null;
}

const ConsumptionContext = createContext<ConsumptionContextType | null>(null);

export const useConsumption = () => {
  const context = useContext(ConsumptionContext);
  if (!context) {
    throw new Error('useConsumption must be used within a ConsumptionProvider');
  }
  return context;
};

// Generate some mock data for initial display
const generateMockData = (): ConsumptionData[] => {
  const data: ConsumptionData[] = [];
  const currentDate = new Date();
  
  // Generate 12 months of historical data
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - i);
    
    // Base consumption with some randomness and seasonal variation
    const month = date.getMonth();
    const seasonalFactor = month >= 5 && month <= 8 ? 1.3 : 1; // Higher in summer months
    const baseConsumption = 300 * seasonalFactor;
    const randomVariation = Math.random() * 50 - 25; // -25 to +25
    
    const kwh = Math.round(baseConsumption + randomVariation);
    
    data.push({
      date: date.toISOString().slice(0, 7), // YYYY-MM format
      kwh,
      cost: kwh * 0.15 // Assuming $0.15 per kWh
    });
  }
  
  return data;
};

export const ConsumptionProvider = ({ children }: { children: React.ReactNode }) => {
  const [historicalData, setHistoricalData] = useState<ConsumptionData[]>([]);
  const [forecastData, setForecastData] = useState<ConsumptionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUploadDate, setLastUploadDate] = useState<string | null>(null);
  const { devices } = useDevices();
  const { toast } = useToast();

  // Load or generate initial data
  useEffect(() => {
    const loadData = () => {
      const savedHistorical = localStorage.getItem('historicalData');
      const savedForecast = localStorage.getItem('forecastData');
      const savedUploadDate = localStorage.getItem('lastUploadDate');
      
      if (savedHistorical) {
        setHistoricalData(JSON.parse(savedHistorical));
      } else {
        const mockData = generateMockData();
        setHistoricalData(mockData);
      }
      
      if (savedForecast) {
        setForecastData(JSON.parse(savedForecast));
      }
      
      if (savedUploadDate) {
        setLastUploadDate(savedUploadDate);
      }
      
      setIsLoading(false);
    };
    
    // Simulate API delay
    setTimeout(() => {
      loadData();
    }, 1500);
  }, []);

  // Generate forecast data whenever devices or historical data changes
  useEffect(() => {
    if (isLoading || historicalData.length === 0) return;
    
    const generateForecast = () => {
      // In a real app, this would use a more sophisticated algorithm based on device data
      // For now, we'll just project forward with some modifications based on device efficiency
      
      const currentDate = new Date();
      const newForecast: ConsumptionData[] = [];
      
      // Calculate an efficiency factor based on devices
      // (simplified: more A-rated devices = more efficient = lower consumption)
      let efficiencyFactor = 1;
      if (devices.length > 0) {
        const ratings = devices.map(d => d.efficiencyRating);
        const aCount = ratings.filter(r => r === 'A').length;
        const bCount = ratings.filter(r => r === 'B').length;
        const cCount = ratings.filter(r => r === 'C').length;
        
        efficiencyFactor = 1 - (aCount * 0.05 + bCount * 0.02 - cCount * 0.03);
        efficiencyFactor = Math.max(0.8, Math.min(1.2, efficiencyFactor)); // Keep within reasonable bounds
      }
      
      // Generate 6 months of forecast data
      for (let i = 1; i <= 6; i++) {
        const date = new Date(currentDate);
        date.setMonth(currentDate.getMonth() + i);
        
        // Base the forecast on the same month from last year if available
        const sameMonthLastYear = historicalData.find(d => {
          const dataDate = new Date(d.date);
          return dataDate.getMonth() === date.getMonth() && 
                 dataDate.getFullYear() === date.getFullYear() - 1;
        });
        
        let baseKwh = 300; // Default if no historical data
        if (sameMonthLastYear) {
          baseKwh = sameMonthLastYear.kwh;
        } else if (historicalData.length > 0) {
          // Or use the average of historical data
          baseKwh = historicalData.reduce((sum, d) => sum + d.kwh, 0) / historicalData.length;
        }
        
        // Apply the efficiency factor
        const forecastKwh = Math.round(baseKwh * efficiencyFactor);
        
        newForecast.push({
          date: date.toISOString().slice(0, 7), // YYYY-MM format
          kwh: forecastKwh,
          cost: forecastKwh * 0.15 // Assuming $0.15 per kWh
        });
      }
      
      setForecastData(newForecast);
      localStorage.setItem('forecastData', JSON.stringify(newForecast));
    };
    
    generateForecast();
  }, [devices, historicalData, isLoading]);

  // Save historical data to local storage when it changes
  useEffect(() => {
    if (!isLoading && historicalData.length > 0) {
      localStorage.setItem('historicalData', JSON.stringify(historicalData));
    }
  }, [historicalData, isLoading]);

  const uploadData = (data: ConsumptionData[]) => {
    setHistoricalData(data);
    const now = new Date().toISOString();
    setLastUploadDate(now);
    localStorage.setItem('lastUploadDate', now);
    
    toast({
      title: "Data uploaded",
      description: "Your consumption data has been uploaded and processed successfully.",
    });
  };

  return (
    <ConsumptionContext.Provider
      value={{
        historicalData,
        forecastData,
        uploadData,
        isLoading,
        lastUploadDate
      }}
    >
      {children}
    </ConsumptionContext.Provider>
  );
};
