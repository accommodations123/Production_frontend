import React from 'react';
import { Toaster as SonnerToaster, toast } from 'sonner';

export function ToastProvider() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#FFFFFF',
          color: '#00162D',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '14px 18px',
          fontWeight: 600,
          fontSize: '14px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
        }
      }}
    />
  );
}

export const notify = {
  success: (message, description) =>
    toast.success(message, { description }),
  error: (message, description) =>
    toast.error(message, { description }),
  info: (message, description) =>
    toast.info(message, { description }),
  whatsapp: (message) =>
    toast('Direct WhatsApp Contact', {
      description: message,
      icon: '💬',
      style: {
        borderLeft: '4px solid #25D366'
      }
    })
};
