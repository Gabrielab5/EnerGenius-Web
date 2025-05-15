
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConsumption } from '@/contexts/ConsumptionContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { LoadingSpinner } from '@/components/ui-components/LoadingSpinner';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-3 border border-app-gray-200 rounded-md shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-primary">
          <span className="font-medium">Usage: </span>
          {data.kwh} kWh
        </p>
        {data.cost && (
          <p className="text-app-green-600">
            <span className="font-medium">Cost: </span>
            ${data.cost.toFixed(2)}
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
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
};

interface ConsumptionChartProps {
  monthlyForecast?: Array<{month: string; kwh: number}>;
}

export const ConsumptionChart = ({ monthlyForecast }: ConsumptionChartProps) => {
  const { historicalData, forecastData, isLoading } = useConsumption();
  
  if (isLoading && !monthlyForecast) {
    return <LoadingSpinner message="Loading consumption data..." />;
  }
  
  // If we have the new monthly forecast data, use it
  let combinedData;
  
  if (monthlyForecast) {
    combinedData = [
      ...historicalData.map(item => ({
        ...item,
        source: 'historical',
        date: formatMonth(item.date)
      })),
      ...monthlyForecast.map(item => ({
        date: formatMonthString(item.month),
        kwh: item.kwh,
        source: 'forecast'
      }))
    ];
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
                    for (let i = 0; i < combinedData.length; i += 2) {
                      ticks.push(combinedData[i].date);
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
