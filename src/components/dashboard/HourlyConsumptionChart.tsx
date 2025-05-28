
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';

type HourlyData = {
  hour: number;
  kwh: number;
  price_ils?: number;
};

interface HourlyConsumptionChartProps {
  hourlyData: HourlyData[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-3 border border-app-gray-200 rounded-md shadow-lg">
        <p className="font-medium">{`Hour: ${label}`}</p>
        <p className="text-primary">
          <span className="font-medium">Usage: </span>
          {data.kwh} kWh
        </p>
        {data.price_ils !== undefined && (
          <p className="text-app-green-600">
            <span className="font-medium">Price: </span>
            ₪{data.price_ils.toFixed(2)}
          </p>
        )}
      </div>
    );
  }

  return null;
};

export const HourlyConsumptionChart = ({ hourlyData }: HourlyConsumptionChartProps) => {
  // Ensure hourlyData is always an array, even if empty
  const safeHourlyData = Array.isArray(hourlyData) ? hourlyData : [];
  
  // Format the data to display hour in 12-hour format with AM/PM
  const formattedData = safeHourlyData.map(item => ({
    ...item,
    formattedHour: formatHour(item.hour),
  }));

  // Create a configuration for our chart
  const chartConfig = {
    hourly: {
      label: "Hourly Usage",
      theme: {
        light: "#37A662",
        dark: "#37A662",
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Hourly Consumption</CardTitle>
        <CardDescription>Average hourly energy usage throughout the day</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={formattedData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="formattedHour" 
                  tick={{ fontSize: 12 }}
                  // Show fewer ticks for better readability
                  ticks={[0, 6, 12, 18, 23].map(hour => formatHour(hour))}
                />
                <YAxis tick={{ fontSize: 12 }} unit=" kWh" />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#37A662" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#37A662" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  name="hourly"
                  dataKey="kwh"
                  stroke="#37A662"
                  fillOpacity={1}
                  fill="url(#hourlyGradient)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to format hour in 12-hour format
function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}${period}`;
}
