
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ElectricityData } from '@/types';

export const useElectricityData = () => {
  const { user } = useAuth();
  const [electricityData, setElectricityData] = useState<ElectricityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchElectricityData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const docRef = doc(db, 'users', user.id, 'results', 'averageresults');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as ElectricityData;
          setElectricityData(data);
        } else {
          setError('No electricity data found');
        }
      } catch (err) {
        console.error('Error fetching electricity data:', err);
        setError('Failed to fetch electricity data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchElectricityData();
  }, [user]);

  return { electricityData, isLoading, error };
};
