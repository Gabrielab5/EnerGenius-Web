import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ForecastData } from '@/types/forecast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Zap, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ForecastResultsProps {
  forecastData: ForecastData;
}

export const ForecastResults = ({ forecastData }: ForecastResultsProps) => {
  const { t, direction, isRTL } = useLanguage();
  const { historical, projected, deviceBreakdown, comparison } = forecastData;

  // Debug logging for comparison values
  console.log('=== FORECAST RESULTS DEBUG ===');
  console.log('Comparison object received:', comparison);
  console.log('kwhDifference:', comparison?.kwhDifference);
  console.log('percentageChange:', comparison?.percentageChange);
  console.log('==============================');

  // Prepare comparison chart data - align by month name (Jan–Dec), last 12 months historical vs next 12 months projected
  const monthNames = [
    t('common.months.0'), t('common.months.1'), t('common.months.2'), t('common.months.3'),
    t('common.months.4'), t('common.months.5'), t('common.months.6'), t('common.months.7'),
    t('common.months.8'), t('common.months.9'), t('common.months.10'), t('common.months.11')
  ];

  // Get last 12 months from historical data
  const historicalMonths = Object.keys(historical.monthlyTotals).sort().slice(-12);
  const projectedMonths = Object.keys(projected.monthlyTotals).sort().slice(0, 12);

  const comparisonData = monthNames.map((monthName, idx) => {
    // Find the historical and projected month keys for this month name
    const histKey = historicalMonths.find(key => parseInt(key.split('-')[1], 10) === idx + 1);
    const projKey = projectedMonths.find(key => parseInt(key.split('-')[1], 10) === idx + 1);
    return {
      month: monthName,
      historical: histKey ? historical.monthlyTotals[histKey]?.kwh || 0 : 0,
      projected: projKey ? projected.monthlyTotals[projKey]?.kwh || 0 : 0,
      historicalCost: histKey ? historical.monthlyTotals[histKey]?.price || 0 : 0,
      projectedCost: projKey ? projected.monthlyTotals[projKey]?.price || 0 : 0
    };
  });

  // Helper to translate device names (now with camelCase conversion)
  const toCamelCase = (str: string) =>
    str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '');

  const translateDeviceName = (name: string) =>
    t(`devices.types.${toCamelCase(name)}`, { defaultValue: name });

  // Prepare device breakdown data using device names
  const deviceData = Object.entries(deviceBreakdown).map(([deviceName, consumption]) => ({
    device: translateDeviceName(deviceName),
    monthlyKwh: consumption.monthlyKwh,
    monthlyCost: consumption.monthlyCost
  }));

  const { kwhDifference, priceDifference, percentageChange } = comparison || { kwhDifference: 0, priceDifference: 0, percentageChange: 0 };

  // Helper to safely format numbers
  const safeNumber = (value: number | undefined | null, digits = 2) => {
    if (typeof value !== 'number' || isNaN(value)) return '—';
    return value.toLocaleString(undefined, { maximumFractionDigits: digits });
  };

  return (
    <div dir={direction}>
      {/* Forecast Summary Section */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{t('forecast.results.summary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm sm:text-base text-muted-foreground space-y-1">
            <p>
              {t('forecast.results.projectedAnnualKwh')}:{' '}
              <b>{safeNumber(projected.annualTotal.kwh, 1)}</b> {t('forecast.units.kwh', { defaultValue: 'קוט"ש' })},{' '}
              {t('forecast.results.projectedAnnualCost')}:{' '}
              <b>{t('forecast.units.currency', { defaultValue: '₪' })}{safeNumber(projected.annualTotal.price, 2)}</b>
            </p>
            <p>
              {kwhDifference === 0
                ? t('forecast.results.noChange')
                : kwhDifference > 0
                  ? t('forecast.results.increase')
                      .replace('{value}', safeNumber(kwhDifference, 2))
                      .replace('{percent}', safeNumber(percentageChange, 1))
                  : t('forecast.results.decrease')
                      .replace('{value}', safeNumber(Math.abs(kwhDifference), 2))
                      .replace('{percent}', safeNumber(Math.abs(percentageChange), 1))
              }
            </p>
            <p>
              {t('forecast.results.deviceCount').replace('{count}', Object.keys(deviceBreakdown).length.toString())}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="w-full max-w-full overflow-hidden">
        <div className="space-y-4 sm:space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Card className="min-w-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t('forecast.results.projectedAnnualKwh')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-xl font-bold">{safeNumber(projected.annualTotal.kwh, 2)}</div>
                <div className="text-xs text-muted-foreground">
                  {t('forecast.results.vsHistorical', { value: safeNumber(historical.annualTotal.kwh, 1) + ' ' + t('forecast.units.kwh', { defaultValue: 'קוט"ש' }) })}
                </div>
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t('forecast.results.projectedAnnualCost')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-xl font-bold">{t('forecast.units.currency', { defaultValue: '₪' })}{safeNumber(projected.annualTotal.price, 2)}</div>
                <div className="text-xs text-muted-foreground">
                  {t('forecast.results.vsHistorical', { value: `${t('forecast.units.currency', { defaultValue: '₪' })}${safeNumber(historical.annualTotal.price, 2)}` })}
                </div>
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {kwhDifference >= 0 ? <TrendingUp className="h-4 w-4 shrink-0" /> : <TrendingDown className="h-4 w-4 shrink-0" />}
                  <span className="truncate">{t('forecast.results.kWhChange')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-lg sm:text-xl font-bold ${kwhDifference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {kwhDifference >= 0 ? '+' : ''}{safeNumber(kwhDifference, 1)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {safeNumber(percentageChange, 1)}% {t('forecast.results.change')}
                </div>
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {priceDifference >= 0 ? <TrendingUp className="h-4 w-4 shrink-0" /> : <TrendingDown className="h-4 w-4 shrink-0" />}
                  <span className="truncate">{t('forecast.results.costImpact')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-lg sm:text-xl font-bold ${priceDifference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {priceDifference >= 0 ? '+' : ''}₪{safeNumber(priceDifference, 2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {priceDifference >= 0 ? t('forecast.results.additional') : t('forecast.results.savings')} {t('forecast.results.perYear')}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Comparison Chart */}
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">{t('forecast.results.monthlyConsumptionComparison')}</CardTitle>
              <CardDescription className="text-sm">{t('forecast.results.historicalVsProjectedElectricityUsage')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                      label={{ value: t('charts.axis.kwh'), angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${value.toLocaleString()} ${t('charts.units.kwh')}`,
                        name === 'historical' ? t('charts.legend.historical') : t('charts.legend.projected')
                      ]}
                      labelFormatter={(label: string) => label}
                    />
                    <Legend 
                      payload={[
                        { value: t('charts.legend.historical'), type: 'line', color: '#8884d8', id: 'historical' },
                        { value: t('charts.legend.projected'), type: 'line', color: '#82ca9d', id: 'projected' }
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="historical" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name={t('charts.legend.historical')}
                      dot={{ r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="projected" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name={t('charts.legend.projected')}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Device Breakdown Chart */}
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">{t('forecast.results.deviceConsumptionBreakdown')}</CardTitle>
              <CardDescription className="text-sm">{t('forecast.results.monthlyConsumptionByDeviceType')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deviceData} margin={{ top: 5, right: 5, left: 5, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="device" 
                      angle={0}
                      textAnchor="middle"
                      height={80}
                      interval={0}
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                      label={{ value: t('charts.axis.kwh'), angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [
                        `${value.toLocaleString()} ${t('charts.units.kwh')}`,
                        t('charts.tooltip.monthlyConsumption')
                      ]}
                      labelFormatter={(label: string) => translateDeviceName(label)}
                    />
                    <Bar 
                      dataKey="monthlyKwh" 
                      fill="#8884d8" 
                      name={t('charts.tooltip.monthlyConsumption')}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Device Breakdown Table */}
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">{t('forecast.results.deviceConsumptionDetails')}</CardTitle>
              <CardDescription className="text-sm">{t('forecast.results.detailedBreakdownByDevice')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>{t('forecast.results.device')}</TableHead>
                    <TableHead className="text-center">{t('forecast.results.dailyKwh')}</TableHead>
                    <TableHead className="text-center">{t('forecast.results.monthlyKwh')}</TableHead>
                    <TableHead className="text-center">{t('forecast.results.annualKwh')}</TableHead>
                    <TableHead className="text-center">{t('forecast.results.monthlyCost')}</TableHead>
                    <TableHead className={isRTL ? "text-left" : "text-right"}>{t('forecast.results.annualCost')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(deviceBreakdown).map(([deviceName, data]) => (
                    <TableRow key={deviceName}>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>{translateDeviceName(deviceName)}</TableCell>
                      <TableCell className="text-center">{safeNumber(data.dailyKwh, 2)}</TableCell>
                      <TableCell className="text-center">{safeNumber(data.monthlyKwh, 2)}</TableCell>
                      <TableCell className="text-center">{safeNumber(data.annualKwh, 2)}</TableCell>
                      <TableCell className="text-center">{t('forecast.units.currency', { defaultValue: '₪' })}{safeNumber(data.monthlyCost, 2)}</TableCell>
                      <TableCell className={isRTL ? 'text-left' : 'text-right'}>{t('forecast.units.currency', { defaultValue: '₪' })}{safeNumber(data.annualCost, 2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
