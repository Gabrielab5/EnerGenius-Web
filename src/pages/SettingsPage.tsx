
import React from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui-components/PageHeader';
import { DeviceManagement } from '@/components/settings/DeviceManagement';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDevices } from '@/contexts/DeviceContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const SettingsPage = () => {
  const { signOut, user, resetPassword } = useAuth();
  const { refreshDevices, isLoading } = useDevices();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  const handleRefreshDevices = async () => {
    await refreshDevices();
  };

  const handleResetPassword = async () => {
    if (user?.email) {
      await resetPassword(user.email);
    }
  };
  
  return (
    <div className="mobile-page pb-20">
      <PageHeader 
        title={t('settings.pageTitle')} 
        description={t('settings.pageDescription')}
      />
      
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{t('settings.devices.title')}</CardTitle>
                <CardDescription>{t('settings.devices.description')}</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefreshDevices}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {t('settings.devices.refresh')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DeviceManagement />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.account.title')}</CardTitle>
            <CardDescription>{t('settings.account.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <Alert>
                <AlertTitle>{t('settings.account.signedInAs')}</AlertTitle>
                <AlertDescription className="font-medium">
                  {user.email}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-3">
              <Button 
                variant="secondary" 
                className="w-full h-12"
                onClick={handleResetPassword}
              >
                {t('settings.account.resetPassword')}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full h-12"
                onClick={handleSignOut}
              >
                {t('settings.account.signOut')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
