import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRTLStyles } from '@/hooks/useRTLStyles';

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
  const { t } = useLanguage();
  const rtl = useRTLStyles();

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
    <div className={`space-y-6 ${rtl.isRTL ? 'text-right' : 'text-left'}`} dir={rtl.isRTL ? 'rtl' : 'ltr'}>
      {/* Device-specific tips */}
      {tips.device_tips && tips.device_tips.length > 0 && (
        <Card className={rtl.isRTL ? 'text-right' : 'text-left'} dir={rtl.isRTL ? 'rtl' : 'ltr'}>
          <CardHeader className={rtl.isRTL ? 'text-right' : 'text-left'}>
            <CardTitle className={`text-xl flex items-center gap-2 ${rtl.isRTL ? 'flex-row-reverse justify-start' : 'flex-row justify-start'}`}>
              <Zap className="h-5 w-5 text-blue-500" />
              <span className={rtl.isRTL ? 'text-right' : 'text-left'}>{t('home.tips.deviceSpecific.title')}</span>
            </CardTitle>
            <CardDescription className={rtl.isRTL ? 'text-right' : 'text-left'}>
              {t('home.tips.deviceSpecific.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className={rtl.isRTL ? 'text-right' : 'text-left'}>
            <div className="space-y-6">
              {tips.device_tips.map((deviceTip, index) => (
                <div key={index} className={`${rtl.isRTL ? 'border-r-4 border-blue-500 pr-4' : 'border-l-4 border-blue-500 pl-4'}`}>
                  <h4 className={`font-semibold text-lg mb-3 ${rtl.isRTL ? 'text-right' : 'text-left'}`}>
                    {translateDeviceName(deviceTip.device)}
                  </h4>
                  <div className={`space-y-2 ${rtl.isRTL ? 'text-right' : 'text-left'}`}>
                    {deviceTip.tips.map((tip, tipIndex) => (
                      <div key={tipIndex} className={`flex items-start gap-3 ${rtl.isRTL ? 'flex-row-reverse justify-start' : 'flex-row justify-start'}`}>
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                          {tipIndex + 1}
                        </span>
                        <p className={`text-sm text-muted-foreground ${rtl.isRTL ? 'text-right' : 'text-left'} flex-1`}>{tip}</p>
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
        <Card className={rtl.isRTL ? 'text-right' : 'text-left'} dir={rtl.isRTL ? 'rtl' : 'ltr'}>
          <CardHeader className={rtl.isRTL ? 'text-right' : 'text-left'}>
            <CardTitle className={`text-xl flex items-center gap-2 ${rtl.isRTL ? 'flex-row-reverse justify-start' : 'flex-row justify-start'}`}>
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span className={rtl.isRTL ? 'text-right' : 'text-left'}>{t('home.tips.general.title')}</span>
            </CardTitle>
            <CardDescription className={rtl.isRTL ? 'text-right' : 'text-left'}>
              {t('home.tips.general.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className={rtl.isRTL ? 'text-right' : 'text-left'}>
            <div className={`grid gap-3 ${rtl.isRTL ? 'text-right' : 'text-left'}`}>
              {tips.general_tips.map((tip, index) => (
                <div key={index} className={`flex items-start gap-3 p-3 rounded-md bg-muted/50 ${rtl.isRTL ? 'flex-row-reverse justify-start' : 'flex-row justify-start'}`}>
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <p className={`text-sm ${rtl.isRTL ? 'text-right' : 'text-left'} flex-1`}>{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};