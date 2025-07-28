import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { MonthlyConsumption } from '@/types';
import { ChartLine } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MonthlyOverviewChartProps {
  monthlyTotals: Record<string, { kwh: number; price: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useLanguage();

  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-md shadow-lg">
        <p className="font-medium">{data.monthName}</p>
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

export const MonthlyOverviewChart = ({ monthlyTotals }: MonthlyOverviewChartProps) => {
  const { t, language, direction, isRTL } = useLanguage();

  const monthlyData = useMemo(() => {
    const data: MonthlyConsumption[] = [];

    // Process all months in chronological order
    Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([month, values]) => {
        const [year, monthNum] = month.split('-');
        const date = new Date(parseInt(year), parseInt(monthNum) - 1);
        const monthName = date.toLocaleDateString(language, { month: 'short', year: '2-digit' });

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
  }, [monthlyTotals, language]);

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

  if (monthlyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine className="h-5 w-5" />
            {t('charts.monthlyOverview.title')}
          </CardTitle>
          <CardDescription>{t('charts.monthlyOverview.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t('charts.noMonthlyData')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{t('dashboard.monthlyOverview.title')}</CardTitle>
        <CardDescription className="text-sm">{t('dashboard.monthlyOverview.description')}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {/* Chart container with consistent height and proper sizing */}
        <div className="h-50 sm:h-96 lg:h-[560px] w-full scale-110 sm:scale-100" dir="ltr">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                // Responsive margins - larger on mobile for readability
                margin={{
                  top: 25,
                  right: window.innerWidth < 640 ? 20 : 30,
                  left: window.innerWidth < 640 ? 40 : 50,
                  bottom: window.innerWidth < 640 ? 40 : 30
                }}
              >
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
                  tick={{ fontSize: window.innerWidth < 640 ? 14 : 12 }}
                  interval="preserveStartEnd"
                  label={{ value: t('charts.axis.month'), position: 'bottom', offset: 5 }}
                />
                <YAxis
                  yAxisId="kwh"
                  orientation="left"
                  tick={{ fontSize: window.innerWidth < 640 ? 14 : 12 }}
                  label={{ value: t('charts.axis.kwh'), angle: -90, position: 'insideLeft', dx: -10 }}
                />
                <YAxis
                  yAxisId="price"
                  orientation="right"
                  tick={{ fontSize: window.innerWidth < 640 ? 14 : 12 }}
                  label={{ value: t('charts.axis.cost'), angle: 90, position: 'insideRight', dx: 10 }}
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Area
                  yAxisId="kwh"
                  type="monotone"
                  dataKey="kwh"
                  name={t('charts.axis.kwh')}
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#kwhGradient)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="price"
                  name={t('charts.axis.cost')}
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