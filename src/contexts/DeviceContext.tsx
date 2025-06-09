
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Device } from '@/types';
import { auth, db } from '@/lib/firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface DeviceContextType {
  devices: Device[];
  addDevice: (device: Omit<Device, 'id'>) => Promise<void>;
  updateDevice: (id: string, updates: Partial<Device>) => Promise<void>;
  removeDevice: (id: string) => Promise<void>;
  isLoading: boolean;
  refreshDevices: () => Promise<void>;
}

const DeviceContext = createContext<DeviceContextType | null>(null);

export const useDevices = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevices must be used within a DeviceProvider');
  }
  return context;
};

export const DeviceProvider = ({ children }: { children: React.ReactNode }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchDevices = async () => {
    if (!user) {
      // If no user is logged in, use local storage or defaults
      const savedDevices = localStorage.getItem('devices');
      if (savedDevices) {
        try {
        const parsedDevices = JSON.parse(savedDevices);
        if (Array.isArray(parsedDevices)) {
          setDevices(parsedDevices);
        } else {
          setDevices([]); 
        }
      } catch (e) {
        console.error("Failed to parse devices from localStorage", e);
        setDevices([]); 
      }
      } else {
        // Set to empty array as we're now using real data
        setDevices([]);
      }
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const userDevicesRef = collection(doc(db, "users", user.id), "devices");
      const q = query(userDevicesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const fetchedDevices: Device[] = [];
      querySnapshot.forEach((doc) => {
        const deviceData = doc.data();
        fetchedDevices.push({
          id: doc.id,
          name: deviceData.name,
          type: deviceData.type,
          age: deviceData.age,
          efficiencyRating: deviceData.efficiencyRating,
          powerConsumption: deviceData.powerConsumption,
          knownKwh: deviceData.knownKwh,
        });
      });
      
      setDevices(fetchedDevices);
      
      // Also store in local storage for offline access
      localStorage.setItem('devices', JSON.stringify(fetchedDevices));
    } catch (error) {
      console.error("Error fetching devices:", error);
      toast({
        title: "Error",
        description: "Failed to load your devices.",
        variant: "destructive",
      });
      
      // Try to load from local storage if Firebase fetch fails
      const savedDevices = localStorage.getItem('devices');
      if (savedDevices) {
        setDevices(JSON.parse(savedDevices));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [user]);

  const addDevice = async (device: Omit<Device, 'id'>) => {
    try {
      if (!user) {
        // Handle local-only storage if no user
        const newDevice = {
          ...device,
          id: Math.random().toString(36).substring(2, 9)
        };
        const updatedDevices = [...devices, newDevice];
        setDevices(updatedDevices);
        localStorage.setItem('devices', JSON.stringify(updatedDevices));
        toast({
          title: "Device added",
          description: `${device.name} has been added successfully.`,
        });
        return;
      }

      // Add to Firestore
      const userDevicesRef = collection(doc(db, "users", user.id), "devices");
      const deviceDoc = {
        name: device.name,
        type: device.type,
        age: device.age,
        efficiencyRating: device.efficiencyRating,
        powerConsumption: device.powerConsumption,
        knownKwh: device.knownKwh,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(userDevicesRef, deviceDoc);
      
      const newDevice: Device = {
        id: docRef.id,
        ...device
      };
      
      setDevices([newDevice, ...devices]);
      localStorage.setItem('devices', JSON.stringify([newDevice, ...devices]));
      
      toast({
        title: "Device added",
        description: `${device.name} has been added successfully.`,
      });
    } catch (error) {
      console.error("Error adding device:", error);
      toast({
        title: "Error",
        description: "Failed to add device. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateDevice = async (id: string, updates: Partial<Device>) => {
    try {
      const updatedDevices = devices.map(device => 
        device.id === id ? { ...device, ...updates } : device
      );
      
      setDevices(updatedDevices);
      localStorage.setItem('devices', JSON.stringify(updatedDevices));
      
      if (user) {
        // Update in Firestore
        const deviceDocRef = doc(db, "users", user.id, "devices", id);
        await updateDoc(deviceDocRef, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
      }
      
      toast({
        title: "Device updated",
        description: "Device information has been updated.",
      });
    } catch (error) {
      console.error("Error updating device:", error);
      toast({
        title: "Error",
        description: "Failed to update device. Please try again.",
        variant: "destructive",
      });
      // Revert changes locally
      await fetchDevices();
    }
  };

  const removeDevice = async (id: string) => {
    try {
      const deviceToRemove = devices.find(device => device.id === id);
      const updatedDevices = devices.filter(device => device.id !== id);
      
      setDevices(updatedDevices);
      localStorage.setItem('devices', JSON.stringify(updatedDevices));
      
      if (user) {
        // Remove from Firestore
        const deviceDocRef = doc(db, "users", user.id, "devices", id);
        await deleteDoc(deviceDocRef);
      }
      
      if (deviceToRemove) {
        toast({
          title: "Device removed",
          description: `${deviceToRemove.name} has been removed.`,
        });
      }
    } catch (error) {
      console.error("Error removing device:", error);
      toast({
        title: "Error",
        description: "Failed to remove device. Please try again.",
        variant: "destructive",
      });
      // Revert changes locally
      await fetchDevices();
    }
  };
  
  const refreshDevices = async () => {
    await fetchDevices();
  };

  return (
    <DeviceContext.Provider
      value={{
        devices,
        addDevice,
        updateDevice,
        removeDevice,
        isLoading,
        refreshDevices
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};
