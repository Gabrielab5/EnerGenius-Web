
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ForecastData } from '@/types/forecast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Zap, DollarSign } from 'lucide-react';

interface ForecastResultsProps {
  forecastData: ForecastData;
}

export const ForecastResults = ({ forecastData }: ForecastResultsProps) => {
  const { historical, projected, deviceBreakdown } = forecastData;

  // Prepare comparison chart data - ensure we have historical data
  const comparisonData = Object.keys(projected.monthlyTotals).map(month => {
    const historicalValue = historical.monthlyTotals[month];
    return {
      month: month.substring(5), // Get MM part
      historical: historicalValue?.kwh || 0,
      projected: projected.monthlyTotals[month].kwh,
      historicalCost: historicalValue?.price || 0,
      projectedCost: projected.monthlyTotals[month].price
    };
  });

  // Prepare device breakdown data using device names
  const deviceData = Object.entries(deviceBreakdown).map(([deviceName, consumption]) => ({
    device: deviceName, // Use the device name directly
    monthlyKwh: consumption.monthlyKwh,
    monthlyCost: consumption.monthlyCost
  }));

  const kwhDifference = projected.annualTotal.kwh - historical.annualTotal.kwh;
  const priceDifference = projected.annualTotal.price - historical.annualTotal.price;
  const percentageChange = historical.annualTotal.kwh > 0 
    ? (kwhDifference / historical.annualTotal.kwh) * 100 
    : 0;

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-4 sm:space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Card className="min-w-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 shrink-0" />
                <span className="truncate">Projected Annual kWh</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl font-bold">{projected.annualTotal.kwh.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                vs {historical.annualTotal.kwh.toLocaleString()} historical
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 shrink-0" />
                <span className="truncate">Projected Annual Cost</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl font-bold">₪{projected.annualTotal.price.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                vs ₪{historical.annualTotal.price.toLocaleString()} historical
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {kwhDifference >= 0 ? <TrendingUp className="h-4 w-4 shrink-0" /> : <TrendingDown className="h-4 w-4 shrink-0" />}
                <span className="truncate">kWh Change</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-lg sm:text-xl font-bold ${kwhDifference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {kwhDifference >= 0 ? '+' : ''}{kwhDifference.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}% change
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {priceDifference >= 0 ? <TrendingUp className="h-4 w-4 shrink-0" /> : <TrendingDown className="h-4 w-4 shrink-0" />}
                <span className="truncate">Cost Impact</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-lg sm:text-xl font-bold ${priceDifference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {priceDifference >= 0 ? '+' : ''}₪{priceDifference.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {priceDifference >= 0 ? 'Additional' : 'Savings'} per year
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Comparison Chart */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Monthly Consumption Comparison</CardTitle>
            <CardDescription className="text-sm">Historical vs Projected electricity usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80 w-full">
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
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value.toLocaleString()} kWh`,
                      name === 'historical' ? 'Historical' : 'Projected'
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="historical" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Historical"
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="projected" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Projected"
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
            <CardTitle className="text-base sm:text-lg">Device Consumption Breakdown</CardTitle>
            <CardDescription className="text-sm">Monthly consumption by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 sm:h-96 w-full">
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
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()} kWh`, 'Monthly Consumption']}
                  />
                  <Bar dataKey="monthlyKwh" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Device Details Table */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Device Consumption Details</CardTitle>
            <CardDescription className="text-sm">Detailed breakdown by device</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px] text-xs">Device</TableHead>
                    <TableHead className="text-right min-w-[70px] text-xs">Daily kWh</TableHead>
                    <TableHead className="text-right min-w-[80px] text-xs">Monthly kWh</TableHead>
                    <TableHead className="text-right min-w-[80px] text-xs">Annual kWh</TableHead>
                    <TableHead className="text-right min-w-[90px] text-xs">Monthly Cost</TableHead>
                    <TableHead className="text-right min-w-[90px] text-xs">Annual Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(deviceBreakdown).map(([deviceName, consumption]) => (
                    <TableRow key={deviceName}>
                      <TableCell className="font-medium text-xs sm:text-sm">{deviceName}</TableCell>
                      <TableCell className="text-right text-xs sm:text-sm">{consumption.dailyKwh.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-xs sm:text-sm">{consumption.monthlyKwh.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-xs sm:text-sm">{consumption.annualKwh.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-xs sm:text-sm">₪{consumption.monthlyCost.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-xs sm:text-sm">₪{consumption.annualCost.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
