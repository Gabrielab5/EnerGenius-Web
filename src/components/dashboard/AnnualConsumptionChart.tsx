
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { MonthlyConsumptionData } from '@/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LoadingSpinner } from '@/components/ui-components/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';

interface AnnualConsumptionChartProps {
  monthlyForecast?: MonthlyConsumptionData[];
  historicalMonthly?: MonthlyConsumptionData[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  const { t } = useLanguage();
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-3 border border-app-gray-200 rounded-md shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-primary">
          <span className="font-medium">{t('charts.tooltip.usage')}: </span>
          {data.kwh}  {t('charts.units.kwh')}
        </p>
        {(data.price_ils) && (
          <p className="text-app-green-600">
            <span className="font-medium">{t('charts.tooltip.price')}: </span>
            ₪{data.price_ils.toFixed(2)}
          </p>
        )}
      </div>
    );
  }

  return null;
};

export const AnnualConsumptionChart = ({ monthlyForecast, historicalMonthly }: AnnualConsumptionChartProps) => {
  // Ensure we have arrays to work with, even if empty
  const safeMonthlyForecast = monthlyForecast || [];
  const safeHistoricalMonthly = historicalMonthly || [];
  
  // Calculate annual totals from monthly data
  const annualData = useMemo(() => {
    const result = [];
    const years = new Set<string>();
    
    // Extract all years from both datasets
    safeHistoricalMonthly.forEach(item => {
      const year = item.month.substring(0, 4);
      years.add(year);
    });
    
    safeMonthlyForecast.forEach(item => {
      const year = item.month.substring(0, 4);
      years.add(year);
    });
    
    // Calculate totals for each year
    years.forEach(year => {
      const historicalKwh = safeHistoricalMonthly
        .filter(item => item.month.startsWith(year))
        .reduce((sum, item) => sum + item.kwh, 0);
        
      const historicalPrice = safeHistoricalMonthly
        .filter(item => item.month.startsWith(year))
        .reduce((sum, item) => sum + (item.price_ils || 0), 0);
        
      const forecastKwh = safeMonthlyForecast
        .filter(item => item.month.startsWith(year))
        .reduce((sum, item) => sum + item.kwh, 0);
        
      const forecastPrice = safeMonthlyForecast
        .filter(item => item.month.startsWith(year))
        .reduce((sum, item) => sum + (item.price_ils || 0), 0);
      
      // Only add historical data if it exists
      if (historicalKwh > 0) {
        result.push({
          year,
          kwh: historicalKwh,
          price_ils: historicalPrice,
          source: 'historical'
        });
      }
      
      // Only add forecast data if it exists
      if (forecastKwh > 0) {
        result.push({
          year,
          kwh: forecastKwh,
          price_ils: forecastPrice,
          source: 'forecast'
        });
      }
    });
    
    return result.sort((a, b) => a.year.localeCompare(b.year));
  }, [safeHistoricalMonthly, safeMonthlyForecast]);
  
  // If no data, show a message
  if (annualData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Annual Consumption</CardTitle>
          <CardDescription>Yearly usage and forecast</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <p className="text-muted-foreground">No annual data available</p>
        </CardContent>
      </Card>
    );
  }

  // Create a configuration for our chart
  const chartConfig = {
    historical: {
      label: "Historical",
      theme: {
        light: "#1E88E5",
        dark: "#1E88E5",
      },
    },
    forecast: {
      label: "Forecast",
      theme: {
        light: "#37A662",
        dark: "#37A662",
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Annual Consumption</CardTitle>
        <CardDescription>Historical usage and future forecast by year</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={annualData}
                margin={{
                  top: 5,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  unit=" kWh"
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="kwh"
                  name="historical"
                  stroke="#1E88E5"
                  activeDot={{ r: 8 }}
                  connectNulls
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  isAnimationActive={true}
                />
                <Line
                  type="monotone"
                  dataKey="kwh"
                  name="forecast"
                  stroke="#37A662"
                  strokeDasharray="5 5"
                  connectNulls
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
