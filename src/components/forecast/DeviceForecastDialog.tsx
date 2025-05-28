import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDevices } from '@/contexts/DeviceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useElectricityData } from '@/hooks/useElectricityData';
import { ForecastDevice, ForecastData } from '@/types/forecast';
import { Device } from '@/types';
import { calculateTotalForecast, getDefaultUsagePattern } from '@/lib/forecastUtils';
import { DeviceUsageConfig } from './DeviceUsageConfig';
import { ForecastResults } from './ForecastResults';
import { LoadingSpinner } from '@/components/ui-components/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface DeviceForecastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onForecastSaved?: () => void;
}

export const DeviceForecastDialog = ({ open, onOpenChange, onForecastSaved }: DeviceForecastDialogProps) => {
  const { devices, isLoading: devicesLoading } = useDevices();
  const { user } = useAuth();
  const { electricityData } = useElectricityData();
  const [currentStep, setCurrentStep] = useState(0);
  const [forecastDevices, setForecastDevices] = useState<ForecastDevice[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [forecastName, setForecastName] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize forecast devices from current devices when dialog opens
  useEffect(() => {
    if (open && devices.length > 0 && forecastDevices.length === 0) {
      const initialDevices: ForecastDevice[] = devices.map(device => ({
        ...device,
        usage: getDefaultUsagePattern(device.name)
      }));
      setForecastDevices(initialDevices);
      console.log('Initialized forecast devices from existing devices:', initialDevices);
    }
  }, [open, devices, forecastDevices.length]);

  // Generate default forecast name
  useEffect(() => {
    if (open && !forecastName) {
      setForecastName(`Device Forecast - ${new Date().toLocaleDateString()}`);
    }
  }, [open, forecastName]);

  const handleDeviceUpdate = (deviceId: string, updates: Partial<ForecastDevice>) => {
    setForecastDevices(prev => 
      prev.map(device => 
        device.id === deviceId ? { ...device, ...updates } : device
      )
    );
  };

  const handleRemoveDevice = (deviceId: string) => {
    setForecastDevices(prev => prev.filter(device => device.id !== deviceId));
  };

  const handleAddDevice = (device: Device) => {
    const newForecastDevice: ForecastDevice = {
      ...device,
      id: `forecast_${device.id}_${Date.now()}`,
      usage: getDefaultUsagePattern(device.name)
    };
    setForecastDevices(prev => [...prev, newForecastDevice]);
  };

  const calculateForecast = () => {
    setIsCalculating(true);
    try {
      const forecast = calculateTotalForecast(forecastDevices, electricityData);
      setForecastData(forecast);
      setCurrentStep(3);
      console.log('Calculated forecast with historical data:', forecast);
    } catch (error) {
      console.error('Error calculating forecast:', error);
      toast({
        title: "Error",
        description: "Failed to calculate forecast. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const saveForecastScenario = async () => {
    if (!user || !forecastData || !forecastName.trim()) {
      if (!forecastName.trim()) {
        toast({
          title: "Error",
          description: "Please enter a name for your forecast.",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      setIsSaving(true);
      const scenarioId = `forecast_${Date.now()}`;
      const scenario = {
        id: scenarioId,
        name: forecastName.trim(),
        devices: forecastDevices,
        projections: {
          monthlyTotals: forecastData.projected.monthlyTotals,
          annualTotal: forecastData.projected.annualTotal,
          comparison: {
            kwhDifference: forecastData.projected.annualTotal.kwh - forecastData.historical.annualTotal.kwh,
            priceDifference: forecastData.projected.annualTotal.price - forecastData.historical.annualTotal.price,
            percentageChange: forecastData.historical.annualTotal.kwh > 0 
              ? ((forecastData.projected.annualTotal.kwh - forecastData.historical.annualTotal.kwh) / forecastData.historical.annualTotal.kwh) * 100
              : 0
          }
        },
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "users", user.id, "forecasts", scenarioId), scenario);
      
      toast({
        title: "Success",
        description: "Forecast scenario saved successfully.",
      });
      
      // Call the callback to refresh forecasts immediately
      if (onForecastSaved) {
        onForecastSaved();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving forecast:', error);
      toast({
        title: "Error",
        description: "Failed to save forecast scenario.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetDialog = () => {
    setCurrentStep(0);
    setForecastData(null);
    setForecastDevices([]);
    setForecastName('');
  };

  useEffect(() => {
    if (!open) {
      resetDialog();
    }
  }, [open]);

  const steps = [
    { title: "Review Devices", description: "Modify your current device setup" },
    { title: "Configure Usage", description: "Set usage patterns for each device" },
    { title: "Name Forecast", description: "Give your forecast a name" },
    { title: "View Results", description: "See your projected electricity consumption" }
  ];

  // Show loading if devices are still loading
  if (devicesLoading && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl lg:max-w-4xl h-[90vh] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0 text-center">
            <DialogTitle className="text-base sm:text-lg">Device-Based Electricity Forecast</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center flex-1">
            <LoadingSpinner size="lg" message="Loading your devices..." />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl lg:max-w-4xl h-[90vh] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 text-center">
          <DialogTitle className="text-base sm:text-lg">Device-Based Electricity Forecast</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Create a forecast based on your device changes and usage patterns
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex-shrink-0 mb-4">
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  index <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <div className="ml-2">
                  <div className="text-xs sm:text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-muted-foreground hidden sm:block">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-4 lg:w-8 h-px mx-2 ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {currentStep === 0 && (
            <DeviceUsageConfig
              devices={forecastDevices}
              availableDevices={devices}
              onDeviceUpdate={handleDeviceUpdate}
              onRemoveDevice={handleRemoveDevice}
              onAddDevice={handleAddDevice}
            />
          )}

          {currentStep === 1 && (
            <DeviceUsageConfig
              devices={forecastDevices}
              availableDevices={devices}
              onDeviceUpdate={handleDeviceUpdate}
              onRemoveDevice={handleRemoveDevice}
              onAddDevice={handleAddDevice}
              showUsageControls={true}
            />
          )}

          {currentStep === 2 && (
            <div className="space-y-4 text-center">
              <h3 className="text-base sm:text-lg font-semibold">Name Your Forecast</h3>
              <div className="space-y-2">
                <Label htmlFor="forecastName" className="text-sm">Forecast Name</Label>
                <Input
                  id="forecastName"
                  value={forecastName}
                  onChange={(e) => setForecastName(e.target.value)}
                  placeholder="Enter a name for your forecast"
                  className="w-full"
                />
              </div>
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-sm sm:text-base">Forecast Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    <p>{forecastDevices.length} device{forecastDevices.length !== 1 ? 's' : ''} configured</p>
                    <p>Ready to calculate consumption forecast</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 3 && forecastData && (
            <ForecastResults forecastData={forecastData} />
          )}

          {isCalculating && (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" message="Calculating forecast..." />
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex-shrink-0 gap-2 flex-col sm:flex-row">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={isCalculating || isSaving}
              className="w-full sm:w-auto text-sm"
              size="sm"
            >
              Back
            </Button>
          )}
          
          {currentStep < 3 && (
            <Button
              onClick={() => {
                if (currentStep === 2) {
                  calculateForecast();
                } else {
                  setCurrentStep(prev => prev + 1);
                }
              }}
              disabled={forecastDevices.length === 0 || isCalculating || (currentStep === 2 && !forecastName.trim())}
              className="w-full sm:w-auto text-sm"
              size="sm"
            >
              {currentStep === 2 ? 'Calculate Forecast' : 'Next'}
            </Button>
          )}

          {currentStep === 3 && (
            <Button
              onClick={saveForecastScenario}
              disabled={isSaving}
              className="w-full sm:w-auto text-sm"
              size="sm"
            >
              {isSaving ? 'Saving...' : 'Save Forecast'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
