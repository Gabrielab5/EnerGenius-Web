
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface InsightsListProps {
  insights: string[];
  explanation: string;
}

export const InsightsList = ({ insights, explanation }: InsightsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          AI Insights
        </CardTitle>
        <CardDescription>Smart observations about your energy usage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{explanation}</p>
          
          <div className="space-y-2 mt-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-md bg-muted/50">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
