
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  const { t, direction } = useLanguage();
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'hsl(43, 26%, 86%)' , direction}}>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Button onClick={goBack} variant="ghost" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
             <span className="ml-2">{t('misc.back')}</span>
          </Button>
        </div>
        
            <h1 className="text-2xl font-bold mb-6">{t('legal.privacyPolicy')}</h1>

        <div className="space-y-4">
          <p>{t('legal.lastUpdated')}: May 11, 2025</p>

          <h2 className="text-xl font-semibold">{t('legal.privacy.introduction.title')}</h2>
          <p>{t('legal.privacy.introduction.content')}</p>

          <h2 className="text-xl font-semibold">{t('legal.privacy.informationCollected.title')}</h2>
          <p>{t('legal.privacy.informationCollected.content')}</p>

          <h2 className="text-xl font-semibold">{t('legal.privacy.howWeUse.title')}</h2>
          <p>{t('legal.privacy.howWeUse.content')}</p>

          <h2 className="text-xl font-semibold">{t('legal.privacy.dataSharing.title')}</h2>
          <p>{t('legal.privacy.dataSharing.content')}</p>

          <h2 className="text-xl font-semibold">{t('legal.privacy.dataSecurity.title')}</h2>
          <p>{t('legal.privacy.dataSecurity.content')}</p>

          <h2 className="text-xl font-semibold">{t('legal.privacy.yourRights.title')}</h2>
          <p>{t('legal.privacy.yourRights.content')}</p>

          <h2 className="text-xl font-semibold">{t('legal.privacy.changes.title')}</h2>
          <p>{t('legal.privacy.changes.content')}</p>

          <h2 className="text-xl font-semibold">{t('legal.privacy.contact.title')}</h2>
          <p>{t('legal.privacy.contact.content')}</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
