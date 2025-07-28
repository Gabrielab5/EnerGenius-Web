import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DeviceTip {
  device: string;
  tips: string[];
}

interface TipsData {
  device_tips: DeviceTip[];
  general_tips: string[];
}

interface ElectricityTipsProps {
  tips: TipsData;
}

export const ElectricityTips = ({ tips }: ElectricityTipsProps) => {
  const { t, isRTL } = useLanguage();

  // Helper to translate device names (converts to camelCase for the key)
  const toCamelCase = (str: string) =>
    str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '');
  
  const translateDeviceName = (name: string) => {
    return t(`devices.types.${toCamelCase(name)}`, { defaultValue: name });
  };

  return (
    <div className="space-y-6">
      {/* Device-specific tips */}
      {tips.device_tips && tips.device_tips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className={`text-xl flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Zap className="h-5 w-5 text-blue-500" />
              {t('home.tips.deviceSpecific.title')}
            </CardTitle>
            <CardDescription>
              {t('home.tips.deviceSpecific.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {tips.device_tips.map((deviceTip, index) => (
                <div key={index} className={`pl-4 ${isRTL ? 'border-l-0 border-r-4 border-blue-500 pr-4 pl-0 text-right' : 'border-l-4 border-blue-500'}`}>
                  <h4 className={`font-semibold text-lg mb-3 ${isRTL ? 'text-right' : ''}`}>{translateDeviceName(deviceTip.device)}</h4>
                  <div className="space-y-2">
                    {deviceTip.tips.map((tip, tipIndex) => (
                      <div key={tipIndex} className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                          {tipIndex + 1}
                        </span>
                        <p className="text-sm text-muted-foreground">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* General tips */}
      {tips.general_tips && tips.general_tips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className={`text-xl flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              {t('home.tips.general.title')}
            </CardTitle>
            <CardDescription>
              {t('home.tips.general.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {tips.general_tips.map((tip, index) => (
                <div key={index} className={`flex items-start gap-3 p-3 rounded-md bg-muted/50 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
