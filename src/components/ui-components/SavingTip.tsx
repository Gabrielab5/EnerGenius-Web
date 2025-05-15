
import React, { useState, useEffect } from 'react';
import { SavingTip as SavingTipType } from '@/types';

const tips: SavingTipType[] = [
  { id: 1, text: "Unplug electronics when not in use to save on standby power consumption." },
  { id: 2, text: "Replace old incandescent bulbs with LED bulbs to reduce lighting costs by up to 80%." },
  { id: 3, text: "Set your refrigerator to the optimal temperature: 3-5°C (37-41°F)." },
  { id: 4, text: "Use ceiling fans instead of air conditioning when possible." },
  { id: 5, text: "Wash clothes in cold water to save on water heating costs." },
  { id: 6, text: "Make sure to fully load your dishwasher before running it." },
  { id: 7, text: "Use power strips to easily turn off multiple devices at once." },
  { id: 8, text: "Air-dry clothes when possible instead of using a dryer." },
];

export const SavingTip = () => {
  const [currentTip, setCurrentTip] = useState<SavingTipType | null>(null);
  
  useEffect(() => {
    // Select a random tip initially
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentTip(randomTip);
    
    // Rotate tips every 10 seconds
    const interval = setInterval(() => {
      const nextTip = tips[Math.floor(Math.random() * tips.length)];
      setCurrentTip(nextTip);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!currentTip) return null;
  
  return (
    <div className="bg-app-green-100 border-l-4 border-app-green-500 p-4 rounded-md mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-app-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-app-green-700 font-medium">Saving Tip</p>
          <p className="mt-1 text-sm text-app-green-600">{currentTip.text}</p>
        </div>
      </div>
    </div>
  );
};
