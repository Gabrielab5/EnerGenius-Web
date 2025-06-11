import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDevices } from '@/contexts/DeviceContext';
import { Device } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui-components/LoadingSpinner';
import { Plus } from 'lucide-react';
import { deviceOptions } from '@/lib/deviceOptions';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRTLStyles } from '@/hooks/useRTLStyles';

export const DeviceManagement = () => {
  const { devices, updateDevice, removeDevice, addDevice, isLoading, refreshDevices } = useDevices();
  const { t } = useLanguage();
  const rtl = useRTLStyles();
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deviceAge, setDeviceAge] = useState("");
  const [efficiencyRating, setEfficiencyRating] = useState<'A' | 'B' | 'C'>('A');
  const [knownKwh, setKnownKwh] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Add new device states
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState('');
  const [newDeviceAge, setNewDeviceAge] = useState('');
  const [newEfficiencyRating, setNewEfficiencyRating] = useState<'A' | 'B' | 'C'>('A');
  const [newKnownKwh, setNewKnownKwh] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleEditClick = (device: Device) => {
    setEditingDevice(device);
    setDeviceAge(device.age.toString());
    setEfficiencyRating(device.efficiencyRating);
    setKnownKwh(device.knownKwh?.toString() || '');
    setIsEditDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!editingDevice) return;
    
    await updateDevice(editingDevice.id, {
      age: parseInt(deviceAge),
      efficiencyRating,
      knownKwh: knownKwh ? parseFloat(knownKwh) : undefined
    });
    
    setIsEditDialogOpen(false);
    setEditingDevice(null);
    await refreshDevices();
  };

  const handleDeleteDevice = async (deviceId: string) => {
    await removeDevice(deviceId);
    await refreshDevices();
  };

  const handleAddDevice = async () => {
    if (!newDeviceName || !newDeviceType || !newDeviceAge) return;

    try {
      setIsAdding(true);
      
      const deviceInfo = deviceOptions.find(d => d.name === newDeviceName);
      
      if (!deviceInfo) return;
      
      await addDevice({
        name: newDeviceName,
        type: newDeviceType || deviceInfo.type,
        age: parseInt(newDeviceAge),
        efficiencyRating: newEfficiencyRating,
        powerConsumption: deviceInfo.powerConsumption,
        knownKwh: newKnownKwh ? parseFloat(newKnownKwh) : undefined
      });
      
      // Reset form
      setNewDeviceName('');
      setNewDeviceType('');
      setNewDeviceAge('');
      setNewEfficiencyRating('A');
      setNewKnownKwh('');
      setIsAddDialogOpen(false);
      
      // Refresh devices list
      await refreshDevices();
    } catch (error) {
      console.error("Error adding device:", error);
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={t('settings.loading')} />;
  }

  return (
    <div className="space-y-4">
      <div className={`flex ${rtl.conditionalClass('justify-start', 'justify-end')}`}>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="mb-2"
        >
          <Plus className={`h-4 w-4 ${rtl.iconSpacing}`} />
          {t('settings.devices.add')}
        </Button>
      </div>
      
      {devices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className={`text-muted-foreground mb-4 ${rtl.textAlign}`}>{t('settings.devices.noDevices')}</p>
            <p className={`text-sm text-center mb-4 ${rtl.textAlign}`}>
              {t('settings.devices.addDevicesHelp')}
            </p>
          </CardContent>
        </Card>
      ) : (
        devices.map(device => (
          <Card key={device.id}>
            <CardHeader className="py-4">
              <CardTitle className={`text-lg ${rtl.textAlign}`}>{device.name}</CardTitle>
              <CardDescription className={`text-muted-foreground ${rtl.textAlign}`}>
                {device.type} • {device.age} {t('settings.devices.yearsOld')} • {t('settings.devices.rating')}: {device.efficiencyRating}
                {device.knownKwh !== undefined && ` • ${t('settings.devices.knownKwh')}: ${device.knownKwh}`}
              </CardDescription>
            </CardHeader>
            <CardContent className={`pt-0 flex gap-2 ${rtl.conditionalClass('justify-start', 'justify-end')}`}>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEditClick(device)}
              >
                {t('common.edit')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-destructive hover:text-destructive/90"
                onClick={() => handleDeleteDevice(device.id)}
              >
                {t('common.remove')}
              </Button>
            </CardContent>
          </Card>
        ))
      )}
      
      {/* Edit Device Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className={rtl.textAlign}>
            <DialogTitle>{t('settings.devices.editDevice')}</DialogTitle>
            <DialogDescription>
              {t('settings.devices.updateInfo')} {editingDevice?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="age" className={rtl.textAlign}>{t('settings.devices.deviceAge')}</Label>
              <Input
                id="age"
                type="number"
                value={deviceAge}
                onChange={(e) => setDeviceAge(e.target.value)}
                min="0"
                max="50"
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rating" className={rtl.textAlign}>{t('settings.devices.efficiencyRating')}</Label>
              <Select
                value={efficiencyRating}
                onValueChange={(value) => setEfficiencyRating(value as 'A' | 'B' | 'C')}
              >
                <SelectTrigger id="rating" className="h-12">
                  <SelectValue placeholder={t('settings.devices.selectRating')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">{t('settings.devices.ratingA')}</SelectItem>
                  <SelectItem value="B">{t('settings.devices.ratingB')}</SelectItem>
                  <SelectItem value="C">{t('settings.devices.ratingC')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="knownKwh" className={rtl.textAlign}>{t('settings.devices.knownKwhOptional')}</Label>
              <Input
                id="knownKwh"
                type="number"
                value={knownKwh}
                onChange={(e) => setKnownKwh(e.target.value)}
                min="0"
                step="0.01"
                placeholder={t('settings.devices.enterKnownKwh')}
                className="h-12"
              />
            </div>
          </div>
          
          <DialogFooter className={rtl.conditionalClass('flex-row-reverse', 'flex-row')}>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveChanges}>{t('common.saveChanges')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Device Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className={rtl.textAlign}>
            <DialogTitle>{t('settings.devices.addNewDevice')}</DialogTitle>
            <DialogDescription>
              {t('settings.devices.enterDeviceInfo')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deviceName" className={rtl.textAlign}>{t('settings.devices.deviceType')}</Label>
              <Select
                value={newDeviceName}
                onValueChange={setNewDeviceName}
              >
                <SelectTrigger id="deviceName" className="h-12">
                  <SelectValue placeholder={t('settings.devices.selectDevice')} />
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
            
          </div>
          
          <DialogFooter className={rtl.conditionalClass('flex-row-reverse', 'flex-row')}>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleAddDevice}
              disabled={isAdding || !newDeviceName || !newDeviceAge}
            >
              {isAdding ? t('settings.devices.adding') : t('settings.devices.addDevice')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
