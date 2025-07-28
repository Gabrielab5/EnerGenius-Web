import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart, ComposedChart } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { DailyConsumption } from '@/types';
import { CalendarDays } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DailyConsumptionChartProps {
  dailyTotals: Record<string, { kwh: number; price: number }>;
}

// Define CustomTooltip outside the main component so it can use useLanguage()
const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useLanguage();
  
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-md shadow-lg">
        <p className="font-medium">{t('charts.tooltip.date')}: {data.dayOfWeek}, {data.date}</p>
        <p className="text-blue-600">
          <span className="font-medium">{t('charts.tooltip.usage')}: </span>
          {data.kwh.toFixed(1)} {t('charts.units.kwh')}
        </p>
        <p className="text-green-600">
          <span className="font-medium">{t('charts.tooltip.cost')}: </span>
          {t('charts.units.currency')}{data.price.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export const DailyConsumptionChart = ({ dailyTotals }: DailyConsumptionChartProps) => {
  const { t, language, direction, isRTL } = useLanguage();
  
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    Object.keys(dailyTotals).forEach(date => {
      const monthKey = date.substring(0, 7); // YYYY-MM
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse(); // Latest first
  }, [dailyTotals]);

  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0] || '');

  const monthlyDailyData = useMemo(() => {
    if (!selectedMonth) return [];

    const data: DailyConsumption[] = [];
    Object.entries(dailyTotals)
      .filter(([date]) => date.startsWith(selectedMonth))
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, values]) => {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.toLocaleDateString(language, { weekday: 'short' });
        
        data.push({
          date: dateObj.getDate().toString(),
          kwh: values.kwh,
          price: values.price,
          dayOfWeek
        });
      });

    return data;
  }, [dailyTotals, selectedMonth, language]);

  const chartConfig = {
    kwh: {
      label: t('charts.axis.kwh'),
      theme: {
        light: "#3B82F6",
        dark: "#3B82F6",
      },
    },
    price: {
      label: t('charts.axis.cost'),
      theme: {
        light: "#10B981",
        dark: "#10B981",
      },
    },
  };

  const formatMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString(language, { month: 'long', year: 'numeric' });
  };

  if (availableMonths.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {t('charts.dailyConsumption.title')}
          </CardTitle>
          <CardDescription>{t('charts.dailyConsumption.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t('charts.noDailyData')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{t('dashboard.dailyConsumption.title')}</CardTitle>
        <CardDescription className="text-sm">{t('dashboard.dailyConsumption.description')}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="h-72 sm:h-80 lg:h-96 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyDailyData} margin={{ top: 10, right: 15, left: 15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                label={{ value: t('charts.axis.day'), position: 'bottom' }}
              />
              <YAxis 
                yAxisId="kwh" 
                orientation="left" 
                tick={{ fontSize: 12 }}
                label={{ value: t('charts.axis.kwh'), angle: -90, position: 'insideLeft' }}
              />
              <ChartTooltip content={<CustomTooltip />} />
              <Bar 
                yAxisId="kwh" 
                dataKey="kwh" 
                fill="#3B82F6" 
                opacity={0.7} 
                name={t('charts.axis.kwh')}
              />
              <Line 
                yAxisId="kwh" 
                type="monotone" 
                dataKey="price" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ r: 4 }}
                name={t('charts.axis.cost')}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
