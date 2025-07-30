import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSavedForecasts } from '@/hooks/useSavedForecasts';
import { ForecastCard } from './ForecastCard';
import { LoadingSpinner } from '@/components/ui-components/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface ForecastHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshTrigger?: number;
}

export const ForecastHistoryDialog = ({ open, onOpenChange, refreshTrigger }: ForecastHistoryDialogProps) => {
  const { forecasts, isLoading, deleteForecast, refreshForecasts } = useSavedForecasts();
  const { t, isRTL } = useLanguage();

  // Refresh forecasts when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && open) {
      refreshForecasts();
    }
  }, [refreshTrigger, open, refreshForecasts]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>{t('forecast.saved.title')}</DialogTitle>
          <DialogDescription className={isRTL ? 'text-right' : 'text-left'}>
            {t('forecast.saved.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" message={t('forecast.saved.loadingForecasts')} />
            </div>
          ) : forecasts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-2">{t('forecast.saved.noForecastsFound')}</p>
                <p className="text-sm text-center">{t('forecast.saved.createAndSaveForecast')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {forecasts.map((forecast) => (
                <ForecastCard
                  key={forecast.id}
                  forecast={forecast}
                  onDelete={deleteForecast}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
