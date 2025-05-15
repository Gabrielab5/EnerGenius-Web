
import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui-components/PageHeader';
import { ConsumptionChart } from '@/components/dashboard/ConsumptionChart';
import { SavingTip } from '@/components/ui-components/SavingTip';
import { DeviceSummary } from '@/components/dashboard/DeviceSummary';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { createAIForecast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui-components/LoadingSpinner';
import { RefreshCw, Zap } from 'lucide-react';
import { HourlyConsumptionChart } from '@/components/dashboard/HourlyConsumptionChart';
import { InsightsList } from '@/components/dashboard/InsightsList';
import { Card, CardContent } from '@/components/ui/card';

const HomePage = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [hasForecast, setHasForecast] = useState(false);
  
  // Check if forecast exists in localStorage on component mount
  useEffect(() => {
    if (user) {
      const savedForecast = localStorage.getItem(`forecast-${user.id}`);
      if (savedForecast) {
        try {
          const parsedForecast = JSON.parse(savedForecast);
          setForecastData(parsedForecast);
          setHasForecast(true);
        } catch (error) {
          console.error('Error parsing saved forecast:', error);
        }
      }
    }
  }, [user]);

  const handleForecastRequest = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to use this feature.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      const response = await createAIForecast(user.id);
      
      if (response && response.success && response.forecast) {
        setForecastData(response.forecast);
        setHasForecast(true);
        
        // Save forecast to localStorage
        localStorage.setItem(`forecast-${user.id}`, JSON.stringify(response.forecast));
        
        toast({
          title: "Success",
          description: "AI forecast created successfully.",
        });
      } else {
        throw new Error("Invalid forecast data");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create AI forecast. Please try again later.",
        variant: "destructive",
      });
      console.error("AI Forecast error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mobile-page pb-20">
      <PageHeader 
        title="Electricity Dashboard" 
        description="Monitor and forecast your electricity consumption"
      />
      
      {hasForecast ? (
        <>
          <SavingTip />
          
          <div className="space-y-6">
            {forecastData && (
              <>
                <ConsumptionChart monthlyForecast={forecastData.forecast_monthly} />
                <HourlyConsumptionChart hourlyData={forecastData.forecast_hourly_avg} />
                <InsightsList 
                  insights={forecastData.insights} 
                  explanation={forecastData.explanation} 
                />
                <DeviceSummary />
              </>
            )}

            <div className="mt-6">
              <Button 
                onClick={handleForecastRequest} 
                disabled={isProcessing || !user}
                variant="outline"
                className="w-full"
                size="sm"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" /> Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" /> Regenerate Forecast
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[70vh] px-4">
          <Card className="w-full max-w-md bg-gradient-to-br from-blue-50 to-green-50 overflow-hidden relative border-blue-200">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-primary mb-2">Smart Energy Forecast</h2>
                <p className="text-muted-foreground">
                  Get personalized energy consumption forecasts and insights based on your device data.
                </p>
              </div>
              
              <Button 
                onClick={handleForecastRequest} 
                disabled={isProcessing || !user}
                size="lg"
                className="w-full text-lg py-6 group relative overflow-hidden"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="md" /> Creating your forecast...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                    <span>Create AI Forecast</span>
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent w-[200%] translate-x-[-100%] group-hover:translate-x-[50%] transition-transform duration-1000"></div>
              </Button>
              
              <p className="text-xs text-muted-foreground mt-6 text-center">
                The AI will analyze your device data and generate hourly, daily, and monthly forecasts.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HomePage;
