
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LoaderCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const videoSrc = "/Energenious.mp4"

interface VideoPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoSrc: string;
  titleKey: string;
  descriptionKey: string;
}

export const VideoPlayerDialog = ({
  open,
  onOpenChange,
  videoSrc,
  titleKey,
  descriptionKey,
}: VideoPlayerDialogProps) => {
  const { t, language } = useLanguage();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Reset loading/error state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsVideoLoaded(false);
      setVideoError(false);
    }
  }, [open]);

  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
    setVideoError(false);
  };

  const handleVideoError = () => {
    setIsVideoLoaded(false);
    setVideoError(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle 
            dir={language === 'he' ? 'rtl' : 'ltr'}
            style={{ textAlign: language === 'he' ? 'right' : 'left' }}
          >
            {t(titleKey)}
          </DialogTitle>
          <DialogDescription 
            dir={language === 'he' ? 'rtl' : 'ltr'}
            style={{ textAlign: language === 'he' ? 'right' : 'left' }}
          >
            {t(descriptionKey)}
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video mt-4 rounded-lg overflow-hidden bg-muted relative">
          {!videoError ? (
            <>
              <video
                className={`w-full h-full ${!isVideoLoaded ? 'invisible' : ''}`}
                src={videoSrc}
                controls
                autoPlay
                muted
                playsInline
                onLoadedData={handleVideoLoaded}
                onError={handleVideoError}
              >
                {t('upload.video.unsupported') || 'Your browser does not support the video tag.'}
              </video>
              {!isVideoLoaded && (
                <div className="w-full h-full flex items-center justify-center absolute top-0 left-0">
                  <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center absolute top-0 left-0">
              <div className="text-destructive">{t('upload.video.error') || 'The video could not be loaded.'}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
