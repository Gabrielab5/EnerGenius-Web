
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConsumption } from '@/contexts/ConsumptionContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { LoadingSpinner } from '@/components/ui-components/LoadingSpinner';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CircleDollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  const { t } = useLanguage();
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-3 border border-app-gray-200 rounded-md shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-primary">
          <span className="font-medium">{t('charts.tooltip.usage')}:</span>
          {data.kwh} kWh
        </p>
        {(data.cost || data.price_ils) && (
          <p className="text-app-green-600">
            <span className="font-medium">{t('charts.tooltip.price')}: </span>
            {data.price_ils ? `₪${data.price_ils.toFixed(2)}` : `$${data.cost.toFixed(2)}`}
          </p>
        )}
      </div>
    );
  }

  return null;
};

// Helper function to format dates
const formatMonth = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
};

// Helper function to format month strings
const formatMonthString = (monthStr: string) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
};

interface ConsumptionChartProps {
  monthlyForecast?: Array<{month: string; kwh: number; price_ils?: number}>;
  historicalMonthly?: Array<{month: string; kwh: number; price_ils?: number}>;
}

export const ConsumptionChart = ({ monthlyForecast, historicalMonthly }: ConsumptionChartProps) => {
  const { historicalData, forecastData, isLoading } = useConsumption();
  
  if (isLoading && !monthlyForecast && !historicalMonthly) {
    return <LoadingSpinner message="Loading consumption data..." />;
  }
  
  // Ensure we have arrays to work with, even if empty
  const safeMonthlyForecast = monthlyForecast || [];
  const safeHistoricalMonthly = historicalMonthly || [];
  
  // If we have the new monthly forecast data, use it
  let combinedData;
  
  if (safeHistoricalMonthly.length > 0 && safeMonthlyForecast.length > 0) {
    combinedData = [
      ...safeHistoricalMonthly.map(item => ({
        ...item,
        source: 'historical',
        date: formatMonthString(item.month)
      })),
      ...safeMonthlyForecast.map(item => ({
        date: formatMonthString(item.month),
        kwh: item.kwh,
        price_ils: item.price_ils,
        source: 'forecast'
      }))
    ];
    console.log("Using historical and monthly forecast data", combinedData);
  } else if (safeMonthlyForecast.length > 0) {
    combinedData = [
      ...historicalData.map(item => ({
        ...item,
        source: 'historical',
        date: formatMonth(item.date)
      })),
      ...safeMonthlyForecast.map(item => ({
        date: formatMonthString(item.month),
        kwh: item.kwh,
        price_ils: item.price_ils,
        source: 'forecast'
      }))
    ];
    console.log("Using context historical and monthly forecast data", combinedData);
  } else {
    // Fall back to original data structure if no monthly forecast
    combinedData = [
      ...historicalData.map(item => ({
        ...item,
        source: 'historical',
        date: formatMonth(item.date)
      })),
      ...forecastData.map(item => ({
        ...item,
        source: 'forecast',
        date: formatMonth(item.date)
      }))
    ];
    console.log("Using fallback data structure", combinedData);
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
        <CardTitle className="text-xl">Monthly Consumption</CardTitle>
        <CardDescription>Historical usage and future forecast</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={combinedData}
                margin={{
                  top: 5,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  ticks={(function() {
                    const ticks = [];
                    // Ensure there's data before attempting to access it
                    if (combinedData && combinedData.length > 0) {
                      for (let i = 0; i < combinedData.length; i += 2) {
                        if (combinedData[i] && combinedData[i].date) {
                          ticks.push(combinedData[i].date);
                        }
                      }
                    }
                    return ticks;
                  })()}
                />
                <YAxis tick={{ fontSize: 12 }} unit=" kWh" />
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
