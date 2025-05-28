
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface VideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VideoModal = ({ open, onOpenChange }: VideoModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-center">How to Upload Your Data</DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
          <video
            className="w-full h-full object-cover"
            controls
            preload="metadata"
            poster="/placeholder.svg"
          >
            <source src="/Energenious.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
};
