
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

const SettingsPage = () => {
  const { signOut, user } = useAuth();
  const { refreshDevices, isLoading } = useDevices();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  const handleRefreshDevices = async () => {
    await refreshDevices();
  };
  
  return (
    <div className="mobile-page pb-20">
      <PageHeader 
        title="Settings" 
        description="Manage your devices and account"
      />
      
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your Devices</CardTitle>
                <CardDescription>Manage your connected electrical devices</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefreshDevices}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DeviceManagement />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <Alert>
                <AlertTitle>Signed in as</AlertTitle>
                <AlertDescription className="font-medium">
                  {user.email}
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              variant="outline" 
              className="w-full h-12"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
