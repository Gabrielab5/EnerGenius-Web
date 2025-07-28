import React from 'react';
import { usePerformance } from '@/hooks/usePerformance';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer = ({ children }: AppInitializerProps) => {
  usePerformance();
  
  return <>{children}</>;
};