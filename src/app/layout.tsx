import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

export const metadata: Metadata = {
  title: '2N5 - WhatsApp Business Management Platform',
  description: 'Comprehensive WhatsApp Business and spy number management system with multi-tenant support',
  keywords: 'WhatsApp, Business, Messaging, Spy Numbers, Multi-tenant',
  authors: [{ name: '2N5 Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#22c55e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      </head>
      <body className="antialiased">
        <LanguageProvider>
          <AuthProvider>
            <OnboardingProvider>
              {children}
            </OnboardingProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
