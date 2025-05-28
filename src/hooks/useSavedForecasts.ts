
import { useState, useEffect } from 'react';
import { collection, doc, getDocs, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { ForecastScenario } from '@/types/forecast';
import { toast } from '@/hooks/use-toast';

export const useSavedForecasts = () => {
  const [forecasts, setForecasts] = useState<ForecastScenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchForecasts = async () => {
    if (!user) {
      setForecasts([]);
      return;
    }

    try {
      setIsLoading(true);
      const forecastsRef = collection(doc(db, "users", user.id), "forecasts");
      const q = query(forecastsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const fetchedForecasts: ForecastScenario[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedForecasts.push({
          id: doc.id,
          name: data.name,
          devices: data.devices,
          projections: data.projections,
          createdAt: data.createdAt
        });
      });
      
      setForecasts(fetchedForecasts);
    } catch (error) {
      console.error('Error fetching forecasts:', error);
      toast({
        title: "Error",
        description: "Failed to load saved forecasts.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteForecast = async (forecastId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, "users", user.id, "forecasts", forecastId));
      setForecasts(prev => prev.filter(f => f.id !== forecastId));
      toast({
        title: "Success",
        description: "Forecast deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting forecast:', error);
      toast({
        title: "Error",
        description: "Failed to delete forecast.",
        variant: "destructive",
      });
    }
  };

  const refreshForecasts = () => {
    fetchForecasts();
  };

  useEffect(() => {
    fetchForecasts();
  }, [user]);

  return {
    forecasts,
    isLoading,
    fetchForecasts,
    deleteForecast,
    refreshForecasts,
    hasForecasts: forecasts.length > 0
  };
};
