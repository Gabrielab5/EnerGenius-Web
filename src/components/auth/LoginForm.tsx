 
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui-components/LoadingSpinner';
import { Link } from 'react-router-dom';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp, signInWithGoogle, status } = useAuth();
  const [currentTab, setCurrentTab] = useState<'login' | 'register'>('login');
  const { t, direction, isRTL} = useLanguage();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password);
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const isLoading = status === 'loading';
  
   // RTL-aware classes
  const textAlignClass = isRTL ? 'text-right' : 'text-left';
  const flexDirectionClass = isRTL ? 'flex-row-reverse' : 'flex-row';

  return ( 
    <Card className="w-full max-w-md mx-auto" dir={direction}>
      <CardHeader>
        <CardTitle className="text-center text-2xl">
          EnerGenius!
        </CardTitle>
        <CardDescription className="text-center">
          {t('auth.loginSubheader')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="login"
          value={currentTab}
          onValueChange={(value) => setCurrentTab(value as 'login' | 'register')}
          className="w-full"
          dir={direction}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t('auth.loginTab')}</TabsTrigger>
            <TabsTrigger value="register">{t('auth.registerTab')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleEmailSignIn} className="space-y-4 mt-4" dir={direction}>
              <div className="space-y-2">
                <Label htmlFor="email" className={`block ${textAlignClass}`}>
                  {t('auth.emailLabel')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className={`h-12 ${textAlignClass}`}
                  dir={direction}
                />
              </div>
              <div className="space-y-2">
                  <div className={`flex ${flexDirectionClass} justify-between items-center`}>
                  <Label htmlFor="password" className={textAlignClass}>
                    {t('auth.passwordLabel')}
                  </Label>
                  <a href="#" className="text-xs text-primary hover:underline">
                    {t('auth.forgotPassword')}
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className={`h-12 ${textAlignClass}`}
                  dir={direction}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner size="sm" message="" /> : t('auth.loginButton')}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleEmailSignUp} className="space-y-4 mt-4" dir={direction}>
              <div className="space-y-2">
                <Label htmlFor="register-email" className={`block ${textAlignClass}`}>
                  {t('auth.emailLabel')}
                </Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className={`h-12 ${textAlignClass}`}
                  dir={direction}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password" className={`block ${textAlignClass}`}>
                  {t('auth.passwordLabel')}
                </Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className={`h-12 ${textAlignClass}`}
                  dir={direction}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner size="sm" message="" /> : t('auth.signupButton')}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative flex items-center mt-6">
          <div className="flex-grow border-t border-app-gray-300"></div>
          <span className="flex-shrink mx-4 text-app-gray-600 text-sm">{t('auth.orContinueWith')}</span>
          <div className="flex-grow border-t border-app-gray-300"></div>
        </div>

        <Button 
          onClick={signInWithGoogle}
          variant="outline" 
          className="w-full mt-4 h-12 text-base"
          disabled={isLoading}
        >
               <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {t('auth.googleLogin')}
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col text-xs text-app-gray-500" dir={direction}>
        <p className={textAlignClass}>
          {t('auth.termsAgree')}{' '}
          <Link to="/terms-of-service" className="text-primary hover:underline">
            {t('auth.termsLink')}
          </Link>{' '}
          {t('auth.and')}{' '}
          <Link to="/privacy-policy" className="text-primary hover:underline">
            {t('auth.privacyLink')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};
