
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

export const DeviceManagement = () => {
  const { devices, updateDevice, removeDevice, addDevice, isLoading, refreshDevices } = useDevices();
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
    return <LoadingSpinner message="Loading devices..." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="mb-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Device
        </Button>
      </div>
      
      {devices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-app-gray-500 mb-4">No devices added yet.</p>
            <p className="text-sm text-center mb-4">
              Adding devices helps us generate accurate forecasts for your electricity consumption.
            </p>
          </CardContent>
        </Card>
      ) : (
        devices.map(device => (
          <Card key={device.id}>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">{device.name}</CardTitle>
              <CardDescription className="text-app-gray-500">
                {device.type} • {device.age} years old • Rating: {device.efficiencyRating}
                {device.knownKwh !== undefined && ` • Known kWh: ${device.knownKwh}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEditClick(device)}
              >
                Edit
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-destructive hover:text-destructive/90"
                onClick={() => handleDeleteDevice(device.id)}
              >
                Remove
              </Button>
            </CardContent>
          </Card>
        ))
      )}
      
      {/* Edit Device Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
            <DialogDescription>
              Update information about your {editingDevice?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="age">Device Age (years)</Label>
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
              <Label htmlFor="rating">Energy Efficiency Rating</Label>
              <Select
                value={efficiencyRating}
                onValueChange={(value) => setEfficiencyRating(value as 'A' | 'B' | 'C')}
              >
                <SelectTrigger id="rating" className="h-12">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A (Most Efficient)</SelectItem>
                  <SelectItem value="B">B (Medium Efficiency)</SelectItem>
                  <SelectItem value="C">C (Least Efficient)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="knownKwh">Known kWh (Optional)</Label>
              <Input
                id="knownKwh"
                type="number"
                value={knownKwh}
                onChange={(e) => setKnownKwh(e.target.value)}
                min="0"
                step="0.01"
                placeholder="Enter known kWh if available"
                className="h-12"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Device Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
            <DialogDescription>
              Enter information about your electrical device
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deviceName">Device Type</Label>
              <Select
                value={newDeviceName}
                onValueChange={setNewDeviceName}
              >
                <SelectTrigger id="deviceName" className="h-12">
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
              <Label htmlFor="deviceType">Device Category</Label>
              <Select
                value={newDeviceType}
                onValueChange={setNewDeviceType}
              >
                <SelectTrigger id="deviceType" className="h-12">
                  <SelectValue placeholder="Select device category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Large Appliance">Large Appliance</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Climate Control">Climate Control</SelectItem>
                  <SelectItem value="Kitchen Appliance">Kitchen Appliance</SelectItem>
                  <SelectItem value="Lighting">Lighting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deviceAge">Device Age (years)</Label>
              <Select
                value={newDeviceAge}
                onValueChange={setNewDeviceAge}
              >
                <SelectTrigger id="deviceAge" className="h-12">
                  <SelectValue placeholder="Select device age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 year</SelectItem>
                  <SelectItem value="2">2 years</SelectItem>
                  <SelectItem value="3">3 years</SelectItem>
                  <SelectItem value="4">4 years</SelectItem>
                  <SelectItem value="5">5 years</SelectItem>
                  <SelectItem value="6">6+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deviceEfficiency">Energy Efficiency Rating</Label>
              <Select
                value={newEfficiencyRating}
                onValueChange={(value) => setNewEfficiencyRating(value as 'A' | 'B' | 'C')}
              >
                <SelectTrigger id="deviceEfficiency" className="h-12">
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
              <Label htmlFor="deviceKnownKwh">Known kWh (Optional)</Label>
              <Input
                id="deviceKnownKwh"
                type="number"
                value={newKnownKwh}
                onChange={(e) => setNewKnownKwh(e.target.value)}
                min="0"
                step="0.01"
                placeholder="Enter known kWh if available"
                className="h-12"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddDevice}
              disabled={isAdding || !newDeviceName || !newDeviceAge}
            >
              {isAdding ? 'Adding...' : 'Add Device'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
