
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
             <span className="ml-2">{t('misc.back', 'Back')}</span>
          </Button>
        </div>
        
         <h1 className="text-2xl font-bold mb-6">{t('auth.privacyLink', 'Privacy Policy')}</h1>
        
        <div className="space-y-4">
          <p>Last updated: May 11, 2025</p>
          
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p>This Privacy Policy describes how EnerGenius ("we", "our", or "us") collects, uses, and discloses your information when you use our application.</p>
          
          <h2 className="text-xl font-semibold">2. Information We Collect</h2>
          <p>We collect information that you provide directly to us, such as when you create an account, upload electricity consumption data, or contact us for support. This may include your name, email address, password, and electricity usage data.</p>
          
          <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, to process and complete transactions, to respond to your inquiries, and to communicate with you about our services.</p>
          
          <h2 className="text-xl font-semibold">4. Data Sharing and Disclosure</h2>
          <p>We do not sell, rent, or share your personal information with third parties except as described in this policy. We may share your information with service providers who perform services on our behalf, or when required by law.</p>
          
          <h2 className="text-xl font-semibold">5. Data Security</h2>
          <p>We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.</p>
          
          <h2 className="text-xl font-semibold">6. Your Rights</h2>
          <p>You may update, correct, or delete your account information at any time by logging into your account settings. You may also contact us to request access to, correction of, or deletion of personal information that you have provided to us.</p>
          
          <h2 className="text-xl font-semibold">7. Changes to This Policy</h2>
          <p>We may change this privacy policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice.</p>
          
          <h2 className="text-xl font-semibold">8. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@energenius.com.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
