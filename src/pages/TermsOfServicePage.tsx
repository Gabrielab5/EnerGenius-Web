
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TermsOfServicePage = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'hsl(43, 26%, 86%)' }}>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Button onClick={goBack} variant="ghost" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="ml-2">Back</span>
          </Button>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>
        
        <div className="space-y-4">
          <p>Last updated: May 11, 2025</p>
          
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p>Welcome to EnerGenius. By using our application, you agree to these Terms of Service. Please read them carefully.</p>
          
          <h2 className="text-xl font-semibold">2. Use of Service</h2>
          <p>EnerGenius provides tools to monitor and optimize your electricity consumption. You agree to use this service only for its intended purpose and in compliance with applicable laws.</p>
          
          <h2 className="text-xl font-semibold">3. User Accounts</h2>
          <p>To use certain features of our application, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          
          <h2 className="text-xl font-semibold">4. Data Privacy</h2>
          <p>Our Privacy Policy explains how we collect, use, and protect your information. By using EnerGenius, you consent to our data practices as described in our Privacy Policy.</p>
          
          <h2 className="text-xl font-semibold">5. Intellectual Property</h2>
          <p>All content, features, and functionality of EnerGenius, including but not limited to text, graphics, logos, and code, are owned by EnerGenius and are protected by intellectual property laws.</p>
          
          <h2 className="text-xl font-semibold">6. Termination</h2>
          <p>We may terminate or suspend your account and access to EnerGenius immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users of EnerGenius, us, or third parties, or for any other reason.</p>
          
          <h2 className="text-xl font-semibold">7. Changes to Terms</h2>
          <p>We may revise these Terms from time to time. The most current version will always be posted on this page. By continuing to use EnerGenius after revisions become effective, you agree to be bound by the revised terms.</p>
          
          <h2 className="text-xl font-semibold">8. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at support@energenius.com.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
