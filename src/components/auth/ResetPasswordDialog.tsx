import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSpinner } from '@/components/ui-components/LoadingSpinner';

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ResetPasswordDialog = ({ open, onOpenChange }: ResetPasswordDialogProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();
  const { t, isRTL } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;
    
    try {
      setIsLoading(true);
      const success = await resetPassword(email);
      if (success) {
        setEmailSent(true);
        // Auto-close after showing success message
        setTimeout(() => {
          onOpenChange(false);
          setEmail('');
          setEmailSent(false);
        }, 3000);
      }
    } catch (error) {
      // Error is handled in the resetPassword function
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) return;
    
    try {
      setIsLoading(true);
      const success = await resetPassword(email);
      if (success) {
        setEmailSent(true);
      }
    } catch (error) {
      // Error is handled in the resetPassword function
    } finally {
      setIsLoading(false);
    }
  };

  const textAlignClass = isRTL ? 'text-right' : 'text-left';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className={textAlignClass}>
          <DialogTitle>{t('auth.resetPassword.title')}</DialogTitle>
          <DialogDescription>
            {emailSent 
              ? "Reset email sent! Please check your inbox and spam folder. This dialog will close automatically."
              : t('auth.resetPassword.description')
            }
          </DialogDescription>
        </DialogHeader>
        
        {!emailSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className={textAlignClass}>
                {t('auth.emailLabel')}
              </Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                required
                disabled={isLoading}
                className={textAlignClass}
              />
            </div>
            
            <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground">
              <p className={textAlignClass}>
                💡 Tips: Check your spam folder after sending. The email might take a few minutes to arrive.
              </p>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading || !email.trim()}>
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  t('auth.resetPassword.sendButton')
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <span className="text-lg">✅</span>
                <p className="font-medium">Email sent successfully!</p>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Please check your email (including spam folder) for the reset link.
              </p>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner /> : "Resend Email"}
              </Button>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  setEmail('');
                  setEmailSent(false);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};