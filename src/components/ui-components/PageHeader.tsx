
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  helpText?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  description, 
  helpText 
}) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
      {subtitle && (
        <p className="text-lg text-muted-foreground mb-2">{subtitle}</p>
      )}
      {description && (
        <p className="text-muted-foreground mb-2">{description}</p>
      )}
      {helpText && (
        <p className="text-sm text-muted-foreground italic">{helpText}</p>
      )}
    </div>
  );
};
