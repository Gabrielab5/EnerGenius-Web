
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSavedForecasts } from '@/hooks/useSavedForecasts';
import { ForecastCard } from './ForecastCard';
import { LoadingSpinner } from '@/components/ui-components/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';

interface ForecastHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshTrigger?: number;
}

export const ForecastHistoryDialog = ({ open, onOpenChange, refreshTrigger }: ForecastHistoryDialogProps) => {
  const { forecasts, isLoading, deleteForecast, refreshForecasts } = useSavedForecasts();

  // Refresh forecasts when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && open) {
      refreshForecasts();
    }
  }, [refreshTrigger, open, refreshForecasts]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle>Saved Forecasts</DialogTitle>
          <DialogDescription>
            View and manage your previously saved electricity forecasts
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" message="Loading forecasts..." />
            </div>
          ) : forecasts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-2">No saved forecasts found.</p>
                <p className="text-sm text-center">Create and save a forecast to see it here.</p>
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
