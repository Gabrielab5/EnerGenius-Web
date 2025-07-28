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
import { deviceOptions, ageOptions } from '@/lib/deviceOptions';

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
    translationKey: string;
    categoryTranslationKey: string;
  }>>([]);
  
  const [currentDevice, setCurrentDevice] = useState('');
  const [currentAge, setCurrentAge] = useState('');
  const [currentEfficiency, setCurrentEfficiency] = useState<'A' | 'B' | 'C'>('A');
  const [currentKnownKwh, setCurrentKnownKwh] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddDevice = () => {
    if (!currentDevice || !currentAge) {
      toast({
        description: t('onboarding.devices.selectDeviceError'),
        variant: "destructive",
      });
      return;
    }
    
    const deviceInfo = deviceOptions.find(d => d.name === currentDevice);
    
    if (!deviceInfo) {
      toast({
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
      ...(currentKnownKwh ? { knownKwh: parseFloat(currentKnownKwh) } : {}),
      translationKey: deviceInfo.translationKey,
      categoryTranslationKey: deviceInfo.categoryTranslationKey,
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

  const handleSkip = () => {
    // Mark onboarding as skipped for this user
    if (user) {
      localStorage.setItem(`onboarding-${user.id}`, 'skipped');
    }
    onComplete();
  };

  const handleComplete = async () => {
    if (selectedDevices.length === 0) {
      toast({
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
          knownKwh: device.knownKwh,
          translationKey: deviceOptions.find(d => d.name === device.deviceName)?.translationKey || '',
          categoryTranslationKey: deviceOptions.find(d => d.name === device.deviceName)?.categoryTranslationKey || '',
        })
      );
      
      await Promise.all(promises);
      
      toast({
        description: t('onboarding.devices.devicesSaved'),
      });
    } catch (error) {
      console.error("Error saving devices:", error);
      toast({
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
              <Label htmlFor="knownKwh">{t('devices.knownKwhLabel')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="tooltip-trigger" aria-label="Help">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{t('devices.knownKwhHelp')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="knownKwh"
              type="number"
              value={currentKnownKwh}
              onChange={(e) => setCurrentKnownKwh(e.target.value)}
              min="0"
              step="0.01"
              placeholder={t('devices.knownKwhPlaceholder')}
              className="h-12"
            />
          </div>
          
          <Button 
            onClick={handleAddDevice}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? t('devices.adding') : t('devices.addButton')}
          </Button>
        </CardContent>
        
        {selectedDevices.length > 0 && (
          <CardFooter className="flex-col space-y-4 px-6 pb-6 pt-0">
            <h3 className="text-lg font-semibold w-full text-left">
              {t('onboarding.devices.yourDevicesTitle')}
            </h3>
            <div className="space-y-3 w-full">
              {selectedDevices.map((device, index) => {
                const deviceInfo = deviceOptions.find(d => d.name === device.deviceName);
                return (
                  <div key={index} className="flex items-center justify-between rounded-md bg-muted/50 p-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t(device.translationKey, { defaultValue: device.deviceName })}</p>
                      <p className="text-xs text-muted-foreground">{t(device.categoryTranslationKey, { defaultValue: deviceInfo?.type || 'Other' })}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => handleRemoveDevice(index)}
                    >
                      {t('onboarding.devices.removeButton')}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardFooter>
        )}
      </Card>
      
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={handleSkip}
          disabled={isLoading}
        >
          {t('common.skip', { defaultValue: 'Skip' })}
        </Button>
        <Button
          onClick={handleComplete}
          disabled={isLoading || selectedDevices.length === 0}
        >
          {isLoading ? t('onboarding.devices.savingButton') : t('onboarding.devices.continueButton')}
        </Button>
      </div>
    </div>
  );
};
