
import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui-components/PageHeader';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { analyzeElectricityData, getElectricityTips, fetchElectricityTipsFromFirestore } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui-components/LoadingSpinner';
import { Lightbulb, TrendingUp, History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useElectricityData } from '@/hooks/useElectricityData';
import { ElectricityStats } from '@/components/dashboard/ElectricityStats';
import { MonthlyOverviewChart } from '@/components/dashboard/MonthlyOverviewChart';
import { DailyConsumptionChart } from '@/components/dashboard/DailyConsumptionChart';
import { ElectricityTips } from '@/components/dashboard/ElectricityTips';
import { DeviceForecastDialog } from '@/components/forecast/DeviceForecastDialog';
import { ForecastHistoryDialog } from '@/components/forecast/ForecastHistoryDialog';
import { useSavedForecasts } from '@/hooks/useSavedForecasts';

const HomePage = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [tips, setTips] = useState(null);
  const [loadingTips, setLoadingTips] = useState(false);
  const [generatingNewTips, setGeneratingNewTips] = useState(false);
  const [forecastDialogOpen, setForecastDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  
  // Use the electricity data hook
  const { electricityData, isLoading, error } = useElectricityData();
  
  // Use saved forecasts hook
  const { hasForecasts, refreshForecasts } = useSavedForecasts();
  
  // Check if electricity data exists on component mount
  useEffect(() => {
    setIsFetching(isLoading);
  }, [isLoading]);

  // Fetch tips when electricity data, user, or language changes
  useEffect(() => {
    const fetchTips = async () => {
      if (electricityData && user) {
        try {
          setLoadingTips(true);
          console.log("Fetching tips for language:", language);
          
          try {
            // Try to fetch tips from API first
            const tipsResponse = await getElectricityTips(user.id, language);
            if (tipsResponse && tipsResponse.success && tipsResponse.tips) {
              setTips(tipsResponse.tips);
              console.log("✅ Loaded tips from API for language:", language);
              return;
            }
          } catch (apiError) {
            console.log("❌ API failed, trying Firestore fallback:", apiError.message);
            
            // If API fails, try Firestore fallback
            const existingTips = await fetchElectricityTipsFromFirestore(user.id);
            if (existingTips && existingTips.tips) {
              setTips(existingTips.tips);
              console.log("✅ Loaded cached tips from Firestore");
              toast({
                description: "Using cached tips - API temporarily unavailable",
                variant: "default",
              });
              return;
            }
          }

           // If both API and Firestore fail, show no tips
          setTips(null);
          console.log("⚠️ No tips available from API or Firestore");

        } catch (error) {
          console.error('Failed to fetch tips:', error);
          setTips(null);
        } finally {
          setLoadingTips(false);
        }
      }
    };
    fetchTips();
  }, [electricityData, user, language, toast]);

  const handleAnalysisRequest = async () => {
    if (!user) {
      toast({
        description: t('home.loginRequired'),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Call the electrical calculation endpoint
      const analysisResponse = await analyzeElectricityData(user.id);
      
      if (analysisResponse.success) {
        // After successful analysis, generate tips
        try {
          const tipsResponse = await getElectricityTips(user.id, language);
          
          if (tipsResponse.success) {
            setTips(tipsResponse.tips);
            console.log("Generated new tips after analysis");
          }
        } catch (tipsError) {
          console.error("Failed to generate tips after analysis:", tipsError);
          // Don't show error to user as analysis was successful
        }

        toast({
          description: t('home.analysisSuccess'),
        });
        
        // Refresh the page to show the new data
        window.location.reload();
      } else {
        throw new Error("Analysis failed");
      }
    } catch (error) {
      toast({
        description: t('home.analysisError'),
        variant: "destructive",
      });
      console.error("Electricity analysis error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateNewTips = async () => {
    if (!user) {
      toast({
        description: t('home.loginRequired'),
        variant: "destructive",
      });
      return;
    }

    try {
      setGeneratingNewTips(true);
      toast({
        description: t('home.generatingTips'),
      });
      
    try {
        const tipsResponse = await getElectricityTips(user.id, language);
        
        if (tipsResponse && tipsResponse.success && tipsResponse.tips) {
          setTips(tipsResponse.tips);
          toast({
            description: t('home.tipsSuccess'),
          });
        } else {
          throw new Error("API returned unsuccessful response");
        }
      } catch (apiError) {
        console.error("API failed, trying Firestore fallback:", apiError);
        
         // Check if error is due to API returning HTML (service down)
        const isApiDown = apiError.message.includes('HTML instead of JSON') || apiError.message.includes('service may be down');

        // Try to get existing tips from Firestore as fallback
        const existingTips = await fetchElectricityTipsFromFirestore(user.id);
        if (existingTips && existingTips.tips) {
          setTips(existingTips.tips);
           if (isApiDown) {
            toast({
              description: "Tips service is temporarily unavailable. Showing your last generated tips.",
              variant: "default",
            });
          } else {
            toast({
              description: "API unavailable - showing cached tips instead",
              variant: "default",
            });
          }
        } else {
          throw new Error("No tips available from API or cache");
        }
      }
    } catch (error) {
      console.error("Failed to generate new tips:", error);
      
      let errorMessage = t('home.tipsError');
      if (error.message.includes('HTML') || error.message.includes('service may be down')) {
        errorMessage = "Tips service is temporarily unavailable. Please try again later.";
      } else if (error.message.includes('timeout') || error.message.includes('AbortError')) {
        errorMessage = "Request timed out. Please check your connection and try again.";
      }
      
      toast({
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setGeneratingNewTips(false);
    }
  };

  // Show loading spinner while checking for existing data
  if (isFetching) {
    return (
      <div className="mobile-page flex items-center justify-center h-[70vh]">
        <LoadingSpinner size="lg" message={t('home.loadingData')} />
      </div>
    );
  }

  // If we have electricity data, show the analytics dashboard
  if (electricityData && !error) {
    return (
      <div className="mobile-page pb-20">
        <PageHeader 
          title={t('home.analyticsTitle')} 
          description={t('home.analyticsDescription')}
        />
        
        {/* Main Forecast Action Buttons - Moved to top */}
        <div className="space-y-3 mb-4 sm:mb-6">
          {/* Generate Device Forecast Button - Primary Green */}
          <Button 
            onClick={() => setForecastDialogOpen(true)} 
            disabled={!user}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <TrendingUp className="h-5 w-5 mr-2" /> {t('home.generateForecast')}
          </Button>
          
          {/* View Previous Forecasts Button - Secondary Green */}
          {hasForecasts && (
            <Button 
              onClick={() => setHistoryDialogOpen(true)} 
              disabled={!user}
              variant="outline"
              className="w-full border-green-600 text-green-600 hover:bg-green-50"
              size="lg"
            >
              <History className="h-5 w-5 mr-2" /> {t('home.viewPreviousForecasts')}
            </Button>
          )}
        </div>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Monthly Overview Chart */}
          <MonthlyOverviewChart monthlyTotals={electricityData.monthly_totals} />
          
          {/* Daily Consumption Chart with Month Selection */}
          <DailyConsumptionChart dailyTotals={electricityData.daily_totals} />
          
          {/* Electricity Tips */}
          {loadingTips && (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <LoadingSpinner size="md" message={t('home.loadingTips')} />
              </CardContent>
            </Card>
          )}
          
          {tips && !loadingTips && (
            <ElectricityTips tips={tips} />
          )}
          
          {/* Statistics Overview */}
          <ElectricityStats data={electricityData} isLoading={isLoading} />
          
          {/* Secondary Action Buttons */}
          <div className="space-y-3">
            {/* Generate New Tips Button */}
            <Button 
              onClick={handleGenerateNewTips} 
              disabled={generatingNewTips || !user}
              variant="outline"
              className="w-full"
              size="sm"
            >
              {generatingNewTips ? (
                <>
                  <LoadingSpinner size="sm" /> {t('home.generatingTips')}
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" /> {t('home.generateNewTips')}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Device Forecast Dialog */}
        <DeviceForecastDialog 
          open={forecastDialogOpen}
          onOpenChange={setForecastDialogOpen}
          onForecastSaved={refreshForecasts}
        />

        {/* Forecast History Dialog */}
        <ForecastHistoryDialog 
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
        />
      </div>
    );
  }

  // If no data exists, show the initial analysis prompt
  return (
    <div className="mobile-page pb-20">
      <PageHeader 
        title={t('home.dashboardTitle')} 
        description={t('home.dashboardDescription')}
      />
      
      <div className="flex flex-col items-center justify-center h-[70vh] px-4">
        <Card className="w-full max-w-md bg-gradient-to-br from-blue-50 to-green-50 overflow-hidden relative border-blue-200">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-primary mb-2">{t('home.smartAnalyticsTitle')}</h2>
              <p className="text-muted-foreground">
                {t('home.smartAnalyticsDescription')}
              </p>
            </div>
            
            <Button 
              onClick={handleAnalysisRequest} 
              disabled={isProcessing || !user}
              size="lg"
              className="w-full text-lg py-6 group relative overflow-hidden"
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="md" /> {t('home.analyzingProgress')}
                </>
              ) : (
                <>
                  <Lightbulb className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                  <span>{t('home.analyzeButton')}</span>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent w-[200%] translate-x-[-100%] group-hover:translate-x-[50%] transition-transform duration-1000"></div>
            </Button>
            
            <p className="text-xs text-muted-foreground mt-6 text-center">
              {t('home.analysisNote')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
