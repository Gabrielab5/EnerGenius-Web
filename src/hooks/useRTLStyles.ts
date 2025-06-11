
import { useLanguage } from '@/contexts/LanguageContext';

export const useRTLStyles = () => {
  const { isRTL, direction } = useLanguage();
  
  return {
    // Basic direction properties
    direction,
    isRTL,
    
    // Text alignment
    textAlign: isRTL ? 'text-right' : 'text-left' as const,
    textAlignOpposite: isRTL ? 'text-left' : 'text-right' as const,
    
    // Flex direction
    flexDirection: isRTL ? 'flex-row-reverse' : 'flex-row' as const,
    flexDirectionCol: isRTL ? 'flex-col-reverse' : 'flex-col' as const,
    
    // Margins
    marginLeft: (value: string) => isRTL ? `mr-${value}` : `ml-${value}`,
    marginRight: (value: string) => isRTL ? `ml-${value}` : `mr-${value}`,
    marginStart: (value: string) => isRTL ? `mr-${value}` : `ml-${value}`,
    marginEnd: (value: string) => isRTL ? `ml-${value}` : `mr-${value}`,
    
    // Padding
    paddingLeft: (value: string) => isRTL ? `pr-${value}` : `pl-${value}`,
    paddingRight: (value: string) => isRTL ? `pl-${value}` : `pr-${value}`,
    paddingStart: (value: string) => isRTL ? `pr-${value}` : `pl-${value}`,
    paddingEnd: (value: string) => isRTL ? `pl-${value}` : `pr-${value}`,
    
    // Borders
    borderLeft: (value: string) => isRTL ? `border-r-${value}` : `border-l-${value}`,
    borderRight: (value: string) => isRTL ? `border-l-${value}` : `border-r-${value}`,
    borderStart: (value: string) => isRTL ? `border-r-${value}` : `border-l-${value}`,
    borderEnd: (value: string) => isRTL ? `border-l-${value}` : `border-r-${value}`,
    
    // Positioning
    left: (value: string) => isRTL ? `right-${value}` : `left-${value}`,
    right: (value: string) => isRTL ? `left-${value}` : `right-${value}`,
    start: (value: string) => isRTL ? `right-${value}` : `left-${value}`,
    end: (value: string) => isRTL ? `left-${value}` : `right-${value}`,
    
    // Rounded corners
    roundedLeft: (value: string) => isRTL ? `rounded-r-${value}` : `rounded-l-${value}`,
    roundedRight: (value: string) => isRTL ? `rounded-l-${value}` : `rounded-r-${value}`,
    roundedStart: (value: string) => isRTL ? `rounded-r-${value}` : `rounded-l-${value}`,
    roundedEnd: (value: string) => isRTL ? `rounded-l-${value}` : `rounded-r-${value}`,
    
    // Icon spacing utilities
    iconSpacing: isRTL ? 'ml-2' : 'mr-2' as const,
    iconSpacingReverse: isRTL ? 'mr-2' : 'ml-2' as const,
    
    // Common layout patterns
    getFlexClasses: (reverse = false) => {
      const base = reverse ? (isRTL ? 'flex-row' : 'flex-row-reverse') : (isRTL ? 'flex-row-reverse' : 'flex-row');
      return base;
    },
    
    getSpacingClasses: (direction: 'start' | 'end', value: string, type: 'margin' | 'padding' = 'margin') => {
      const isStart = direction === 'start';
      const prop = type === 'margin' ? 'm' : 'p';
      const dir = isStart ? (isRTL ? 'r' : 'l') : (isRTL ? 'l' : 'r');
      return `${prop}${dir}-${value}`;
    },
    
    // Helper for conditional classes
    conditionalClass: (rtlClass: string, ltrClass: string) => isRTL ? rtlClass : ltrClass,
    
    // Style object for inline styles
    getStyleObject: () => ({
      direction: direction as 'ltr' | 'rtl',
      textAlign: (isRTL ? 'right' : 'left') as 'left' | 'right',
    }),
  };
};
