
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { useDevices } from '@/contexts/DeviceContext';
import { LoadingSpinner } from '@/components/ui-components/LoadingSpinner';

export const DeviceSummary = () => {
  const { devices, isLoading } = useDevices();

  if (isLoading) {
    return <LoadingSpinner message="Loading device data..." />;
  }

  // Group devices by type and calculate total consumption
  const devicesByType = devices.reduce<Record<string, { count: number; totalConsumption: number }>>(
    (acc, device) => {
      const { type, powerConsumption } = device;
      if (!acc[type]) {
        acc[type] = { count: 0, totalConsumption: 0 };
      }
      acc[type].count += 1;
      acc[type].totalConsumption += powerConsumption;
      return acc;
    },
    {}
  );

  // Prepare data for pie chart
  const chartData = Object.entries(devicesByType).map(([type, data]) => ({
    name: type,
    value: data.totalConsumption,
    count: data.count
  }));

  // Colors for the pie chart
  const COLORS = ['#1E88E5', '#37A662', '#8BC5FF', '#C3EBD4', '#4AA3FF', '#92DAAE'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Device Summary</CardTitle>
        <CardDescription>Breakdown of your devices by type</CardDescription>
      </CardHeader>
      <CardContent>
        {devices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-app-gray-500">No devices added yet.</p>
            <p className="text-sm mt-2">Add devices in the Settings page.</p>
          </div>
        ) : (
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: any) => {
                    const item = props.payload;
                    return [`${value}W • ${item.count} device(s)`, name];
                  }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
