
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageHeader } from '@/components/ui-components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

const PrivacyPolicyPage = () => {
  const { t, language } = useLanguage();

  const containerStyle: React.CSSProperties = {
    direction: language === 'he' ? 'rtl' : 'ltr'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto" style={containerStyle}>
        <PageHeader 
          title={t('legal.privacy.title')}
          subtitle={t('legal.privacy.subtitle')}
        />
        
        <Card className="mt-6">
          <CardContent className="p-6 space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.introduction.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.privacy.introduction.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.informationCollected.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.privacy.informationCollected.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.howWeUse.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.privacy.howWeUse.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.dataSharing.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.privacy.dataSharing.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.dataSecurity.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.privacy.dataSecurity.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.yourRights.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.privacy.yourRights.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.changes.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.privacy.changes.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.contact.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.privacy.contact.content')}
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
