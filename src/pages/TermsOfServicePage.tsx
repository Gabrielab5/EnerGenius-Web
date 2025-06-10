
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const TermsOfServicePage = () => {
  const navigate = useNavigate();
 const { t, direction } = useLanguage();
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'hsl(43, 26%, 86%)' }, direction}>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Button onClick={goBack} variant="ghost" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="ml-2">{t('misc.back')}</span>
          </Button>
        </div>
        
         <h1 className="text-2xl font-bold mb-6">{t('legal.termsOfService')}</h1>

        <div className="space-y-4">
          <p>{t('legal.lastUpdated')}: May 11, 2025</p>

          <h2 className="text-xl font-semibold">{t('legal.terms.introduction.title')}</h2>
          <p>{t('legal.terms.introduction.content')}</p>

          <h2 className="text-xl font-semibold">{t('legal.terms.useOfService.title')}</h2>
          <p>{t('legal.terms.useOfService.content')}</p>

          <h2 className="text-xl font-semibold">{t('legal.terms.userAccounts.title')}</h2>
          <p>{t('legal.terms.userAccounts.content')}</p>

          <h2 className="text-xl font-semibold">{t('legal.terms.dataPrivacy.title')}</h2>
          <p>{t('legal.terms.dataPrivacy.content')}</p>

          <h2 className="text-xl font-semibold">{t('legal.terms.intellectualProperty.title')}</h2>
          <p>{t('legal.terms.intellectualProperty.content')}</p>

          <h2 className="text-xl font-semibold">{t('legal.terms.termination.title')}</h2>
          <p>{t('legal.terms.termination.content')}</p>

          <h2 className="text-xl font-semibold">{t('legal.terms.changes.title')}</h2>
          <p>{t('legal.terms.changes.content')}</p>

          <h2 className="text-xl font-semibold">{t('legal.terms.contact.title')}</h2>
          <p>{t('legal.terms.contact.content')}</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;