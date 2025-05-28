
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ForecastDevice } from '@/types/forecast';
import { Device } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { deviceOptions } from '@/lib/deviceOptions';

interface DeviceUsageConfigProps {
  devices: ForecastDevice[];
  availableDevices: Device[];
  onDeviceUpdate: (deviceId: string, updates: Partial<ForecastDevice>) => void;
  onRemoveDevice: (deviceId: string) => void;
  onAddDevice: (device: Device) => void;
  showUsageControls?: boolean;
}

export const DeviceUsageConfig = ({
  devices,
  availableDevices,
  onDeviceUpdate,
  onRemoveDevice,
  onAddDevice,
  showUsageControls = false
}: DeviceUsageConfigProps) => {
  const [selectedDeviceToAdd, setSelectedDeviceToAdd] = React.useState<string>('');

  const handleAddNewDevice = () => {
    if (!selectedDeviceToAdd) return;
    
    const deviceInfo = deviceOptions.find(d => d.name === selectedDeviceToAdd);
    if (!deviceInfo) return;

    const newDevice: Device = {
      id: `new_${Date.now()}`,
      name: selectedDeviceToAdd,
      type: deviceInfo.type,
      age: 1,
      efficiencyRating: 'B',
      powerConsumption: deviceInfo.powerConsumption
    };

    onAddDevice(newDevice);
    setSelectedDeviceToAdd('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h3 className="text-lg font-semibold">
          {showUsageControls ? 'Configure Usage Patterns' : 'Review & Modify Devices'}
        </h3>
        
        <div className="flex items-center gap-2">
          <Select value={selectedDeviceToAdd} onValueChange={setSelectedDeviceToAdd}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Add new device" />
            </SelectTrigger>
            <SelectContent>
              {deviceOptions.map((device) => (
                <SelectItem key={device.name} value={device.name}>
                  {device.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddNewDevice}
            disabled={!selectedDeviceToAdd}
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {devices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">No devices selected for forecast.</p>
            <p className="text-sm text-center">Add devices using the dropdown above to start creating your forecast.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {devices.map((device) => (
            <Card key={device.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base">{device.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {device.type} • {device.powerConsumption}W • Rating: {device.efficiencyRating}
                      {device.knownKwh && ` • Known kWh: ${device.knownKwh}`}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveDevice(device.id)}
                    className="text-destructive hover:text-destructive/90 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              {showUsageControls && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Hours per Day</Label>
                      <div className="space-y-2">
                        <Slider
                          value={[device.usage.hoursPerDay]}
                          onValueChange={([value]) => 
                            onDeviceUpdate(device.id, {
                              usage: { ...device.usage, hoursPerDay: value }
                            })
                          }
                          max={24}
                          min={0}
                          step={0.5}
                          className="w-full"
                        />
                        <div className="text-sm text-muted-foreground text-center">
                          {device.usage.hoursPerDay} hours/day
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Days per Week</Label>
                      <div className="space-y-2">
                        <Slider
                          value={[device.usage.daysPerWeek]}
                          onValueChange={([value]) => 
                            onDeviceUpdate(device.id, {
                              usage: { ...device.usage, daysPerWeek: value }
                            })
                          }
                          max={7}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="text-sm text-muted-foreground text-center">
                          {device.usage.daysPerWeek} days/week
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Device Age (years)</Label>
                        <Input
                          type="number"
                          value={device.age}
                          onChange={(e) => 
                            onDeviceUpdate(device.id, { age: parseInt(e.target.value) || 1 })
                          }
                          min={0}
                          max={20}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Efficiency Rating</Label>
                        <Select
                          value={device.efficiencyRating}
                          onValueChange={(value: 'A' | 'B' | 'C') => 
                            onDeviceUpdate(device.id, { efficiencyRating: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A (Most Efficient)</SelectItem>
                            <SelectItem value="B">B (Average)</SelectItem>
                            <SelectItem value="C">C (Least Efficient)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Power Consumption (W)</Label>
                        <Input
                          type="number"
                          value={device.powerConsumption}
                          onChange={(e) => 
                            onDeviceUpdate(device.id, { powerConsumption: parseInt(e.target.value) || 0 })
                          }
                          min={0}
                          max={10000}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Known kWh (optional)</Label>
                        <Input
                          type="number"
                          value={device.knownKwh || ''}
                          onChange={(e) => 
                            onDeviceUpdate(device.id, { 
                              knownKwh: e.target.value ? parseFloat(e.target.value) : undefined 
                            })
                          }
                          min={0}
                          step={0.1}
                          placeholder="Enter known kWh"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
