
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { MonthlyConsumption } from '@/types';
import { ChartLine } from 'lucide-react';

interface MonthlyOverviewChartProps {
  monthlyTotals: Record<string, { kwh: number; price: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-md shadow-lg">
        <p className="font-medium">{data.monthName}</p>
        <p className="text-blue-600">
          <span className="font-medium">Usage: </span>
          {data.kwh.toFixed(1)} kWh
        </p>
        <p className="text-green-600">
          <span className="font-medium">Cost: </span>
          ₪{data.price.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export const MonthlyOverviewChart = ({ monthlyTotals }: MonthlyOverviewChartProps) => {
  const monthlyData = useMemo(() => {
    const data: MonthlyConsumption[] = [];
    
    // Process all months in chronological order
    Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([month, values]) => {
        const [year, monthNum] = month.split('-');
        const date = new Date(parseInt(year), parseInt(monthNum) - 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        
        // Only include months with actual data
        if (values.kwh > 0 || values.price > 0) {
          data.push({
            month,
            kwh: values.kwh,
            price: values.price,
            monthName,
            year
          });
        }
      });

    console.log('MonthlyOverviewChart data:', data);
    return data;
  }, [monthlyTotals]);

  const chartConfig = {
    kwh: {
      label: "Energy Usage (kWh)",
      theme: {
        light: "#3B82F6",
        dark: "#3B82F6",
      },
    },
    price: {
      label: "Cost (₪)",
      theme: {
        light: "#10B981",
        dark: "#10B981",
      },
    },
  };

  if (monthlyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine className="h-5 w-5" />
            Monthly Overview
          </CardTitle>
          <CardDescription>Monthly electricity consumption trends</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No monthly data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartLine className="h-5 w-5" />
          Monthly Overview
        </CardTitle>
        <CardDescription>Monthly electricity consumption and cost trends ({monthlyData.length} months)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="kwhGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="monthName" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis yAxisId="kwh" orientation="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="price" orientation="right" tick={{ fontSize: 12 }} />
                <ChartTooltip content={<CustomTooltip />} />
                <Area
                  yAxisId="kwh"
                  type="monotone"
                  dataKey="kwh"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#kwhGradient)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="price"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
