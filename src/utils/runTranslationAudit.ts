import { auditTranslationCoverage, generateAuditReport, logTranslationAudit } from './translationAudit';
import { validateRTLImplementation, generateRTLReport, logRTLValidation } from './rtlValidator';
import { generateTranslationReport } from './translationDevTools';

// Sample component code for testing RTL validation
const sampleComponents = {
  'SettingsPage': `
    import { useLanguage } from '@/contexts/LanguageContext';
    import { useRTLStyles } from '@/hooks/useRTLStyles';
    
    const SettingsPage = () => {
      const { t, direction } = useLanguage();
      const rtl = useRTLStyles();
      
      return (
        <div dir={direction} className={rtl.textAlign}>
          <h1>{t('settings.title')}</h1>
        </div>
      );
    };
  `,
  'ElectricityStats': `
    import { useLanguage } from '@/contexts/LanguageContext';
    import { useRTLStyles } from '@/hooks/useRTLStyles';
    
    const ElectricityStats = () => {
      const { t, isRTL } = useLanguage();
      const rtl = useRTLStyles();
      
      return (
        <div className={isRTL ? 'flex-row-reverse' : 'flex-row'}>
          <span className={rtl.textAlign}>{t('dashboard.stats.title')}</span>
        </div>
      );
    };
  `,
  'BadComponent': `
    const BadComponent = () => {
      return (
        <div className="text-left">
          <h1>Hardcoded Title</h1>
          <p className="ml-4">This is not translated</p>
        </div>
      );
    };
  `
};

export interface TranslationAuditResults {
  translationCoverage: ReturnType<typeof auditTranslationCoverage>;
  rtlValidation: ReturnType<typeof validateRTLImplementation>[];
  summary: {
    totalTranslationKeys: number;
    translationCoverage: {
      he: number;
      ru: number;
    };
    rtlCompliance: {
      averageScore: number;
      componentsWithIssues: number;
      totalComponents: number;
    };
    recommendations: string[];
  };
}

export const runComprehensiveAudit = (): TranslationAuditResults => {
  console.group('🔍 Running Comprehensive Translation & RTL Audit');
  
  // Run translation coverage audit
  console.log('📊 Checking translation coverage...');
  const translationAudit = auditTranslationCoverage();
  
  // Run RTL validation on sample components
  console.log('🔄 Validating RTL implementation...');
  const rtlResults = Object.entries(sampleComponents).map(([name, code]) => 
    validateRTLImplementation(code, name)
  );
  
  // Calculate summary metrics
  const averageRTLScore = rtlResults.reduce((sum, result) => sum + result.score, 0) / rtlResults.length;
  const componentsWithIssues = rtlResults.filter(result => result.issues.length > 0).length;
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (translationAudit.missingKeys.he.length > 0) {
    recommendations.push(`Add ${translationAudit.missingKeys.he.length} missing Hebrew translations`);
  }
  
  if (translationAudit.missingKeys.ru.length > 0) {
    recommendations.push(`Add ${translationAudit.missingKeys.ru.length} missing Russian translations`);
  }
  
  if (averageRTLScore < 80) {
    recommendations.push('Improve RTL implementation - average score below 80%');
  }
  
  if (componentsWithIssues > 0) {
    recommendations.push(`Fix RTL issues in ${componentsWithIssues} components`);
  }
  
  const results: TranslationAuditResults = {
    translationCoverage: translationAudit,
    rtlValidation: rtlResults,
    summary: {
      totalTranslationKeys: translationAudit.totalKeys,
      translationCoverage: translationAudit.coverage,
      rtlCompliance: {
        averageScore: averageRTLScore,
        componentsWithIssues,
        totalComponents: rtlResults.length
      },
      recommendations
    }
  };
  
  // Log summary
  console.log('📈 Audit Summary:');
  console.log(`Total Translation Keys: ${results.summary.totalTranslationKeys}`);
  console.log(`Hebrew Coverage: ${results.summary.translationCoverage.he.toFixed(1)}%`);
  console.log(`Russian Coverage: ${results.summary.translationCoverage.ru.toFixed(1)}%`);
  console.log(`Average RTL Score: ${results.summary.rtlCompliance.averageScore.toFixed(1)}/100`);
  console.log(`Components with RTL Issues: ${results.summary.rtlCompliance.componentsWithIssues}/${results.summary.rtlCompliance.totalComponents}`);
  
  if (results.summary.recommendations.length > 0) {
    console.warn('🎯 Recommendations:');
    results.summary.recommendations.forEach(rec => console.warn(`  - ${rec}`));
  } else {
    console.log('✅ All translation and RTL checks passed!');
  }
  
  console.groupEnd();
  
  return results;
};

// Export for CLI usage
export const generateFinalReport = (): void => {
  const results = runComprehensiveAudit();
  
  // Generate detailed reports
  const translationReport = generateAuditReport();
  const rtlReport = generateRTLReport(results.rtlValidation);
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 DETAILED TRANSLATION REPORT');
  console.log('='.repeat(60));
  console.log(translationReport);
  
  console.log('\n' + '='.repeat(60));
  console.log('🔄 DETAILED RTL VALIDATION REPORT');
  console.log('='.repeat(60));
  console.log(rtlReport);
  
  // Generate JSON report for CI/CD
  const jsonReport = {
    timestamp: new Date().toISOString(),
    ...results,
    reports: {
      translation: translationReport,
      rtl: rtlReport
    }
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📄 JSON REPORT FOR CI/CD');
  console.log('='.repeat(60));
  console.log(JSON.stringify(jsonReport, null, 2));
};

// Development helper
export const quickAudit = () => {
  logTranslationAudit();
  
  Object.entries(sampleComponents).forEach(([name, code]) => {
    logRTLValidation(code, name);
  });
};
