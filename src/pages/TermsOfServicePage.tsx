
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageHeader } from '@/components/ui-components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

const TermsOfServicePage = () => {
  const { t, language } = useLanguage();

  const containerStyle: React.CSSProperties = {
    direction: language === 'he' ? 'rtl' : 'ltr'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto" style={containerStyle}>
        <PageHeader 
          title={t('legal.terms.title')}
          subtitle={t('legal.terms.subtitle')}
        />
        
        <Card className="mt-6">
          <CardContent className="p-6 space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">{t('legal.terms.acceptance.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.terms.acceptance.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t('legal.terms.services.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.terms.services.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t('legal.terms.data.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.terms.data.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t('legal.terms.liability.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.terms.liability.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t('legal.terms.changes.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.terms.changes.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t('legal.terms.contact.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.terms.contact.content')}
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
