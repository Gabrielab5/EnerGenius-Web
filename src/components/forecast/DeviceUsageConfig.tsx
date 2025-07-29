import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ForecastDevice } from '@/types/forecast';
import { Device } from '@/types';
import { Plus, Trash2, HelpCircle} from 'lucide-react';
import { deviceOptions, deviceRanges } from '@/lib/deviceOptions';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DeviceUsageConfigProps {
  devices: ForecastDevice[];
  availableDevices: Device[];
  onDeviceUpdate: (deviceId: string, updates: Partial<ForecastDevice>) => void;
  onRemoveDevice: (deviceId: string) => void;
  onAddDevice: (device: Device) => void;
  showUsageControls?: boolean;
  showAddDevice?: boolean;
}

export const DeviceUsageConfig = ({
  devices,
  availableDevices,
  onDeviceUpdate,
  onRemoveDevice,
  onAddDevice,
  showUsageControls = false,
  showAddDevice = true
}: DeviceUsageConfigProps) => {
  const { t } = useLanguage();
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
      powerConsumption: deviceInfo.powerConsumption,
      translationKey: deviceInfo.translationKey,
      categoryTranslationKey: deviceInfo.categoryTranslationKey,
    };

    onAddDevice(newDevice);
    toast({
      description: `${t(deviceInfo.translationKey)} added! Now you're welcome to configure it.`,
    });
    setSelectedDeviceToAdd('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h3 className="text-lg font-semibold">
          {showUsageControls ? t('forecast.deviceUsage.configureUsagePatterns') : t('forecast.deviceUsage.reviewModifyDevices')}
        </h3>
        
        {showAddDevice && (
        <div className="flex items-center gap-2">
          <Select value={selectedDeviceToAdd} onValueChange={setSelectedDeviceToAdd}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t('devices.addNew')} />
            </SelectTrigger>
            <SelectContent>
              {deviceOptions.map((device) => (
                <SelectItem key={device.name} value={device.name}>
                  {t(device.translationKey)}
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
        )}
      </div>
      
      {devices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">{t('forecast.deviceUsage.noDevicesSelectedForForecast')}</p>
            <p className="text-sm text-center">{t('forecast.deviceUsage.addDevicesUsingDropdownAboveToStartCreatingYourForecast')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {devices.map((device) => (
            <Card key={device.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base">{t(device.translationKey)} ({device.name})</CardTitle>
                    <CardDescription className="text-sm">
                      {t(device.categoryTranslationKey)} ({device.type}) • {device.powerConsumption}W • Rating: {device.efficiencyRating}
                      {device.knownKwh && ` • ${t('devices.knownKwhLabel')}: ${device.knownKwh}`}
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
                      <Label className="text-sm font-medium">{t('forecast.deviceUsage.hoursPerDay')}</Label>
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
                          {device.usage.hoursPerDay} {t('forecast.deviceUsage.hoursPerDayUnit')}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">{t('forecast.deviceUsage.daysPerWeek')}</Label>
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
                          {device.usage.daysPerWeek} {t('forecast.deviceUsage.daysPerWeekUnit')}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">{t('forecast.deviceUsage.deviceAge')}</Label>
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
                        <Label className="text-sm font-medium">{t('forecast.deviceUsage.efficiencyRating')}</Label>
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
                            <SelectItem value="A">{t('forecast.deviceUsage.a')}</SelectItem>
                            <SelectItem value="B">{t('forecast.deviceUsage.b')}</SelectItem>
                            <SelectItem value="C">{t('forecast.deviceUsage.c')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <Label className="text-sm font-medium">{t('forecast.deviceUsage.powerConsumption')}</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="text-muted-foreground hover:text-foreground">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  {deviceRanges[device.name as keyof typeof deviceRanges]?.powerRange || 'Typical range varies by model'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
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
                        <div className="flex items-center gap-1">
                          <Label className="text-sm font-medium">{t('forecast.deviceUsage.knownKwh')}</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="text-muted-foreground hover:text-foreground">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  {deviceRanges[device.name as keyof typeof deviceRanges]?.kwhRange || 'Typical usage varies by frequency'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
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
                          placeholder={t('forecast.deviceUsage.enterKnownKwh')}
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
