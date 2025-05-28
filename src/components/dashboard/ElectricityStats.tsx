
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ElectricityData } from '@/types';
import { Zap, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface ElectricityStatsProps {
  data: ElectricityData;
}

export const ElectricityStats = ({ data }: ElectricityStatsProps) => {
  const formatCurrency = (amount: number) => `₪${amount.toFixed(2)}`;
  const formatKwh = (kwh: number) => `${kwh.toFixed(1)} kWh`;

  // Calculate average daily consumption
  const totalDays = Object.keys(data.daily_totals).length;
  const avgDailyKwh = data.annual_total_kwh / totalDays;
  const avgDailyPrice = data.annual_total_price / totalDays;

  // Find highest consumption month
  const monthlyTotals = Object.entries(data.monthly_totals);
  const highestMonth = monthlyTotals.reduce((max, [month, values]) => 
    values.kwh > max.kwh ? { month, ...values } : max, 
    { month: '', kwh: 0, price: 0 }
  );

  const formatMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Annual Total</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatKwh(data.annual_total_kwh)}</div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(data.annual_total_price)} total cost
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatKwh(data.avg_monthly_kwh)}</div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(data.avg_monthly_price)} avg cost
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatKwh(avgDailyKwh)}</div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(avgDailyPrice)} avg cost
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Highest Month</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatKwh(highestMonth.kwh)}</div>
          <p className="text-xs text-muted-foreground">
            {formatMonthName(highestMonth.month)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
