import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ForecastScenario } from '@/types/forecast';
import { Trash2, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ForecastCardProps {
  forecast: ForecastScenario;
  onDelete: (id: string) => void;
}

export const ForecastCard = ({ forecast, onDelete }: ForecastCardProps) => {
  const { t, language, isRTL } = useLanguage();
  const { comparison, annualTotal, monthlyTotals } = forecast.projections;
  const isIncrease = comparison.kwhDifference >= 0;
  const [isDevicesOpen, setIsDevicesOpen] = useState(false);

  const handleDelete = () => {
    onDelete(forecast.id);
    toast({
      description: t('deleteSuccessDescription').replace('{forecastName}', forecast.name),
    });
  };

  const toCamelCase = (str: string) => str.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => (i === 0 ? w.toLowerCase() : w.toUpperCase())).replace(/\s+/g, '');
  const translateDeviceName = (name: string) => t(`devices.types.${toCamelCase(name)}`, { defaultValue: name });

  const getFormattedDate = () => {
    if (!forecast.createdAt) return '';
    try {
      // Handle both Firestore Timestamp objects and standard date strings/numbers
      let dateValue: string | number;
      
      if (typeof forecast.createdAt === 'object' && forecast.createdAt !== null) {
        // Check if it's a Firestore Timestamp with seconds property
        const timestampObj = forecast.createdAt as any;
        dateValue = timestampObj.seconds ? timestampObj.seconds * 1000 : forecast.createdAt;
      } else {
        dateValue = forecast.createdAt;
      }
      
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return ''; // Return empty string for invalid dates
      }
      return format(date, 'PPP');
    } catch (error) {
      console.error('Error formatting date:', forecast.createdAt, error);
      return ''; // Return empty string on error
    }
  };
  
  const deviceCountText = t('forecast.card.deviceConfigured', { count: forecast.devices.length });

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <CardTitle className="text-lg font-bold">{forecast.name}</CardTitle>
          <CardDescription>
            {t('forecast.card.createdOn').replace('{date}', getFormattedDate())}
          </CardDescription>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
            <AlertDialogHeader className={isRTL ? 'text-right' : 'text-left'}>
              <AlertDialogTitle>{t('forecast.card.deleteForecastTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('forecast.card.deleteForecastDescription').replace('{forecastName}', forecast.name)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className={isRTL ? 'sm:justify-start' : 'sm:justify-end'}>
              <AlertDialogCancel>{t('forecast.card.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                {t('forecast.card.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className={`space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="text-xs text-muted-foreground">{t('forecast.card.annualKwh')}</div>
            <div className="text-sm sm:text-base font-medium">
              {annualTotal.kwh.toLocaleString(undefined, { maximumFractionDigits: 1 })} {t('forecast.units.kwh')}
            </div>
          </div>
          
          <div className={`space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="text-xs text-muted-foreground">{t('forecast.card.annualCost')}</div>
            <div className="text-sm sm:text-base font-medium">
              {t('forecast.units.currency')}{annualTotal.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className={`space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="text-xs text-muted-foreground">{t('forecast.card.kwhChange')}</div>
            <div className={`text-sm sm:text-base font-medium flex items-center gap-1 ${isIncrease ? 'text-red-600' : 'text-green-600'} ${isRTL ? 'flex-row-reverse' : ''}`}>
              {isIncrease ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{isIncrease ? '+' : ''}{comparison.kwhDifference.toLocaleString(undefined, { maximumFractionDigits: 1 })} {t('forecast.units.kwh')}</span>
            </div>
          </div>
          
          <div className={`space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="text-xs text-muted-foreground">{t('forecast.card.percentageChange')}</div>
            <div className={`text-sm sm:text-base font-medium flex items-center gap-1 ${comparison.percentageChange >= 0 ? 'text-red-600' : 'text-green-600'} ${isRTL ? 'flex-row-reverse' : ''}`}>
              {comparison.percentageChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{comparison.percentageChange >= 0 ? '+' : ''}{comparison.percentageChange.toFixed(1)}%</span>
            </div>
          </div>
        </div>
        
        <Collapsible open={isDevicesOpen} onOpenChange={setIsDevicesOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:hover:bg-green-900">
              <span>{deviceCountText}</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDevicesOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="py-2">
            <div className="space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
              {forecast.devices.map((device, index) => (
                <div key={index} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <div className="font-semibold">
                    <div>{translateDeviceName(device.name)}</div>
                    <div className="text-xs text-muted-foreground">
                      {t('forecast.card.power')} - {device.powerConsumption}W
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">{t('forecast.card.dailyUsage')}</div>
                      <div>{device.usage.hoursPerDay} {t('forecast.card.hoursPerDayUnit')}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">{t('forecast.card.daysPerWeek')}</div>
                      <div>{device.usage.daysPerWeek} {t('forecast.card.daysUnit')}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">{t('forecast.card.monthlyKwh')}</div>
                      <div>
                        {((device.powerConsumption / 1000) * device.usage.hoursPerDay * device.usage.daysPerWeek * 4.33).toFixed(1)} {t('forecast.units.kwh')}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">{t('forecast.card.monthlyCost')}</div>
                      <div>
                        {t('forecast.units.currency')}{(((device.powerConsumption / 1000) * device.usage.hoursPerDay * device.usage.daysPerWeek * 4.33) * 0.6).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
