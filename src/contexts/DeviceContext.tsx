import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Device } from '@/types';
import { auth, db } from '@/lib/firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { deviceOptions } from '@/lib/deviceOptions';

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
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchDevices = async () => {
    if (!user) {
      // Try to load from local storage if no user
      const savedDevices = localStorage.getItem('devices');
      if (savedDevices) {
        try {
          const parsedDevices = JSON.parse(savedDevices);
          if (Array.isArray(parsedDevices)) {
            setDevices(parsedDevices);
          }
        } catch (parseError) {
          console.error('Failed to parse devices from localStorage:', parseError);
          setDevices([]);
        }
      }
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
        const deviceInfo = deviceOptions.find(d => d.name === deviceData.name);
        fetchedDevices.push({
          id: doc.id,
          name: deviceData.name,
          type: deviceData.type,
          age: deviceData.age,
          efficiencyRating: deviceData.efficiencyRating,
          powerConsumption: deviceData.powerConsumption,
          knownKwh: deviceData.knownKwh,
          translationKey: deviceInfo?.translationKey || deviceData.translationKey || '',
          categoryTranslationKey: deviceInfo?.categoryTranslationKey || deviceData.categoryTranslationKey || '',
        });
      });
      
      setDevices(fetchedDevices);
      localStorage.setItem('devices', JSON.stringify(fetchedDevices));
    } catch (error) {
      console.error("Error fetching devices:", error);
      toast({
        description: t('notifications.device.loadError'),
        variant: "destructive",
      });
      
      // Try to load from local storage if Firebase fetch fails
      const savedDevices = localStorage.getItem('devices');
      if (savedDevices) {
        try {
          const parsedDevices = JSON.parse(savedDevices);
          if (Array.isArray(parsedDevices)) {
            setDevices(parsedDevices);
          }
        } catch (parseError) {
          console.error('Failed to parse fallback devices from localStorage:', parseError);
          setDevices([]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const loadDevices = async () => {
      try {
        await fetchDevices();
      } catch (error) {
        console.error("Error loading devices:", error);
      }
    };

    if (isMounted) {
      loadDevices();
    }

    return () => {
      isMounted = false;
      abortController.abort();
    };
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
          description: t('notifications.device.addedDescription', { deviceName: device.name }),
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
        translationKey: device.translationKey,
        categoryTranslationKey: device.categoryTranslationKey,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(userDevicesRef, deviceDoc);
      
      const newDevice: Device = {
        id: docRef.id,
        ...device
      };
      
      setDevices(prevDevices => [newDevice, ...prevDevices]);
      localStorage.setItem('devices', JSON.stringify([newDevice, ...devices]));
      
      toast({
        description: t('notifications.device.addedDescription', { deviceName: device.name }),
      });
    } catch (error) {
      console.error("Error adding device:", error);
      toast({
        description: t('notifications.device.addError'),
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateDevice = async (id: string, updates: Partial<Device>) => {
    try {
      setDevices(prevDevices => 
        prevDevices.map(device => 
          device.id === id ? { ...device, ...updates } : device
        )
      );
      
      if (user) {
        // Update in Firestore
        const deviceDocRef = doc(db, "users", user.id, "devices", id);
        await updateDoc(deviceDocRef, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
        
        // Update local storage after successful Firestore update
        const updatedDevices = devices.map(device => 
          device.id === id ? { ...device, ...updates } : device
        );
        localStorage.setItem('devices', JSON.stringify(updatedDevices));
      }
      
      toast({
        description: t('notifications.device.updatedDescription'),
      });
    } catch (error) {
      console.error("Error updating device:", error);
      toast({
        description: t('notifications.device.updateError'),
        variant: "destructive",
      });
      // Revert changes locally
      await fetchDevices();
      throw error;
    }
  };

  const removeDevice = async (id: string) => {
    try {
      const deviceToRemove = devices.find(device => device.id === id);
      setDevices(prevDevices => prevDevices.filter(device => device.id !== id));
      
      if (user) {
        // Remove from Firestore
        const deviceDocRef = doc(db, "users", user.id, "devices", id);
        await deleteDoc(deviceDocRef);
        
        // Update local storage after successful Firestore deletion
        const updatedDevices = devices.filter(device => device.id !== id);
        localStorage.setItem('devices', JSON.stringify(updatedDevices));
      }
      
      if (deviceToRemove) {
        toast({
          description: t('notifications.device.removedDescription'),
        });
      }
    } catch (error) {
      console.error("Error removing device:", error);
      toast({
        description: t('notifications.device.removeError'),
        variant: "destructive",
      });
      // Revert changes locally
      await fetchDevices();
      throw error;
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
