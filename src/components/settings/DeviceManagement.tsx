
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
import { deviceOptions, ageOptions } from '@/lib/deviceOptions';
import { useLanguage } from '@/contexts/LanguageContext';

export const DeviceManagement = () => {
  const { devices, updateDevice, removeDevice, addDevice, isLoading, refreshDevices } = useDevices();
  const { t } = useLanguage();
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
        knownKwh: newKnownKwh ? parseFloat(newKnownKwh) : undefined,
        translationKey: deviceInfo.translationKey,
        categoryTranslationKey: deviceInfo.categoryTranslationKey,
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
    return <LoadingSpinner message={t('devices.loadingDevices')} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="mb-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('devices.addNew')}
        </Button>
      </div>
      
      {devices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-app-gray-500 mb-4">{t('devices.noDevices')}</p>
            <p className="text-sm text-center mb-4">
              {t('devices.addDevicesHelpText')}
            </p>
          </CardContent>
        </Card>
      ) : (
        devices.map(device => (
          <Card key={device.id}>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">{t(device.translationKey, { defaultValue: device.name })}</CardTitle>
              <CardDescription className="text-app-gray-500">
                {t(device.categoryTranslationKey, { defaultValue: device.type })} • {device.age} {t('devices.years')} {t('devices.old')} • {t('devices.rating')}: {device.efficiencyRating}
                {device.knownKwh !== undefined && ` • ${t('devices.knownKwhLabel')}: ${device.knownKwh}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEditClick(device)}
              >
                {t('devices.edit')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-destructive hover:text-destructive/90"
                onClick={() => handleDeleteDevice(device.id)}
              >
                {t('devices.remove')}
              </Button>
            </CardContent>
          </Card>
        ))
      )}
      
      {/* Edit Device Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('devices.editDeviceTitle')}</DialogTitle>
            <DialogDescription>
              {t('devices.editDeviceDescription', { deviceName: t(editingDevice?.translationKey || '', { defaultValue: editingDevice?.name }) })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="age">{t('devices.ageLabel')}</Label>
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
              <Label htmlFor="rating">{t('devices.efficiencyLabel')}</Label>
              <Select
                value={efficiencyRating}
                onValueChange={(value) => setEfficiencyRating(value as 'A' | 'B' | 'C')}
              >
                <SelectTrigger id="rating" className="h-12">
                  <SelectValue placeholder={t('devices.selectRatingPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">{t('devices.efficiency.A')}</SelectItem>
                  <SelectItem value="B">{t('devices.efficiency.B')}</SelectItem>
                  <SelectItem value="C">{t('devices.efficiency.C')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="knownKwh">{t('devices.knownKwhLabel')}</Label>
              <Input
                id="knownKwh"
                type="number"
                value={knownKwh}
                onChange={(e) => setKnownKwh(e.target.value)}
                min="0"
                step="0.01"
                placeholder={t('devices.knownKwhPlaceholder')}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" onClick={handleSaveChanges}>{t('devices.saveChanges')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Device Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('devices.addNewDeviceTitle')}</DialogTitle>
            <DialogDescription>{t('devices.addNewDeviceDescription')}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newDeviceName">{t('devices.typeLabel')}</Label>
              <Select value={newDeviceName} onValueChange={setNewDeviceName}>
                <SelectTrigger id="newDeviceName" className="h-12">
                  <SelectValue placeholder={t('devices.selectDevicePlaceholder')} />
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
              <Label htmlFor="newDeviceAge">{t('devices.ageLabel')}</Label>
              <Input
                id="newDeviceAge"
                type="number"
                value={newDeviceAge}
                onChange={(e) => setNewDeviceAge(e.target.value)}
                min="0"
                max="50"
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newEfficiencyRating">{t('devices.efficiencyLabel')}</Label>
              <Select
                value={newEfficiencyRating}
                onValueChange={(value) => setNewEfficiencyRating(value as 'A' | 'B' | 'C')}
              >
                <SelectTrigger id="newEfficiencyRating" className="h-12">
                  <SelectValue placeholder={t('devices.selectRatingPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">{t('devices.efficiency.A')}</SelectItem>
                  <SelectItem value="B">{t('devices.efficiency.B')}</SelectItem>
                  <SelectItem value="C">{t('devices.efficiency.C')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newKnownKwh">{t('devices.knownKwhLabel')}</Label>
              <Input
                id="newKnownKwh"
                type="number"
                value={newKnownKwh}
                onChange={(e) => setNewKnownKwh(e.target.value)}
                min="0"
                step="0.01"
                placeholder={t('devices.knownKwhPlaceholder')}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" onClick={handleAddDevice} disabled={isAdding}>
              {isAdding ? t('devices.adding') : t('devices.addDeviceButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
