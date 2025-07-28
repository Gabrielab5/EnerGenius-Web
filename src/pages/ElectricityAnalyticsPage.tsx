
import React from 'react';
import { PageHeader } from '@/components/ui-components/PageHeader';
import { LoadingSpinner } from '@/components/ui-components/LoadingSpinner';
import { useElectricityData } from '@/hooks/useElectricityData';
import { DailyConsumptionChart } from '@/components/dashboard/DailyConsumptionChart';
import { MonthlyOverviewChart } from '@/components/dashboard/MonthlyOverviewChart';
import { ElectricityStats } from '@/components/dashboard/ElectricityStats';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ElectricityAnalyticsPage = () => {
  const { electricityData, isLoading, error } = useElectricityData();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="mobile-page flex items-center justify-center h-[70vh]">
        <LoadingSpinner size="lg" message="Loading electricity data..." />
      </div>
    );
  }

  if (error || !electricityData) {
    return (
      <div className="mobile-page">
        <PageHeader 
          title={t('analytics.page.title')} 
          description={t('analytics.page.description')}
        />
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('analytics.error.noData')}</h3>
            <p className="text-muted-foreground text-center">
              {error || t('analytics.error.message')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mobile-page pb-20">
      <PageHeader 
        title={t('analytics.page.title')} 
        description={t('analytics.page.description')}
      />
      
      <div className="space-y-6">
        {/* Statistics Overview */}
        <ElectricityStats data={electricityData} isLoading={isLoading} />
        
        {/* Monthly Overview Chart */}
        <MonthlyOverviewChart monthlyTotals={electricityData.monthly_totals} />
        
        {/* Daily Consumption Chart with Month Selection */}
        <DailyConsumptionChart dailyTotals={electricityData.daily_totals} />
      </div>
    </div>
  );
};

export default ElectricityAnalyticsPage;
