
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Zap } from 'lucide-react';

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
  language: string;
}

export const ElectricityTips = ({ tips, language }: ElectricityTipsProps) => {
  const isRTL = language === 'he';

  return (
    <div className="space-y-6">
      {/* Device-specific tips */}
      {tips.device_tips && tips.device_tips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className={`text-xl flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Zap className="h-5 w-5 text-blue-500" />
              {language === 'he' ? 'טיפים למכשירים' : language === 'ru' ? 'Советы для устройств' : 'Device Tips'}
            </CardTitle>
            <CardDescription>
              {language === 'he' ? 'טיפים ספציפיים למכשירים שלך' : language === 'ru' ? 'Специфические советы для ваших устройств' : 'Specific tips for your devices'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {tips.device_tips.map((deviceTip, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-lg mb-3">{deviceTip.device}</h4>
                  <div className="space-y-2">
                    {deviceTip.tips.map((tip, tipIndex) => (
                      <div key={tipIndex} className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                          {tipIndex + 1}
                        </span>
                        <p className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : ''}`}>{tip}</p>
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
              {language === 'he' ? 'טיפים כלליים' : language === 'ru' ? 'Общие советы' : 'General Tips'}
            </CardTitle>
            <CardDescription>
              {language === 'he' ? 'טיפים כלליים לחיסכון בחשמל' : language === 'ru' ? 'Общие советы по экономии электроэнергии' : 'General electricity saving tips'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {tips.general_tips.map((tip, index) => (
                <div key={index} className={`flex items-start gap-3 p-3 rounded-md bg-muted/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <p className={`text-sm ${isRTL ? 'text-right' : ''}`}>{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
