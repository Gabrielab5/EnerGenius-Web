
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart, ComposedChart } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { DailyConsumption } from '@/types';
import { CalendarDays } from 'lucide-react';

interface DailyConsumptionChartProps {
  dailyTotals: Record<string, { kwh: number; price: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-md shadow-lg">
        <p className="font-medium">{`${data.dayOfWeek}, ${label}`}</p>
        <p className="text-blue-600">
          <span className="font-medium">Usage: </span>
          {data.kwh.toFixed(2)} kWh
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

export const DailyConsumptionChart = ({ dailyTotals }: DailyConsumptionChartProps) => {
  // Get available months
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    Object.keys(dailyTotals).forEach(date => {
      const monthKey = date.substring(0, 7); // YYYY-MM
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse(); // Latest first
  }, [dailyTotals]);

  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0] || '');

  // Process daily data for selected month
  const monthlyDailyData = useMemo(() => {
    if (!selectedMonth) return [];

    const data: DailyConsumption[] = [];
    Object.entries(dailyTotals)
      .filter(([date]) => date.startsWith(selectedMonth))
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, values]) => {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        
        data.push({
          date: dateObj.getDate().toString(),
          kwh: values.kwh,
          price: values.price,
          dayOfWeek
        });
      });

    return data;
  }, [dailyTotals, selectedMonth]);

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

  const formatMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (availableMonths.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Daily Consumption
          </CardTitle>
          <CardDescription>Daily electricity usage and costs</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No daily data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Daily Consumption
            </CardTitle>
            <CardDescription>Daily electricity usage and costs by month</CardDescription>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map(month => (
                <SelectItem key={month} value={month}>
                  {formatMonthName(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyDailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="kwh" orientation="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="price" orientation="right" tick={{ fontSize: 12 }} />
                <ChartTooltip content={<CustomTooltip />} />
                <Bar yAxisId="kwh" dataKey="kwh" fill="#3B82F6" opacity={0.7} />
                <Line 
                  yAxisId="price" 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
