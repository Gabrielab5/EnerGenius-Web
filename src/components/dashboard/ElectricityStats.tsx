
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ElectricityData } from '@/types';
import { Zap, TrendingUp, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSpinner } from '../ui-components/LoadingSpinner';

interface ElectricityStatsProps {
  data: ElectricityData | null;
  isLoading: boolean;
}

export const ElectricityStats = ({ data, isLoading }: ElectricityStatsProps) => {
  const { t, language } = useLanguage();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data || !data.annual_total_kwh) {
    return (
      <Card className="md:col-span-2 lg:col-span-4">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium">{t('analytics.error.noData')}</p>
          <p className="text-sm text-muted-foreground">{t('analytics.error.message')}</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => `₪${amount.toFixed(2)}`;
  const formatKwh = (kwh: number) => `${kwh.toFixed(1)} ${t('forecast.units.kwh', { defaultValue: 'קוט"ש' })}`;

  // Safely calculate average daily consumption
  const totalDays = data.daily_totals ? Object.keys(data.daily_totals).length : 0;
  const avgDailyKwh = totalDays > 0 ? (data.annual_total_kwh || 0) / totalDays : 0;
  const avgDailyPrice = totalDays > 0 ? (data.annual_total_price || 0) / totalDays : 0;

  // Safely find highest consumption month
  const monthlyTotals = data.monthly_totals ? Object.entries(data.monthly_totals) : [];
  const highestMonth = monthlyTotals.length > 0 
    ? monthlyTotals.reduce((max, [month, values]) => 
        (values?.kwh || 0) > (max?.kwh || 0) ? { month, ...values } : max, 
        { month: '', kwh: 0, price: 0 }
      )
    : { month: '', kwh: 0, price: 0 };

  const formatMonthName = (monthKey: string) => {
    if (!monthKey) return '';
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString(language, { month: 'long', year: 'numeric' });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card className="min-w-0 overflow-hidden min-h-[130px] sm:min-h-[120px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 py-2 sm:py-3">
          <CardTitle className="text-sm sm:text-base font-medium leading-tight pr-2 flex-1">{t('analytics.stats.annualTotal')}</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardHeader>
        <CardContent className="px-3 sm:px-4 py-2 text-center">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 leading-tight">{formatKwh(data.annual_total_kwh)}</div>
          <p className="text-sm text-muted-foreground leading-tight">
            {formatCurrency(data.annual_total_price)}
          </p>
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden min-h-[130px] sm:min-h-[120px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 py-2 sm:py-3">
          <CardTitle className="text-sm sm:text-base font-medium leading-tight pr-2 flex-1">{t('analytics.stats.monthlyAverage')}</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardHeader>
        <CardContent className="px-3 sm:px-4 py-2 text-center">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 leading-tight">{formatKwh(data.avg_monthly_kwh || 0)}</div>
          <p className="text-sm text-muted-foreground leading-tight">
            {formatCurrency(data.avg_monthly_price || 0)}
          </p>
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden min-h-[130px] sm:min-h-[120px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 py-2 sm:py-3">
          <CardTitle className="text-sm sm:text-base font-medium leading-tight pr-2 flex-1">{t('analytics.stats.dailyAverage')}</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardHeader>
        <CardContent className="px-3 sm:px-4 py-2 text-center">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 leading-tight">{formatKwh(avgDailyKwh)}</div>
          <p className="text-sm text-muted-foreground leading-tight">
            {formatCurrency(avgDailyPrice)}
          </p>
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden min-h-[130px] sm:min-h-[120px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 py-2 sm:py-3">
          <CardTitle className="text-sm sm:text-base font-medium leading-tight pr-2 flex-1">{t('analytics.stats.highestMonth')}</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardHeader>
        <CardContent className="px-3 sm:px-4 py-2 text-center">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 leading-tight">{formatKwh(highestMonth.kwh)}</div>
          <p className="text-sm text-muted-foreground leading-tight">
            {formatMonthName(highestMonth.month)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
