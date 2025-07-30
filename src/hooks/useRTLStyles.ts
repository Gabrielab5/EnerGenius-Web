import { useLanguage } from '@/contexts/LanguageContext';

export const useRTLStyles = () => {
  const { isRTL } = useLanguage();
  
  return {
    // Text alignment classes
    textAlign: isRTL ? 'text-right' : 'text-left',
    textAlignClass: isRTL ? 'text-right' : 'text-left',
    
    // Flex direction classes
    flexDirection: isRTL ? 'flex-row-reverse' : 'flex-row',
    flexDirectionClass: isRTL ? 'flex-row-reverse' : 'flex-row',
    
    // Icon spacing for when icons should be on opposite side in RTL
    iconSpacing: isRTL ? 'ml-2' : 'mr-2',
    iconSpacingReverse: isRTL ? 'mr-2' : 'ml-2',
    
    // Margin utilities
    marginLeft: isRTL ? 'mr-' : 'ml-',
    marginRight: isRTL ? 'ml-' : 'mr-',
    
    // Padding utilities  
    paddingLeft: isRTL ? 'pr-' : 'pl-',
    paddingRight: isRTL ? 'pl-' : 'pr-',
    
    // Border utilities
    borderLeft: isRTL ? 'border-r-' : 'border-l-',
    borderRight: isRTL ? 'border-l-' : 'border-r-',
    
    // Conditional class helper
    conditionalClass: (rtlClass: string, ltrClass: string) => 
      isRTL ? rtlClass : ltrClass,
      
    // Direction attribute
    direction: isRTL ? 'rtl' : 'ltr',
    
    // Boolean flags
    isRTL,
    isLTR: !isRTL,
    
    // Number/currency formatting for RTL languages
    formatNumber: (num: number, options?: Intl.NumberFormatOptions) => {
      const locale = isRTL ? 'he-IL' : 'en-US';
      return new Intl.NumberFormat(locale, options).format(num);
    },
    
    formatCurrency: (amount: number, currency: string = 'ILS') => {
      const locale = isRTL ? 'he-IL' : 'en-US';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
      }).format(amount);
    }
  };
};