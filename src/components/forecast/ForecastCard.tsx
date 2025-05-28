
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ForecastScenario } from '@/types/forecast';
import { Trash2, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ForecastCardProps {
  forecast: ForecastScenario;
  onDelete: (id: string) => void;
}

export const ForecastCard = ({ forecast, onDelete }: ForecastCardProps) => {
  const { comparison } = forecast.projections;
  const isIncrease = comparison.kwhDifference > 0;
  const [isDevicesOpen, setIsDevicesOpen] = useState(false);
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-base sm:text-lg">{forecast.name}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Created on {new Date(forecast.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/90">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Forecast</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{forecast.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(forecast.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Annual kWh</div>
            <div className="text-sm sm:text-base font-medium">
              {forecast.projections.annualTotal.kwh.toLocaleString()}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Annual Cost</div>
            <div className="text-sm sm:text-base font-medium">
              ₪{forecast.projections.annualTotal.price.toLocaleString()}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">kWh Change</div>
            <div className={`text-sm sm:text-base font-medium flex items-center gap-1 ${
              isIncrease ? 'text-red-600' : 'text-green-600'
            }`}>
              {isIncrease ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isIncrease ? '+' : ''}{comparison.kwhDifference.toLocaleString()}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">% Change</div>
            <div className={`text-sm sm:text-base font-medium ${
              comparison.percentageChange > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {comparison.percentageChange > 0 ? '+' : ''}{comparison.percentageChange.toFixed(1)}%
            </div>
          </div>
        </div>
        
        {/* Device Details Section */}
        <div className="border-t pt-3">
          <Collapsible open={isDevicesOpen} onOpenChange={setIsDevicesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {forecast.devices.length} device{forecast.devices.length !== 1 ? 's' : ''} configured
                  </span>
                </div>
                {isDevicesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3">
              <div className="space-y-2">
                {forecast.devices.map((device) => {
                  const daysPerMonth = (device.usage.daysPerWeek / 7) * 30.44; // Average days per month
                  const monthlyKwh = (device.powerConsumption * device.usage.hoursPerDay * daysPerMonth) / 1000;
                  
                  return (
                    <div key={device.id} className="bg-muted/50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{device.name}</h4>
                          <p className="text-xs text-muted-foreground">{device.type}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Power</div>
                          <div className="text-sm font-medium">{device.powerConsumption}W</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Daily Usage:</span>
                          <div className="font-medium">{device.usage.hoursPerDay}h/day</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Days/Week:</span>
                          <div className="font-medium">{device.usage.daysPerWeek} days</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Monthly kWh:</span>
                          <div className="font-medium">{monthlyKwh.toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Known kWh:</span>
                          <div className="font-medium">{device.knownKwh || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};
