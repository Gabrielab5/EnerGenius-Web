import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useDevices } from '@/contexts/DeviceContext';
import { PageHeader } from '@/components/ui-components/PageHeader';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Common device types with typical power consumption
const deviceOptions = [
  { name: 'Refrigerator', type: 'Large Appliance', powerConsumption: 150 },
  { name: 'Freezer', type: 'Large Appliance', powerConsumption: 200 },
  { name: 'Washing Machine', type: 'Large Appliance', powerConsumption: 500 },
  { name: 'Dryer', type: 'Large Appliance', powerConsumption: 3000 },
  { name: 'Dishwasher', type: 'Large Appliance', powerConsumption: 1200 },
  { name: 'Air Conditioner', type: 'Climate Control', powerConsumption: 1500 },
  { name: 'Electric Heater', type: 'Climate Control', powerConsumption: 1500 },
  { name: 'Water Heater', type: 'Large Appliance', powerConsumption: 4000 },
  { name: 'Television', type: 'Electronics', powerConsumption: 100 },
  { name: 'Computer', type: 'Electronics', powerConsumption: 200 },
  { name: 'Microwave', type: 'Kitchen Appliance', powerConsumption: 1000 },
  { name: 'Electric Oven', type: 'Kitchen Appliance', powerConsumption: 2000 },
  { name: 'Coffee Maker', type: 'Kitchen Appliance', powerConsumption: 800 },
  { name: 'Lighting (LED)', type: 'Lighting', powerConsumption: 10 },
  { name: 'Lighting (CFL)', type: 'Lighting', powerConsumption: 15 },
  { name: 'Lighting (Incandescent)', type: 'Lighting', powerConsumption: 60 },
];

// Age options for device dropdown
const ageOptions = [
  { label: '1 year', value: '1' },
  { label: '2 years', value: '2' },
  { label: '3 years', value: '3' },
  { label: '4 years', value: '4' },
  { label: '5 years', value: '5' },
  { label: '6+ years', value: '6' },
];

export const DeviceSelectionForm = ({ onComplete }: { onComplete: () => void }) => {
  const { addDevice } = useDevices();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedDevices, setSelectedDevices] = useState<Array<{
    deviceName: string;
    age: number;
    efficiencyRating: 'A' | 'B' | 'C';
    powerConsumption: number;
    knownKwh?: number;
  }>>([]);
  
  const [currentDevice, setCurrentDevice] = useState('');
  const [currentAge, setCurrentAge] = useState('');
  const [currentEfficiency, setCurrentEfficiency] = useState<'A' | 'B' | 'C'>('A');
  const [currentKnownKwh, setCurrentKnownKwh] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddDevice = () => {
    if (!currentDevice || !currentAge) {
      toast({
        title: "Error",
        description: "Please select a device and its age.",
        variant: "destructive",
      });
      return;
    }
    
    const deviceInfo = deviceOptions.find(d => d.name === currentDevice);
    
    if (!deviceInfo) {
      toast({
        title: "Error",
        description: "Please select a valid device.",
        variant: "destructive",
      });
      return;
    }
    
    const newDevice = {
      deviceName: currentDevice,
      age: parseInt(currentAge),
      efficiencyRating: currentEfficiency,
      powerConsumption: deviceInfo.powerConsumption,
      ...(currentKnownKwh ? { knownKwh: parseFloat(currentKnownKwh) } : {})
    };
    
    setSelectedDevices([...selectedDevices, newDevice]);
    
    // Reset form
    setCurrentDevice('');
    setCurrentAge('');
    setCurrentEfficiency('A');
    setCurrentKnownKwh('');
  };

  const handleRemoveDevice = (index: number) => {
    const updatedDevices = [...selectedDevices];
    updatedDevices.splice(index, 1);
    setSelectedDevices(updatedDevices);
  };

  const handleComplete = async () => {
    if (selectedDevices.length === 0) {
      toast({
        title: "No devices added",
        description: "Please add at least one device to continue.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Add all selected devices to the context - this will also save to Firestore
      // We're not going to separately save to Firestore as the DeviceContext already does this
      const promises = selectedDevices.map(device => 
        addDevice({
          name: device.deviceName,
          type: deviceOptions.find(d => d.name === device.deviceName)?.type || 'Other',
          age: device.age,
          efficiencyRating: device.efficiencyRating,
          powerConsumption: device.powerConsumption,
          knownKwh: device.knownKwh
        })
      );
      
      await Promise.all(promises);
      
      toast({
        title: "Devices saved",
        description: "Your devices have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving devices:", error);
      toast({
        title: "Error",
        description: "Failed to save your devices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Select Your Devices" 
        description="Tell us about your electrical appliances to get accurate forecasts."
        helpText="Adding your devices helps us calculate more accurate energy consumption forecasts. The more devices you add, the better your forecasts will be."
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Add a Device</CardTitle>
          <CardDescription>
            Enter information about each electrical device in your home
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="device">Device Type</Label>
            <Select
              value={currentDevice}
              onValueChange={setCurrentDevice}
            >
              <SelectTrigger id="device" className="h-12">
                <SelectValue placeholder="Select a device" />
              </SelectTrigger>
              <SelectContent>
                {deviceOptions.map((device) => (
                  <SelectItem key={device.name} value={device.name}>
                    {device.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="age">Device Age</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="tooltip-trigger" aria-label="Help">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Older devices typically consume more electricity.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              value={currentAge}
              onValueChange={setCurrentAge}
            >
              <SelectTrigger id="age" className="h-12">
                <SelectValue placeholder="Select device age" />
              </SelectTrigger>
              <SelectContent>
                {ageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="efficiency">Energy Efficiency Rating</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="tooltip-trigger" aria-label="Help">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">A is the most efficient, C is the least efficient.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              value={currentEfficiency}
              onValueChange={(value) => setCurrentEfficiency(value as 'A' | 'B' | 'C')}
            >
              <SelectTrigger id="efficiency" className="h-12">
                <SelectValue placeholder="Select efficiency rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A (Most Efficient)</SelectItem>
                <SelectItem value="B">B (Medium Efficiency)</SelectItem>
                <SelectItem value="C">C (Least Efficient)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="knownKwh">Known kWh (Optional)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="tooltip-trigger" aria-label="Help">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">If you know how many kWh this device consumes, enter it here.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="knownKwh"
              type="number"
              placeholder="Enter known kWh (optional)"
              min="0"
              step="0.01"
              value={currentKnownKwh}
              onChange={(e) => setCurrentKnownKwh(e.target.value)}
              className="h-12"
            />
          </div>
          
          <Button
            onClick={handleAddDevice}
            className="w-full h-12 mt-2"
          >
            Add Device
          </Button>
        </CardContent>
      </Card>

      {selectedDevices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Your Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedDevices.map((device, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-app-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">{device.deviceName}</p>
                    <p className="text-sm text-app-gray-600">
                      Age: {device.age} years • Rating: {device.efficiencyRating}
                      {device.knownKwh && ` • Known kWh: ${device.knownKwh}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDevice(index)}
                    className="text-app-gray-500 hover:text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleComplete}
              className="w-full h-12"
              variant="default"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};
