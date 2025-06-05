
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
import { useLanguage } from '@/contexts/LanguageContext';

// Common device types with typical power consumption
const deviceOptions = [
  { name: 'Refrigerator', type: 'Large Appliance', powerConsumption: 150, translationKey: 'devices.types.refrigerator' },
  { name: 'Freezer', type: 'Large Appliance', powerConsumption: 200, translationKey: 'devices.types.freezer' },
  { name: 'Washing Machine', type: 'Large Appliance', powerConsumption: 500, translationKey: 'devices.types.washingMachine' },
  { name: 'Dryer', type: 'Large Appliance', powerConsumption: 3000, translationKey: 'devices.types.dryer' },
  { name: 'Dishwasher', type: 'Large Appliance', powerConsumption: 1200, translationKey: 'devices.types.dishwasher' },
  { name: 'Air Conditioner', type: 'Climate Control', powerConsumption: 1500, translationKey: 'devices.types.airConditioner' },
  { name: 'Electric Heater', type: 'Climate Control', powerConsumption: 1500, translationKey: 'devices.types.electricHeater' },
  { name: 'Water Heater', type: 'Large Appliance', powerConsumption: 4000, translationKey: 'devices.types.waterHeater' },
  { name: 'Television', type: 'Electronics', powerConsumption: 100, translationKey: 'devices.types.television' },
  { name: 'Computer', type: 'Electronics', powerConsumption: 200, translationKey: 'devices.types.computer' },
  { name: 'Microwave', type: 'Kitchen Appliance', powerConsumption: 1000, translationKey: 'devices.types.microwave' },
  { name: 'Electric Oven', type: 'Kitchen Appliance', powerConsumption: 2000, translationKey: 'devices.types.electricOven' },
  { name: 'Coffee Maker', type: 'Kitchen Appliance', powerConsumption: 800, translationKey: 'devices.types.coffeeMaker' },
  { name: 'Lighting (LED)', type: 'Lighting', powerConsumption: 10, translationKey: 'devices.types.lightingLED' },
  { name: 'Lighting (CFL)', type: 'Lighting', powerConsumption: 15, translationKey: 'devices.types.lightingCFL' },
  { name: 'Lighting (Incandescent)', type: 'Lighting', powerConsumption: 60, translationKey: 'devices.types.lightingIncandescent' },
];

// Age options for device dropdown
const ageOptions = [
  { label: '1 year', value: '1', translationKey: 'devices.age.1year' },
  { label: '2 years', value: '2', translationKey: 'devices.age.2years' },
  { label: '3 years', value: '3', translationKey: 'devices.age.3years' },
  { label: '4 years', value: '4', translationKey: 'devices.age.4years' },
  { label: '5 years', value: '5', translationKey: 'devices.age.5years' },
  { label: '6+ years', value: '6', translationKey: 'devices.age.6plus' },
];

export const DeviceSelectionForm = ({ onComplete }: { onComplete: () => void }) => {
  const { addDevice } = useDevices();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();
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
        title: t('error.generic'),
        description: t('onboarding.devices.selectDeviceError'),
        variant: "destructive",
      });
      return;
    }
    
    const deviceInfo = deviceOptions.find(d => d.name === currentDevice);
    
    if (!deviceInfo) {
      toast({
        title: t('error.generic'),
        description: t('onboarding.devices.validDeviceError'),
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
        title: t('onboarding.devices.noDevicesError'),
        description: t('onboarding.devices.noDevicesError'),
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
        title: t('onboarding.devices.devicesSaved'),
        description: t('onboarding.devices.devicesSaved'),
      });
    } catch (error) {
      console.error("Error saving devices:", error);
      toast({
        title: t('error.generic'),
        description: t('onboarding.devices.saveError'),
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
        title={t('onboarding.devices.header')} 
        description={t('onboarding.devices.description')}
        helpText={t('onboarding.devices.helpText')}
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t('onboarding.devices.formTitle')}</CardTitle>
          <CardDescription>
            {t('onboarding.devices.formDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="device">{t('onboarding.devices.typeLabel')}</Label>
            <Select
              value={currentDevice}
              onValueChange={setCurrentDevice}
            >
              <SelectTrigger id="device" className="h-12">
                <SelectValue placeholder={t('onboarding.devices.typePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {deviceOptions.map((device) => (
                  <SelectItem key={device.name} value={device.name}>
                    {t(device.translationKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="age">{t('onboarding.devices.ageLabel')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="tooltip-trigger" aria-label="Help">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{t('onboarding.devices.ageHelp')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              value={currentAge}
              onValueChange={setCurrentAge}
            >
              <SelectTrigger id="age" className="h-12">
                <SelectValue placeholder={t('onboarding.devices.agePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {ageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.translationKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="efficiency">{t('onboarding.devices.efficiencyLabel')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="tooltip-trigger" aria-label="Help">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{t('onboarding.devices.efficiencyHelp')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              value={currentEfficiency}
              onValueChange={(value) => setCurrentEfficiency(value as 'A' | 'B' | 'C')}
            >
              <SelectTrigger id="efficiency" className="h-12">
                <SelectValue placeholder={t('onboarding.devices.typePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">{t('devices.efficiency.A')}</SelectItem>
                <SelectItem value="B">{t('devices.efficiency.B')}</SelectItem>
                <SelectItem value="C">{t('devices.efficiency.C')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="knownKwh">{t('onboarding.devices.knownKwhLabel')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="tooltip-trigger" aria-label="Help">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{t('onboarding.devices.knownKwhHelp')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="knownKwh"
              type="number"
              placeholder={t('onboarding.devices.knownKwhPlaceholder')}
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
            {t('onboarding.devices.addButton')}
          </Button>
        </CardContent>
      </Card>

      {selectedDevices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t('onboarding.devices.yourDevicesTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedDevices.map((device, index) => {
                const deviceTranslationKey = deviceOptions.find(d => d.name === device.deviceName)?.translationKey;
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-app-gray-50 rounded-md">
                    <div>
                      <p className="font-medium">{deviceTranslationKey ? t(deviceTranslationKey) : device.deviceName}</p>
                      <p className="text-sm text-app-gray-600">
                        {t('onboarding.devices.deviceAge').replace('{age}', device.age.toString())} • {t('onboarding.devices.deviceRating').replace('{rating}', device.efficiencyRating)}
                        {device.knownKwh && ` • ${t('onboarding.devices.deviceKnownKwh').replace('{kwh}', device.knownKwh.toString())}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDevice(index)}
                      className="text-app-gray-500 hover:text-destructive"
                    >
                      {t('onboarding.devices.removeButton')}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleComplete}
              className="w-full h-12"
              variant="default"
              disabled={isLoading}
            >
              {isLoading ? t('onboarding.devices.savingButton') : t('onboarding.devices.continueButton')}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};
