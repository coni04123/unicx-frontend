'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const userId = searchParams.get('userId');
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    if (!token || !userId) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email and try again.');
      return;
    }

    verifyEmail();
  }, [token, userId]);

  const verifyEmail = async () => {
    try {
      await api.verifyEmail(token!, userId!);
      setStatus('success');
      setMessage('Your email has been verified successfully!');
    } catch (err: any) {
      console.error('Error verifying email:', err);
      setStatus('error');
      setMessage(err.message || 'Failed to verify email. The link may have expired. Please request a new verification email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {status === 'verifying' && 'Please wait while we verify your email...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'verifying' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center">
                <CheckIcon className="h-8 w-8 text-success-600" />
              </div>
              <p className="text-sm text-success-700 text-center">{message}</p>
              <Button onClick={() => router.push('/profile')} className="w-full">
                Go to Profile
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center">
                <XMarkIcon className="h-8 w-8 text-error-600" />
              </div>
              <p className="text-sm text-error-600 text-center">{message}</p>
              <div className="flex space-x-2 w-full">
                <Button variant="outline" onClick={() => router.push('/profile')} className="flex-1">
                  Go to Profile
                </Button>
                <Button onClick={() => router.push('/login')} className="flex-1">
                  Go to Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

