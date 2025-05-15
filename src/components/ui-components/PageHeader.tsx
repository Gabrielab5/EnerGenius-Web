
import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  helpText?: string;
}

export const PageHeader = ({ title, description, helpText }: PageHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-app-gray-800">{title}</h1>
        {helpText && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="tooltip-trigger ml-2" aria-label="Help">
                <HelpCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{helpText}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {description && (
        <p className="text-app-gray-600 mt-1">{description}</p>
      )}
    </div>
  );
};
