
import React from 'react';
import { Globe, check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'settings';
  showLabel?: boolean;
}

export const LanguageSelector = ({ 
  variant = 'default', 
  showLabel = true 
}: LanguageSelectorProps) => {
  const { language, setLanguage, availableLanguages, isRTL } = useLanguage();

  const currentLanguage = availableLanguages.find(lang => lang.code === language);

  const buttonContent = () => {
    if (variant === 'compact') {
      return (
        <>
          <Globe className="h-4 w-4" />
          <span className="text-xs font-medium">{currentLanguage?.code.toUpperCase()}</span>
        </>
      );
    }

    return (
      <>
        <Globe className="h-4 w-4" />
        {showLabel && (
          <span className="hidden md:inline">
            {variant === 'settings' ? currentLanguage?.nativeName : currentLanguage?.name}
          </span>
        )}
    </>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={variant === 'compact' ? 'sm' : 'default'}
          className={`flex gap-2 items-center ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          {buttonContent()}
        </Button>
      </DropdownMenuTrigger>
       <DropdownMenuContent 
        align={isRTL ? 'start' : 'end'} 
        className="w-[200px]"
        side={variant === 'settings' ? 'right' : 'bottom'}
      >
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`${language === lang.code ? 'bg-accent/50' : ''} ${isRTL ? 'flex-row-reverse' : ''} flex justify-between items-center`}
          >
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-xs text-muted-foreground">({lang.name})</span>
            </div>
            {language === lang.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};